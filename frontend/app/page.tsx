'use client';

export default function HomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center animate-enter">
                <h1 className="text-6xl font-bold text-white mb-4">
                    OpenLedger <span className="text-electric-blue">Black</span>
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                    Enterprise Finance Intelligence Platform
                </p>
                <a
                    href="/login"
                    className="neon-button inline-block"
                >
                    Access System
                </a>
            </div>
        </div>
    );
}
