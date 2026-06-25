# GovConnect — API Contracts (Sprint 3)

Discovery & Recommendation endpoints. Base URL: `http://localhost:8000/api/v1`

All responses are JSON. Both endpoints below are public (`AllowAny`) — no auth token required.

---

## 1. Procedure Checklist

Returns a single procedure with its requirements rendered as a checklist.

**Endpoint**

```
GET /api/v1/procedures/<id>
```

> Note: no trailing slash on the detail route. Example: `/api/v1/procedures/1`

**Request**

No body. The `id` is the procedure's integer id.

**Response — 200 OK**

```json
{
  "id": 1,
  "name": "تجديد جواز السفر",
  "description": "تجديد جواز السفر المصري للمواطنين.",
  "estimated_government_fee": "500.00",
  "estimated_processing_days": 5,
  "government_authority": "مصلحة الجوازات والهجرة والجنسية",
  "requirements": [
    { "id": 1, "title": "صورة بطاقة الرقم القومي", "description": "", "done": false },
    { "id": 2, "title": "صورتان شخصيتان حديثتان", "description": "", "done": false }
  ]
}
```

**Field notes**

- `estimated_government_fee` is a **string** (e.g. `"500.00"`), not a number — parse if you need to do math on it.
- `estimated_government_fee` and `estimated_processing_days` may be `null` (optional on the model).
- `requirements` is the checklist array. Each item has `id`, `title`, `description` (may be `""`), and `done`.
- `done` is currently **always `false`** (placeholder). Real per-user completion arrives in Sprint 4 once document uploads exist. The response shape will **not** change then — only the value of `done` will become dynamic. Safe to build the checklist UI against this shape now.

**Errors**

- `404 Not Found` — no active procedure with that id (inactive procedures are treated as not found).

---

## 2. Company Recommendation

Returns companies that perform a given procedure, scored and ranked (best first).

**Endpoint**

```
POST /api/v1/ai/recommend-companies/
```

**Request body (raw JSON)**

```json
{
  "procedure_id": 1,
  "governorate": "القاهرة"
}
```

- `procedure_id` — **required**, integer.
- `governorate` — **optional**. If provided, companies in the same governorate are ranked higher. If omitted, ranking uses price and speed only.

**Response — 200 OK**

```json
{
  "procedure_id": 1,
  "results": [
    {
      "company_id": 1,
      "company_name": "مكتب النيل للخدمات",
      "governorate": "القاهرة",
      "city": "مدينة نصر",
      "price": "700.00",
      "estimated_days": 3,
      "score": 0.74
    },
    {
      "company_id": 3,
      "company_name": "مكتب الإنجاز",
      "governorate": "القاهرة",
      "city": "المعادي",
      "price": "850.00",
      "estimated_days": 2,
      "score": 0.6
    }
  ]
}
```

**Field notes**

- `results` is already **sorted by `score` descending** (best match first). Render in order; no client-side sorting needed.
- `price` is a **string** (e.g. `"700.00"`) — parse if needed.
- `estimated_days` is the company's own completion estimate for this procedure (integer).
- `score` is a float between `0` and `1` (higher is better). It's based on price, location, and speed. Use it for display/sorting if you want; not required to show it to the user.
- `results` can be an **empty array** `[]` (valid `200`) when no companies serve that procedure — show an empty state like "لا توجد شركات متاحة لهذا الإجراء".

**Errors**

- `400 Bad Request` — invalid body (e.g. `procedure_id` missing or not an integer). Standard DRF validation error shape.

---

## Typical flow

1. User asks the AI chat about a procedure → chat returns an answer.
2. UI calls `GET /procedures/<id>` to show the checklist + official fees.
3. UI calls `POST /ai/recommend-companies` with the `procedure_id` (and optional `governorate`) to show the ranked company list.
4. User picks a company → (order flow, Sprint 4).
