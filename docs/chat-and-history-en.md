# GovGuide — Chat & Chat History API

Backend reference for the AI chat feature (Member A) for the frontend team. Covers sending a message to the assistant and fetching the user's past conversations.

Base URL: `http://localhost:8000/api/v1`

---

## 1. Send a chat message

```
POST /api/v1/ai/chat/
```

**Auth:** optional. Works for anyone (`AllowAny`). If the user is logged in (`Authorization: Bearer <access_token>`), the conversation is saved to their history; if not, it still answers but isn't saved.

**Request body**

```json
{
  "message": "عايز اجدد جواز السفر"
}
```

**Response — 200 OK**

```json
{
  "intent": "procedure_query",
  "answer": "لتجديد جواز السفر، يجب عليك تقديم المستندات التالية: ...",
  "tokens": 697,
  "procedure_id": 1
}
```

**Field notes**

- `intent` — one of: `procedure_query`, `order_status`, `booking`, `support`, `greeting`, `unknown`. Use it to decide UI behavior.
- `answer` — Arabic text, ready to display. May contain line breaks and markdown-style formatting.
- `tokens` — tokens used (for monitoring; can be ignored in UI).
- `procedure_id` — **key field.** When `intent` is `procedure_query`, this is the id of the matched procedure (or `null`). Use it to:
  - fetch the checklist: `GET /procedures/<procedure_id>`
  - fetch recommended companies: `POST /ai/recommend-companies` with this `procedure_id`
  - For all other intents, `procedure_id` is `null`.

**Out-of-scope questions:** if the user asks something unrelated to Egyptian government procedures, `answer` politely says the assistant only handles government procedures, and `procedure_id` is `null`.

**Error — 503**

```json
{ "error": "AI service is temporarily unavailable. Please try again." }
```

---

## Suggested chat flow (frontend)

1. User sends a message → `POST /ai/chat/`.
2. Display `answer`.
3. If `procedure_id` is not null:
   - Optionally show a "View required documents" button → `GET /procedures/<procedure_id>`.
   - Optionally show a "See companies" button → `POST /ai/recommend-companies` with `procedure_id`.

This links the chat to the checklist and the recommendation engine.

---

## 2. Get chat history

```
GET /api/v1/ai/chat-history/
```

**Auth:** required (`Authorization: Bearer <access_token>`). Each user only sees their own conversations.

**Response — 200 OK** (paginated, newest first)

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 4,
      "message": "i want to renew my passport",
      "answer": "To renew your Egyptian passport, follow these steps: ...",
      "intent": "procedure_query",
      "tokens_used": 697,
      "created_at": "2026-06-30T12:44:41.603765+03:00"
    }
  ]
}
```

**Field notes**

- `results` is sorted newest first (by `created_at` descending).
- Each item is one past exchange: the user's `message` and the assistant's `answer`.
- `intent` — same categories as above.
- Response is paginated (`count`, `next`, `previous`, `results`). Use `next` for the following page.
- Only saved for logged-in users, so a user who chatted while logged out won't see those messages here.

---

## Suggested history UI

- Show a list of past conversations, newest first.
- Each row: the user's question + a preview of the answer + the date.
- Tapping a row can expand to show the full `answer`.

---

## Code files (reference)

- `ai_agents/api/views.py` — `ChatView` (send message), `ChatHistoryView` (list history).
- `ai_agents/models.py` — `AISession` (stores each exchange).
