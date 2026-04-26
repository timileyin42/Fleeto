# AGENTS.md

This repository contains a FastAPI service implementing a Mini Briefing Report Generator.

AI agents MUST follow the rules below when modifying the codebase.

---

# CORE PRINCIPLES

- Follow existing structure strictly
- Do NOT collapse layers
- Keep routes thin
- Keep services focused
- Keep repositories pure (DB only)

---

# ARCHITECTURE

Layered architecture is enforced:

API (routes)
→ Services (business logic)
→ Repositories (database access)
→ Models (schema)

---

# DATABASE RULES

- SQLAlchemy 2.0 style ONLY
- Use Mapped[] and mapped_column()
- Explicit nullable declaration
- Use Decimal for monetary values
- Enforce 3NF normalization
- Use foreign keys for relationships
- UUID primary keys

---

# VALIDATION RULES

Use Pydantic schemas.

Must enforce:

- companyName required
- ticker required and uppercase
- summary required
- recommendation required
- ≥ 2 key points
- ≥ 1 risk
- metrics unique per briefing

---

# REPORT GENERATION

- Do NOT render HTML in Python strings
- Use Jinja2 templates only
- Templates must be in app/templates/

---

# SERVICE LAYER RULES

- Services contain all business logic
- Repositories must not contain logic
- Formatter transforms DB → presentation

---

# REPOSITORY RULES

- No HTTPException
- No business logic
- Only DB queries

---

# API RULES

- Routes must be thin
- Call services only
- Return schemas

---

# ERROR HANDLING

- Use structured errors
- Consistent response format
- No raw exceptions leaking

---

# TESTING

- Mock dependencies where needed
- Test service logic, not framework behavior

---

# FINAL RULE

Keep it clean, simple, and readable.
Avoid overengineering.