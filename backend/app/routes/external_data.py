"""
External Data API Routes
Endpoints for 13+ free external APIs - no signup required!

APIs Available:
1. Currency Exchange Rates
2. Cryptocurrency Prices
3. Weather Data
4. Geocoding
5. Macro Economic Indicators
6. Country Information
7. Public Holidays
8. Book/Resource Search
9. Random User/Beneficiary Generator
10. Air Quality Data
11. IP Geolocation
12. Carbon Footprint Calculator
"""

from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional

from ..services.external_apis import (
    get_exchange_rates,
    get_crypto_price,
    get_weather,
    geocode_address,
    get_macro_indicator,
    get_country_info,
    get_public_holidays,
    get_book_info,
    search_books,
    generate_random_users,
    get_air_quality,
    get_ip_geolocation,
    calculate_carbon_footprint
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
    
    Example: `/api/external/exchange-rates?base=USD&symbols=KES,EUR,GBP,NGN`
    """
    try:
        symbol_list = symbols.split(",") if symbols else ["KES", "EUR", "GBP", "NGN", "TZS", "UGX"]
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


# ============================================================================
# NEW API ENDPOINTS
# ============================================================================

@router.get("/countries/{country_name}")
async def fetch_country_info(country_name: str):
    """
    Get comprehensive country information.
    
    Source: REST Countries API (free, no API key required)
    Cache: 7 days
    
    Example: `/api/external/countries/Kenya`
    """
    try:
        info = await get_country_info(country_name)
        
        if info is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Country '{country_name}' not found"
            )
        
        return {
            "country": info,
            "source": "restcountries.com"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch country info: {str(e)}"
        )


@router.get("/holidays/{country_code}/{year}")
async def fetch_public_holidays(
    country_code: str,
    year: int
):
    """
    Get public holidays for a country and year.
    
    Source: Nager.Date API (free, no API key required)
    Cache: 24 hours
    
    Example: `/api/external/holidays/KE/2024`
    """
    try:
        holidays = await get_public_holidays(country_code, year)
        
        if holidays is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No holidays found for {country_code}/{year}"
            )
        
        return {
            "country_code": country_code,
            "year": year,
            "holidays": holidays,
            "count": len(holidays),
            "source": "date.nager.at"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch holidays: {str(e)}"
        )


@router.get("/books/isbn/{isbn}")
async def fetch_book_by_isbn(isbn: str):
    """
    Get book information by ISBN.
    
    Source: OpenLibrary API (free, no API key required)
    Cache: 7 days
    
    Example: `/api/external/books/isbn/9780140328721`
    """
    try:
        book = await get_book_info(isbn)
        
        if book is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with ISBN '{isbn}' not found"
            )
        
        return {
            "book": book,
            "source": "openlibrary.org"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch book: {str(e)}"
        )


@router.get("/books/search")
async def search_for_books(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=100, description="Maximum results")
):
    """
    Search for books and resources.
    
    Source: OpenLibrary API (free, no API key required)
    Cache: 1 hour
    
    Example: `/api/external/books/search?q=agriculture&limit=10`
    """
    try:
        books = await search_books(q, limit)
        
        if books is None or len(books) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No books found for query: {q}"
            )
        
        return {
            "query": q,
            "results": books,
            "count": len(books),
            "source": "openlibrary.org"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search books: {str(e)}"
        )


@router.get("/demo/users")
async def generate_demo_users(
    count: int = Query(10, ge=1, le=100, description="Number of users"),
    nationality: str = Query("us", description="Nationality code (us, gb, ke, ng, etc.)")
):
    """
    Generate random beneficiary/user profiles for demos.
    
    Source: RandomUser API (free, no API key required)
    Cache: 1 hour (per day)
    
    Example: `/api/external/demo/users?count=5&nationality=ke`
    """
    try:
        users = await generate_random_users(count, nationality)
        
        if users is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate demo users"
            )
        
        return {
            "users": users,
            "count": len(users),
            "nationality": nationality,
            "source": "randomuser.me"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate users: {str(e)}"
        )


@router.get("/air-quality/{country_code}")
async def fetch_air_quality(
    country_code: str,
    limit: int = Query(10, ge=1, le=100, description="Maximum results")
):
    """
    Get air quality measurements for a country.
    
    Source: OpenAQ API (free, no API key required)
    Cache: 30 minutes
    
    Example: `/api/external/air-quality/KE?limit=5`
    """
    try:
        data = await get_air_quality(country_code, limit)
        
        if data is None or len(data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No air quality data found for {country_code}"
            )
        
        return {
            "country_code": country_code,
            "measurements": data,
            "count": len(data),
            "source": "openaq.org"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch air quality: {str(e)}"
        )


@router.get("/geolocation")
async def fetch_geolocation():
    """
    Get geolocation based on IP address.
    
    Source: ipapi.co (free, no API key required)
    Cache: 1 hour
    
    Example: `/api/external/geolocation`
    """
    try:
        location = await get_ip_geolocation()
        
        if location is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get geolocation"
            )
        
        return {
            "location": location,
            "source": "ipapi.co"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch geolocation: {str(e)}"
        )


@router.post("/carbon-footprint")
async def calculate_carbon(
    electricity_kwh: float = Query(0, ge=0, description="Electricity in kWh"),
    natural_gas_therms: float = Query(0, ge=0, description="Natural gas in therms"),
    fuel_liters: float = Query(0, ge=0, description="Fuel in liters"),
    flights_km: float = Query(0, ge=0, description="Flights in kilometers")
):
    """
    Calculate carbon footprint based on consumption.
    
    Uses standard EPA/DEFRA emission factors.
    No external API - calculated locally.
    
    Example: `/api/external/carbon-footprint?electricity_kwh=1000&fuel_liters=50&flights_km=5000`
    """
    try:
        result = calculate_carbon_footprint(
            electricity_kwh=electricity_kwh,
            natural_gas_therms=natural_gas_therms,
            fuel_liters=fuel_liters,
            flights_km=flights_km
        )
        
        return {
            "footprint": result,
            "inputs": {
                "electricity_kwh": electricity_kwh,
                "natural_gas_therms": natural_gas_therms,
                "fuel_liters": fuel_liters,
                "flights_km": flights_km
            },
            "source": "local_calculation"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate carbon footprint: {str(e)}"
        )
