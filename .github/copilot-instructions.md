# copilot-instructions.md

This repository uses FastAPI with a strict layered architecture.

Copilot MUST follow these rules.

---

# DO NOT BREAK STRUCTURE

Use:

- models → DB
- repositories → queries
- services → logic
- api → routes

---

# FASTAPI RULES

- Use Pydantic schemas
- Keep routes thin
- Use dependency injection

---

# DATABASE RULES

- SQLAlchemy 2.0 only
- Use Mapped[] syntax
- No raw SQL

---

# REPORT GENERATION

- Use Jinja2 templates
- Do NOT build HTML in Python

---

# VALIDATION

Always validate inputs with schemas.

---

# GOOD CODE STYLE

- small functions
- clear naming
- no deep nesting

---

# WHEN UNSURE

Choose simple, readable, maintainable code.