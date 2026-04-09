from pydantic import BaseModel, Field


class MatchProfileTool(BaseModel):
    id: int
    slug: str
    name: str


class MatchProfileResponse(BaseModel):
    userId: int
    username: str
    bio: str
    isMatchmakingEnabled: bool
    tools: list[MatchProfileTool]


class UpdateMatchProfileRequest(BaseModel):
    bio: str = Field(default="", max_length=512)
    isMatchmakingEnabled: bool


class AddUserToolUsageRequest(BaseModel):
    toolId: int


class MatchCandidateToolPair(BaseModel):
    myTool: str
    candidateTool: str
    similarity: float


class MatchCandidate(BaseModel):
    userId: int
    username: str
    bio: str
    matchScore: int
    sharedTools: list[str]
    similarToolPairs: list[MatchCandidateToolPair]
    reason: str
