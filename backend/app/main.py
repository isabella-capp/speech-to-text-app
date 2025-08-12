from fastapi import FastAPI
from app.routers import asr, health

app = FastAPI(title="Speech-to-Text Backend")

# Include i router
app.include_router(asr.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {"message": "Speech-to-Text API running"}
