#!/usr/bin/env zsh
# Pin current installed dependencies into requirements-pinned.txt
# Usage:
#   ./scripts/pin_deps.zsh         # creates .venv (if needed), installs requirements.txt and writes pinned file
#   source ./scripts/pin_deps.zsh  # same but activates venv in current shell

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${0%/*}")/.." && pwd)"
cd "$PROJECT_ROOT"

VENV_NAME=".venv"

if [ ! -d "$VENV_NAME" ]; then
  echo "[pin_deps] Creating virtualenv: $VENV_NAME"
  python3 -m venv "$VENV_NAME"
fi

echo "[pin_deps] Activating virtualenv"
# shellcheck disable=SC1090
source "$VENV_NAME/bin/activate"

echo "[pin_deps] Upgrading pip"
pip install --upgrade pip setuptools wheel

if [ -f requirements.txt ]; then
  echo "[pin_deps] Installing (unpinned) requirements from requirements.txt"
  pip install -r requirements.txt
else
  echo "[pin_deps] No requirements.txt found — aborting"
  exit 1
fi

echo "[pin_deps] Writing pinned requirements to requirements-pinned.txt"
pip freeze > requirements-pinned.txt
echo "[pin_deps] Done. Commit requirements-pinned.txt to lock dependencies for reproducible installs."
