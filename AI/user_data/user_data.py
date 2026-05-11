from dataclasses import dataclass
from typing import Literal, List

@dataclass
class UserData:
    name: str
    email: str
    tags: list[str]
    role: Literal["sponsor", "creator"]

    def __post_init__(self):
        allowed_roles: List[str] = ["sponsor", "creator"]

        if self.role not in allowed_roles:
            raise ValueError(f"Invalid role: {self.role}. Allowed roles are: {', '.join(allowed_roles)}")