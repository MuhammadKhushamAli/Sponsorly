from pydantic import BaseModel, Field
from typing import List, Literal

class UserContext(BaseModel):
    user_name: str = Field(..., description="The name of user in database")
    user_email: str = Field(..., description="The email of user in database")
    user_location: str = Field(..., description="The location of user stored in database")
    user_tags: List[str] = Field(..., description="The list of tags user have according to his/her interest stored in database")
    user_role: Literal["sponsor", "creator"] = Field(..., description="The role of the user working with ('sponsot', 'creator') the roles must be form them")