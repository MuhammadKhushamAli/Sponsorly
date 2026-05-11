from db.db import mongo_db_manager
from agents import function_tool
from typing import List, Dict

@function_tool
async def creators_compaigns_finder(tags: List[str]) -> str:
    """
    Use this tool when the user is a SPONSOR looking for creators to collaborate with.
    Searches creator campaigns in the database that match the given tags.
    Always pass the user's own tags as the input list.
    Params: tags: List[str]
    Returns: str
    """
    return await mongo_db_manager.creator_compaign_finder(tags)


@function_tool
async def sponsors_compaigns_finder(tags: List[str]) -> str:
    """
    Use this tool when the user is a CREATOR looking for sponsorship opportunities.
    Searches sponsor campaigns in the database that match the given tags.
    Always pass the user's own tags as the input list.
    Params: tags: List[str]
    Returns: str
    """
    return await mongo_db_manager.sponsors_compaigns_finder(tags)