from app.schemas.ai_search import AiSearchResult
from app.schemas.tool import AccessFlags
from app.services.ai_search_service import _build_agent_recommendation


def _result(slug: str, name: str, *, reason: str | None = None) -> AiSearchResult:
    return AiSearchResult(
        id=1,
        slug=slug,
        name=name,
        category="AI 办公",
        categorySlug="office",
        score=8.8,
        summary="适合把真实任务拆成可执行步骤。",
        tags=["办公", "写作"],
        officialUrl=f"https://example.com/{slug}",
        logoPath=None,
        logoStatus="missing",
        logoSource="seed",
        status="published",
        featured=True,
        createdAt="2026-04-01",
        price="",
        reviewCount=8,
        accessFlags=AccessFlags(needsVpn=False, cnLang=True, cnPayment=True),
        pricingType="freemium",
        freeAllowanceText="免费版可用于基础试用",
        features=["生成任务流程"],
        limitations=["复杂格式仍需人工核验"],
        bestFor=["论文排版"],
        dealSummary="免费版可试用",
        primaryMedia=None,
        reason=reason,
    )


def test_agent_recommendation_has_decision_complete_pipeline():
    results = [
        _result("chatgpt", "ChatGPT", reason="适合先梳理论文格式问题"),
        _result("wps-ai", "WPS AI", reason="适合在文档里执行排版调整"),
    ]

    agent = _build_agent_recommendation(
        query="我要把 Word 文档自动排版成论文格式",
        normalized_query="论文 academic-writing 文档 排版",
        intent_payload={
            "intent_summary": "用户希望处理论文格式",
            "task": "academic-writing",
            "constraints": {"pricing": "free_preferred", "language": "zh_preferred"},
        },
        constraints={"pricing": "free_preferred", "language": "zh_preferred"},
        task="academic-writing",
        results=results,
        ranked_items=results,
    )

    assert agent.confidence in {"high", "medium", "low"}
    assert agent.intent.task == "论文与文档处理"
    assert "免费或低成本优先" in agent.intent.constraints
    assert [step.id for step in agent.trace] == ["intent", "scene", "recall", "verify", "recommend"]
    assert len(agent.toolPlan) == 2
    assert agent.toolPlan[0].role == "主推荐"
    assert agent.toolPlan[0].fit_reason == "适合先梳理论文格式问题"
    assert agent.toolPlan[0].free_signal
    assert agent.toolPlan[0].limitation_risk
    assert agent.toolPlan[0].next_step
