"""
External Data API Routes
Endpoints for free external APIs (currency, crypto, weather, geocoding, macro data).
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from ..services.external_apis import (
    get_exchange_rates,
    get_crypto_price,
    get_weather,
    geocode_address,
    get_macro_indicator
)

router = APIRouter(prefix="/api/external", tags=["external-data"])


@router.get("/exchange-rates")
async def fetch_exchange_rates(
    base: str = Query("USD", description="Base currency code"),
    symbols: Optional[str] = Query(None, description="Comma-separated currency codes")
):
    """
    Get real-time currency exchange rates.
    
    Source: exchangerate.host (free, no API key required)
    Cache: 1 hour
    
    Example: `/api/external/exchange-rates?base=USD&symbols=KES,EUR,GBP`
    """
    try:
        symbol_list = symbols.split(",") if symbols else ["KES", "EUR", "GBP"]
        rates = await get_exchange_rates(base, symbol_list)
        
        return {
            "base": base,
            "rates": rates,
            "source": "exchangerate.host"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch exchange rates: {str(e)}"
        )


@router.get("/crypto/{coin_id}")
async def fetch_crypto_price(
    coin_id: str,
    vs_currency: str = Query("usd", description="Target currency")
):
    """
    Get cryptocurrency price.
    
    Source: CoinGecko (free, no API key required)
    Cache: 5 minutes
    
    Common coin_id values: bitcoin, ethereum, cardano, solana
    
    Example: `/api/external/crypto/bitcoin?vs_currency=usd`
    """
    try:
        price = await get_crypto_price(coin_id, vs_currency)
        
        if price is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cryptocurrency '{coin_id}' not found"
            )
        
        return {
            "coin_id": coin_id,
            "price": price,
            "currency": vs_currency,
            "source": "coingecko.com"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch crypto price: {str(e)}"
        )


@router.get("/weather")
async def fetch_weather(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate")
):
    """
    Get current weather for location.
    
    Source: Open-Meteo (free, no API key required)
    Cache: 30 minutes
    
    Example: `/api/external/weather?latitude=-1.286389&longitude=36.817223`
    (Nairobi, Kenya)
    """
    try:
        weather = await get_weather(latitude, longitude)
        
        if weather is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Weather data not available for this location"
            )
        
        return {
            "location": {"latitude": latitude, "longitude": longitude},
            "weather": weather,
            "source": "open-meteo.com"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather: {str(e)}"
        )


@router.get("/geocode")
async def geocode(
    address: str = Query(..., description="Address to geocode")
):
    """
    Convert address to coordinates.
    
    Source: Nominatim / OpenStreetMap (free, respects 1 req/sec limit)
    Cache: 24 hours
    
    Example: `/api/external/geocode?address=Nairobi, Kenya`
    """
    try:
        location = await geocode_address(address)
        
        if location is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location not found for address: {address}"
            )
        
        return {
            "query": address,
            "location": location,
            "source": "openstreetmap.org"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to geocode address: {str(e)}"
        )


@router.get("/macro/{country}/{indicator}")
async def fetch_macro_indicator(
    country: str,
    indicator: str,
    date_start: Optional[str] = Query(None, description="Start year"),
    date_end: Optional[str] = Query(None, description="End year")
):
    """
    Get macroeconomic indicators.
    
    Source: World Bank API (free, no API key required)
    Cache: 24 hours
    
    Common indicators:
    - NY.GDP.MKTP.CD: GDP (current US$)
    - FP.CPI.TOTL: Consumer Price Index
    - SL.UEM.TOTL.ZS: Unemployment rate
    
    Example: `/api/external/macro/KE/NY.GDP.MKTP.CD?date_start=2020&date_end=2023`
    """
    try:
        data = await get_macro_indicator(country, indicator, date_start, date_end)
        
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for {country}/{indicator}"
            )
        
        return {
            "country": country,
            "indicator": indicator,
            "date_range": f"{date_start or 'all'} to {date_end or 'latest'}",
            "data": data,
            "source": "worldbank.org"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch macro indicator: {str(e)}"
        )
