import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  const navItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/incois', label: 'INCOIS', icon: '🌐' },
    { to: '/social', label: 'Social', icon: '🔔' },
    { to: '/local-ngos', label: 'Community', icon: '👥' },
  ]

  const quickItems = [
    { label: 'Safety Tips', icon: '🛟', to: '/precautions' },
    { label: 'Weather', icon: '⛅', to: '/weather' }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src="/meow.png"
        alt="Background Meow"
        className="absolute inset-0 -z-20 w-full h-full object-cover"
      />
      {/* Overlay to dim image */}
      <div className="absolute inset-0 -z-10 bg-primary-navy/20" />

      {/* Top bar with brand and icon nav */}
      <div className="max-w-7xl mx-auto px-5 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">🌊</div>
            <span className="text-2xl font-extrabold tracking-tight">oceanEye</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-white/90">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero content */}
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 gap-6 min-h-[70vh] place-content-center">
          <div className="text-left text-white max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-sm">
              OceanEye: Your<br />Coastal Guardian
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90">
              real-time monitoring, emergency alerts, and community support for a safer ocean experience.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white text-primary-navy shadow-xl shadow-black/20 hover:!bg-white/90 px-8 py-4"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      {/* Bottom quick features */}
      <div className="relative">
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-items-end w-fit ml-auto">
            {quickItems.map((q) => (
              <div
                key={q.label}
                role="button"
                tabIndex={0}
                aria-label={q.label}
                onClick={() => navigate(q.to)}
                className="justify-self-end flex items-center justify-center gap-3 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur p-4 shadow-lg cursor-pointer transform transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <span className="text-2xl">{q.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{q.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
