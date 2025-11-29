"""
Finance Analytics API Routes
Endpoints for financial metrics, predictions, and analysis.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from ..services.analytics import calculate_summary_metrics, get_cashflow_predictions

router = APIRouter(prefix="/api/finance", tags=["analytics"])


class AnalyticsResponse(BaseModel):
    """Analytics response model"""
    summary: Dict
    predictions: List[Dict]


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    entity_id: Optional[int] = None,
    horizon: int = 3
):
    """
    Get financial analytics including summary metrics and predictions.
    
    Query Parameters:
    - entity_id: Optional entity filter
    - horizon: Number of months to predict (default: 3)
    
    Returns:
    - summary: MTD revenue, expenses, burn rate, trend slope, budget variance
    - predictions: Cashflow forecasts for next N months
    
    Example Response:
    ```json
    {
      "summary": {
        "mtd_revenue": 125000,
        "mtd_expenses": 87500,
        "net_cashflow": 37500,
        "burn_rate": 2916,
        "cashflow_trend_slope": 1250,
        "budget_variance_percent": -5.2
      },
      "predictions": [
        {
          "month": "2024-04",
          "predicted_cashflow": 42000,
          "confidence_lower": 33600,
          "confidence_upper": 50400
        }
      ]
    }
    ```
    """
    try:
        # Calculate summary metrics
        summary = calculate_summary_metrics(entity_id)
        
        # Generate predictions
        predictions = get_cashflow_predictions(horizon_months=horizon)
        
        return AnalyticsResponse(
            summary=summary,
            predictions=predictions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics calculation failed: {str(e)}"
        )


@router.get("/predict/cashflow")
async def predict_cashflow(horizon: int = 12):
    """
    Get cashflow predictions only.
    
    Query Parameters:
    - horizon: Number of months to predict (default: 12, max: 24)
    
    Returns:
    - List of monthly predictions with confidence intervals
    """
    if horizon > 24:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horizon cannot exceed 24 months"
        )
    
    try:
        predictions = get_cashflow_predictions(horizon_months=horizon)
        return {
            "predictions": predictions,
            "horizon_months": horizon,
            "generated_at": predictions[0]["month"] if predictions else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/metrics/summary")
async def get_summary_metrics(entity_id: Optional[int] = None):
    """
    Get summary metrics only (no predictions).
    
    Faster endpoint for dashboard overview.
    """
    try:
        summary = calculate_summary_metrics(entity_id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Metrics calculation failed: {str(e)}"
        )
