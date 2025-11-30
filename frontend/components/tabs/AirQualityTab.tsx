'use client';

/** Air Quality Monitor Tab - Environmental health data */

import { useState, useEffect } from 'react';

interface AirQualityProps {
    apiUrl: string;
}

export default function AirQualityTab({ apiUrl }: AirQualityProps) {
    const [country, setCountry] = useState('KE');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadAirQuality = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/external/air-quality/${country}?limit=10`);
            if (res.ok) {
                const result = await res.json();
                setData(result.measurements);
            }
        } catch (error) {
            console.error('Error loading air quality:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAirQuality();
    }, [country]);

    const getQualityColor = (param: string, value: number) => {
        if (param === 'pm25') {
            if (value <= 12) return 'text-green-400';
            if (value <= 35) return 'text-yellow-400';
            if (value <= 55) return 'text-orange-400';
            return 'text-red-400';
        }
        return 'text-electric-blue';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Air Quality Monitor</h2>
                    <p className="text-gray-400 mt-1">Environmental health data for your projects</p>
                </div>
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                >
                    <option value="KE">Kenya</option>
                    <option value="NG">Nigeria</option>
                    <option value="TZ">Tanzania</option>
                    <option value="UG">Uganda</option>
                    <option value="GH">Ghana</option>
                </select>
            </div>

            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
                </div>
            )}

            {!loading && data.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.map((location, idx) => (
                        <div key={idx} className="glass-panel p-6 rounded-xl hover-glow transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{location.location}</h3>
                                    <p className="text-gray-400">{location.city}, {location.country}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {location.coordinates?.latitude?.toFixed(2)}, {location.coordinates?.longitude?.toFixed(2)}
                                </span>
                            </div>

                            {location.measurements && location.measurements.length > 0 && (
                                <div className="space-y-3">
                                    {location.measurements.slice(0, 5).map((measurement: any, midx: number) => (
                                        <div key={midx} className="flex items-center justify-between p-3 bg-dark-600/50 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium uppercase">{measurement.parameter}</p>
                                                <p className="text-gray-400 text-sm">{measurement.unit}</p>
                                            </div>
                                            <p className={`text-2xl font-bold ${getQualityColor(measurement.parameter, measurement.value)}`}>
                                                {measurement.value?.toFixed(1)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">🌫️</p>
                    <p className="text-gray-400">No air quality data available for {country}</p>
                </div>
            )}

            <div className="glass-panel p-4 rounded-xl">
                <h4 className="text-white font-semibold mb-2">Air Quality Index Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-gray-400">Good (0-12)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-gray-400">Moderate (13-35)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                        <span className="text-gray-400">Sensitive (36-55)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className="text-gray-400">Unhealthy (55+)</span>
                    </div>
                </div>
            </div>

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
