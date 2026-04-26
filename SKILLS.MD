# SKILLS.md

This project requires backend engineering skills in FastAPI and relational system design.

---

# CORE STACK

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0
- Pydantic
- Jinja2

---

# REQUIRED SKILLS

## API Design
- RESTful endpoints
- clean routing
- proper status codes

## Database Modeling
- relational schema
- normalization (3NF)
- foreign keys
- indexing

## Architecture
- layered architecture
- separation of concerns
- service-oriented design

## Validation
- Pydantic schemas
- strict input validation
- clear error messages

## Report Rendering
- Jinja2 templates
- HTML structuring
- safe rendering

---

# IMPORTANT PATTERNS

Correct flow:

Route → Service → Repository → DB

---

# AVOID

- fat controllers
- business logic in repositories
- HTML in Python strings
- JSON blobs for structured data

---

# ENGINEERING QUALITY

- readable code
- small functions
- clear naming
- no duplication
- maintainable structure