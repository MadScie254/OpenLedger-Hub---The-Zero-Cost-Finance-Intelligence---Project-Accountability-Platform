'use client';

/** Beneficiary Generator Tab - Generate demo beneficiary profiles */

import { useState } from 'react';

interface BeneficiaryGeneratorProps {
    apiUrl: string;
}

export default function BeneficiaryGeneratorTab({ apiUrl }: BeneficiaryGeneratorProps) {
    const [count, setCount] = useState(5);
    const [nationality, setNationality] = useState('ke');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generateBeneficiaries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/external/demo/users?count=${count}&nationality=${nationality}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error generating beneficiaries:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Beneficiary Generator</h2>
                    <p className="text-gray-400 mt-1">Generate realistic demo beneficiary profiles</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                    >
                        <option value="ke">Kenya</option>
                        <option value="ng">Nigeria</option>
                        <option value="tz">Tanzania</option>
                        <option value="ug">Uganda</option>
                        <option value="gh">Ghana</option>
                    </select>
                    <input
                        type="number"
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        min="1"
                        max="50"
                        className="w-20 px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                    />
                    <button
                        onClick={generateBeneficiaries}
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-electric-blue to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            {users.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user, idx) => (
                        <div key={idx} className="glass-panel p-4 rounded-xl hover-glow transition-all">
                            <div className="flex items-start gap-4">
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full border-2 border-electric-blue/30"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold truncate">{user.name}</h4>
                                    <p className="text-gray-400 text-sm">{user.gender} • {user.age} years</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📧</span>
                                    <span className="text-white truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📞</span>
                                    <span className="text-white">{user.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📍</span>
                                    <span className="text-white truncate">{user.location.city}, {user.location.country}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {users.length === 0 && !loading && (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">👥</p>
                    <p className="text-gray-400">Click "Generate" to create demo beneficiary profiles</p>
                </div>
            )}

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
