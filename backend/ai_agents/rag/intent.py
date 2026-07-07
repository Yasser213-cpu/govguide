import os
from langchain_openai import ChatOpenAI

# ---------- Lazy LLM (created only on first use, not at import) ----------
_llm = None


# def get_llm():
#     """Create the intent-classifier LLM once, on first use."""
#     global _llm
#     if _llm is None:
#         _llm = ChatOpenAI(
#             model="gpt-4o-mini",
#             openai_api_key=os.getenv("OPENAI_API_KEY"),
#             temperature=0,
#         )
#     return _llm

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
- booking: wants to book or schedule an appointment
- support: needs help with the app or has a complaint
- greeting: just greeting or small talk

Reply with ONLY the category name, nothing else.

Message: {message}
Category:"""

    response = get_llm().invoke(prompt)
    raw = response.content.strip().lower()

    # The free model sometimes returns extra text, so we search for the category
    categories = ["procedure_query", "booking", "support", "greeting"]
    for category in categories:
        if category in raw:
            return category

    return "unknown"