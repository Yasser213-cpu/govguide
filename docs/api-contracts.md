# GovConnect AI — API Contracts

This document defines the API contract for the AI Chat feature so the frontend
can build against it. Backend owner: Yasser (Member A).

---

## AI Chat

Send a user message to the AI assistant and receive an answer. The assistant
detects the user's intent and, for procedure questions, answers from the
official government documents (RAG).

### Request

```
POST /api/v1/ai/chat/
Content-Type: application/json
```

Body:

```json
{
  "message": "How do I renew my passport?"
}
```

| Field   | Type   | Required | Notes                          |
|---------|--------|----------|--------------------------------|
| message | string | yes      | The user's question. Max 1000 chars. |

### Success Response — 200 OK

```json
{
  "intent": "procedure_query",
  "answer": "To renew your passport you need: 1) National ID...",
  "tokens": 245
}
```

| Field  | Type   | Notes                                                        |
|--------|--------|-------------------------------------------------------------|
| intent | string | Detected intent. One of the values listed below.            |
| answer | string | The assistant's reply. Display this as the AI message.      |
| tokens | int    | LLM tokens used for this message (analytics; can be ignored in UI). |

### Possible `intent` values

| intent          | Meaning                          | How the UI might react                  |
|-----------------|----------------------------------|-----------------------------------------|
| procedure_query | Asking about a government procedure | Show the answer (may be a checklist)    |
| greeting        | Greeting / small talk            | Show the greeting reply                 |
| booking         | Wants to book an appointment     | Show reply (booking not built yet)      |
| support         | Needs help / complaint           | Show support reply                      |
| unknown         | Could not classify               | Show the "please rephrase" reply        |

### Error Response — 503 Service Unavailable

Returned when the AI service (LLM) is temporarily unavailable or rate-limited.

```json
{
  "error": "AI service is temporarily unavailable. Please try again."
}
```

The UI should show a friendly "try again" message when it receives a 503.

### Validation Error — 400 Bad Request

Returned when the request body is invalid (e.g. missing message, too long).

```json
{
  "message": ["This field is required."]
}
```

---

## Notes for the frontend

- The first request after the server starts may take a few seconds (the model
  warms up). Show a loading indicator ("AI is typing…") while waiting.
- `answer` is plain text for now. It may contain line breaks (`\n`) — render
  them as line breaks so document checklists display nicely.
- Authentication is **not required** to call this endpoint right now
  (permission is AllowAny). When a logged-in user calls it, the conversation is
  saved server-side automatically — the frontend does not need to do anything
  extra for that.
- Base URL in the frontend `.env`: `VITE_API_URL=http://localhost:8000/api/v1`
  so the call becomes `${VITE_API_URL}/ai/chat/`.

---

## Quick test (curl)

```bash
curl -X POST http://localhost:8000/api/v1/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I renew my passport?"}'
```
