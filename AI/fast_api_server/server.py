from fastapi import FastAPI, Query, Body
from .pydantic_model.chat_bot_message_model import ChatBotMessage
from .pydantic_model.user_context_model import UserContext
from ..agent.agent import agent_caller
from typing import Dict

app: FastAPI = FastAPI()


@app.get("/")
def seting_context_to_chat_bot():

    return {
        "status": 200,
        "response": "server is running"
    }

@app.get("/chat_bot_interaction")
async def interacting_with_agent(
    prev_history_id: str | None = Query(None, description="The Previous history id user must have to start the conversation with agent form previous context"),
    message: ChatBotMessage = Body(..., description="The user query for the chat bot to start the conversation"),
    context: UserContext = Body(..., description="It is required to setup the context of user for chat bot")
):
    chat_bot_reply: Dict[str, str] = await agent_caller(
        user_input=message,
        context=context,
        prev_response_id=prev_history_id
    )

    return {
        "status": 200,
        **chat_bot_reply
    }