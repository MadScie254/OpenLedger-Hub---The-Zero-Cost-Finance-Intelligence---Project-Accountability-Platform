'use client';

/** Carbon Tracker Tab - Calculate and visualize carbon footprint */

import { useState } from 'react';

interface CarbonTrackerProps {
    apiUrl: string;
}

export default function CarbonTrackerTab({ apiUrl }: CarbonTrackerProps) {
    const [inputs, setInputs] = useState({
        electricity: 0,
        fuel: 0,
        flights: 0
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculateFootprint = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${apiUrl}/external/carbon-footprint?electricity_kwh=${inputs.electricity}&fuel_liters=${inputs.fuel}&flights_km=${inputs.flights}`,
                { method: 'POST' }
            );
            if (res.ok) {
                const data = await res.json();
                setResult(data.footprint);
            }
        } catch (error) {
            console.error('Error calculating carbon footprint:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Carbon Tracker</h2>
                <p className="text-gray-400 mt-1">Calculate your project's environmental impact</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Input Data</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Electricity (kWh)</label>
                            <input
                                type="number"
                                value={inputs.electricity}
                                onChange={(e) => setInputs({ ...inputs, electricity: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                                placeholder="e.g., 1000"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Fuel/Petrol (Liters)</label>
                            <input
                                type="number"
                                value={inputs.fuel}
                                onChange={(e) => setInputs({ ...inputs, fuel: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                                placeholder="e.g., 50"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Air Travel (Kilometers)</label>
                            <input
                                type="number"
                                value={inputs.flights}
                                onChange={(e) => setInputs({ ...inputs, flights: Number(e.target.value) })}
                                className="w-full px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                                placeholder="e.g., 5000"
                            />
                        </div>

                        <button
                            onClick={calculateFootprint}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-electric-blue to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Calculating...' : 'Calculate Footprint'}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-6">Results</h3>

                        <div className="text-center mb-6">
                            <p className="text-6xl font-bold text-electric-blue">{result.total_tons_co2e}</p>
                            <p className="text-gray-400 mt-2">tons CO₂e</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-dark-600/50 rounded-lg">
                                <span className="text-gray-400">Electricity</span>
                                <span className="text-white font-semibold">{result.breakdown.electricity_kg_co2e} kg</span>
                            </div>
                            <div className="flex justify-between p-3 bg-dark-600/50 rounded-lg">
                                <span className="text-gray-400">Fuel</span>
                                <span className="text-white font-semibold">{result.breakdown.fuel_kg_co2e} kg</span>
                            </div>
                            <div className="flex justify-between p-3 bg-dark-600/50 rounded-lg">
                                <span className="text-gray-400">Flights</span>
                                <span className="text-white font-semibold">{result.breakdown.flights_kg_co2e} kg</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <p className="text-gray-400 text-sm mb-3">To offset this, you need:</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                    <p className="text-2xl font-bold text-green-400">{result.equivalents.trees_needed_to_offset}</p>
                                    <p className="text-gray-400 text-sm">Trees for 1 year</p>
                                </div>
                                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                                    <p className="text-2xl font-bold text-green-400">{result.equivalents.cars_off_road_days}</p>
                                    <p className="text-gray-400 text-sm">Car-free days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .glass-panel {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 211, 238, 0.1);
        }
      `}</style>
        </div>
    );
}
