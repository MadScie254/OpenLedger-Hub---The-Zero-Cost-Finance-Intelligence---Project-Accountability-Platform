'use client';

import { useState } from 'react';
import { Icons } from '@/components/Icons';

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
];

export default function DashboardPage() {
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [transactionForm, setTransactionForm] = useState({
        type: 'income',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [projectForm, setProjectForm] = useState({
        name: '',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'planning',
    });

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
    });

    const stats = {
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
    };

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Call API
            setNotification({ type: 'success', message: 'Transaction created successfully!' });
            setShowTransactionModal(false);
            setTransactionForm({ type: 'income', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to create transaction' });
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setNotification({ type: 'success', message: 'Project created successfully!' });
            setShowProjectModal(false);
            setProjectForm({ name: '', budget: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'planning' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to create project' });
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setNotification({ type: 'success', message: 'Task created successfully!' });
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to create task' });
        }
    };

    const formatCurrency = (amount: number) => {
        return `${currency.symbol}${amount.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(220, 38, 38, 0.9)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(220, 38, 38, 0.5)'}`,
                    zIndex: 9999,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out',
                }}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                        OpenLedger <span style={{ color: '#0ea5e9' }}>Black</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Currency Selector */}
                    <select
                        value={currency.code}
                        onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value)!)}
                        style={{
                            background: 'rgba(26, 26, 26, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        {CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code}</option>
                        ))}
                    </select>

                    <button style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid #0ea5e9',
                        color: '#0ea5e9',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <Icons.Download />
                        Export Data
                    </button>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                {/* Page Title */}
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Executive Dashboard</h2>
                    <p style={{ color: '#a3a3a3', fontSize: '16px' }}>Real-time financial intelligence and project oversight</p>
                </div>

                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: 'NET CASHFLOW (30D)', value: formatCurrency(stats.net_cashflow), change: '+30.0%', icon: <Icons.TrendingUp />, positive: true },
                        { label: 'DAILY BURN RATE', value: formatCurrency(stats.burn_rate), subtitle: 'per day', icon: <Icons.DollarSign />, positive: false },
                        { label: 'ACTIVE PROJECTS', value: stats.active_projects, subtitle: formatCurrency(stats.total_budget) + ' total budget', icon: <Icons.Briefcase />, positive: true },
                        { label: 'BUDGET UTILIZATION', value: stats.budget_utilization.toFixed(1) + '%', subtitle: formatCurrency(stats.budget_spent) + ' spent', icon: <Icons.PieChart />, positive: true },
                    ].map((metric, i) => (
                        <div key={i} style={{
                            background: 'rgba(26, 26, 26, 0.6)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '24px',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.border = '1px solid #0ea5e9';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(14, 165, 233, 0.2)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ color: '#a3a3a3', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>{metric.label}</div>
                                <div style={{ color: metric.positive ? '#10b981' : '#a3a3a3' }}>{metric.icon}</div>
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px', lineHeight: '1' }}>{metric.value}</div>
                            {metric.change && <div style={{ color: metric.positive ? '#10b981' : '#dc2626', fontSize: '14px', fontWeight: '600' }}>{metric.change}</div>}
                            {metric.subtitle && <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>{metric.subtitle}</div>}
                        </div>
                    ))}
                </div>

                {/* Financial Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>Cashflow Breakdown</h3>
                            <Icons.PieChart />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                                <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>TOTAL INCOME</div>
                                <div style={{ color: '#10b981', fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.total_income)}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '12px' }}>
                                <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>TOTAL EXPENSES</div>
                                <div style={{ color: '#dc2626', fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.total_expenses)}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '12px' }}>
                            <div style={{ color: '#0ea5e9', fontSize: '14px', fontWeight: '600' }}>Net Positive: {formatCurrency(stats.net_cashflow)}</div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>Budget Status</h3>
                            <Icons.Target />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
                                <div style={{ color: '#a3a3a3', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>ALLOCATED</div>
                                <div style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.total_budget)}</div>
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '12px' }}>
                                <div style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>REMAINING</div>
                                <div style={{ color: '#0ea5e9', fontSize: '28px', fontWeight: '700' }}>{formatCurrency(stats.total_budget - stats.budget_spent)}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                            <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>{(100 - stats.budget_utilization).toFixed(1)}% Budget Available</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: 'TOTAL BENEFICIARIES', value: stats.total_beneficiaries.toLocaleString(), icon: <Icons.Users />, color: '#0ea5e9' },
                        { label: 'LOW STOCK ALERTS', value: stats.low_stock_items, subtitle: 'Restock required', icon: <Icons.AlertTriangle />, color: '#f59e0b' },
                        { label: 'UPCOMING MAINTENANCE', value: stats.upcoming_maintenances, subtitle: 'Next 30 days', icon: <Icons.Tool />, color: '#a3a3a3' },
                    ].map((stat, i) => (
                        <div key={i} style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#a3a3a3', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '12px' }}>{stat.label}</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                                {stat.subtitle && <div style={{ fontSize: '12px', color: stat.color, marginTop: '6px', fontWeight: '500' }}>{stat.subtitle}</div>}
                            </div>
                            <div style={{ color: stat.color, opacity: 0.6 }}>{stat.icon}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'rgba(26, 26, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '28px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <button
                            onClick={() => setShowTransactionModal(true)}
                            style={{
                                background: '#0ea5e9',
                                color: 'white',
                                fontWeight: '600',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0284c7';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 165, 233, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0ea5e9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Icons.Plus />
                            Record Transaction
                        </button>

                        <button
                            onClick={() => setShowProjectModal(true)}
                            style={{
                                background: 'transparent',
                                color: '#0ea5e9',
                                fontWeight: '600',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: '2px solid #0ea5e9',
                                cursor: 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0ea5e9';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#0ea5e9';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Icons.Briefcase />
                            Create Project
                        </button>

                        <button
                            onClick={() => setShowTaskModal(true)}
                            style={{
                                background: 'transparent',
                                color: '#0ea5e9',
                                fontWeight: '600',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: '2px solid #0ea5e9',
                                cursor: 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#0ea5e9';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#0ea5e9';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Icons.Target />
                            Add Task/KPI
                        </button>

                        <button
                            style={{
                                background: 'transparent',
                                color: '#10b981',
                                fontWeight: '600',
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: '2px solid #10b981',
                                cursor: 'pointer',
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Icons.Package />
                            Add Asset
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '32px 0 16px', color: '#666', fontSize: '13px' }}>
                    <p>OpenLedger Black v1.0.0 • All systems operational • Zero external dependencies</p>
                </div>
            </div>

            {/* Transaction Modal */}
            {showTransactionModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}
                    onClick={() => setShowTransactionModal(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(26, 26, 26, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>Record Transaction</h3>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a3a3a3',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Icons.X />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTransaction}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                                <select
                                    value={transactionForm.type}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount ({currency.symbol})</label>
                                <input
                                    type="number"
                                    value={transactionForm.amount}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                    placeholder="0.00"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                                <input
                                    type="text"
                                    value={transactionForm.category}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                    placeholder="e.g., Salary, Rent, Equipment"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                <textarea
                                    value={transactionForm.description}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                    }}
                                    placeholder="Optional details..."
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</label>
                                <input
                                    type="date"
                                    value={transactionForm.date}
                                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowTransactionModal(false)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        color: '#a3a3a3',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        background: '#0ea5e9',
                                        border: 'none',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Create Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}
                    onClick={() => setShowProjectModal(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(26, 26, 26, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>Create Project</h3>
                            <button
                                onClick={() => setShowProjectModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a3a3a3',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Icons.X />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Name</label>
                                <input
                                    type="text"
                                    value={projectForm.name}
                                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget ({currency.symbol})</label>
                                <input
                                    type="number"
                                    value={projectForm.budget}
                                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                    placeholder="0.00"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.startDate}
                                        onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(42, 42, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.endDate}
                                        onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(42, 42, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                                <select
                                    value={projectForm.status}
                                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="planning">Planning</option>
                                    <option value="active">Active</option>
                                    <option value="on-hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowProjectModal(false)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        color: '#a3a3a3',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        background: '#0ea5e9',
                                        border: 'none',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}
                    onClick={() => setShowTaskModal(false)}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'rgba(26, 26, 26, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '20px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>Add Task/KPI</h3>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a3a3a3',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Icons.X />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
                                <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                    }}
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(42, 42, 42, 0.8)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                    }}
                                    placeholder="Task details..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(42, 42, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#a3a3a3', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date</label>
                                    <input
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'rgba(42, 42, 42, 0.8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        color: '#a3a3a3',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        background: '#0ea5e9',
                                        border: 'none',
                                        color: 'white',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
