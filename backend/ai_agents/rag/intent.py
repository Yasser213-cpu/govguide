import os
from langchain_openai import ChatOpenAI

# ---------- LLM setup (OpenRouter) ----------
llm = ChatOpenAI(
    model="openrouter/free",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0,
)
def detect_intent(message):
    """Classify the user's message into one intent category."""
    prompt = f"""You are an intent classifier for an Egyptian government services assistant.
Classify the user's message into EXACTLY ONE of these categories:

- procedure_query: asking about a government procedure (documents, fees, steps)
- booking: wants to book or schedule an appointment
- support: needs help with the app or has a complaint
- greeting: just greeting or small talk

Reply with ONLY the category name, nothing else.

Message: {message}
Category:"""

    response = llm.invoke(prompt)
    raw= response.content.strip().lower()
    # The free model sometimes returns extra text, so we search for the category
    categories = ["procedure_query", "booking", "support", "greeting"]
    for category in categories:
        if category in raw:
            return category

    return "unknown"
