#!/usr/bin/env zsh
# reset_env.zsh — reset the project's Python development environment
#
# This script is a safe, repeatable helper to rebuild the project's virtual
# environment, clear common Python build/test caches, and (optionally)
# install requirements from `requirements.txt`.
#
# Features
# - Removes any existing virtualenv directory (default: .venv)
# - Removes Python bytecode caches and common build/test artifacts
# - Recreates a new virtualenv and upgrades pip/setuptools/wheel
# - Installs requirements from requirements.txt (if present)
# - When sourced, the script will automatically activate the venv in the
#   current shell session. When executed, it prints activation instructions.
#
# Usage
#   ./scripts/reset_env.zsh              # recreate venv and install deps
#   source ./scripts/reset_env.zsh       # recreate venv, install deps, and activate
#   ./scripts/reset_env.zsh --help       # show this help
#
# Notes
# - This script is intended for local development only. Do not use it on
#   production systems or CI without reviewing the actions it performs.
# - The script will attempt to be non-destructive: it only removes the
#   configured venv directory and common cache directories.

set -euo pipefail

usage() {
  cat <<-USAGE
Usage: $0 [--help]

Reset the Python development environment for this project.

Options:
  --help      Show this help message and exit.

Examples:
  # Recreate venv and install deps (non-interactive)
  ./scripts/reset_env.zsh

  # Recreate venv and activate it in the current shell
  source ./scripts/reset_env.zsh
USAGE
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

PROJECT_ROOT="$(cd "$(dirname "${0%/*}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "[reset_env] Project root: $PROJECT_ROOT"

# Basic prerequisites
if ! command -v python3 >/dev/null 2>&1; then
  echo "[reset_env][ERROR] python3 not found — please install Python 3.8+"
  exit 1
fi

VENV_NAME=".venv"

echo "[reset_env] Deactivating any active venv in this shell (if present)"
deactivate 2>/dev/null || true

if [ -d "$VENV_NAME" ]; then
  echo "[reset_env] Removing existing virtualenv: $VENV_NAME"
  rm -rf "$VENV_NAME"
else
  echo "[reset_env] No existing virtualenv found at $VENV_NAME"
fi

echo "[reset_env] Removing Python bytecode caches and build/test artifacts"
find . -type d -name "__pycache__" -prune -exec rm -rf {} + 2>/dev/null || true
rm -rf .pytest_cache 2>/dev/null || true
rm -rf build dist *.egg-info 2>/dev/null || true

echo "[reset_env] Attempting to clear pip cache (best-effort)"
# Use system pip if available; ignore failures.
if command -v pip >/dev/null 2>&1; then
  pip cache purge || true
fi

echo "[reset_env] Creating virtualenv: $VENV_NAME"
python3 -m venv "$VENV_NAME"

echo "[reset_env] Upgrading pip, setuptools and wheel inside new venv"
"$VENV_NAME/bin/python" -m pip install --upgrade pip setuptools wheel

if [ -f requirements.txt ]; then
  echo "[reset_env] Installing requirements from requirements.txt"
  "$VENV_NAME/bin/pip" install -r requirements.txt
else
  echo "[reset_env] No requirements.txt found — skipping pip install"
fi

# If the script is sourced, activate the new venv in the current shell.
if [ "${ZSH_EVAL_CONTEXT:-}" = "toplevel" ] || [ -n "${BASH_SOURCE-}" -a "$0" != "$BASH_SOURCE" ]; then
  echo "[reset_env] Activating virtualenv in current shell"
  # shellcheck disable=SC1090
  source "$VENV_NAME/bin/activate"
  echo "[reset_env] Virtualenv activated. Use: deactivate to exit."
else
  echo "[reset_env] Done. To activate the venv in your shell run:"
  echo "  source $VENV_NAME/bin/activate"
fi

echo "[reset_env] Completed successfully."
