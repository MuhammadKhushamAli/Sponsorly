from pymongo import AsyncMongoClient, database
import pymongo


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
        except Exception as e:
            raise Exception(f"Unable to Connect to Mongo DB: {e}")
    
    async def close_connection(self) -> None:
        """Closes the connection to the MongoDB database"""
        try:
            await self.__client.close()
        except Exception as e:
            raise Exception(f"Error in cLossing DB connection {e}")
        
mongo_db_manager: MongoDBManager = MongoDBManager()