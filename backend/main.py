from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.v1 import router
from app.api.v1.routes.auth import limiter

app = FastAPI(title="Finance Tracker API", version="1.0.0", description="Production-quality personal finance tracking system")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _err(status_code: int, msg: str):
    return JSONResponse(status_code=status_code, content={"success": False, "data": None, "message": msg})


@app.exception_handler(401)
async def h401(r: Request, e): return _err(401, "Unauthorized")

@app.exception_handler(403)
async def h403(r: Request, e): return _err(403, "Forbidden")

@app.exception_handler(404)
async def h404(r: Request, e): return _err(404, "Not found")

@app.exception_handler(500)
async def h500(r: Request, e): return _err(500, "Internal server error")


app.include_router(router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
