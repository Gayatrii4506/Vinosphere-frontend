from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="Wine Recommendation API"
)

# ---------------------------------------------------------------------------
# CORS — allow the React / Vite dev server (any origin) to call the API.
# For production, replace ["*"] with your actual frontend domain, e.g.:
#   allow_origins=["https://yourapp.com"]
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins (dev)
    allow_credentials=False,      # set True only if you use cookies/auth
    allow_methods=["*"],          # GET, POST, OPTIONS, etc.
    allow_headers=["*"],          # Content-Type, Authorization, etc.
)

app.include_router(router)