from agents import Agent, Runner, RunContextWrapper
from dotenv import load_dotenv
from user_data.user_data import UserData
from typing import Dict
load_dotenv()

def instruction_generator(wrapper: RunContextWrapper[UserData], agent: Agent) -> str:
    """Generates instructions for the agent based on the user data context."""
    context: UserData = wrapper.context
    return f"You are a helpful assistant. Your name is {agent.name} The user is {context.name} from {context.location}. His role is {context.role}. They have the following tags: {', '.join(context.tags)}. Answer the user's question based on this information."


async def agent_caller(user_input: str, context: UserData, prev_response_id: str) -> Dict[str, str]:
    """Calls the agent and returns the response and the history ID."""

    chat_agent = Agent(
        name="ChatAgent",
        instructions=instruction_generator,
        model="gpt-3.5-turbo"
    )

    while True:
        response = await Runner.run(
            starting_agent=chat_agent,
            input=user_input,
            previous_response_id=prev_response_id,
            context=context
        )

        return {
            "response": response.final_output,
            "history_id": response.last_response_id
        }