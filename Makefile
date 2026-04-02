SHELL := /bin/bash

# Simplified Makefile focused on Alembic and DB helper commands.
# No Docker targets. Designed to work with either `poetry` or a local venv.

.PHONY: help venv install alembic-revision alembic-upgrade alembic-downgrade \
	alembic-sql apply-sql db-shell sql run test clean

# Config
VENV ?= .venv
POETRY := $(shell command -v poetry 2>/dev/null)

ifeq ($(POETRY),)
PY := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
ALEMBIC := $(VENV)/bin/alembic
UVICORN := $(VENV)/bin/uvicorn
else
PY := poetry run python
PIP := poetry install
ALEMBIC := poetry run alembic
UVICORN := poetry run uvicorn
endif

DB_CMD ?= psql
SQL_TMP := /tmp/alembic-head.sql

# Hard-coded dev DATABASE_URL (edit this to a real value for your environment)
# WARNING: don't commit production credentials. Change as needed for local dev.
HARD_CODED_DATABASE_URL ?= postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/hms_saas
# RESOLVED_DATABASE_URL: prefer exported DATABASE_URL, otherwise fall back to the hard-coded dev value
RESOLVED_DATABASE_URL := $(if $(DATABASE_URL),$(DATABASE_URL),$(HARD_CODED_DATABASE_URL))

help:
	@echo "Makefile - common tasks:"
	@echo "  make venv            # create venv and install requirements (if not using poetry)"
	@echo "  make install         # install dependencies (uses poetry if available)"
	@echo "  make alembic-revision m=MSG  # create alembic revision (autogenerate)"
	@echo "  make alembic-upgrade  # apply alembic upgrade head"
	@echo "  make alembic-downgrade to=REV  # downgrade to REV"
	@echo "  make alembic-sql      # write SQL for upgrade head to $(SQL_TMP)"
	@echo "  make apply-sql        # apply $(SQL_TMP) to database (requires DATABASE_URL)"
	@echo "  make db-shell         # open psql using DATABASE_URL"
	@echo "  make sql q='SELECT 1;'  # run a quick SQL command against DATABASE_URL"
	@echo "  make run              # run uvicorn app.main:app --reload"
	@echo "  make test             # run pytest"

venv:
	@if [ -z "$(POETRY)" ]; then \
		if [ ! -d "$(VENV)" ]; then python3 -m venv "$(VENV)"; fi; \
		$(VENV)/bin/python -m pip install --upgrade pip setuptools wheel; \
		if [ -f requirements.txt ]; then $(VENV)/bin/pip install -r requirements.txt; fi; \
	else \
		echo "poetry detected; use 'make install' to install dependencies"; \
	fi

install:
	@if [ -n "$(POETRY)" ]; then \
		echo "Installing via poetry"; poetry install; \
	else \
		echo "Installing into venv ($(VENV))"; $(MAKE) venv; \
	fi

alembic-revision:
	@if [ -z "$(m)" ]; then echo "Provide message: make alembic-revision m='message'"; exit 1; fi
	@echo "Creating alembic revision: $(m)"
	@$(ALEMBIC) revision --autogenerate -m "$(m)"

alembic-upgrade:
	@echo "Running alembic upgrade head"
	@$(ALEMBIC) upgrade head

alembic-downgrade:
	@if [ -z "$(to)" ]; then echo "Provide target revision: make alembic-downgrade to=<rev>"; exit 1; fi
	@$(ALEMBIC) downgrade $(to)

alembic-sql:
	@echo "Generating SQL for alembic upgrade --sql head -> $(SQL_TMP)"
	@$(ALEMBIC) upgrade --sql head > $(SQL_TMP)
	@ls -l $(SQL_TMP) || true

apply-sql:
	@if [ ! -f "$(SQL_TMP)" ]; then echo "$(SQL_TMP) not found — run 'make alembic-sql' first"; exit 1; fi
	@# Resolve a psql-compatible DATABASE_URL (env -> app config -> HARD_CODED_DATABASE_URL)
	@PSQL_URL="`HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py --psql`"; \
	if [ -z "$$PSQL_URL" ]; then \
		echo "ERROR: could not resolve a psql-compatible DATABASE_URL. Set DATABASE_URL or update HARD_CODED_DATABASE_URL in the Makefile."; \
		exit 1; \
	fi; \
	echo "Applying $(SQL_TMP) to DB using $$PSQL_URL"; \
	# If alembic_version already exists, remove its CREATE/INSERT lines from the SQL before applying
	EXISTS="`$(DB_CMD) "$$PSQL_URL" -tA -c "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='alembic_version' LIMIT 1;"`"; \
	if [ "$$EXISTS" = "1" ]; then \
		CLEANED="$(SQL_TMP).cleaned.sql"; \
		echo "alembic_version exists in DB; creating cleaned SQL at $$CLEANED (removing alembic_version creation/insert)"; \
		$(PY) scripts/clean_alembic_sql.py $(SQL_TMP) $$CLEANED; \
		# obtain password (if any) to avoid interactive prompt
		PGPASS="`HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py --password`"; \
		if [ -n "$$PGPASS" ]; then export PGPASSWORD="$$PGPASS"; fi; \
		echo "Applying cleaned SQL file"; \
		$(DB_CMD) "$$PSQL_URL" -f $$CLEANED; \
	else \
		PGPASS="`HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py --password`"; \
		if [ -n "$$PGPASS" ]; then export PGPASSWORD="$$PGPASS"; fi; \
		$(DB_CMD) "$$PSQL_URL" -f $(SQL_TMP); \
	fi

db-shell:
	@# Open a psql shell using the resolved DATABASE_URL (env -> app config -> hard-coded)
	@RESOLVED="`HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py --psql`"; \
	if [ -z "$$RESOLVED" ]; then echo "No DATABASE_URL found. Set DATABASE_URL or update HARD_CODED_DATABASE_URL in the Makefile."; exit 1; fi; \
	echo "Opening psql for $$RESOLVED"; \
	$(DB_CMD) "$$RESOLVED"

sql:
	@if [ -z "$(q)" ]; then echo "Usage: make sql q='SELECT 1;'"; exit 1; fi
	@RESOLVED="`HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py --psql`"; \
	if [ -z "$$RESOLVED" ]; then echo "No DATABASE_URL found. Set DATABASE_URL or update HARD_CODED_DATABASE_URL in the Makefile."; exit 1; fi; \
	$(DB_CMD) "$$RESOLVED" -c "$(q)"

show-db-url:
	@# Print the runtime-resolved DATABASE_URL: env -> app config -> hard-coded
	@printf "Resolved DATABASE_URL: "; HARD_CODED_DATABASE_URL='$(HARD_CODED_DATABASE_URL)' $(PY) scripts/get_database_url.py

run:
	@echo "Starting dev server (uvicorn)"
	@$(UVICORN) app.main:app --reload --port 8000

test:
	@echo "Running tests"
	@$(PY) -m pytest -q

clean:
	@echo "Cleaning up build artifacts"
	@rm -rf __pycache__ *.pyc $(VENV)

.DEFAULT_GOAL := help
