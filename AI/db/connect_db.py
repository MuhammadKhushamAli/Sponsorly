from dotenv import load_dotenv
from pymongo import AsyncMongoClient
import pymongo
import os

async def connect_db() -> AsyncMongoClient:
    """Connects to the MongoDB database asyncrounously and return the client"""
    load_dotenv()
    MONGO_DB_URI = os.getenv("MONGO_DB_URI")
    
    if not MONGO_DB_URI:
        raise ValueError("MONGO_DB_URI is not set in the environment variables.")
    
    try:
        mongo_db_client: AsyncMongoClient = AsyncMongoClient(
            MONGO_DB_URI,
            server_api=pymongo.server_api.ServerApi(
                version="1",
                strict=True,
                deprecation_errors=True
            )
        )
        return mongo_db_client
    except Exception as e:
        raise Exception(f"Unable to Connect to Mongo DB: {e}")
    