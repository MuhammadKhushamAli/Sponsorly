from agents import Agent, Runner, RunContextWrapper
from dotenv import load_dotenv
from user_data.user_data import UserData
load_dotenv()


prev_history_id: str = None

def instruction_generator(wrapper: RunContextWrapper[UserData], agent: Agent) -> str:
    """Generates instructions for the agent based on the user data context."""
    context: UserData = wrapper.context
    return f"You are a helpful assistant. Your name is {agent.name} The user is {context.name} from {context.location}. His role is {context.role}. They have the following tags: {', '.join(context.tags)}. Answer the user's question based on this information."




chat_agent = Agent(
    name="ChatAgent",
    instructions=instruction_generator,
    model="gpt-3.5-turbo"
)

while True:
    user_input = input("User: ")
    response = Runner.run_sync(
        starting_agent=chat_agent,
        input=user_input,
        previous_response_id=prev_history_id,
        context=UserData(
            _id="123",
            name="John Doe",
            email="123@gmail.com",
            location="New York",
            tags=["Programmer", "AI Enthusiast"],
            role="sponsor"
        ),
    )
    print(f"ChatAgent: {response.final_output}")
    prev_history_id = response.last_response_id