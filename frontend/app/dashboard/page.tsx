'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Icons } from '@/components/Icons';
import ProjectsTab from '@/components/tabs/ProjectsTab';
import FinanceTab from '@/components/tabs/FinanceTab';
import GlobalContextTab from '@/components/tabs/GlobalContextTab';
import MarketIntelligenceTab from '@/components/tabs/MarketIntelligenceTab';
import ImpactSimulatorTab from '@/components/tabs/ImpactSimulatorTab';
import CarbonTrackerTab from '@/components/tabs/CarbonTrackerTab';
import BeneficiaryGeneratorTab from '@/components/tabs/BeneficiaryGeneratorTab';
import ResourceLibraryTab from '@/components/tabs/ResourceLibraryTab';
import HolidayCalendarTab from '@/components/tabs/HolidayCalendarTab';
import AirQualityTab from '@/components/tabs/AirQualityTab';

const TABS = [
    { id: 'projects', label: 'Projects', icon: <Icons.Briefcase />, component: ProjectsTab },
    { id: 'finance', label: 'Finance', icon: <Icons.DollarSign />, component: FinanceTab },
    { id: 'global', label: 'Global Context', icon: <Icons.Globe />, component: GlobalContextTab },
    { id: 'market', label: 'Market Intel', icon: <Icons.TrendingUp />, component: MarketIntelligenceTab },
    { id: 'impact', label: 'Impact Sim', icon: <Icons.Activity />, component: ImpactSimulatorTab },
    { id: 'carbon', label: 'Carbon Tracker', icon: <Icons.Leaf />, component: CarbonTrackerTab },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: <Icons.Users />, component: BeneficiaryGeneratorTab },
    { id: 'resources', label: 'Resources', icon: <Icons.Book />, component: ResourceLibraryTab },
    { id: 'calendar', label: 'Holidays', icon: <Icons.Calendar />, component: HolidayCalendarTab },
    { id: 'air', label: 'Air Quality', icon: <Icons.Wind />, component: AirQualityTab },
];

export default function DashboardPage() {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('projects');
    const API_URL = 'http://localhost:8000/api';

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || ProjectsTab;

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-sky-500/30 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-neutral-950/80 to-neutral-950"></div>
                <div className="absolute inset-0 bg-gradient-animate"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-xl">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                            <Icons.Activity />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">
                            OpenLedger <span className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">Hub</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 md:flex shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Systems Operational
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Icons.Sun className="h-4 w-4" /> : <Icons.Moon className="h-4 w-4" />}
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition hover:bg-white/10 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <Icons.Bell />
                        </button>
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-sky-500/20 ring-2 ring-transparent hover:ring-sky-500/50 transition-all">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                alt="User"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto border-t border-white/5 px-6 scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'border-sky-500 text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                                : 'border-transparent text-neutral-400 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 relative z-10">
                <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* @ts-ignore - Dynamic component props */}
                    <ActiveComponent apiUrl={API_URL} />
                </div>
            </main>
        </div>
    );
}
