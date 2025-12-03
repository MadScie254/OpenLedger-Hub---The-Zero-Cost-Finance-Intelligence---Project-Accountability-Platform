'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LiveStatsProps {
    className?: string;
}

interface Stats {
    totalProjects: number;
    totalBudget: number;
    totalTransactions: number;
    netBalance: number;
}

const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number }> = ({
    value,
    prefix = '',
    suffix = '',
    decimals = 0
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {prefix}{count.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}{suffix}
        </span>
    );
};

export const LiveStats: React.FC<LiveStatsProps> = ({ className = '' }) => {
    const [stats, setStats] = useState<Stats>({
        totalProjects: 0,
        totalBudget: 0,
        totalTransactions: 0,
        netBalance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

            const [projectsRes, transactionsRes] = await Promise.all([
                fetch(`${apiUrl}/projects`),
                fetch(`${apiUrl}/finance/transactions`)
            ]);

            const projects = await projectsRes.json();
            const transactions = await transactionsRes.json();

            const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.total_budget || 0), 0);
            const income = transactions.filter((t: any) => t.transaction_type === 'income')
                .reduce((sum: number, t: any) => sum + t.amount, 0);
            const expenses = transactions.filter((t: any) => t.transaction_type === 'expense')
                .reduce((sum: number, t: any) => sum + t.amount, 0);

            setStats({
                totalProjects: projects.length,
                totalBudget,
                totalTransactions: transactions.length,
                netBalance: income - expenses
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Active Projects',
            value: stats.totalProjects,
            icon: '📊',
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30'
        },
        {
            label: 'Total Budget',
            value: stats.totalBudget,
            icon: '💰',
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            prefix: '$',
            decimals: 2
        },
        {
            label: 'Transactions',
            value: stats.totalTransactions,
            icon: '🔄',
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
        },
        {
            label: 'Net Balance',
            value: stats.netBalance,
            icon: stats.netBalance >= 0 ? '📈' : '📉',
            color: stats.netBalance >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-orange-600',
            bgColor: stats.netBalance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
            borderColor: stats.netBalance >= 0 ? 'border-green-500/30' : 'border-red-500/30',
            prefix: '$',
            decimals: 2
        }
    ];

    if (loading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card animate-pulse h-32"></div>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`glass-card p-6 border ${stat.borderColor} ${stat.bgColor} relative overflow-hidden group cursor-pointer`}
                >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                            />
                        </div>

                        <h3 className="text-sm font-medium text-white/60 mb-2">{stat.label}</h3>

                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            <AnimatedCounter
                                value={stat.value}
                                prefix={stat.prefix}
                                decimals={stat.decimals}
                            />
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
