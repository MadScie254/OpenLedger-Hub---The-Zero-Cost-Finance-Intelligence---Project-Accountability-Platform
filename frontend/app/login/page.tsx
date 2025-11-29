'use client';

/**
 * OpenLedger Black - Login Page
 * Executive-grade authentication interface
 */

import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.login({ username, password });
            // Force page reload to ensure tokens are picked up
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 bg-gradient-mesh -z-10" />

            {/* Floating orbs for depth */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

            {/* Login Card */}
            <div className="glass-card w-full max-w-md p-8 animate-enter">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        OpenLedger <span className="text-electric-blue">Black</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Enterprise Finance Intelligence Platform</p>
                </div>

                {/* Google Sign-In */}
                <div className="mb-6">
                    <GoogleSignIn
                        buttonTheme="filled_black"
                        buttonSize="large"
                        buttonText="signin_with"
                    />
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-700"></div>
                    <span className="px-4 text-gray-500 text-sm">or continue with credentials</span>
                    <div className="flex-1 border-t border-gray-700"></div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all outline-none"
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all outline-none"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full neon-button py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2">📝 Demo Credentials:</p>
                    <p className="text-sm text-electric-blue font-mono">admin / root1234</p>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-600">
                    <p>Zero-cost • SQLite-powered • Enterprise-grade</p>
                </div>
            </div>
        </div>
    );
}


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.login({ username, password });
            // Force page reload to ensure tokens are picked up
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 bg-gradient-mesh -z-10" />

            {/* Floating orbs for depth */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

            {/* Login Card */}
            <div className="glass-card w-full max-w-md p-8 animate-enter">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        OpenLedger <span className="text-electric-blue">Black</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Enterprise Finance Intelligence Platform</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm animate-slide-in">
                            {error}
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="label-executive">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-executive"
                            placeholder="Enter your username"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="label-executive">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-executive"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full neon-button flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="spinner" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Access System</span>
                        )}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 pt-6 border-t border-glass-border">
                    <p className="text-xs text-gray-500 text-center mb-3">Demo Credentials:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black-tertiary px-3 py-2 rounded">
                            <span className="text-gray-500">User:</span> <span className="text-white font-mono">admin</span>
                        </div>
                        <div className="bg-black-tertiary px-3 py-2 rounded">
                            <span className="text-gray-500">Pass:</span> <span className="text-white font-mono">root1234</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">
                        Zero-cost • SQLite-powered • Military-grade security
                    </p>
                </div>
            </div>
        </div>
    );
}
