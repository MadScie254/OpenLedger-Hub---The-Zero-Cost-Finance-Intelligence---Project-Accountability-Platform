'use client';

/** Market Intelligence Tab - Crypto and currency market trends */

import { useState, useEffect } from 'react';

interface MarketIntelligenceProps {
    apiUrl: string;
}

export default function MarketIntelligenceTab({ apiUrl }: MarketIntelligenceProps) {
    const [cryptoPrices, setCryptoPrices] = useState<any>({});
    const [exchangeRates, setExchangeRates] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const loadMarketData = async () => {
        setLoading(true);
        try {
            // Fetch crypto prices
            const cryptoCoins = ['bitcoin', 'ethereum', 'cardano'];
            const cryptoPromises = cryptoCoins.map(coin =>
                fetch(`${apiUrl}/external/crypto/${coin}`).then(r => r.json())
            );
            const cryptoResults = await Promise.all(cryptoPromises);
            const cryptoData: any = {};
            cryptoResults.forEach(result => {
                cryptoData[result.coin_id] = result.price;
            });
            setCryptoPrices(cryptoData);

            // Fetch exchange rates
            const ratesRes = await fetch(`${apiUrl}/external/exchange-rates?base=USD&symbols=KES,EUR,GBP,NGN,TZS`);
            if (ratesRes.ok) {
                const ratesData = await ratesRes.json();
                setExchangeRates(ratesData.rates);
            }
        } catch (error) {
            console.error('Error loading market data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMarketData();
        const interval = setInterval(loadMarketData, 300000); // Refresh every 5 mins
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Market Intelligence</h2>
                    <p className="text-gray-400 mt-1">Real-time crypto and currency trends</p>
                </div>
                <button
                    onClick={loadMarketData}
                    disabled={loading}
                    className="px-4 py-2 bg-dark-600/50 border border-electric-blue/30 rounded-lg text-white hover:bg-electric-blue/10 transition-all disabled:opacity-50"
                >
                    {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
                </button>
            </div>

            {/* Crypto Prices */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Cryptocurrency Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(cryptoPrices).map(([coin, price]: [string, any]) => (
                        <div key={coin} className="glass-panel p-6 rounded-xl hover-glow transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-white font-semibold capitalize">{coin}</h4>
                                <span className="text-xs text-gray-400">USD</span>
                            </div>
                            <p className="text-4xl font-bold text-electric-blue">
                                ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Exchange Rates */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Exchange Rates (USD Base)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(exchangeRates).map(([currency, rate]: [string, any]) => (
                        <div key={currency} className="glass-panel p-4 rounded-xl text-center">
                            <p className="text-2xl font-bold text-white mb-1">{currency}</p>
                            <p className="text-electric-blue font-semibold">
                                {rate?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {!loading && Object.keys(cryptoPrices).length === 0 && (
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">💹</p>
                    <p className="text-gray-400">Loading market data...</p>
                </div>
            )}

            <style jsx>{`
        .glass-panel {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 211, 238, 0.1);
        }
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
        }
      `}</style>
        </div>
    );
}
