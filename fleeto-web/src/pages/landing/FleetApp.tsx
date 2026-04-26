import { Link } from 'react-router-dom'
import MarketingNav from '../../components/MarketingNav'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUzIaT_WwgB-MBACDh5cJ6xS2H7E4JbJujOS4tag8Ep57hGeoK2c1YEqdkBv53-xjxYg0W8nKmD1q1eD29gSto9vm-S7dxQGdJuJmCev7JRmXGEYID21nK3QEq2xoAxtNTljHeuTp-6VmegmMLw_PVHINZBMqWND-s3TCn9HkVlu_1G9uosMeX_MT7UtOElJDjqFPXDe14BT6y5-Pan7njnbWK6-Vy7FQ-cVb5Zx_PYOIwS6yz3XJFPLRGhHXJwCpGNY9HPwatCt19'
const MAP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd19wfObS9baotUpvGpMtrrNLjlay8ho04hxUuduw8z2paHOI2NSkwEdTdyU0rFW9pqHYEoQZmCjuvDD40OrLoiP40Emq5p6zx76diun1GEIsSP2ZnI3sCxnVoBa8EIVYFFwwUwY1D6h9o9vBPFcyFpCY_dbHWBa_2pIquZLZqNfalsctDCKFzwMmdUKjnyzLLJ4Um51aEY_2WV9NcusIxG5VamwkBKtQx-xiq01ypd8kzZ0oj1og8NuxyOKw_FV0LEZcZebGcAQyu'

export default function FleetApp() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <MarketingNav />

      <main className="flex-grow flex flex-col">

        {/* Hero */}
        <section className="w-full px-8 max-w-7xl mx-auto pt-xxl pb-margin md:py-xxl flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full w-max">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-label-caps font-semibold uppercase tracking-[0.05em] text-on-surface-variant">OPERATOR COMMAND CENTER</span>
            </div>
            <h1 className="text-h1 font-black text-on-background max-w-lg tracking-tighter">Control your logistics network with absolute precision.</h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">The Fleet App delivers real-time oversight, automated dispatching, and industrial-grade analytics to scale your operations effortlessly.</p>
            <div className="flex gap-4 pt-4">
              <Link to="/signup" className="bg-zinc-950 text-white text-body-sm font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity flex items-center gap-2">
                Start Operating <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <button className="bg-surface-container text-on-background text-body-sm font-medium px-6 py-3 rounded-md hover:bg-surface-variant transition-colors flex items-center gap-2 border border-outline-variant">
                View Demo
              </button>
            </div>
          </div>

          <div className="w-full md:w-1/2 relative">
            <div className="bg-surface-container-low rounded-2xl border border-surface-variant overflow-hidden aspect-[4/3] relative shadow-elevated">
              <img src={HERO_IMG} alt="Fleet management dashboard" className="w-full h-full object-cover opacity-90 mix-blend-multiply grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white rounded-xl shadow-elevated p-4 border border-surface-variant flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-surface-container p-2 rounded-lg">
                    <span className="material-symbols-outlined text-on-background">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-label-caps font-semibold uppercase tracking-[0.05em] text-on-surface-variant">ACTIVE FLEET</p>
                    <p className="text-h3 font-semibold text-on-background">2,048</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-label-caps font-semibold uppercase text-green-600 flex items-center justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 98.4% EFFICIENCY
                  </p>
                  <p className="text-body-sm text-on-surface-variant">All systems nominal</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="w-full bg-surface-container-lowest py-xxl">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-margin">
              <h2 className="text-h2 font-black text-on-background tracking-tight">Industrial-grade capability.</h2>
              <p className="text-body-lg text-on-surface-variant mt-2 max-w-2xl">Purpose-built tools designed to eliminate friction and maximize throughput across your entire fleet network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gridAutoRows: '300px' }}>

              {/* Live Tracking — 2 cols */}
              <div className="md:col-span-2 bg-surface-container-low rounded-2xl border border-surface-variant p-8 flex flex-col justify-between relative overflow-hidden group shadow-card">
                <div className="z-10 relative">
                  <span className="material-symbols-outlined text-on-background bg-white p-2 rounded-lg shadow-sm border border-surface-variant mb-4 inline-block">satellite_alt</span>
                  <h3 className="text-h3 font-semibold text-on-background">Live Fleet Tracking</h3>
                  <p className="text-body-md text-on-surface-variant mt-2 max-w-md">Monitor your entire ecosystem with sub-second latency. Precise geospatial data layered with operational context.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-2/3 h-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none">
                  <img src={MAP_IMG} alt="City map" className="w-full h-full object-cover grayscale contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface-container-low" />
                </div>
                <div className="absolute right-12 bottom-12 z-10 hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-card border border-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-mono text-mono-label text-on-background">UNIT-84A ACTIVE</span>
                </div>
              </div>

              {/* Smart Dispatch */}
              <div className="bg-surface-container-low rounded-2xl border border-surface-variant p-8 flex flex-col relative overflow-hidden shadow-card">
                <div className="z-10 relative h-full flex flex-col">
                  <div>
                    <span className="material-symbols-outlined text-on-background bg-white p-2 rounded-lg shadow-sm border border-surface-variant mb-4 inline-block">route</span>
                    <h3 className="text-h3 font-semibold text-on-background">Smart Dispatch</h3>
                    <p className="text-body-sm text-on-surface-variant mt-2">Algorithmic routing minimizes empty miles and optimizes asset utilization.</p>
                  </div>
                  <div className="mt-auto space-y-2 pt-6">
                    {[['NODE_A', 'NODE_B'], ['NODE_C', 'NODE_D']].map(([a, b], i) => (
                      <div key={a} className={`flex items-center justify-between p-2 bg-white rounded-md border border-surface-variant ${i === 1 ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">my_location</span>
                          <span className="font-mono text-mono-label">{a}</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-amber-500">arrow_right_alt</span>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">pin_drop</span>
                          <span className="font-mono text-mono-label">{b}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automated Payouts */}
              <div className="bg-zinc-950 rounded-2xl border border-surface-tint p-8 flex flex-col relative overflow-hidden group text-white shadow-elevated">
                <div className="z-10 relative h-full flex flex-col">
                  <div>
                    <span className="material-symbols-outlined text-white bg-zinc-800 p-2 rounded-lg mb-4 inline-block">account_balance_wallet</span>
                    <h3 className="text-h3 font-semibold text-white">Automated Payouts</h3>
                    <p className="text-body-sm text-zinc-400 mt-2">Frictionless financial clearing. Programmatic settlements executed instantly.</p>
                  </div>
                  <div className="mt-auto pt-6">
                    <p className="text-label-caps font-semibold uppercase tracking-[0.05em] text-zinc-500 mb-1">TOTAL CLEARED (24H)</p>
                    <p className="text-h2 font-black text-white flex items-baseline gap-1">
                      <span className="text-lg text-zinc-500">$</span>124,590<span className="text-lg text-zinc-500">.00</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics — 2 cols */}
              <div className="md:col-span-2 bg-surface-container-low rounded-2xl border border-surface-variant p-8 flex flex-col justify-between relative overflow-hidden group shadow-card">
                <div className="z-10 relative">
                  <span className="material-symbols-outlined text-on-background bg-white p-2 rounded-lg shadow-sm border border-surface-variant mb-4 inline-block">monitoring</span>
                  <h3 className="text-h3 font-semibold text-on-background">Detailed Analytics</h3>
                  <p className="text-body-md text-on-surface-variant mt-2 max-w-md">Granular telemetry converted into actionable operational intelligence. Track yield, utilization, and downtime.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-2/3 pointer-events-none flex items-end justify-end p-8 gap-2 opacity-80">
                  {[30, 50, 40, 70, 90, 60].map((h, i) => (
                    <div key={i} className={`w-8 rounded-t-sm relative ${i === 4 ? 'bg-zinc-950' : 'bg-surface-variant'}`} style={{ height: `${h}%` }}>
                      {i === 4 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm border border-surface-variant">
                          <span className="font-mono text-[10px] text-on-background">+14%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white w-full border-t pt-16 pb-8 border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 w-full">
          <div className="flex flex-col gap-4 md:col-span-1">
            <span className="text-lg font-black tracking-tighter text-zinc-900 uppercase">Fleeto</span>
            <p className="text-xs tracking-wide uppercase font-semibold text-zinc-400">© 2026 Fleeto Logistics. Precise. Fast. Industrial.</p>
          </div>
          <div className="col-span-1 md:col-span-3 flex gap-8 justify-end">
            {['Product', 'Network', 'Status', 'Legal', 'Privacy'].map((item) => (
              <a key={item} href="#" className="text-xs tracking-wide uppercase font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
