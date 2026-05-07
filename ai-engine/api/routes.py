from fastapi import APIRouter, HTTPException
from typing import List, Dict

# This requires the detector dependency to be passed in, 
# for ease we will just export a function mapping the router.
def get_insights_router(detector):
    router = APIRouter()

    @router.get("/{sim_id}", response_model=Dict[str, List[Dict]])
    async def fetch_insights(sim_id: str):
        try:
            # We enforce inference at the exact moment of request
            insights = detector.analyze(sim_id)
            return {"insights": insights}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    return router
