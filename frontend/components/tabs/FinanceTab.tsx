'use client';

import { useState, useEffect } from 'react';
import { Icons } from '../Icons';

interface FinanceTabProps {
    apiUrl: string;
}

export default function FinanceTab({ apiUrl }: FinanceTabProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        project_id: '',
        amount: '',
        type: 'Expense',
        category: 'Operational',
        description: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [txRes, projRes] = await Promise.all([
                fetch(`${apiUrl}/finance/transactions`),
                fetch(`${apiUrl}/projects`)
            ]);

            if (txRes.ok) {
                const data = await txRes.json();
                setTransactions(data);
            }
            if (projRes.ok) {
                const data = await projRes.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                transaction_type: formData.type.toLowerCase(), // Ensure lowercase enum
                amount: parseFloat(formData.amount),
                description: formData.description,
                date: new Date().toISOString().split('T')[0], // Today's date
                project_id: formData.project_id ? parseInt(formData.project_id) : null,
                notes: `Category: ${formData.category}` // Store category in notes since we don't have IDs
            };

            const res = await fetch(`${apiUrl}/finance/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ project_id: '', amount: '', type: 'Expense', category: 'Operational', description: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Financial Overview</h2>
                    <p className="text-neutral-400 mt-1">Track income, expenses, and project budgets</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    <Icons.Plus className="w-5 h-5" />
                    New Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <Icons.TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Total Income</p>
                            <p className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                            <Icons.TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Total Expenses</p>
                            <p className="text-2xl font-bold text-white">${totalExpense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
                            <Icons.DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-400">Net Balance</p>
                            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ${balance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="glass-card p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-4">Record Transaction</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="glass-select"
                                >
                                    <option value="Income" className="bg-neutral-900">Income</option>
                                    <option value="Expense" className="bg-neutral-900">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Amount (USD)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="glass-input"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="glass-select"
                                >
                                    <option value="Operational" className="bg-neutral-900">Operational</option>
                                    <option value="Salary" className="bg-neutral-900">Salary</option>
                                    <option value="Equipment" className="bg-neutral-900">Equipment</option>
                                    <option value="Marketing" className="bg-neutral-900">Marketing</option>
                                    <option value="Grant" className="bg-neutral-900">Grant</option>
                                    <option value="Donation" className="bg-neutral-900">Donation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Project (Optional)</label>
                                <select
                                    value={formData.project_id}
                                    onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                                    className="glass-select"
                                >
                                    <option value="" className="bg-neutral-900">General (No Project)</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                            <input
                                type="text"
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="glass-input"
                                placeholder="Transaction details..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Save Transaction
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions List */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 text-sm font-medium text-neutral-400">Date</th>
                                <th className="p-4 text-sm font-medium text-neutral-400">Description</th>
                                <th className="p-4 text-sm font-medium text-neutral-400">Category</th>
                                <th className="p-4 text-sm font-medium text-neutral-400">Project</th>
                                <th className="p-4 text-sm font-medium text-neutral-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-sm text-neutral-300">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-white font-medium">{tx.description}</td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-neutral-400">
                                        {projects.find(p => p.id === tx.project_id)?.name || '-'}
                                    </td>
                                    <td className={`p-4 text-sm font-bold text-right ${tx.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                                        No transactions recorded yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
