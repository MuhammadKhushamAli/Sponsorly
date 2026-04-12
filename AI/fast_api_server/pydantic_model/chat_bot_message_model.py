from pydantic import BaseModel, Field

class ChatBotMessage(BaseModel):
    message: str = Field(..., description="This is the message sent by the user to th chat bot")
