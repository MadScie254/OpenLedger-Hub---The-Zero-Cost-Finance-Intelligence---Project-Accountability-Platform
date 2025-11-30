'use client';

/** Impact Simulator Tab - Calculate and visualize project impact */

import { useState } from 'react';

interface ImpactSimulatorProps {
    apiUrl: string;
}

export default function ImpactSimulatorTab({ apiUrl }: ImpactSimulatorProps) {
    const [inputs, setInputs] = useState({
        budget: 10000,
        beneficiaries: 100,
        duration: 12, // months
        costPerBeneficiary: 100
    });

    const calculateImpact = () => {
        const totalReach = inputs.beneficiaries;
        const costEfficiency = inputs.budget / inputs.beneficiaries;
        const monthlyReach = Math.round(totalReach / inputs.duration);
        const roi = ((totalReach * inputs.costPerBeneficiary - inputs.budget) / inputs.budget * 100);

        return {
            totalReach,
            costEfficiency,
            monthlyReach,
            roi,
            breakEven: Math.round(inputs.budget / inputs.costPerBeneficiary)
        };
    };

    const impact = calculateImpact();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Impact Simulator</h2>
                <p className="text-gray-400 mt-1">Model your project's impact and efficiency</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Project Parameters</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Total Budget (USD)</label>
                            <input
                                type="number"
                                value={inputs.budget}
                                onChange={(e) => setInputs({ ...inputs, budget: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-electric-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Target Beneficiaries</label>
                            <input
                                type="number"
                                value={inputs.beneficiaries}
                                onChange={(e) => setInputs({ ...inputs, beneficiaries: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-electric-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Project Duration (Months)</label>
                            <input
                                type="number"
                                value={inputs.duration}
                                onChange={(e) => setInputs({ ...inputs, duration: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-electric-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Value Per Beneficiary (USD)</label>
                            <input
                                type="number"
                                value={inputs.costPerBeneficiary}
                                onChange={(e) => setInputs({ ...inputs, costPerBeneficiary: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-electric-blue"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="space-y-4">
                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-gray-400 text-sm mb-2">Total Reach</h3>
                        <p className="text-5xl font-bold text-electric-blue">{impact.totalReach.toLocaleString()}</p>
                        <p className="text-gray-500 mt-1">people impacted</p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-gray-400 text-sm mb-2">Cost Efficiency</h3>
                        <p className="text-5xl font-bold text-green-400">${impact.costEfficiency.toFixed(2)}</p>
                        <p className="text-gray-500 mt-1">per beneficiary</p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-gray-400 text-sm mb-2">Monthly Reach</h3>
                        <p className="text-5xl font-bold text-purple-400">{impact.monthlyReach.toLocaleString()}</p>
                        <p className="text-gray-500 mt-1">beneficiaries/month</p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <h3 className="text-gray-400 text-sm mb-2">Social ROI</h3>
                        <p className={`text-5xl font-bold ${impact.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {impact.roi >= 0 ? '+' : ''}{impact.roi.toFixed(1)}%
                        </p>
                        <p className="text-gray-500 mt-1">return on investment</p>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-dark-600/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Break-even Point</p>
                        <p className="text-2xl font-bold text-white">{impact.breakEven} beneficiaries</p>
                    </div>
                    <div className="p-4 bg-dark-600/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Budget Utilization</p>
                        <p className="text-2xl font-bold text-white">
                            {((inputs.beneficiaries / impact.breakEven) * 100).toFixed(0)}%
                        </p>
                    </div>
                    <div className="p-4 bg-dark-600/50 rounded-lg">
                        <p className="text-gray-400 text-sm mb-1">Efficiency Rating</p>
                        <p className="text-2xl font-bold text-electric-blue">
                            {impact.costEfficiency < 50 ? 'Excellent' : impact.costEfficiency < 100 ? 'Good' : 'Fair'}
                        </p>
                    </div>
                </div>
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
