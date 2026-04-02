import json
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from typing import  Any, Optional

def extract_message_from_data(data: Any) -> Optional[str]:
    """Extract message from data for success responses"""
    if isinstance(data, dict):
        # Check for message field in standardized delete responses
        if "message" in data and isinstance(data["message"], str):
            return data["message"] 
        # Check for other common message patterns
        if "detail" in data and isinstance(data["detail"], str):
            return data["detail"]
    return None

def normalize_error_response(data: Any) -> str:
    """Normalize error responses to string format"""
    if isinstance(data, str):
        return data
    elif isinstance(data, dict):
        # Extract error message from various formats
        if "detail" in data:
            return str(data["detail"])
        elif "message" in data:
            return str(data["message"])
        elif "error" in data:
            return str(data["error"])
        else:
            return json.dumps(data)
    elif isinstance(data, list) and len(data) > 0:
        # Handle validation errors (list of error objects)
        if isinstance(data[0], dict) and "msg" in data[0]:
            return "; ".join([err.get("msg", str(err)) for err in data])
        else:
            return "; ".join([str(item) for item in data])
    else:
        return str(data)

async def generic_response_middleware(request: Request, call_next):
    try:
        # Skip wrapping for OpenAPI and docs endpoints
        excluded_paths = ["/openapi.json", "/docs", "/redoc"]
        if (request.url.path in excluded_paths or 
            request.url.path.startswith("/docs") or 
            request.url.path.startswith("/redoc")):
            return await call_next(request)

        response = await call_next(request)
        
        # Only wrap JSON responses
        if not response.headers.get("content-type", "").startswith("application/json"):
            return response

        # Read response body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk
            
        # Parse JSON
        try:
            data = json.loads(body)
        except Exception:
            # If JSON parsing fails, return original response
            return Response(body, status_code=response.status_code, headers=dict(response.headers))
        
        # Prevent double-wrapping if already in standardized format
        if (isinstance(data, dict) and 
            all(key in data for key in ["success", "status_code", "data", "error", "message"])):
            return Response(body, status_code=response.status_code, headers=dict(response.headers))

        # Prepare standardized response
        headers = dict(response.headers)
        headers.pop("content-length", None)
        
        success = response.status_code < 400
        
        if success:
            # Extract message for success responses
            message = extract_message_from_data(data)
            wrapped_response = {
                "success": True,
                "status_code": response.status_code,
                "message": message,
                "data": data,
                "error": None
            }
        else:
            # Handle error responses
            error_message = normalize_error_response(data)
            wrapped_response = {
                "success": False,
                "status_code": response.status_code,
                "message": None,
                "data": None,
                "error": error_message
            }

        return JSONResponse(
            content=wrapped_response, 
            status_code=response.status_code, 
            headers=headers
        )
        
    except Exception as exc:
        # Handle middleware exceptions
        return JSONResponse(
            content={
                "success": False,
                "status_code": 500,
                "message": None,
                "data": None,
                "error": f"Internal server error: {str(exc)}"
            }, 
            status_code=500
        )
