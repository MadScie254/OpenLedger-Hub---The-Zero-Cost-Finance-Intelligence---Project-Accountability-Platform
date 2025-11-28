'use client';

/**
 * OpenLedger Black - Home Page
 * Direct redirect to dashboard
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Direct redirect to dashboard
        router.push('/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                    OpenLedger <span className="text-electric-blue">Black</span>
                </h1>
                <p className="text-gray-400">Loading dashboard...</p>
            </div>
        </div>
    );
}
