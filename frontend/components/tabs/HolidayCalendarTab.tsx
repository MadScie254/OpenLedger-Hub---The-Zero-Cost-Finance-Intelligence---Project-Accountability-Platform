'use client';

/** Holiday Calendar Tab - Public holidays for project planning */

import { useState, useEffect } from 'react';

interface HolidayCalendarProps {
    apiUrl: string;
}

export default function HolidayCalendarTab({ apiUrl }: HolidayCalendarProps) {
    const [country, setCountry] = useState('KE');
    const [year, setYear] = useState(new Date().getFullYear());
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHolidays = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/external/holidays/${country}/${year}`);
            if (res.ok) {
                const data = await res.json();
                setHolidays(data.holidays);
            }
        } catch (error) {
            console.error('Error loading holidays:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHolidays();
    }, [country, year]);

    const getMonthName = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'long' });
    };

    const groupByMonth = (holidays: any[]) => {
        const grouped: any = {};
        holidays.forEach(holiday => {
            const month = getMonthName(holiday.date);
            if (!grouped[month]) grouped[month] = [];
            grouped[month].push(holiday);
        });
        return grouped;
    };

    const grouped = groupByMonth(holidays);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Holiday Calendar</h2>
                    <p className="text-gray-400 mt-1">Plan around public holidays in your region</p>
                </div>
                <div className="flex gap-3">
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
                        <option value="RW">Rwanda</option>
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white focus:outline-none focus:border-electric-blue"
                    >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
                </div>
            )}

            {!loading && holidays.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(grouped).map(([month, monthHolidays]: [string, any]) => (
                        <div key={month} className="glass-panel p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-white mb-4">{month}</h3>
                            <div className="space-y-3">
                                {monthHolidays.map((holiday: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-dark-600/50 rounded-lg">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{holiday.localName || holiday.name}</p>
                                                {holiday.name !== holiday.localName && (
                                                    <p className="text-gray-400 text-sm mt-1">{holiday.name}</p>
                                                )}
                                            </div>
                                            <span className="text-electric-blue font-semibold whitespace-nowrap">
                                                {new Date(holiday.date).getDate()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && holidays.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">📅</p>
                    <p className="text-gray-400">No holidays found for {country} in {year}</p>
                </div>
            )}

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
