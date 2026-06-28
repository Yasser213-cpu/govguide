# GovConnect — Sprint 4: OCR & Document Verification

Backend reference for Sprint 4 (Member A): automatic text extraction from uploaded documents (OCR) and a preliminary verification step that **assists** the company's reviewer. This document is for the frontend team (company dashboard) and as a record of what was built.

Base URL: `http://localhost:8000/api/v1`

---

## Overview

When a client uploads a document to an order, the system **automatically** runs OCR on it (extracts the text), performs a preliminary type check, and stores the result. The company sees the extracted text and assist signals ready, so it can review faster.

**The system assists the reviewer — it does not decide for them.** Final accept/reject stays with the human.

---

## End-to-end flow

1. Client uploads a document → `POST /orders/<order_id>/documents`
2. The endpoint saves the document (`ocr_status = "pending"`) and returns `201` immediately.
3. In the background, a Celery task runs automatically: opens the file, runs OCR (text + confidence).
4. The same task runs verification (type check + signals).
5. The result is saved on the document (`ocr_status = "done"`).
6. The company opens the order in the dashboard and finds the text + signals ready.

The client does **not** wait for OCR — they get an instant response, and processing happens in the background.

---

## Upload endpoint

```
POST /api/v1/orders/<order_id>/documents
```

**Auth:** `Authorization: Bearer <access_token>` — must be a **client** user. Order must be in `pending` status.

**Body:** `form-data`

| Key | Type | Notes |
|-----|------|-------|
| `file` | File | The document image |
| `requirement` | Integer | The requirement id this document fulfills. Must belong to the order's procedure, and must not already have a document. |

**Response — 201 Created**

```json
{
  "requirement": 21,
  "file": "/media/orders/documents/<uuid>.jpg"
}
```

OCR starts automatically right after this response; results appear on the document shortly after (see below).

**Errors**

- `404` — no order with that id.
- `400` — order is not `pending`, requirement doesn't belong to the procedure, or a document already exists for that requirement.

---

## New `Document` fields (OCR results)

These fields hold the OCR + verification output:

| Field | Type | Meaning |
|-------|------|---------|
| `extracted_text` | text | Text extracted by OCR |
| `ocr_confidence` | float (0..100) | Average OCR confidence |
| `ocr_status` | string | `pending` / `done` / `failed` |
| `needs_review` | boolean | Any signal that warrants human review? |
| `verification_flags` | list | List of signals (see below) |

These come back in the company order detail endpoint (the document list per order).

---

## `ocr_status` values (important for the UI)

The process is async, so this field tells you which stage the document is at:

- `pending` → uploaded, OCR hasn't run yet (right after upload).
- `done` → OCR + verification finished, results are ready.
- `failed` → an error occurred (corrupt file, unreadable image).

Use this to show "Processing..." while `pending`, the results when `done`, or an error state when `failed`.

---

## Verification signals (`verification_flags`)

A list with zero or more of these:

| Flag | Meaning |
|------|---------|
| `low_confidence` | OCR confidence is low (< 40) — image is probably unclear |
| `little_text` | Extracted text is very short — file may not be a readable image |
| `type_uncertain` | Document type doesn't match the expected requirement, or is uncertain |

- Empty list (`[]`) and `needs_review = false` → document looks fine.
- Any flag present → `needs_review = true`, reviewer should check it.

**Dashboard note:** use `needs_review` to **highlight / sort** documents (color, badge), not to **hide** the ones that are `false`. The reviewer should see all documents; the flag just draws attention. This way, if the system is wrong, no document gets skipped.

---

## Verification philosophy

The check does two things:
1. **Quality check:** is confidence low? is the text nearly empty?
2. **Type check:** does the uploaded document match the expected requirement? (e.g. expected "ID card" but a passport was uploaded)

The type check uses **keyword matching**: each document type has keywords that confirm it (positive) and keywords that rule it out (negative). E.g. if the expected type is "ID card" but the text contains "passport", the system flags it as the wrong type.

This is **intentionally not 100% precise** — keyword matching is inherently limited (e.g. an Egyptian passport itself contains "national number"). That's **acceptable** because the system is "assist": worst case, the reviewer looks themselves. The goal is to direct attention, not to make the final decision.

---

## Operational notes (for the team after pulling)

- **`docker compose build`** required — new system packages in the Dockerfile: `tesseract-ocr` and `tesseract-ocr-ara` (Arabic language).
- **`migrate`** — new fields on the `Document` model.
- **Re-seed procedures:** the `Requirement`↔`Procedure` relation is now `ManyToMany`. If you have old requirements, clear them and re-run `seed_procedures`:
  ```
  Requirement.objects.all().delete()
  python manage.py seed_procedures
  ```
- **After editing task files:** `docker compose restart celery` (the worker has no autoreload).

---

## Code files (reference)

- `ai_agents/ocr.py` — `extract_text(path)` → text + confidence.
- `ai_agents/verification.py` — `verify_document(document)` → flags + needs_review.
- `ai_agents/tasks.py` — Celery task `run_ocr_on_document(document_id)` ties them together.
- `orders/api/views.py` — `UploadOrderDocument` triggers the task after upload (`run_ocr_on_document.delay(document.id)`).
