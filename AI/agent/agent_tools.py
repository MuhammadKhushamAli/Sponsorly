from db.db import mongo_db_manager
from agents import function_tool
from typing import List, Dict

@function_tool
async def creators_compaigns_finder(tags: List[str]) -> str:
    """
    It Find the creator's compaigns by matching the tags with sponsor's desired tags
    Params: tags: List[str]
    Returns: str
    """

    return mongo_db_manager.creator_compaign(tags)


@function_tool
async def sponsors_compaigns_finder(tags: List[str]) -> str:
    """
    It Find the sponsors's compaigns by matching the tags with creator's desired tags
    Params: tags: List[str]
    Returns: str
    """

    return mongo_db_manager.sponsors_compaigns_finder(tags)