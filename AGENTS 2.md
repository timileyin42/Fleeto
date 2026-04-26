# AGENTS.md
# Fleeto Backend — AI Agent Instructions

You are building the backend for **Fleeto**, a logistics operations platform
for small dispatch businesses in Lagos, Nigeria. This file is the single
source of truth for how you think, plan, and write code in this repository.

Read this file fully before writing any code. If something here conflicts
with a user instruction, flag it and ask — do not silently override it.

---

## What Fleeto Does

Fleeto has three user types:

| Actor      | Auth method        | Primary surface         |
|------------|--------------------|-------------------------|
| Operator   | Email + password   | Web dashboard           |
| Rider      | Phone + OTP        | Mobile PWA              |
| Customer   | None (token only)  | Public tracking page    |

Core flows:
1. Operator creates a job (pickup to drop-off, assigns rider)
2. Rider receives job on mobile, marks status (picked up to delivered)
3. Customer gets a WhatsApp link and tracks in real time
4. Operator sees all riders on a live map

---

## Project Layout

```
python-service/
├── app/
│   ├── main.py                  # FastAPI app init, middleware, router mount
│   ├── core/                    # Config, DB session, security, exceptions
│   ├── models/                  # SQLAlchemy 2.0 ORM models
│   ├── schemas/                 # Pydantic v2 request/response schemas
│   ├── repositories/            # DB access layer ONLY — no business logic
│   ├── services/                # Business logic — calls repos, not DB directly
│   ├── api/v1/                  # Route handlers — thin, delegate to services
│   ├── templates/               # Jinja2 (customer tracking page only)
│   └── utils/                   # Stateless helpers
├── migrations/                  # Alembic migrations
├── tests/                       # pytest test suite
├── AGENTS.md                    # This file
├── SKILLS.md                    # Code patterns and reusable examples
└── CLAUDE.md                    # Claude-specific behaviour rules
```

---

## Architecture Rules

### Layer responsibilities — never cross these

```
Route handler  =>  validates input, calls service, returns response
Service        =>  business logic, orchestration, calls repositories
Repository     =>  database access only, no logic
Model          =>  SQLAlchemy table definition only
Schema         =>  Pydantic shape only, no DB imports
```

Never:
- Import a model into a route handler directly
- Write a DB query inside a service
- Write business logic inside a repository
- Import a service into a repository

### Async everywhere

All endpoints, services, and repository methods must be async.
Use AsyncSession from SQLAlchemy. Never use .all() or .first() —
use await session.execute(...) and .scalars().

### Dependencies via injection

Database sessions and current user are always injected via Depends().
Never instantiate a session or decode a token manually inside a handler.

```python
# correct
async def get_jobs(
    db: AsyncSession = Depends(get_db),
    current_operator: Operator = Depends(get_current_operator),
):
```

---

## Naming Conventions

| Thing              | Convention              | Example                        |
|--------------------|-------------------------|--------------------------------|
| Files              | snake_case              | job_service.py                 |
| Classes            | PascalCase              | JobService, JobCreate          |
| Functions          | snake_case              | create_job, get_rider_by_id    |
| Endpoints          | snake_case nouns        | /jobs, /riders/{rider_id}      |
| DB columns         | snake_case              | created_at, operator_id        |
| Env variables      | UPPER_SNAKE             | DATABASE_URL, JWT_SECRET       |
| Schema suffixes    | Create/Update/Response  | JobCreate, JobResponse         |

---

## Domain Models

| Domain      | Model file         | What it represents                         |
|-------------|--------------------|--------------------------------------------|
| operator    | operator.py        | Business owner, manages the fleet          |
| fleet       | fleet.py           | The operator's named business entity       |
| rider       | rider.py           | Dispatch rider, belongs to a fleet         |
| job         | job.py             | A single delivery task                     |
| tracking    | tracking.py        | Real-time location pings from rider        |

---

## Job Lifecycle

Jobs move through these statuses in order. No skipping.

  created -> assigned -> picked_up -> in_transit -> delivered
                                                 -> failed

Status transitions are enforced in job_service.py, not in the route handler.

---

## Auth Rules

- Operators: email + bcrypt password => JWT access token + refresh token
- Riders: phone number => OTP SMS => JWT with role=rider
- Customers: no auth — signed tracking token in URL containing job_id + expiry
  Validate in tracking_service.py — never expose internal IDs

Token claims must always include: sub (user id), role, iat, exp.

---

## API Design

- All routes versioned under /api/v1/
- Use nouns not verbs: /jobs not /create-job
- Bulk operations use nested routes: /fleets/{fleet_id}/riders
- Pagination on all list endpoints: ?page=1&page_size=20
- Errors always return { "detail": "...", "code": "..." }
- HTTP status codes must be semantically correct

---

## Real-time (WebSockets)

Rider location updates use WebSockets.

  Operator listens:  WS /ws/operators/{operator_id}/live
  Rider pings:       WS /ws/riders/{rider_id}/location

Location pings are stored in the tracking table and broadcast
to the connected operator. Keep WebSocket handlers thin —
delegate to tracking_service.py.

---

## Testing Rules

- Every service method must have at least one test
- Every route must have at least one integration test
- Use pytest with httpx.AsyncClient for route tests
- Use a separate test database — never the dev database
- Mock external services (WhatsApp API, SMS) with pytest-mock
- Test files mirror source: app/services/job_service.py => tests/test_jobs.py

---

## What to Ask Before Building

Before implementing any feature, confirm:

1. Which layer does this belong in?
2. Does a repo method already exist for this DB operation?
3. Does this need a new schema or can an existing one be extended?
4. Does this touch auth — if so, which role is allowed?
5. Does this need a migration?

If unsure about any of these, ask. Do not assume.
