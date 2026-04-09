from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.matchmaking import AddUserToolUsageRequest, MatchCandidate, MatchProfileResponse, UpdateMatchProfileRequest
from app.services import auth_service
from app.services.matchmaking_service import add_tool_usage, get_my_profile, list_candidates, remove_tool_usage, update_my_profile

router = APIRouter(prefix="/matchmaking")


@router.get("/me", response_model=MatchProfileResponse)
def get_me_profile(db: Session = Depends(get_db), user=Depends(auth_service.current_user_dependency)):
    return get_my_profile(db, user=user)


@router.put("/me", response_model=MatchProfileResponse)
def update_me_profile(payload: UpdateMatchProfileRequest, db: Session = Depends(get_db), user=Depends(auth_service.current_user_dependency)):
    return update_my_profile(db, user=user, bio=payload.bio, is_enabled=payload.isMatchmakingEnabled)


@router.post("/me/tools", response_model=MatchProfileResponse)
def add_me_tool(payload: AddUserToolUsageRequest, db: Session = Depends(get_db), user=Depends(auth_service.current_user_dependency)):
    return add_tool_usage(db, user=user, tool_id=payload.toolId)


@router.delete("/me/tools/{tool_id}", response_model=MatchProfileResponse)
def delete_me_tool(tool_id: int, db: Session = Depends(get_db), user=Depends(auth_service.current_user_dependency)):
    return remove_tool_usage(db, user=user, tool_id=tool_id)


@router.get("/me/candidates", response_model=list[MatchCandidate])
def get_my_candidates(
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    user=Depends(auth_service.current_user_dependency),
):
    return list_candidates(db, user=user, limit=limit)
