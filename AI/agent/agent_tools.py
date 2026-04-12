from db.db import mongo_db_manager
from agents import function_tool
from typing import List, Dict

@function_tool
async def creators_compaigns_finder(tags: List[str]):
    """It Find the creator's compaigns by matching the tags with creators tags"""

    collection = mongo_db_manager.db["users"]
    
    pipeline: List[Dict] = [
        {
            "$match": {
                "tags": {
                    "$in": tags
                }
            }
        },
        {
            "$lookup": {
                "from": "creators",
                "localField": "creatorId",
                "foreignField": "_id",
                "as": "creator_Detail",
                "pipeline": [
                    {
                        "$lookup": {
                            "from": "users",
                            "localField": "user",
                            "foreignField": "_id",
                            "as": "user_detail",
                            "pipeline": [
                                {
                                    "$project": {
                                        "name": 1,
                                        "email": 1,
                                        "location": 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$lookup": {
                            "from": "reviews",
                            "localField": "ratings",
                            "foreignField": "_id",
                            "as": "ratings",
                            "pipeline": [
                                {
                                    "$project": {
                                        "rating": 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "$addFields": {
                            "user_detail": {
                                "$first": "user_detail"
                            },
                            "ratings": {
                                "$map": {
                                    "input": "$ratings",
                                    "as": "r",
                                    "in": "$$r.rating"
                                }
                            },
                            "rating": {
                                "$avg": "$ratings"
                            }
                        }
                    },
                    {
                        "$project": {
                            "user_detail": 1,
                            "previousProjects": 1,
                            "experienceInYears": 1,
                            "rating": 1
                        }
                    }
                ]
            }
        },
        {
            "$addFields": {
                "creator_Detail": {
                    "$first": "$creator_Detail"
                }
            }
        },
        {
            "$project": {
                "title": 1,
                "ratePerHour": 1,
                "tags": 1,
                "description": 1,
                "creator_Detail": 1
            }
        }
    ]
    result_cursor = await collection.aggregate(pipeline)

    returned_str: str = "The creators compaigns matched to your desired tags are:" + "\n\n".join(
        [f"Compaign has:\nTitle: {doc.title}\nRate Per Hour:{doc.ratePerHour}\nTags:{doc.tags}\nDescription:{doc.description}\nCreator Details: {doc.creator_Detail}" async for doc in result_cursor]
    )
    await mongo_db_manager.close_connection()

    print(returned_str)

    return returned_str