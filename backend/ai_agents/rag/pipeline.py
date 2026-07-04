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
        return {
            "intent": intent,
            "answer": rag_result["answer"],
            "tokens": rag_result["tokens"],
            "procedure_id": rag_result.get("procedure_id"),
        }
    elif intent == "greeting":
        return {
            "intent": intent,
            "answer": "أهلاً بك! يمكنني مساعدتك في الإجراءات الحكومية المصرية. ماذا تحتاج؟",
            "tokens": 0,
            "procedure_id": None,
        }
    elif intent == "booking":
        return {
            "intent": intent,
            "answer": "خدمة الحجز غير متاحة حالياً، وسيتم إضافتها قريباً.",
            "tokens": 0,
            "procedure_id": None,
        }
    elif intent == "support":
        return {
            "intent": intent,
            "answer": "للمساعدة، يرجى التواصل مع فريق الدعم.",
            "tokens": 0,
            "procedure_id": None,
        }
    else:
        return {
            "intent": intent,
            "answer": "عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟",
            "tokens": 0,
            "procedure_id": None,
        }


if __name__ == "__main__":
    test_messages = [
        "عايز اجدد جواز السفر",
        "السلام عليكم",
        "عايز احجز موعد",
    ]
    for msg in test_messages:
        result = handle_message(msg)
        print(f"Message: {msg}")
        print(f"Intent: {result['intent']}")
        print(f"Answer: {result['answer']}\n")
        print("-" * 50)