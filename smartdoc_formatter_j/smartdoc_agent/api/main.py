from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Smart Document Formatting Agent API",
    description="API to interact with the agentic document formatting system.",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify your frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Smart Document Formatting Agent API!"}

# Include routers from endpoints.py
from .endpoints import router as api_router
from .auth_endpoints import router as auth_router
from .admin_endpoints import router as admin_router
from .analytics_endpoints import router as analytics_router

app.include_router(api_router, prefix="/api") # All these routes will be under /api
app.include_router(auth_router, prefix="/api") # Auth routes will be under /api/auth
app.include_router(admin_router) # Admin routes already have /api/admin prefix
app.include_router(analytics_router) # Analytics routes under /api/admin/analytics
