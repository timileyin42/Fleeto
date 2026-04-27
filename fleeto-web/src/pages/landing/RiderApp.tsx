import { Link } from 'react-router-dom'
import MarketingNav from '../../components/MarketingNav'

export default function RiderApp() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <MarketingNav />

      <main className="flex-grow">

        {/* Hero */}
        <section className="py-xxl px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div className="flex flex-col gap-lg">
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-label-caps font-semibold uppercase tracking-[0.05em] text-on-surface-variant">RIDER APP VERSION 2.4</span>
            </div>
            <h1 className="text-h1 font-black text-primary tracking-tighter">Built for the Road.<br />Designed for Speed.</h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              The Delivra Rider App strips away the noise. Low-data usage, offline-first reliability, and large touch targets ensure your riders spend less time tapping and more time moving.
            </p>
            <div className="flex gap-4 pt-sm">
              <button className="bg-primary text-on-primary px-6 py-3 rounded-lg text-body-md font-semibold hover:opacity-90 transition-opacity">Download for iOS</button>
              <button className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg text-body-md font-semibold hover:bg-surface-dim transition-colors border border-outline-variant">Download for Android</button>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative h-[600px] flex justify-center items-center">
            <div className="absolute inset-0 bg-surface-container-low rounded-[40px] border border-outline-variant transform rotate-3 shadow-elevated opacity-50" />
            <div className="relative w-[300px] h-[600px] bg-surface rounded-[32px] border-4 border-primary shadow-elevated overflow-hidden flex flex-col z-10">
              {/* Status bar */}
              <div className="h-6 bg-surface flex justify-between items-center px-4">
                <span className="text-[10px] font-mono text-on-surface-variant">14:23</span>
                <div className="flex gap-1">
                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">signal_cellular_4_bar</span>
                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">wifi</span>
                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">battery_full</span>
                </div>
              </div>
              {/* App content */}
              <div className="p-4 flex-grow bg-surface-container-low flex flex-col gap-4 overflow-hidden">
                <div className="bg-primary text-on-primary p-4 rounded-xl">
                  <h3 className="text-h3 font-semibold mb-1">Current Job #4829</h3>
                  <p className="text-body-sm opacity-80">Industrial Park, Sector 4</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-green-500 text-white py-3 rounded-lg text-label-caps font-semibold flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] fill">check_circle</span> DELIVERED
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-label-caps font-semibold uppercase tracking-[0.05em] text-on-surface-variant px-1">UPCOMING STOPS</div>
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-center justify-between">
                    <div>
                      <div className="text-body-md font-semibold">14:45 - Tech Hub Alpha</div>
                      <div className="text-body-sm text-on-surface-variant">3 Packages • 2.4km</div>
                    </div>
                    <span className="material-symbols-outlined text-outline">navigation</span>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-center justify-between opacity-70">
                    <div>
                      <div className="text-body-md font-semibold">15:30 - Central Station</div>
                      <div className="text-body-sm text-on-surface-variant">1 Package • 5.1km</div>
                    </div>
                    <span className="material-symbols-outlined text-outline">navigation</span>
                  </div>
                </div>
              </div>
              {/* Bottom nav */}
              <div className="h-16 bg-surface border-t border-outline-variant flex justify-around items-center text-on-surface-variant">
                <div className="flex flex-col items-center text-primary"><span className="material-symbols-outlined fill">list_alt</span></div>
                <div className="flex flex-col items-center"><span className="material-symbols-outlined">map</span></div>
                <div className="flex flex-col items-center"><span className="material-symbols-outlined">person</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="py-xxl bg-surface-container-lowest px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-xl text-center max-w-2xl mx-auto">
              <h2 className="text-h2 font-black text-primary tracking-tight mb-sm">Engineered for Efficiency</h2>
              <p className="text-body-md text-on-surface-variant">Every element is designed to minimize friction and maximize successful deliveries, even in the toughest conditions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">

              {/* Offline First — 2 cols */}
              <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-lg border border-outline-variant shadow-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-surface-container-high rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-500" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="bg-surface w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-outline-variant">
                    <span className="material-symbols-outlined text-primary">wifi_off</span>
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold text-primary mb-2">Offline-First Architecture</h3>
                    <p className="text-body-sm text-on-surface-variant max-w-md">Data drops in concrete warehouses or rural routes won't stop the job. The app caches all essential routing and job details, syncing seamlessly when connectivity returns.</p>
                  </div>
                </div>
              </div>

              {/* Touch Targets */}
              <div className="bg-surface rounded-2xl p-lg border border-outline-variant shadow-card flex flex-col">
                <div className="bg-surface-container-low w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-outline-variant">
                  <span className="material-symbols-outlined text-primary">touch_app</span>
                </div>
                <h3 className="text-h3 font-semibold text-primary mb-2">Oversized Touch Targets</h3>
                <p className="text-body-sm text-on-surface-variant">Designed to be used with gloves, in moving vehicles, or while holding packages. Critical actions are unmissable.</p>
              </div>

              {/* Low Data */}
              <div className="bg-surface rounded-2xl p-lg border border-outline-variant shadow-card flex flex-col">
                <div className="bg-surface-container-low w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-outline-variant">
                  <span className="material-symbols-outlined text-primary">data_usage</span>
                </div>
                <h3 className="text-h3 font-semibold text-primary mb-2">Low-Data Payload</h3>
                <p className="text-body-sm text-on-surface-variant">We stripped out bloated map tiles and heavy images. The app uses kilobytes, not megabytes, saving battery and data costs.</p>
              </div>

              {/* Linear Job Lists — 2 cols */}
              <div className="md:col-span-2 bg-primary rounded-2xl p-lg shadow-card text-on-primary flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-zinc-700">
                    <span className="material-symbols-outlined text-on-primary">list</span>
                  </div>
                  <h3 className="text-h3 font-semibold mb-2">Linear Job Lists</h3>
                  <p className="text-body-sm text-on-primary/80 max-w-md">No complex tabs or hidden menus. Riders get a straightforward, chronological list of their day's tasks. Complete one, move to the next.</p>
                </div>
                <div className="w-full md:w-auto bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex flex-col gap-3 min-w-[250px]">
                  <div className="flex items-center gap-3 opacity-50">
                    <span className="material-symbols-outlined text-on-primary">check_circle</span>
                    <span className="font-mono text-mono-label line-through text-on-primary">Job #4828</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-400">
                    <span className="material-symbols-outlined fill">radio_button_checked</span>
                    <span className="font-mono text-mono-label font-bold">Job #4829 (Active)</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-primary">
                    <span className="material-symbols-outlined">radio_button_unchecked</span>
                    <span className="font-mono text-mono-label">Job #4830</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-xxl px-8 text-center max-w-7xl mx-auto">
          <h2 className="text-h2 font-black text-on-background tracking-tight mb-md">Your riders deserve better tools.</h2>
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto mb-xl">Give them an app built for Lagos — fast, reliable, and designed for the road.</p>
          <Link to="/signup" className="inline-block bg-primary text-on-primary px-10 py-5 rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity">
            Get Started Free
          </Link>
        </section>
      </main>

      <footer className="bg-white w-full border-t pt-16 pb-8 border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8">
          <div>
            <div className="text-lg font-black tracking-tighter text-zinc-900 mb-4 uppercase">Delivra</div>
            <p className="text-xs tracking-wide uppercase font-semibold text-zinc-400">© 2026 Delivra. All rights reserved.</p>
          </div>
          {[['Product', 'Network'], ['Status', 'Legal'], ['Privacy']].map((group, i) => (
            <div key={i} className="flex flex-col gap-2">
              {group.map((item) => (
                <a key={item} href="#" className="text-xs tracking-wide uppercase font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">{item}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
