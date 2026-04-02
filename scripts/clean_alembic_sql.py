#!/usr/bin/env python3
"""Strip alembic bookkeeping statements from an Alembic-generated SQL file.

This script removes the CREATE TABLE/INSERT statements for the
`alembic_version` table so the SQL can be applied to a DB that already
contains Alembic metadata.

Usage: clean_alembic_sql.py <input.sql> <output.sql>
If <output.sql> is omitted the cleaned SQL is printed to stdout.
"""
import re
import sys


def clean_sql(text: str) -> str:
    # Remove CREATE TABLE ... alembic_version { ... ); } blocks
    # This matches 'CREATE TABLE' up to the next line that contains ');'
    cleaned = re.sub(r"CREATE\s+TABLE[\s\S]*?alembic_version[\s\S]*?\);\s*\n", "", text, flags=re.IGNORECASE)

    # Remove INSERT INTO ... alembic_version ...; lines
    cleaned = re.sub(r"INSERT\s+INTO[\s\S]*?alembic_version[\s\S]*?;\s*\n", "", cleaned, flags=re.IGNORECASE)

    # Also remove any COMMENT ON TABLE alembic_version ...; lines
    cleaned = re.sub(r"COMMENT\s+ON\s+TABLE[\s\S]*?alembic_version[\s\S]*?;\s*\n", "", cleaned, flags=re.IGNORECASE)

    return cleaned


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: clean_alembic_sql.py <input.sql> [output.sql]", file=sys.stderr)
        return 2

    inp = argv[1]
    out = argv[2] if len(argv) > 2 else None

    with open(inp, "r", encoding="utf-8") as f:
        src = f.read()

    result = clean_sql(src)

    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(result)
    else:
        sys.stdout.write(result)

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
