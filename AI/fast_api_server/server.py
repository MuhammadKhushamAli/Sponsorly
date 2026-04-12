from fastapi import FastAPI, Query, Body
from .pydantic_model.chat_bot_message_model import ChatBotMessage
from .pydantic_model.user_context_model import UserContext
from agent.agent import agent_caller
from typing import Dict
from user_data.user_data import UserData

app: FastAPI = FastAPI()


@app.get("/")
def root():

    return {
        "status": 200,
        "response": "server is running"
    }

@app.put("/chat_bot_interaction")
async def interacting_with_agent(
    prev_history_id: str | None = Query(None, description="The Previous history id user must have to start the conversation with agent form previous context"),
    message: ChatBotMessage = Body(..., description="The user query for the chat bot to start the conversation"),
    context: UserContext = Body(..., description="It is required to setup the context of user for chat bot")
):

    chat_bot_reply: Dict[str, str] = await agent_caller(
        user_input=message.message,
        context=UserData(
            name=context.user_name,
            email=context.user_email,
            location=context.user_location,
            tags=context.user_tage,
            role=context.user_role
        ),
        prev_response_id=prev_history_id
    )

    return {
        "status": 200,
        **chat_bot_reply
    }