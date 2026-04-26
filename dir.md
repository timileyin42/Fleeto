python-service/
│
├── app/
│   ├── main.py
│   │
│   ├── core/                  # config, settings, db, security
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── exceptions.py
│   │
│   ├── models/                # SQLAlchemy models (2.0 style)
│   │   ├── briefing.py
│   │   ├── briefing_point.py
│   │   ├── briefing_risk.py
│   │   └── briefing_metric.py
│   │
│   ├── schemas/               # Pydantic validation schemas
│   │   ├── briefing.py
│   │   ├── report.py
│   │   └── common.py
│   │
│   ├── repositories/          # DB access layer ONLY
│   │   ├── briefing_repo.py
│   │   └── base.py
│   │
│   ├── services/              # Business logic layer
│   │   ├── briefing_service.py
│   │   ├── report_service.py
│   │   └── formatter.py       # transforms DB → report view model
│   │
│   ├── api/                   # Routes (thin controllers)
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── router.py
│   │       └── briefing.py
│   │
│   ├── templates/             # Jinja2 templates
│   │   └── briefing_report.html
│   │
│   └── utils/
│       └── helpers.py
│
├── migrations/                # Alembic (if used)
│
├── tests/
│   ├── test_briefings.py
│   └── test_reports.py
│
├── requirements.txt
├── README.md
├── AGENTS.md
├── SKILLS.md
└── .github/
    └── copilot-instructions.mdS