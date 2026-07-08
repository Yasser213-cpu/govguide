import os
from langchain_openai import ChatOpenAI

# ---------- Lazy LLM (created only on first use, not at import) ----------
_llm = None




def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0,
        )
    return _llm


def detect_intent(message):
    """Classify the user's message into one intent category."""
    prompt = f"""You are an intent classifier for an Egyptian government services assistant.
Classify the user's message into EXACTLY ONE of these categories:
- procedure_query: asking about a government procedure (documents, fees, steps)
- order_status: asking about the status of their order or request (e.g. "where is my order", "طلبي وصل لفين")
- booking: wants to book or schedule an appointment
- support: needs help with the app or has a complaint
- greeting: just greeting or small talk
Reply with ONLY the category name, nothing else.

Message: {message}
Category:"""

    response = get_llm().invoke(prompt)
    raw = response.content.strip().lower()

    categories = ["procedure_query", "order_status", "booking", "support", "greeting"]
    for category in categories:
        if category in raw:
            return category
    return "unknown"