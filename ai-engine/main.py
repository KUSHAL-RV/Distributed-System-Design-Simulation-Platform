from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from contextlib import asynccontextmanager
from ml.anomaly_detector import AnomalyDetector
from services.kafka_service import KafkaService
from api.routes import get_insights_router
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)

# 1. Initialize State Dependencies
detector = AnomalyDetector()
kafka_service = KafkaService(detector)

# 2. Lifecycle hooks to manage Async Kafka
@asynccontextmanager
async def lifespan(app: FastAPI):
    await kafka_service.start()
    yield
    await kafka_service.stop()

# 3. FastAPI Mount
app = FastAPI(title="LiveSys AI Insights", lifespan=lifespan)

# Allow Gateway requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_insights_router(detector), prefix="/insights")

if __name__ == "__main__":
    import uvicorn
    # Make sure we run locally mapping standard AI engine port 6000
    uvicorn.run("main:app", host="0.0.0.0", port=6000, reload=True)
