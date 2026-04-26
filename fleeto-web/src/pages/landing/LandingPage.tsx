import { Link } from 'react-router-dom'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9JHY2H7mr4gAL33s6jqTrL2TtUqCvTWlfzox6VRJq8X-zUEnaaMWlzA0aNJLocPBn4nV_x7LkWRL2y0dfrpmUK1N3TwYbusUjkz5YNqIoX4aAYhGRbYig0_xSNMYfPvTzT0Oa6I-zw0RqKu9VC_pSH_BgOSFpGaGnJAbRZoE6X08z2t0H-uLykyFLyk4U8FHR0f-9RK97eRHUdARe7EE2zKaFtS_PEeKI4iikqd3PXP7selXMq8BMZJfnITh1Dn9yDJTr0i4s2Fw4'
const DASHBOARD_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5CXqSNnAVOuQ3Be3s5iTh3Tx1PTiJj7HdmpSxWpCbohMzJ67yMQi-ZM2feCGloBxaDd8xxIriTBboMOlZzQLPkkclqqUWXMRi7yJ81D_5MMMnB6z2FlW2YZIyvq4RmvCasKq8wkSTddZAP4WzgIx1Q6KIyF0MtN9S6abBCy6Zto8YlCIckPuRgxfj78uipPZy6fcbia52gT0kKNnrGieUMzvnUx9J2MrdUMmyfb-q7ZMJtXjdK3Uw2lnWVIthkLWZ6EaFFzGcLreK'
const MAP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLfdH2qc_M-PEUIyRXlfLbujN3VwjsEUYgTHvhy-Th1-85FGUDHlnPZBlwaTd5rU5aUONml2XqcdBsD3E-0RXvUWRF5eAOiV-nfSUK4inhkGRTv6PBFUEmZcxRiTbqN1ZgASn9S7WwCPjLESOCefOdIXPsp9K7mtCSiM0XfDvkFKZuvZT-6V2REHwBOQ557NiQGMLC5kfHrbnTLQL12ocEggkTltex7Yij0su3M5XOkYdAVG3d9LT1KpSiVbrhUeG'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">

      {/* TopAppBar */}
      <header className="bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-zinc-100 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-zinc-900">Fleeto</div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium tracking-tight text-zinc-900 border-b-2 border-zinc-900 pb-1 transition-transform active:scale-[0.98]">Solutions</a>
            <Link to="/fleet-app" className="text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-colors duration-200">Fleet App</Link>
            <Link to="/rider-app" className="text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-colors duration-200">Rider App</Link>
            <Link to="/pricing" className="text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-colors duration-200">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-colors">Login</Link>
            <Link to="/signup" className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-medium tracking-tight hover:opacity-90 active:scale-[0.98] transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-xxl px-margin max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div className="space-y-md">
            <span className="inline-block text-label-caps font-semibold text-secondary-fixed-dim bg-secondary-container px-3 py-1 rounded-full uppercase tracking-[0.05em]">TRANSFORMING LOGISTICS</span>
            <h1 className="text-h1 font-black text-on-background leading-[1.1] tracking-tighter">Lagos Logistics, Simplified. The infrastructure for your delivery business.</h1>
            <p className="text-body-lg text-secondary max-w-lg">From managing a fleet to starting your first delivery service, Fleeto gives you the tools to move Lagos forward.</p>
            <div className="flex flex-wrap gap-md pt-sm">
              <Link to="/signup" className="bg-primary text-on-primary px-8 py-4 rounded-xl text-body-md font-semibold hover:opacity-90 transition-all shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">Get Started</Link>
              <button className="bg-zinc-100 text-primary px-8 py-4 rounded-xl text-body-md font-semibold hover:bg-zinc-200 transition-all">See how it works</button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[32px] overflow-hidden shadow-xl border border-zinc-100">
              <img className="w-full h-full object-cover" src={HERO_IMG} alt="Dispatch riders navigating Lagos traffic" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg border border-zinc-100 hidden md:block">
              <div className="text-h2 font-black text-primary">12.4k</div>
              <div className="text-label-caps font-semibold uppercase tracking-[0.05em] text-secondary">Deliveries Today</div>
            </div>
          </div>
        </div>
      </main>

      {/* 3 Surfaces — Bento Grid */}
      <section className="bg-zinc-50 py-xxl border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center mb-xxl">
            <h2 className="text-h2 font-black text-on-background tracking-tight mb-md">One Ecosystem. Three Core Surfaces.</h2>
            <p className="text-body-md text-secondary max-w-xl mx-auto">A unified platform built to handle the chaos of urban logistics without breaking a sweat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

            {/* Control Center */}
            <div className="md:col-span-8 bg-white rounded-[20px] p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-zinc-100 group">
              <div className="flex flex-col h-full">
                <div className="mb-gutter">
                  <span className="material-symbols-outlined text-primary mb-sm block">dashboard</span>
                  <h3 className="text-h3 font-semibold text-on-background mb-sm">The Control Center</h3>
                  <p className="text-body-sm text-secondary">Real-time oversight for operators. Dispatch, monitor, and optimize your entire fleet from a single high-performance dashboard.</p>
                </div>
                <div className="mt-auto overflow-hidden rounded-xl border border-zinc-100 shadow-sm">
                  <img className="w-full grayscale group-hover:grayscale-0 transition-all duration-500" src={DASHBOARD_IMG} alt="Logistics dashboard interface" />
                </div>
              </div>
            </div>

            {/* Rider App */}
            <div className="md:col-span-4 bg-zinc-900 rounded-[20px] p-xl text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-zinc-400 mb-sm block">directions_bike</span>
                <h3 className="text-h3 font-semibold text-zinc-50 mb-sm">Built for the Road</h3>
                <p className="text-body-sm text-zinc-400">Lightweight, offline-first, and battery-efficient. The Rider App is designed for the harsh realities of Lagos streets.</p>
              </div>
              <div className="mt-xl relative z-10">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-semibold text-zinc-300">OFFLINE MODE</span>
                  <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-semibold text-zinc-300">GPS OPTIMIZED</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-20 transform rotate-12 pointer-events-none">
                <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 100" }}>smartphone</span>
              </div>
            </div>

            {/* Tracking Page */}
            <div className="md:col-span-12 bg-white rounded-[20px] p-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col md:flex-row gap-xl items-center">
              <div className="md:w-1/2">
                <span className="material-symbols-outlined text-primary mb-sm fill block">location_on</span>
                <h3 className="text-h3 font-semibold text-on-background mb-sm">Trust in Every Mile</h3>
                <p className="text-body-md text-secondary mb-md">Customer tracking pages that don't just show a map, but provide a transparent journey. Real-time ETAs and direct rider communication built-in.</p>
                <ul className="space-y-sm">
                  <li className="flex items-center gap-sm text-body-sm text-primary">
                    <span className="material-symbols-outlined text-[18px] fill">check_circle</span> Live location sharing
                  </li>
                  <li className="flex items-center gap-sm text-body-sm text-primary">
                    <span className="material-symbols-outlined text-[18px] fill">check_circle</span> Automated WhatsApp updates
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full h-64 bg-zinc-50 rounded-xl overflow-hidden">
                <img className="w-full h-full object-cover" src={MAP_IMG} alt="Lagos delivery map route" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entrepreneur Section */}
      <section className="py-xxl px-margin max-w-7xl mx-auto">
        <div className="bg-primary text-on-primary rounded-[32px] p-xl md:p-xxl flex flex-col md:flex-row justify-between items-center gap-xl">
          <div className="md:max-w-xl">
            <h2 className="text-h1 font-black text-white mb-md">Start from Scratch.</h2>
            <p className="text-body-lg text-zinc-400 mb-lg">We provide the platform, you provide the drive. Launch your delivery business in 24 hours with our ready-to-deploy logistics stack.</p>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <div className="text-h3 font-black text-white">0 to 1</div>
                <p className="text-body-sm text-zinc-500">Rapid deployment</p>
              </div>
              <div>
                <div className="text-h3 font-black text-white">100%</div>
                <p className="text-body-sm text-zinc-500">Asset visibility</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link to="/signup" className="bg-white text-primary px-10 py-5 rounded-xl text-body-md font-bold hover:bg-zinc-100 transition-all active:scale-95 block">Launch Your Fleet</Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-xxl px-margin border-t border-zinc-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-xl">
          {[
            { stat: '500+', label: 'Fleets Managed' },
            { stat: '2.4M', label: 'Total Parcels' },
            { stat: '15min', label: 'Avg. Pick-up' },
            { stat: '99%', label: 'Delivery Rate' },
          ].map(({ stat, label }) => (
            <div key={label} className="text-center">
              <div className="text-h1 font-black text-primary">{stat}</div>
              <p className="text-label-caps font-semibold uppercase tracking-[0.05em] text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-50 py-xxl text-center px-margin border-t border-zinc-200">
        <h2 className="text-h1 font-black text-on-background tracking-tighter mb-md">Ready to move Lagos?</h2>
        <p className="text-body-lg text-secondary max-w-2xl mx-auto mb-xl">Join hundreds of businesses scaling their logistics operations with Fleeto's infrastructure.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-md">
          <Link to="/signup" className="bg-primary text-on-primary px-10 py-5 rounded-xl text-body-md font-bold hover:opacity-90 transition-all">Create Account</Link>
          <a href="mailto:hello@fleeto.ng" className="bg-white border border-zinc-200 text-primary px-10 py-5 rounded-xl text-body-md font-bold hover:bg-zinc-50 transition-all">Contact Sales</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-zinc-900 text-lg">Fleeto</span>
            <p className="text-xs uppercase tracking-widest text-zinc-600">© 2026 Fleeto Logistics. Moving Lagos forward.</p>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all opacity-90 hover:opacity-100">{item}</a>
            ))}
            <Link to="/login" className="text-xs uppercase tracking-widest text-zinc-900 transition-all opacity-90 hover:opacity-100">Fleet Portal</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
