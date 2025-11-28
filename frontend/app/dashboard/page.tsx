'use client';

export default function DashboardPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)', padding: '20px' }}>
            {/* Header */}
            <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: 0 }}>
                    OpenLedger <span style={{ color: '#0ea5e9' }}>Black</span>
                </h1>
                <p style={{ color: '#a3a3a3', marginTop: '8px', marginBottom: 0 }}>Executive Dashboard - Real-time Intelligence</p>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Executive Dashboard</h2>
                <p style={{ color: '#a3a3a3' }}>Real-time financial intelligence and project oversight</p>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {/* Net Cashflow */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s' }}>
                    <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>NET CASHFLOW (30D)</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>$37,500</div>
                    <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>↑ 30.0%</div>
                </div>

                {/* Burn Rate */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s' }}>
                    <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>DAILY BURN RATE</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>$2,916</div>
                    <div style={{ color: '#a3a3a3', fontSize: '14px' }}>per day</div>
                </div>

                {/* Active Projects */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s' }}>
                    <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>ACTIVE PROJECTS</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>4</div>
                    <div style={{ color: '#a3a3a3', fontSize: '14px' }}>$500,000 total budget</div>
                </div>

                {/* Budget Utilization */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', transition: 'all 0.3s' }}>
                    <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>BUDGET UTILIZATION</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>57.5%</div>
                    <div style={{ color: '#a3a3a3', fontSize: '14px' }}>$287,500 spent</div>
                </div>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                {/* Income vs Expenses */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>Cashflow Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '8px' }}>Total Income</div>
                            <div style={{ color: '#10b981', fontSize: '24px', fontWeight: '700' }}>$125,000</div>
                        </div>
                        <div>
                            <div style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '8px' }}>Total Expenses</div>
                            <div style={{ color: '#dc2626', fontSize: '24px', fontWeight: '700' }}>$87,500</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                        <div style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>Net Positive: $37,500</div>
                    </div>
                </div>

                {/* Budget Status */}
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>Budget Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <div style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '8px' }}>Allocated</div>
                            <div style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>$500,000</div>
                        </div>
                        <div>
                            <div style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '8px' }}>Remaining</div>
                            <div style={{ color: '#0ea5e9', fontSize: '24px', fontWeight: '700' }}>$212,500</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '8px' }}>
                        <div style={{ color: '#0ea5e9', fontSize: '14px', fontWeight: '600' }}>42.5% Available</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>TOTAL BENEFICIARIES</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>1,247</div>
                    </div>
                    <div style={{ fontSize: '48px' }}>👥</div>
                </div>

                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>LOW STOCK ITEMS</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>3</div>
                        <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>Restock required</div>
                    </div>
                    <div style={{ fontSize: '48px' }}>⚠️</div>
                </div>

                <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#a3a3a3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>UPCOMING MAINTENANCE</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>5</div>
                        <div style={{ fontSize: '12px', color: '#a3a3a3', marginTop: '4px' }}>Next 30 days</div>
                    </div>
                    <div style={{ fontSize: '48px' }}>🔧</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '20px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <button style={{ background: '#0ea5e9', color: 'white', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Record Transaction
                    </button>
                    <button style={{ background: 'transparent', color: '#0ea5e9', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', border: '2px solid #0ea5e9', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Create Project
                    </button>
                    <button style={{ background: 'transparent', color: '#0ea5e9', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', border: '2px solid #0ea5e9', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Add Asset
                    </button>
                    <button style={{ background: 'transparent', color: '#0ea5e9', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', border: '2px solid #0ea5e9', cursor: 'pointer', transition: 'all 0.3s' }}>
                        Record KPI
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '12px' }}>
                <p>OpenLedger Black v1.0.0 • All systems operational • Zero external dependencies</p>
            </div>
        </div>
    );
}
