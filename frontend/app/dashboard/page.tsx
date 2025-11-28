'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardStats {
    total_income: number;
    total_expenses: number;
    net_cashflow: number;
    burn_rate: number;
    active_projects: number;
    total_budget: number;
    budget_spent: number;
    budget_utilization: number;
    low_stock_items: number;
    upcoming_maintenances: number;
    total_beneficiaries: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        total_income: 125000,
        total_expenses: 87500,
        net_cashflow: 37500,
        burn_rate: 2916,
        active_projects: 4,
        total_budget: 500000,
        budget_spent: 287500,
        budget_utilization: 57.5,
        low_stock_items: 3,
        upcoming_maintenances: 5,
        total_beneficiaries: 1247,
    });

    const budgetRemaining = stats.total_budget - stats.budget_spent;
    const cashflowChange = ((stats.net_cashflow / (stats.total_income || 1)) * 100).toFixed(1);

    const cashflowData = {
        labels: ['Income', 'Expenses'],
        datasets: [
            {
                data: [stats.total_income, stats.total_expenses],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(220, 38, 38, 0.8)'],
                borderColor: ['#10b981', '#dc2626'],
                borderWidth: 2,
            },
        ],
    };

    const budgetData = {
        labels: ['Spent', 'Remaining'],
        datasets: [
            {
                data: [stats.budget_spent, budgetRemaining],
                backgroundColor: ['rgba(14, 165, 233, 0.8)', 'rgba(42, 42, 42, 0.8)'],
                borderColor: ['#0ea5e9', '#2a2a2a'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                    color: '#a3a3a3',
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-mesh">
            {/* Navigation Header */}
            <nav className="glass-card m-4 p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        OpenLedger <span className="text-electric-blue">Black</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Logged in as</p>
                        <p className="text-white font-semibold">Demo User</p>
                    </div>
                </div>
            </nav>

            {/* Main Dashboard */}
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="stagger-item">
                    <h2 className="text-3xl font-bold text-white mb-2">Executive Dashboard</h2>
                    < className="text-gray-400">Real-time financial intelligence and project oversight</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Cashflow */}
                <div className="stat-card stagger-item">
                    <div className="metric-label">Net Cashflow (30d)</div>
                    <div className="metric-value">
                        ${stats.net_cashflow.toLocaleString()}
                    </div>
                    <div className={stats.net_cashflow >= 0 ? 'metric-change-positive' : 'metric-change-negative'}>
                        {stats.net_cashflow >= 0 ? '↑' : '↓'} {cashflowChange}%
                    </div>
                </div>

                {/* Burn Rate */}
                <div className="stat-card stagger-item">
                    <div className="metric-label">Daily Burn Rate</div>
                    <div className="metric-value">
                        ${stats.burn_rate.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">per day</div>
                </div>

                {/* Active Projects */}
                <div className="stat-card stagger-item">
                    <div className="metric-label">Active Projects</div>
                    <div className="metric-value">{stats.active_projects}</div>
                    <div className="text-sm text-gray-400">
                        ${stats.total_budget.toLocaleString()} total budget
                    </div>
                </div>

                {/* Budget Utilization */}
                <div className="stat-card stagger-item">
                    <div className="metric-label">Budget Utilization</div>
                    <div className="metric-value">{stats.budget_utilization.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">
                        ${stats.budget_spent.toLocaleString()} spent
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cashflow Breakdown */}
                <div className="executive-card stagger-item">
                    <h3 className="text-xl font-bold text-white mb-4">Cashflow Breakdown</h3>
                    <div className="h-64">
                        <Doughnut data={cashflowData} options={chartOptions} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-gray-400">Total Income</div>
                            <div className="text-emerald font-bold text-lg">
                                ${stats.total_income.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Total Expenses</div>
                            <div className="text-crimson font-bold text-lg">
                                ${stats.total_expenses.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Status */}
                <div className="executive-card stagger-item">
                    <h3 className="text-xl font-bold text-white mb-4">Budget Status</h3>
                    <div className="h-64">
                        <Doughnut data={budgetData} options={chartOptions} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-gray-400">Allocated</div>
                            <div className="text-white font-bold text-lg">
                                ${stats.total_budget.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Remaining</div>
                            <div className="text-electric-blue font-bold text-lg">
                                ${budgetRemaining.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Beneficiaries */}
                <div className="executive-card stagger-item">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="metric-label">Total Beneficiaries</div>
                            <div className="text-2xl font-bold text-white mt-2">
                                {stats.total_beneficiaries.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-4xl text-electric-blue">👥</div>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="executive-card stagger-item">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="metric-label">Low Stock Items</div>
                            <div className="text-2xl font-bold text-amber mt-2">
                                {stats.low_stock_items}
                            </div>
                        </div>
                        <div className="text-4xl text-amber">⚠️</div>
                    </div>
                    {stats.low_stock_items > 0 && (
                        <div className="mt-2 text-xs text-amber">Restock required</div>
                    )}
                </div>

                {/* Maintenance Due */}
                <div className="executive-card stagger-item">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="metric-label">Upcoming Maintenance</div>
                            <div className="text-2xl font-bold text-white mt-2">
                                {stats.upcoming_maintenances}
                            </div>
                        </div>
                        <div className="text-4xl text-gray-400">🔧</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Next 30 days</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="executive-card stagger-item">
                <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="neon-button">
                        Record Transaction
                    </button>
                    <button className="ghost-button">
                        Create Project
                    </button>
                    <button className="ghost-button">
                        Add Asset
                    </button>
                    <button className="ghost-button">
                        Record KPI
                    </button>
                </div>
            </div>

            {/* System Status */}
            <div className="text-center text-xs text-gray-600 py-4">
                <p>OpenLedger Black v1.0.0 • All systems operational • Zero external dependencies</p>
            </div>
        </div>
        </div >
    );
}
