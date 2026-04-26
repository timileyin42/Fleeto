# Mini Briefing Report Generator

FastAPI backend using a strict layered architecture:

- API routes (thin)
- Services (business logic)
- Repositories (database access only)
- Models and schemas

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Test

```bash
pytest -q
```
