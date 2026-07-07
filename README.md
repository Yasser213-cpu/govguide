# Gov Guide

**Gov Guide** is a full-stack, AI-powered government services platform that connects citizens who need official paperwork completed with service companies and offices that can complete it on their behalf. The platform guides citizens through government procedures with a conversational AI assistant, recommends the best-fit companies for a given procedure, manages the full order lifecycle from placement to completion, and uses OCR to help companies verify uploaded documents faster.

Built as a graduation project under ITI's Full-Stack Web & Generative AI Development Using Python track.

## Repository

https://github.com/Yasser213-cpu/govguide/pull/49

---

## Table of Contents

- [Overview](#overview)
- [The Product Flow](#the-product-flow)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Models](#data-models)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [AI Capabilities](#ai-capabilities)
- [Testing Strategy](#testing-strategy)
- [CI/CD & Deployment](#cicd--deployment)
- [Security Measures](#security-measures)
- [MVP vs. Nice-to-Have](#mvp-vs-nice-to-have)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Government paperwork is often confusing, slow, and paper-heavy — citizens don't always know what documents they need, what the official fees are, or which office/company can help. Gov Guide solves this by pairing an AI assistant that understands government procedures with a marketplace of vetted service companies, and by digitizing the entire order-to-completion journey.

The platform serves two sides of the marketplace:

- **Citizens** — get guided answers, a checklist of requirements, official fees, and a ranked list of companies that can complete a given procedure on their behalf.
- **Companies** — get a dashboard of incoming orders with OCR-assisted document review, so they can accept or reject faster and with more confidence.

---

## The Product Flow

This flow is the single source of truth for how the system behaves end to end:

```
1. Citizen asks the AI chat about a procedure
        │
        ▼
2. AI returns a CHECKLIST + steps + official government fees
        │
        ▼
3. System RECOMMENDS companies that can do it (scored)
        │
        ▼
4. Citizen picks a company, uploads documents, places an ORDER
        │
        ▼
5. Company reviews documents (OCR + verification ASSIST)
        │
        ▼
6. Company ACCEPTS or asks for FIXES
        │
        ▼
7. After acceptance → citizen PAYS
        │
        ▼
8. Company fulfills the procedure → status TRACKING
        │
        ▼
9. Completed → citizen REVIEWS the company
        │
        ▼
10. Review score feeds back into the RECOMMENDATION ENGINE (loop)
```

> **Key design decision:** payment happens only *after* a company verifies the documents and accepts the order. This protects citizens from paying for a request that later gets rejected for missing paperwork. OCR/verification is an assistive tool for the company's review — never a hard gate the citizen must pass alone.

---

## Features

### For Citizens
- Conversational AI assistant that answers procedure questions in Arabic, powered by a Retrieval-Augmented Generation (RAG) pipeline over official government documents
- Auto-generated checklists showing required documents/steps and official government fees per procedure
- Scored, ranked company recommendations based on procedure match, historical rating, price, and location
- Document upload at order placement, with support for multiple required documents per order
- Order status tracking with a live progress timeline (`pending → accepted/rejected → paid → in_progress → completed`)
- Payment step gated behind company acceptance — never pay before the paperwork is verified
- Post-completion review system (star rating + comment)
- Notifications on every status change (accepted, rejected, paid, completed)

### For Companies
- Dashboard of incoming orders with OCR-extracted text and automated verification flags
- Ability to accept an order or request fixes/re-uploads before accepting
- Company profile management: services offered, pricing, location
- Average rating driven by citizen reviews, which directly affects future recommendation ranking

### Platform-Wide
- Role-based permissions across citizen, company, and company-staff roles
- Async processing (OCR, notifications) via Celery + Redis so the API stays responsive
- Arabic-first UX with RTL support throughout
- Loading, empty, and error states across all major flows

---

## Tech Stack

### Backend
| Component | Choice |
|---|---|
| Web framework | Django + Django REST Framework |
| Database | PostgreSQL |
| Task queue | Celery, with Redis as the broker |
| AI / RAG | ChromaDB embeddings + LLM (LangChain-style retrieval pipeline) |
| OCR | pytesseract, with Arabic language support |
| Auth | JWT, with email OTP verification and password reset |
| Containerization | Docker & Docker Compose |
| CI | Automated pipeline for tests and builds |

### Frontend
| Component | Choice |
|---|---|
| Framework | React.js (functional components + hooks) |
| Routing | React Router |
| HTTP client | Axios |
| Localization | RTL support for Arabic |

---

## Architecture

```
Citizen / Company User
        │
        ▼
   React Frontend  ──(Axios)──►  DRF API (Django)
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
              PostgreSQL      Celery Workers     RAG / LLM Pipeline
              (orders,        (OCR, async         (ChromaDB +
               users,          notifications)      embeddings)
               reviews, ...)
```

- **`users`** — custom user model (citizen/company), JWT auth, email OTP, password reset
- **`ai_agents`** — RAG pipeline, chat endpoint, intent detection, AI session/token logging
- **`procedures`** — procedure + requirement models, checklist generation, seeding
- **`companies`** — company profiles, services offered, pricing, location
- **`orders`** — order lifecycle, document attachments, dual namespace for citizen vs. company access
- **`reviews`** — post-completion ratings that feed the recommendation engine
- **`notifications`** — async, Celery-driven notifications on status changes

---

## Data Models

### Order
| Field | Description |
|---|---|
| `user` | FK — citizen who placed the order |
| `company` | FK — company fulfilling the order |
| `procedure` | FK — the government procedure being requested |
| `status` | `pending` → `accepted` / `rejected` → `paid` → `in_progress` → `completed` |
| `created_at` / `updated_at` | Timestamps |

### Document
| Field | Description |
|---|---|
| `order` | FK — parent order |
| `file` | Uploaded document |
| `ocr_text` | Extracted text from OCR (Celery async) |
| `verification_flag` | Assist signal: clear / unclear / missing |

### Company Profile
| Field | Description |
|---|---|
| `user` | FK — company-owning user |
| `services` | Procedures the company can fulfill |
| `price_list` | Pricing per procedure |
| `location` | Used in recommendation scoring |
| `average_rating` | Aggregated from Reviews |

### Review
| Field | Description |
|---|---|
| `order` | One-to-one — the completed order |
| `rating` | 1–5 stars |
| `comment` | Optional text feedback |

---

## Project Structure

```
govguide/
├── backend/
│   ├── ai_agents/          # RAG pipeline, chat, intent detection, AI sessions
│   ├── procedures/         # Procedures, requirements, checklists
│   ├── companies/          # Company profiles, services, pricing
│   ├── orders/              # Order lifecycle, documents, dual URL namespace
│   ├── reviews/             # Ratings feeding the recommendation engine
│   ├── notifications/       # Celery-driven status notifications
│   ├── users/                # Auth, JWT, OTP
│   └── govguide/             # Project settings, Celery config, urls
├── frontend/
│   ├── citizen/             # Chat, checklist, company list, order flow, uploads
│   └── company-dashboard/   # Incoming orders, OCR review, status tracking UI
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis
- Docker & Docker Compose (optional, recommended)

### Backend

```bash
git clone https://github.com/Yasser213-cpu/govguide.git
cd govguide/backend
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Set up your `.env` file (see [Environment Variables](#environment-variables)), then:

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for admin access
python manage.py runserver
```

Start the Celery worker in a separate terminal (required for OCR and notifications):

```bash
celery -A govguide worker -l info
```

### Frontend

```bash
cd govguide/frontend
npm install
```

Set up your `.env` file, then:

```bash
npm run dev
```

### With Docker Compose

```bash
docker-compose up --build
```

This brings up the backend, frontend, PostgreSQL, Redis, and the Celery worker together.

---

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local development |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `REDIS_URL` | Redis connection string, e.g. `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | API key for the LLM used in the RAG pipeline |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:8000/api` |

---

## API Documentation

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new citizen or company user |
| POST | `/api/auth/login/` | Obtain JWT access/refresh tokens |
| POST | `/api/auth/verify-otp/` | Verify account via email OTP |
| POST | `/api/auth/reset-password/` | Request/confirm a password reset |

### AI & Procedures
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/chat/` | Ask the AI assistant about a procedure |
| GET | `/procedures/<id>/` | Checklist with per-user completion status |
| POST | `/ai/recommend-companies/` | Ranked list of companies for a procedure |

### Companies
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/companies/` | List / register company profiles |
| GET | `/companies/<id>/` | Company profile detail |

### Orders & Documents
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/orders/` | List or place citizen orders |
| GET/PATCH | `/orders/<id>/` | View or update an order's status |
| POST | `/orders/<id>/documents/` | Upload required documents for an order |
| GET/PATCH | `/company/orders/` | Company-side namespace for reviewing/actioning orders |

### Reviews & Notifications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders/<id>/review/` | Submit a rating and comment after completion |
| GET | `/notifications/` | Retrieve in-app notifications |

> Full request/response schemas, permission matrices, and example payloads are maintained in the team's internal API documentation per module (users/auth, procedures/companies, orders/reviews).

---

## AI Capabilities

**Retrieval-Augmented Generation (RAG) Assistant** — citizen questions are answered using a RAG pipeline built on ChromaDB embeddings over official Arabic-language procedure documents, combined with an LLM for natural-language responses and intent detection.

**Recommendation Engine** — companies are scored using ORM-based filtering and a weighted scoring function considering procedure match, historical rating, price, and location, continuously refined as new reviews arrive.

**OCR & Document Verification** — uploaded documents are processed asynchronously via Celery using pytesseract (Arabic-aware). Extracted text is used to detect document type and flag unclear or missing documents as an assist signal for the reviewing company — never an automatic reject.

---

## Testing Strategy

- **Unit Testing** — backend functions, serializers, and frontend components tested in isolation
- **Integration Testing** — API endpoints, database interactions, and AI/OCR pipeline integration
- **End-to-End Testing** — full citizen and company journeys, from chat to order completion
- **Regression Testing** — automated tests for AI endpoints, recommendation scoring, and the order lifecycle, wired into CI

---

## CI/CD & Deployment

- Dockerized services orchestrated via a single root `docker-compose.yml`
- CI/CD pipeline automating build, test, and deployment steps
- Cloud deployment (e.g., AWS) with HTTPS and production settings
- Managed PostgreSQL for automated backups, scaling, and high availability

---

## Security Measures

- JWT-based authentication with email OTP verification
- Role-based access control (citizen / company / company staff)
- Split serializers by purpose to prevent over-exposure of fields
- Server-side permission checks on all order, document, and review endpoints
- Centralized error handling and input validation
- Documents stored and served through authenticated, permission-checked endpoints only

---

## MVP vs. Nice-to-Have

| MVP (must demo) | Nice-to-have (defer) |
|---|---|
| AI chat + checklist + fees; company recommendation; order with upload; OCR-assisted review; accept/pay (simulated); status tracking; reviews; email notifications | Real payment gateway; in-app realtime notifications; chat memory across messages; advanced Arabic OCR; company analytics; delivery integration |

---

## Roadmap

- [ ] Real payment gateway integration (Paymob / Stripe)
- [ ] In-app real-time notifications
- [ ] Persistent AI chat memory across a conversation
- [ ] Improved Arabic OCR for scanned government IDs and forms
- [ ] Company analytics dashboards
- [ ] Delivery/courier integration for physical document handoff

---

## License

Developed for academic use only as part of ITI's Full-Stack Web & Generative AI Development Using Python track. Commercial use is prohibited without prior permission.
