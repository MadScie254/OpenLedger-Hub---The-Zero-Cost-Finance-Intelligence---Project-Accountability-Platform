'use client';

/**
 * Global Context Tab - Real-time world data at your fingertips
 * Shows economic indicators, weather, and location context
 */

import { useState, useEffect } from 'react';

interface GlobalContextProps {
    apiUrl: string;
}

export default function GlobalContextTab({ apiUrl }: GlobalContextProps) {
    const [country, setCountry] = useState('Kenya');
    const [countryData, setCountryData] = useState<any>(null);
    const [weather, setWeather] = useState<any>(null);
    const [gdpData, setGdpData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadGlobalContext = async () => {
        setLoading(true);
        try {
            // Fetch country info
            const countryRes = await fetch(`${apiUrl}/external/countries/${country}`);
            if (countryRes.ok) {
                const data = await countryRes.json();
                setCountryData(data.country);

                // Fetch weather for capital if we have coordinates
                // For now, using Nairobi coordinates as default
                const weatherRes = await fetch(
                    `${apiUrl}/external/weather?latitude=-1.286389&longitude=36.817223`
                );
                if (weatherRes.ok) {
                    const weatherData = await weatherRes.json();
                    setWeather(weatherData.weather);
                }

                // Fetch GDP data
                const gdpRes = await fetch(
                    `${apiUrl}/external/macro/${data.country.code}/NY.GDP.MKTP.CD?date_start=2020&date_end=2023`
                );
                if (gdpRes.ok) {
                    const gdpJson = await gdpRes.json();
                    setGdpData(gdpJson.data);
                }
            }
        } catch (error) {
            console.error('Error loading global context:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGlobalContext();
    }, [country]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Global Context</h2>
                    <p className="text-gray-400 mt-1">Real-time economic & environmental intelligence</p>
                </div>
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue transition-all"
                >
                    <option value="Kenya">Kenya</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Rwanda">Rwanda</option>
                </select>
            </div>

            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
                    <p className="text-gray-400 mt-4">Loading global context...</p>
                </div>
            )}

            {!loading && countryData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Country Overview Card */}
                    <div className="glass-panel p-6 rounded-xl hover-glow transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{countryData.name}</h3>
                                <p className="text-gray-400">{countryData.official_name}</p>
                            </div>
                            {countryData.flag && (
                                <img src={countryData.flag} alt={`${countryData.name} flag`} className="w-16 h-12 rounded shadow-lg" />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm">Capital</p>
                                <p className="text-white font-semibold">{countryData.capital || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm">Region</p>
                                <p className="text-white font-semibold">{countryData.region}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm">Population</p>
                                <p className="text-white font-semibold">
                                    {countryData.population?.toLocaleString() || 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-400 text-sm">Area</p>
                                <p className="text-white font-semibold">
                                    {countryData.area?.toLocaleString()} km²
                                </p>
                            </div>
                        </div>

                        {countryData.currencies && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">Currencies</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(countryData.currencies).map(([code, curr]: [string, any]) => (
                                        <span
                                            key={code}
                                            className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm font-medium"
                                        >
                                            {code} - {curr.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Weather Card */}
                    <div className="glass-panel p-6 rounded-xl hover-glow transition-all">
                        <h3 className="text-xl font-bold text-white mb-4">Current Weather</h3>
                        {weather && (
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-electric-blue/20 to-purple-500/20 mb-4">
                                    <p className="text-5xl font-bold text-white">{Math.round(weather.temperature)}°</p>
                                </div>
                                <p className="text-gray-400 mb-6">{countryData.capital}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-sm">Wind Speed</p>
                                        <p className="text-white font-semibold">{weather.windspeed} km/h</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-400 text-sm">Condition</p>
                                        <p className="text-white font-semibold">
                                            {weather.weathercode === 0 ? 'Clear' : 'Cloudy'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!weather && <p className="text-gray-500 text-center py-8">Weather data unavailable</p>}
                    </div>

                    {/* GDP Trend Card */}
                    <div className="glass-panel p-6 rounded-xl hover-glow transition-all lg:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">GDP Evolution (2020-2023)</h3>
                        {gdpData && gdpData.length > 0 ? (
                            <div className="space-y-4">
                                {gdpData.slice(0, 4).map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-dark-600/50 rounded-lg">
                                        <div>
                                            <p className="text-white font-semibold">{item.date || item.year}</p>
                                            <p className="text-gray-400 text-sm">{item.countryiso3code}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-electric-blue">
                                                ${item.value ? (item.value / 1e9).toFixed(2) : 'N/A'}B
                                            </p>
                                            <p className="text-gray-400 text-sm">USD</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">GDP data unavailable</p>
                        )}
                    </div>
                </div>
            )}

            {/* Styling */}
            <style jsx>{`
        .glass-panel {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 211, 238, 0.1);
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
        }
      `}</style>
        </div>
    );
}
