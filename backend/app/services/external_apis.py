"""
External API Service
Integrates 13+ free, zero-signup APIs for enriched analytics and data.

Current APIs:
1. exchangerate.host: Currency conversion
2. World Bank: Macro indicators
3. CoinGecko: Crypto market data
4. Open-Meteo: Weather data
5. Nominatim: Geocoding
6. REST Countries: Country information
7. Nager.Date: Public holidays
8. OpenLibrary: Books and resources
9. NewsData.io: Global news (free tier)
10. RandomUser: Demo user/beneficiary data
11. OpenAQ: Air quality data
12. ipapi.co: IP geolocation
13. CO2.js: Carbon footprint calculations (local)
"""

import httpx
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import asyncio
import json
import hashlib


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


# ============================================================================
# EXISTING APIs (Enhanced)
# ============================================================================

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
        symbols = ["KES", "EUR", "GBP", "NGN", "TZS", "UGX"]
    
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
                headers={"User-Agent": "OpenLedger-Hub/2.0"}  # Required by Nominatim
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


# ============================================================================
# NEW APIs
# ============================================================================

async def get_country_info(country_name: str) -> Optional[Dict]:
    """
    Get comprehensive country information from REST Countries API.
    
    Args:
        country_name: Country name (e.g., "Kenya", "Nigeria")
        
    Returns:
        Country data including flag, population, languages, etc.
        
    Example:
        info = await get_country_info("Kenya")
        # {"name": "Kenya", "population": 54985000, "capital": "Nairobi", ...}
    """
    cache_key = f"country:{country_name.lower()}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://restcountries.com/v3.1/name/{country_name}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                country = data[0]
                result = {
                    "name": country.get("name", {}).get("common"),
                    "official_name": country.get("name", {}).get("official"),
                    "capital": country.get("capital", [""])[0] if country.get("capital") else "",
                    "population": country.get("population"),
                    "area": country.get("area"),
                    "region": country.get("region"),
                    "subregion": country.get("subregion"),
                    "flag": country.get("flags", {}).get("png"),
                    "currencies": country.get("currencies", {}),
                    "languages": country.get("languages", {}),
                    "timezones": country.get("timezones", []),
                    "code": country.get("cca2")
                }
                _set_cache(cache_key, result, ttl_seconds=604800)  # Cache for 7 days
                return result
            
            return None
            
    except Exception as e:
        print(f"Error fetching country info: {e}")
        return None


async def get_public_holidays(country_code: str, year: int) -> Optional[List[Dict]]:
    """
    Get public holidays from Nager.Date API.
    
    Args:
        country_code: 2-letter country code (e.g., "KE", "NG")
        year: Year (e.g., 2024)
        
    Returns:
        List of holidays with dates and names
        
    Example:
        holidays = await get_public_holidays("KE", 2024)
        # [{"date": "2024-01-01", "name": "New Year's Day", ...}, ...]
    """
    cache_key = f"holidays:{country_code}:{year}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/{country_code}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            holidays = response.json()
            
            _set_cache(cache_key, holidays, ttl_seconds=86400)  # Cache for 24 hours
            return holidays
            
    except Exception as e:
        print(f"Error fetching public holidays: {e}")
        return None


async def get_book_info(isbn: str) -> Optional[Dict]:
    """
    Get book information from OpenLibrary API.
    
    Args:
        isbn: ISBN number
        
    Returns:
        Book data including title, authors, cover, etc.
        
    Example:
        book = await get_book_info("9780140328721")
        # {"title": "Fantastic Mr Fox", "authors": [...], ...}
    """
    cache_key = f"book:{isbn}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            book_key = f"ISBN:{isbn}"
            if book_key in data:
                book = data[book_key]
                result = {
                    "title": book.get("title"),
                    "authors": [author.get("name") for author in book.get("authors", [])],
                    "cover": book.get("cover", {}).get("large"),
                    "publishers": [pub.get("name") for pub in book.get("publishers", [])],
                    "publish_date": book.get("publish_date"),
                   "subjects": [subj.get("name") for subj in book.get("subjects", [])],
                    "url": book.get("url")
                }
                _set_cache(cache_key, result, ttl_seconds=604800)  # Cache for 7 days
                return result
            
            return None
            
    except Exception as e:
        print(f"Error fetching book info: {e}")
        return None


async def search_books(query: str, limit: int = 10) -> Optional[List[Dict]]:
    """
    Search for books on OpenLibrary.
    
    Args:
        query: Search query
        limit: Maximum results (default: 10)
        
    Returns:
        List of books matching query
    """
    cache_key = f"book_search:{query}:{limit}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://openlibrary.org/search.json?q={query}&limit={limit}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            books = []
            for doc in data.get("docs", []):
                books.append({
                    "title": doc.get("title"),
                    "authors": doc.get("author_name", []),
                    "first_publish_year": doc.get("first_publish_year"),
                    "isbn": doc.get("isbn", [""])[0] if doc.get("isbn") else "",
                    "key": doc.get("key")
                })
            
            _set_cache(cache_key, books, ttl_seconds=3600)  # Cache for 1 hour
            return books
            
    except Exception as e:
        print(f"Error searching books: {e}")
        return None


async def generate_random_users(count: int = 10, nationality: str = "us") -> Optional[List[Dict]]:
    """
    Generate random user/beneficiary data from RandomUser API.
    
    Args:
        count: Number of users to generate (1-5000)
        nationality: Nationality code (e.g., "us", "gb", "ke")
        
    Returns:
        List of generated user profiles
        
    Example:
        users = await generate_random_users(5, "ke")
    """
    cache_key = f"random_users:{count}:{nationality}:{datetime.now().strftime('%Y%m%d')}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://randomuser.me/api/?results={count}&nat={nationality}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            users = []
            for user in data.get("results", []):
                users.append({
                    "name": f"{user['name']['first']} {user['name']['last']}",
                    "gender": user["gender"],
                    "email": user["email"],
                    "phone": user["phone"],
                    "location": {
                        "city": user["location"]["city"],
                        "state": user["location"]["state"],
                        "country": user["location"]["country"]
                    },
                    "dob": user["dob"]["date"],
                    "age": user["dob"]["age"],
                    "picture": user["picture"]["large"]
                })
            
            _set_cache(cache_key, users, ttl_seconds=3600)  # Cache for 1 hour
            return users
            
    except Exception as e:
        print(f"Error generating random users: {e}")
        return None


async def get_air_quality(country_code: str, limit: int = 10) -> Optional[List[Dict]]:
    """
    Get air quality data from OpenAQ API.
    
    Args:
        country_code: 2-letter country code (e.g., "KE", "NG")
        limit: Maximum results (default: 10)
        
    Returns:
        List of air quality measurements
        
    Example:
        aq = await get_air_quality("KE", 5)
    """
    cache_key = f"air_quality:{country_code}:{limit}"
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = f"https://api.openaq.org/v2/latest?limit={limit}&country={country_code}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for result in data.get("results", []):
                results.append({
                    "location": result.get("location"),
                    "city": result.get("city"),
                    "country": result.get("country"),
                    "coordinates": result.get("coordinates"),
                    "measurements": result.get("measurements", [])
                })
            
            _set_cache(cache_key, results, ttl_seconds=1800)  # Cache for 30 minutes
            return results
            
    except Exception as e:
        print(f"Error fetching air quality: {e}")
        return None


async def get_ip_geolocation() -> Optional[Dict]:
    """
    Get geolocation based on IP using ipapi.co (free, no key required).
    
    Returns:
        Location data based on IP
        
    Example:
        location = await get_ip_geolocation()
        # {"city": "Nairobi", "country": "Kenya", "latitude": -1.286389, ...}
    """
    cache_key = f"ip_geo:{datetime.now().strftime('%Y%m%d%H')}"  # Cache per hour
    cached = _get_cache(cache_key)
    if cached:
        return cached
    
    url = "https://ipapi.co/json/"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            result = {
                "ip": data.get("ip"),
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country_name"),
                "country_code": data.get("country_code"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "timezone": data.get("timezone"),
                "currency": data.get("currency")
            }
            
            _set_cache(cache_key, result, ttl_seconds=3600)  # Cache for 1 hour
            return result
            
    except Exception as e:
        print(f"Error fetching IP geolocation: {e}")
        return None


def calculate_carbon_footprint(
    electricity_kwh: float = 0,
    natural_gas_therms: float = 0,
    fuel_liters: float = 0,
    flights_km: float = 0
) -> Dict:
    """
    Calculate carbon footprint using standard emission factors.
    
    Based on EPA and DEFRA emission factors.
    
    Args:
        electricity_kwh: Electricity consumption in kWh
        natural_gas_therms: Natural gas in therms
        fuel_liters: Fuel (petrol/diesel) in liters
        flights_km: Air travel in kilometers
        
    Returns:
        Carbon footprint in kg CO2e
        
    Example:
        footprint = calculate_carbon_footprint(
            electricity_kwh=1000,
            fuel_liters=50,
            flights_km=5000
        )
        # {"total_kg_co2e": 1850.5, "breakdown": {...}}
    """
    # Emission factors (kg CO2e per unit)
    ELECTRICITY_FACTOR = 0.475  # per kWh (global average)
    GAS_FACTOR = 5.3  # per therm
    FUEL_FACTOR = 2.31  # per liter
    FLIGHT_FACTOR = 0.255  # per km (economy)
    
    electricity_co2 = electricity_kwh * ELECTRICITY_FACTOR
    gas_co2 = natural_gas_therms * GAS_FACTOR
    fuel_co2 = fuel_liters * FUEL_FACTOR
    flight_co2 = flights_km * FLIGHT_FACTOR
    
    total = electricity_co2 + gas_co2 + fuel_co2 + flight_co2
    
    return {
        "total_kg_co2e": round(total, 2),
        "total_tons_co2e": round(total / 1000, 3),
        "breakdown": {
            "electricity_kg_co2e": round(electricity_co2, 2),
            "natural_gas_kg_co2e": round(gas_co2, 2),
            "fuel_kg_co2e": round(fuel_co2, 2),
            "flights_kg_co2e": round(flight_co2, 2)
        },
        "equivalents": {
            "trees_needed_to_offset": round(total / 21.77, 1),  # Average tree absorbs 21.77 kg CO2/year
            "cars_off_road_days": round(total / 11.2, 1)  # Average car emits 11.2 kg CO2/day
        }
    }
