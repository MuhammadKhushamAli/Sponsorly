from dotenv import load_dotenv
import os
from .server import app
import uvicorn
from asyncio import run
from ..db.db import mongo_db_manager

PORT: int = os.getenv("PORT")
MONGO_URI: str = os.getenv("MONGO_DB_URI")
DB_NAME: str = os.getenv("DB_NAME")

def main():
    try:
        run(mongo_db_manager.connect_db(MONGO_URI, DB_NAME))
        print("Database is connected")
        uvicorn.run(app, port=PORT, host="0.0.0.0")
    except Exception as e:
        print(f"Exception occured: {e}")

main()
