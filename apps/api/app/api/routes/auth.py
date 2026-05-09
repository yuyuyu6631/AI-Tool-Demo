import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import AuthLoginRequest, AuthRegisterRequest, AuthUserResponse
from app.services import auth_service

router = APIRouter(prefix="/auth")
_RATE_LIMIT_WINDOW_SECONDS = 60
_auth_attempts: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_auth_attempts_lock = Lock()


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _check_auth_rate_limit(request: Request, *, action: str, max_attempts: int) -> tuple[str, str]:
    now = time.monotonic()
    key = (action, _client_ip(request))
    with _auth_attempts_lock:
        attempts = _auth_attempts[key]
        while attempts and now - attempts[0] > _RATE_LIMIT_WINDOW_SECONDS:
            attempts.popleft()
        if len(attempts) >= max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="操作过于频繁，请稍后再试。",
            )
    return key


def _record_auth_failure(key: tuple[str, str]) -> None:
    with _auth_attempts_lock:
        _auth_attempts[key].append(time.monotonic())


@router.post("/register", response_model=AuthUserResponse, status_code=201)
def register(
    payload: AuthRegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    rate_limit_key = _check_auth_rate_limit(request, action="register", max_attempts=20)
    try:
        result = auth_service.register_user(db, payload, request)
    except HTTPException:
        _record_auth_failure(rate_limit_key)
        raise
    auth_service.set_auth_cookie(response, result.session_token)
    return auth_service.serialize_user(result.user)


@router.post("/login", response_model=AuthUserResponse)
def login(
    payload: AuthLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    rate_limit_key = _check_auth_rate_limit(request, action="login", max_attempts=5)
    try:
        result = auth_service.login_user(db, payload, request)
    except HTTPException:
        _record_auth_failure(rate_limit_key)
        raise
    auth_service.set_auth_cookie(response, result.session_token)
    return auth_service.serialize_user(result.user)


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    session_token = request.cookies.get(auth_service.settings.session_cookie_name)
    if session_token:
        auth_service.revoke_session(db, session_token)
    auth_service.clear_auth_cookie(response)


@router.get("/me", response_model=AuthUserResponse)
def me(user=Depends(auth_service.current_user_dependency)):
    return auth_service.serialize_user(user)
