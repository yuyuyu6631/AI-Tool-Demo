from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.models.models import Tool, ToolEmbedding, User, UserMatchProfile, UserToolUsage
from app.schemas.matchmaking import MatchCandidate, MatchCandidateToolPair, MatchProfileResponse, MatchProfileTool
from app.services.embedding_service import cosine_similarity, deserialize_embedding

_SIMILARITY_THRESHOLD = 0.72
_MAX_SIMILAR_PAIRS = 3


@dataclass(slots=True)
class _CandidateScore:
    user: User
    profile: UserMatchProfile
    shared_tools: list[Tool]
    similar_pairs: list[MatchCandidateToolPair]
    final_score: int


def _get_or_create_profile(db: Session, *, user_id: int) -> UserMatchProfile:
    profile = db.scalar(select(UserMatchProfile).where(UserMatchProfile.user_id == user_id))
    if profile:
        return profile

    profile = UserMatchProfile(user_id=user_id)
    db.add(profile)
    db.flush()
    return profile


def _serialize_profile(db: Session, user: User) -> MatchProfileResponse:
    profile = _get_or_create_profile(db, user_id=user.id)
    usages = db.scalars(
        select(UserToolUsage)
        .where(UserToolUsage.user_id == user.id)
        .options(selectinload(UserToolUsage.tool))
        .order_by(UserToolUsage.updated_at.desc(), UserToolUsage.id.desc())
    ).all()

    tools = [
        MatchProfileTool(
            id=item.tool.id,
            slug=item.tool.slug,
            name=item.tool.name,
        )
        for item in usages
        if item.tool is not None
    ]

    return MatchProfileResponse(
        userId=user.id,
        username=user.username,
        bio=profile.bio,
        isMatchmakingEnabled=profile.is_matchmaking_enabled,
        tools=tools,
    )


def get_my_profile(db: Session, *, user: User) -> MatchProfileResponse:
    try:
        result = _serialize_profile(db, user)
        db.commit()
        return result
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="读取匹配资料失败，请稍后重试。") from error


def update_my_profile(db: Session, *, user: User, bio: str, is_enabled: bool) -> MatchProfileResponse:
    try:
        profile = _get_or_create_profile(db, user_id=user.id)
        profile.bio = bio.strip()
        profile.is_matchmaking_enabled = is_enabled
        db.commit()
        return _serialize_profile(db, user)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="更新匹配资料失败，请稍后重试。") from error


def add_tool_usage(db: Session, *, user: User, tool_id: int) -> MatchProfileResponse:
    tool = db.get(Tool, tool_id)
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="工具不存在。")

    try:
        existing = db.scalar(select(UserToolUsage).where(UserToolUsage.user_id == user.id, UserToolUsage.tool_id == tool_id))
        if not existing:
            db.add(UserToolUsage(user_id=user.id, tool_id=tool_id, source="manual"))
        db.commit()
        return _serialize_profile(db, user)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="保存在用工具失败，请稍后重试。") from error


def remove_tool_usage(db: Session, *, user: User, tool_id: int) -> MatchProfileResponse:
    try:
        existing = db.scalar(select(UserToolUsage).where(UserToolUsage.user_id == user.id, UserToolUsage.tool_id == tool_id))
        if existing is not None:
            db.delete(existing)
        db.commit()
        return _serialize_profile(db, user)
    except SQLAlchemyError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="取消在用工具失败，请稍后重试。") from error


def _build_similarity_pairs(
    *,
    my_tools: list[Tool],
    candidate_tools: list[Tool],
    shared_tool_ids: set[int],
    embeddings_by_tool_id: dict[int, list[float]],
) -> list[MatchCandidateToolPair]:
    my_non_overlap = [tool for tool in my_tools if tool.id not in shared_tool_ids]
    candidate_non_overlap = [tool for tool in candidate_tools if tool.id not in shared_tool_ids]
    if not my_non_overlap or not candidate_non_overlap:
        return []

    pairs: list[MatchCandidateToolPair] = []
    for my_tool in my_non_overlap:
        my_embedding = embeddings_by_tool_id.get(my_tool.id)
        if not my_embedding:
            continue

        best_tool = None
        best_similarity = 0.0
        for candidate_tool in candidate_non_overlap:
            candidate_embedding = embeddings_by_tool_id.get(candidate_tool.id)
            if not candidate_embedding:
                continue
            similarity = cosine_similarity(my_embedding, candidate_embedding)
            if similarity >= _SIMILARITY_THRESHOLD and similarity > best_similarity:
                best_similarity = similarity
                best_tool = candidate_tool

        if best_tool is None:
            continue

        pairs.append(
            MatchCandidateToolPair(
                myTool=my_tool.name,
                candidateTool=best_tool.name,
                similarity=round(best_similarity, 3),
            )
        )

    pairs.sort(key=lambda item: item.similarity, reverse=True)
    return pairs[:_MAX_SIMILAR_PAIRS]


def _build_reason(shared_tools: list[str], similar_pairs: list[MatchCandidateToolPair]) -> str:
    shared_text = "、".join(shared_tools[:2])
    if similar_pairs:
        pair = similar_pairs[0]
        return f"你们都在用 {shared_text}，同时 Ta 在用的 {pair.candidateTool} 与你在用的 {pair.myTool} 也很接近"
    return f"你们都在用 {shared_text}，适合先从工具协作经验开始交流"


def _load_tool_embeddings(db: Session, tool_ids: set[int]) -> dict[int, list[float]]:
    if not tool_ids:
        return {}

    rows = db.scalars(select(ToolEmbedding).where(ToolEmbedding.tool_id.in_(tool_ids))).all()
    return {row.tool_id: deserialize_embedding(row.embedding_json) for row in rows}


def list_candidates(db: Session, *, user: User, limit: int) -> list[MatchCandidate]:
    my_usages = db.scalars(
        select(UserToolUsage).where(UserToolUsage.user_id == user.id).options(selectinload(UserToolUsage.tool))
    ).all()
    my_tools = [item.tool for item in my_usages if item.tool is not None]
    my_tool_by_id = {tool.id: tool for tool in my_tools}

    if not my_tool_by_id:
        return []

    candidates = db.scalars(
        select(User)
        .join(UserMatchProfile, UserMatchProfile.user_id == User.id)
        .where(
            User.id != user.id,
            User.status == "active",
            UserMatchProfile.is_matchmaking_enabled.is_(True),
        )
        .options(selectinload(User.tool_usages).selectinload(UserToolUsage.tool), selectinload(User.match_profile))
    ).all()

    all_tool_ids: set[int] = set(my_tool_by_id)
    for candidate in candidates:
        for usage in candidate.tool_usages:
            if usage.tool is not None:
                all_tool_ids.add(usage.tool.id)

    embeddings_by_tool_id: dict[int, list[float]] = {}
    try:
        embeddings_by_tool_id = _load_tool_embeddings(db, all_tool_ids)
    except Exception:
        embeddings_by_tool_id = {}

    scored: list[_CandidateScore] = []
    for candidate in candidates:
        profile = candidate.match_profile
        if profile is None:
            continue

        candidate_tools = [usage.tool for usage in candidate.tool_usages if usage.tool is not None]
        if not candidate_tools:
            continue

        shared_tool_ids = set(my_tool_by_id).intersection(tool.id for tool in candidate_tools)
        if not shared_tool_ids:
            continue

        shared_tools = [my_tool_by_id[tool_id] for tool_id in shared_tool_ids]
        shared_tools.sort(key=lambda item: item.name.casefold())
        exact_overlap_count = len(shared_tools)

        similar_pairs = _build_similarity_pairs(
            my_tools=my_tools,
            candidate_tools=candidate_tools,
            shared_tool_ids=shared_tool_ids,
            embeddings_by_tool_id=embeddings_by_tool_id,
        )
        similarity_score = sum(round(pair.similarity * 10) for pair in similar_pairs)
        final_score = exact_overlap_count * 100 + similarity_score

        scored.append(
            _CandidateScore(
                user=candidate,
                profile=profile,
                shared_tools=shared_tools,
                similar_pairs=similar_pairs,
                final_score=final_score,
            )
        )

    scored.sort(
        key=lambda item: (
            -item.final_score,
            -len(item.shared_tools),
            -item.profile.updated_at.timestamp(),
            item.user.id,
        )
    )

    items: list[MatchCandidate] = []
    for score in scored[:limit]:
        shared_tool_names = [tool.name for tool in score.shared_tools]
        items.append(
            MatchCandidate(
                userId=score.user.id,
                username=score.user.username,
                bio=score.profile.bio,
                matchScore=score.final_score,
                sharedTools=shared_tool_names,
                similarToolPairs=score.similar_pairs,
                reason=_build_reason(shared_tool_names, score.similar_pairs),
            )
        )

    return items
