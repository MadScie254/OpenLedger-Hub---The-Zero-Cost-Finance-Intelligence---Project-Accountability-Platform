"""
External API Service
Integrates free, zero-signup APIs for enriched analytics.

APIs:
- exchangerate.host: Currency conversion
- World Bank: Macro indicators
- CoinGecko: Crypto market data
- Open-Meteo: Weather data
- Nominatim: Geocoding
"""

import httpx
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import json


# Simple in-memory cache
_cache = {}
_cache_ttl = {}


def _get_cache(key: str) -> Optional[any]:
    """Get value from cache if not expired"""
    if key in _cache and key in _cache_ttl:
        if datetime.now() < _cache_ttl[key]:
            return _cache[key]
    return None


def _set_cache(key: str, value: any, ttl_seconds: int = 3600):
    """Set cache with TTL"""
    _cache[key] = value
    _cache_ttl[key] = datetime.now() + timedelta(seconds=ttl_seconds)


async def get_exchange_rates(base: str = "USD", symbols: List[str] = None) -> Dict:
    """
    Get currency exchange rates from exchangerate.host.
    
    Args:
        base: Base currency code (default: USD)
        symbols: List of target currency codes
        
    Returns:
        Dictionary with rates
        
    Example:
        rates = await get_exchange_rates("USD", ["KES", "EUR", "GBP"])
        # {"KES": 129.5, "EUR": 0.92, "GBP": 0.79}
    """
    if symbols is None:
        symbols = ["KES", "EUR", "GBP"]
    
    cache_key = f"exchange_rates:{base}:{','.join(sorted(symbols))}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    symbols_str = ",".join(symbols)
    url = f"https://api.exchangerate.host/latest?base={base}&symbols={symbols_str}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            rates = data.get("rates", {})
            _set_cache(cache_key, rates, ttl_seconds=3600)  # Cache for 1 hour
            return rates
            
    except Exception as e:
        print(f"Error fetching exchange rates: {e}")
        return {}


async def get_crypto_price(coin_id: str = "bitcoin", vs_currency: str = "usd") -> Optional[float]:
    """
    Get cryptocurrency price from CoinGecko.
    
    Args:
        coin_id: Coin identifier (e.g., "bitcoin", "ethereum")
        vs_currency: Target currency (default: "usd")
        
    Returns:
        Current price or None
        
    Example:
        price = await get_crypto_price("bitcoin", "usd")
        # 43250.75
    """
    cache_key = f"crypto:{coin_id}:{vs_currency}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies={vs_currency}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            price = data.get(coin_id, {}).get(vs_currency)
            if price:
                _set_cache(cache_key, price, ttl_seconds=300)  # Cache for 5 minutes
            return price
            
    except Exception as e:
        print(f"Error fetching crypto price: {e}")
        return None


async def get_weather(latitude: float, longitude: float) -> Optional[Dict]:
    """
    Get current weather from Open-Meteo.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        
    Returns:
        Weather data dictionary or None
        
    Example:
        weather = await get_weather(-1.286389, 36.817223)  # Nairobi
        # {"temperature": 22.5, "windspeed": 10.2, "weathercode": 0}
    """
    cache_key = f"weather:{latitude},{longitude}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            weather = data.get("current_weather", {})
            if weather:
                _set_cache(cache_key, weather, ttl_seconds=1800)  # Cache for 30 minutes
            return weather
            
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None


async def geocode_address(address: str) -> Optional[Dict]:
    """
    Geocode address using Nominatim (OpenStreetMap).
    
    IMPORTANT: Respect usage policy - max 1 request per second.
    
    Args:
        address: Address to geocode
        
    Returns:
        Location data with lat/lon or None
        
    Example:
        location = await geocode_address("Nairobi, Kenya")
        # {"lat": -1.286389, "lon": 36.817223, "display_name": "..."}
    """
    cache_key = f"geocode:{address}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1"
    
    try:
        async with httpx.AsyncClient() as client:
            # Respect usage policy: 1 req/sec
            await asyncio.sleep(1)
            
            response = await client.get(
                url,
                timeout=10.0,
                headers={"User-Agent": "OpenLedger-Black/1.0"}  # Required by Nominatim
            )
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                location = {
                    "lat": float(data[0].get("lat")),
                    "lon": float(data[0].get("lon")),
                    "display_name": data[0].get("display_name")
                }
                _set_cache(cache_key, location, ttl_seconds=86400)  # Cache for 24 hours
                return location
            
            return None
            
    except Exception as e:
        print(f"Error geocoding address: {e}")
        return None


async def get_macro_indicator(
    country: str = "KE",
    indicator: str = "NY.GDP.MKTP.CD",
    date_start: Optional[str] = None,
    date_end: Optional[str] = None
) -> Optional[List[Dict]]:
    """
    Get macroeconomic indicators from World Bank API.
    
    Args:
        country: 2-letter country code (e.g., "KE" for Kenya)
        indicator: Indicator code (e.g., "NY.GDP.MKTP.CD" for GDP)
        date_start: Start year (e.g., "2020")
        date_end: End year (e.g., "2023")
        
    Returns:
        List of data points or None
        
    Common indicators:
        - NY.GDP.MKTP.CD: GDP (current US$)
        - FP.CPI.TOTL: Consumer Price Index
        - SL.UEM.TOTL.ZS: Unemployment rate
        
    Example:
        gdp = await get_macro_indicator("KE", "NY.GDP.MKTP.CD", "2020", "2023")
    """
    cache_key = f"macro:{country}:{indicator}:{date_start}:{date_end}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    date_param = f"date={date_start}:{date_end}" if date_start and date_end else ""
    url = f"https://api.worldbank.org/v2/country/{country}/indicator/{indicator}?{date_param}&format=json&per_page=100"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            
            if len(data) > 1:
                indicators = data[1]  # First element is metadata
                _set_cache(cache_key, indicators, ttl_seconds=86400)  # Cache for 24 hours
                return indicators
            
            return None
            
    except Exception as e:
        print(f"Error fetching macro indicator: {e}")
        return None
