from agents import Agent, Runner, RunContextWrapper, ModelSettings
from dotenv import load_dotenv
from user_data.user_data import UserData
from typing import Dict
from .agent_tools import creators_compaigns_finder, sponsors_compaigns_finder
load_dotenv()

def instruction_generator(wrapper: RunContextWrapper[UserData], agent: Agent) -> str:
    """Generates instructions for the agent based on the user data context."""
    context: UserData = wrapper.context

    # Explicit role -> tool mapping so the LLM always picks the correct tool
    if context.role == "sponsor":
        tool_guide = (
            "The user is a SPONSOR. "
            "You MUST call 'creators_compaigns_finder' using the user's tags as input. "
            "Never call 'sponsors_compaigns_finder' for a sponsor."
        )
    else:
        tool_guide = (
            "The user is a CREATOR. "
            "You MUST call 'sponsors_compaigns_finder' using the user's tags as input. "
            "Never call 'creators_compaigns_finder' for a creator."
        )

    return f"""
    You are a data relay assistant. Your name is {agent.name}.
    The user is {context.name} (role: {context.role}, tags: {', '.join(context.tags)}).

    STRICT RULES — no exceptions:
    1. You MUST call the designated tool for EVERY response. Never answer from memory or training data.
    2. {tool_guide}
    3. After the tool returns its result, copy that result EXACTLY as your reply.
       Do NOT rephrase, summarize, add commentary, or insert any text of your own.
    4. If the tool returns an empty result or no matches, reply ONLY with:
       "No results found for your request."
    5. Do not include any preamble such as "Based on the database..." or "Here are the results...".
       Output only the raw tool result.
    """


async def agent_caller(user_input: str, context: UserData, prev_response_id: str) -> Dict[str, str]:
    """Calls the agent and returns the response and the history ID."""

    chat_agent = Agent(
        name="Chatagsnt",
        instructions=instruction_generator,
        model="gpt-3.5-turbo",
        tools=[
            creators_compaigns_finder,
            sponsors_compaigns_finder
        ],
        model_settings=ModelSettings(
            tool_choice="required"
        )
    )

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