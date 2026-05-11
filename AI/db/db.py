from pymongo import AsyncMongoClient, database
import pymongo
from typing import List, Dict
import asyncio
from bson import ObjectId


class MongoDBManager:

    def __init__(self):
        self.__client: AsyncMongoClient = None
        self.db: database = None

    async def connect_db(self, mongo_db_uri: str, db_name: str) -> None:
        """Connects to the MongoDB database asyncrounously and return the client"""
        try:
            self.__client = AsyncMongoClient(
                mongo_db_uri,
                server_api=pymongo.server_api.ServerApi(
                    version="1",
                    strict=True,
                    deprecation_errors=True
                )
            )
            self.db = self.__client[db_name]
            print("Connected to MongoDB")
        except Exception as e:
            raise Exception(f"Unable to Connect to Mongo DB: {e}")
    
    async def close_connection(self) -> None:
        """Closes the connection to the MongoDB database"""
        try:
            await self.__client.close()
        except Exception as e:
            raise Exception(f"Error in cLossing DB connection {e}")
        
    async def creator_compaign(self, tags: List[str]) -> str:
        """It Find the creator's compaigns by matching the tags with sponsor's desired tags"""

        collection = self.db["creatorcampaigns"]

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
                    "as": "creator_detail",
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
                                "localField": "reviews",
                                "foreignField": "_id",
                                "as": "reviews",
                                "pipeline": [
                                    {
                                        "$project": {
                                            "rating": 1,
                                            "comment": 1
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
                                        "input": "$reviews",
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
                                "links": 1,
                                "rating": 1,
                                "reviews": 1,
                                "followersCount": 1
                            }
                        }
                    ]
                }
            },
            {
                "$addFields": {
                    "creator_detail": {
                        "$first": "$creator_detail"
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
        await self.close_connection()

        print(returned_str)

        return returned_str
    
    async def sponsors_compaigns_finder(self, tags: List[str]) -> SyntaxError:
        """It Find the sponsors's compaigns by matching the tags with creator's desired tags"""

        collection = self.db["sponsorcampaigns"]
        
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
                    "from": "sponsors",
                    "localField": "sponsorId",
                    "foreignField": "_id",
                    "as": "sponsor_detail",
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
                                            "_id": 0,
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
                                            "_id": 0,
                                            "rating": 1,
                                            "comment": 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "$addFields": {
                                "user_detail": {
                                    "$arrayElemAt": ["$user_detail", 0]
                                },
                            }
                        },
                        {
                            "$project": {
                                "_id": 0,
                                "user_detail": 1,
                                "previousProjects": 1,
                                "rating": 1,
                                "ratings": 1
                            }
                        }
                    ]
                }
            },
            {
                "$addFields": {
                    "sponsor_detail": {
                        "$arrayElemAt": ["$sponsor_detail", 0]
                    }
                }
            },
            {
                "$project": {
                    "title": 1,
                    "budget": 1,
                    "tags": 1,
                    "description": 1,
                    "sponsor_detail": 1
                }
            }
        ]
 
        result_cursor = await collection.aggregate(pipeline)

        returned_str: str = "The sponsors compaigns matched to your desired tags are:" + "\n\n".join(
            [f"Compaign has:\nTitle: {doc["title"]}\nBudget:{doc["budget"]}\nTags:{doc["tags"]}\nDescription:{doc["description"]}\nSponsor Details: {doc["sponsor_detail"]} " async for doc in result_cursor]
        )
        await self.close_connection()

        return returned_str


mongo_db_manager: MongoDBManager = MongoDBManager()

async def main():
    await mongo_db_manager.connect_db(
    "mongodb+srv://Khusham:KJutt.387@studybackend.jmaospe.mongodb.net",
    "Sponsorly"
    )
    result = await mongo_db_manager.creator_compaign(
        ["short-form"]
    )
    print(result)



asyncio.run(main())