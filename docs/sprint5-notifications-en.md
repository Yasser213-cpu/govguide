# GovConnect — Sprint 5: Notifications API

Backend reference for the notifications feature (Member A): users get notified automatically when their order's status changes. This document is for the frontend team (notifications UI / bell) and as a record of what was built.

Base URL: `http://localhost:8000/api/v1`

---

## Overview

When a company changes an order's status (accepted, rejected, paid, completed), the system **automatically** creates a notification for the order's owner (and emails them). The notification is stored, and the user fetches their notifications via the endpoint below.

The notification is created in the background (async via Celery), so changing the status returns instantly.

---

## How it works (flow)

1. Company changes an order status → `PATCH /orders/<id>/status/`
2. The backend automatically fires a background task.
3. The task creates a `Notification` record for the order's owner and sends an email.
4. The user fetches their notifications → `GET /notifications/`

The frontend polls `GET /notifications/` (e.g. on page load, or periodically) to show the user's notifications. Real-time push (WebSockets) is a separate concern handled elsewhere; this endpoint is the core, reliable source.

---

## List notifications

Returns the current user's notifications, newest first.

**Endpoint**

```
GET /api/v1/notifications/
```

**Auth:** `Authorization: Bearer <access_token>` — required. Each user only sees their own notifications.

**Response — 200 OK** (paginated)

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "notification_type": "accepted",
      "message": "تم قبول طلبك رقم #5",
      "order": 5,
      "is_read": false,
      "created_at": "2026-06-27T12:18:15.428605+03:00"
    },
    {
      "id": 1,
      "notification_type": "accepted",
      "message": "تم قبول طلبك رقم #5",
      "order": 5,
      "is_read": false,
      "created_at": "2026-06-27T12:08:11.043370+03:00"
    }
  ]
}
```

**Field notes**

- `results` is already sorted **newest first** (by `created_at` descending).
- `notification_type` — one of `accepted`, `rejected`, `paid`, `completed`. Use it for the icon/color.
- `message` — ready-to-display Arabic text.
- `order` — the related order id. Use it to link the notification to the order page.
- `is_read` — currently always `false` (see note below).
- Response is **paginated** (`count`, `next`, `previous`, `results`). Use `next` for the following page.

**Unread count:** the bell badge can use `count` from a filtered call, or count `is_read: false` items client-side. (A dedicated unread-count endpoint can be added later if needed.)

---

## Notification types

| Type | When it fires |
|------|---------------|
| `accepted` | Company accepted the order |
| `rejected` | Company rejected the order |
| `paid` | Payment confirmed |
| `completed` | Order completed |

---

## Notes

- **Mark-as-read** is not implemented yet — all notifications return `is_read: false`. A `PATCH /notifications/<id>/read/` endpoint can be added if the UI needs read/unread state.
- Notifications are created automatically on order status changes; the frontend does not create them.
- The email send is best-effort — a notification record is always created even if the email fails.

---

## Code files (reference)

- `notifications/models.py` — `Notification` model (user, order, type, message, is_read, created_at).
- `notifications/tasks.py` — Celery task `send_order_notification(order_id, type, message)`.
- `notifications/api/views.py` — `NotificationListView` (lists the current user's notifications).
- `orders/api/views.py` — `OrderStatusAPIView` fires the task after a status change.
