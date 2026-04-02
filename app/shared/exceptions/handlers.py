
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

GENERIC_NOTE = "There might be ODBC, SQL, or other API issues. Please check your request and try again."


def build_error_message(msg: str, user_msg: str = None, exc_type: str = None) -> str:
    type_info = f" [ErrorType: {exc_type}]" if exc_type else ""
    if user_msg:
        return f"{user_msg}{type_info} {GENERIC_NOTE}"
    return f"{msg}{type_info} {GENERIC_NOTE}"


def sqlalchemy_integrity_error_handler(request: Request, exc: IntegrityError):
    msg = str(exc.orig)
    exc_type = type(exc.orig).__name__ if hasattr(exc, 'orig') else type(exc).__name__
    if "duplicate key" in msg or "UNIQUE" in msg or "duplicate" in msg:
        user_msg = "Duplicate or unique constraint violation."
        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "status_code": 409,
                "message": None,
                "data": None,
                "error": build_error_message(msg, user_msg, exc_type)
            },
        )
    if "IDENTITY_INSERT" in msg:
        user_msg = "Cannot insert explicit value for identity column. Remove explicit ID or check your model."
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "status_code": 400,
                "message": None,
                "data": None,
                "error": build_error_message(msg, user_msg, exc_type)
            },
        )
    user_msg = "Database integrity error."
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "status_code": 400,
            "message": None,
            "data": None,
            "error": build_error_message(msg, user_msg, exc_type)
        },
    )


def validation_error_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI validation errors with detailed field information.

    Special-cases JSON parsing errors so clients get a clearer message (these happen
    before Pydantic field validation).
    """
    errors: list[str] = []

    for error in exc.errors():
        loc = error.get("loc", ())
        msg = error.get("msg", "Validation error")
        err_type = error.get("type")
        ctx = error.get("ctx") or {}

        # FastAPI/Pydantic emits JSON parsing errors with a location like ('body', <char_pos>)
        # and a message like "JSON decode error".
        if err_type in {"json_invalid", "value_error.jsondecode"} or msg.lower().startswith("json decode error"):
            char_pos = None
            if isinstance(loc, (list, tuple)) and len(loc) >= 2 and isinstance(loc[1], int):
                char_pos = loc[1]

            ctx_error = ctx.get("error")
            ctx_error_str = str(ctx_error) if ctx_error is not None else None

            pos_part = f" at character {char_pos}" if char_pos is not None else ""
            hint = "If your strings contain newlines, escape them as \\n."
            detail = f" ({ctx_error_str})" if ctx_error_str else ""
            errors.append(f"Invalid JSON body{pos_part}{detail}. {hint}")
            continue

        # Default formatting for regular validation errors
        if isinstance(loc, (list, tuple)) and loc and loc[0] == "body":
            loc = loc[1:]

        field = " -> ".join([str(part) for part in loc])
        errors.append(f"{field}: {msg}" if field else msg)

    error_msg = "Validation failed: " + "; ".join(errors)

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "status_code": 422,
            "message": None,
            "data": None,
            "error": error_msg
        },
    )


def generic_exception_handler(request: Request, exc: Exception):
    user_msg = "Internal server error."
    exc_type = type(exc).__name__
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status_code": 500,
            "message": None,
            "data": None,
            "error": build_error_message(str(exc), user_msg, exc_type)
        },
    )
