from ai_agents.rag.intent import detect_intent
from ai_agents.rag.rag_chain import ask

def handle_message(message):
    """Main pipeline: detect intent, then route to the right handler."""
    # 1. Detect the user's intent
    intent = detect_intent(message)

    # 2. Route based on intent
    if intent == "procedure_query":
        # Use the RAG to answer from government documents
        rag_result = ask(message)
        return {"intent": intent, "answer": rag_result["answer"],"tokens":rag_result["tokens"]}

    elif intent == "greeting":
        return {
            "intent": intent,
            "answer": "Hello! I can help you with Egyptian government procedures. What do you need?",
            "tokens":0
        }

    elif intent == "booking":
        return {
            "intent": intent,
            "answer": "Booking is not available yet. It will be added soon.",
             "tokens":0

        }

    elif intent == "support":
        return {
            "intent": intent,
            "answer": "For support, please contact the help team.",
            "tokens":0

        }

    else:
        return {
            "intent": intent,
            "answer": "Sorry, I didn't understand. Could you rephrase?",
             "tokens":0

        }
if __name__ == "__main__":
    # Test the full pipeline with different messages
    test_messages = [
        "What documents do I need to renew my passport?",
        "Hello",
        "I want to book an appointment",
    ]

    for msg in test_messages:
        result = handle_message(msg)
        print(f"Message: {msg}")
        print(f"Intent: {result['intent']}")
        print(f"Answer: {result['answer']}\n")
        print("-" * 50)