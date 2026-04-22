from fastapi import APIRouter, Query

from app.services.crawler_service import build_mock_snapshot

router = APIRouter()


@router.post("/crawl/jobs")
def create_crawl_job(source_name: str = Query(default="manual", min_length=1, max_length=120)):
    return build_mock_snapshot(source_name)
