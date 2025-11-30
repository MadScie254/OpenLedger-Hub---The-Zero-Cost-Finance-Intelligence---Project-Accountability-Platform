'use client';

import { useState } from 'react';
import { Icons } from '@/components/Icons';
import GlobalContextTab from '@/components/tabs/GlobalContextTab';
import MarketIntelligenceTab from '@/components/tabs/MarketIntelligenceTab';
import ImpactSimulatorTab from '@/components/tabs/ImpactSimulatorTab';
import CarbonTrackerTab from '@/components/tabs/CarbonTrackerTab';
import BeneficiaryGeneratorTab from '@/components/tabs/BeneficiaryGeneratorTab';
import ResourceLibraryTab from '@/components/tabs/ResourceLibraryTab';
import HolidayCalendarTab from '@/components/tabs/HolidayCalendarTab';
import AirQualityTab from '@/components/tabs/AirQualityTab';

const TABS = [
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
    );
}
