# GovConnect — Company Insights API

Backend reference for the company insights feature (Member A): an endpoint that tells a company **why it ranks where it does** for a given procedure, with concrete strengths, weaknesses, and advice. For the frontend team (company dashboard).

Base URL: `http://localhost:8000/api/v1`

---

## Overview

A company owner can request an analysis of their performance for a specific procedure. The system compares the company against its competitors (using the same logic as the recommendation engine) and returns its rank plus actionable advice — where it's strong, where it's weak, and what to improve.

This helps companies understand why they're (not) being chosen and how to climb the ranking.

---

## Get company insights

```
GET /api/v1/ai/company-insights/<procedure_id>
```

**Auth:** `Authorization: Bearer <access_token>` — must be a **company owner**. Each company only sees its own analysis (the company is resolved from the token, not the URL).

**Path parameter:**
- `procedure_id` (integer) — the procedure to analyze the company's performance for.

**Response — 200 OK**

```json
{
  "rank": 1,
  "total": 3,
  "strengths": [
    "سعرك (600.0 جنيه) أقل من متوسط المنافسين (716.67 جنيه) — نقطة قوة تجذب العملاء.",
    "تقييمك (5.0) هو الأعلى بين المنافسين — حافظ عليه."
  ],
  "weaknesses": [
    "مدة إنجازك (5 أيام) أبطأ من الأسرع (2 أيام) — تسريع الخدمة يحسّن ترتيبك."
  ]
}
```

**Field notes**

- `rank` — the company's position among competitors for this procedure (1 = best).
- `total` — total number of companies offering this procedure.
- `strengths` — array of Arabic strings; the company's advantages, with the actual numbers.
- `weaknesses` — array of Arabic strings; areas to improve, each with a concrete suggestion.
- `strengths` / `weaknesses` may be empty arrays.
- The advice text is Arabic (ready to display).

**Errors**

- `400` — the account is not linked to a company, or the company doesn't offer this procedure.
- `403` — the user is not a company owner.

---

## How the analysis works (for context)

The company is scored on the same four dimensions as the recommendation engine: price, location, speed, and rating. The insight compares the company's values against the competitors':
- **Price** vs the average competitor price.
- **Rating** vs the best rating (and flags companies with no reviews yet).
- **Speed** vs the fastest competitor.

Each dimension becomes a strength or a weakness with a short recommendation. The analysis is data-driven (real numbers from the DB), not generated text.

---

## Suggested UI

- Show `rank` prominently (e.g. "ترتيبك: 1 من 3").
- List `strengths` with a positive marker (green / ✓).
- List `weaknesses` with an attention marker (amber / !), since each includes a recommendation.
- Optionally let the company pick which procedure to analyze (dropdown of the procedures it offers).

---

## Code files (reference)

- `ai_agents/company_insights.py` — `analyze_company()` (numeric analysis) + `build_advice()` (Arabic advice).
- `ai_agents/api/views.py` — `CompanyInsightsView` (company-owner-only endpoint).
