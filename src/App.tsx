import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'
import { I18nProvider } from './providers/I18nProvider'
import { NotificationProvider } from './providers/NotificationProvider'
import { LocationProvider } from './providers/LocationProvider'
import { RoleGuard } from './app/guards/RoleGuard'
import { ReportsProvider } from './providers/ReportsProvider'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { motion } from 'framer-motion'
import { ErrorBoundary } from './components/ErrorBoundary'

import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import SignupPage from './pages/Auth/SignupPage'
import PrecautionsPage from './pages/Info/PrecautionsPage'
import LocalNGOsPage from './pages/Info/LocalNGOsPage'
import EvacuationSupportPage from './pages/Info/EvacuationSupportPage'
import INCOISPage from './pages/Info/INCOISPage'
import SocialMediaPage from './pages/Info/SocialMediaPage'
import WeatherPage from './pages/Info/WeatherPage'
import CitizenDashboard from './pages/Dashboard/Citizen/CitizenDashboard'
import OfficialDashboard from './pages/Dashboard/Official/OfficialDashboard'
import AnalystDashboard from './pages/Dashboard/Analyst/AnalystDashboard'

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
)

function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  return (
    <ThemeProvider>
      <I18nProvider>
        <NotificationProvider>
          <LocationProvider>
            <ReportsProvider>
              <div className="min-h-screen relative z-[1] on-ocean">
{/* Global background image */}
<img src="/meow.png" alt="Background Meow" className="absolute inset-0 -z-20 w-full h-full object-cover" />
<div className="absolute inset-0 -z-10 bg-primary-navy/20" />
              <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
              >
                <div
                  className="absolute -top-32 -left-32 h-[60vmax] w-[60vmax] rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(0, 122, 255, 0.12), transparent)' }}
                />
                <div
                  className="absolute -bottom-32 -right-32 h-[50vmax] w-[50vmax] rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(0, 200, 180, 0.10), transparent)' }}
                />
              </div>
              {!isLanding && <Navbar />}
              <main className="min-h-screen">
                <ErrorBoundary>
                  <Routes location={location} key={location.pathname}>
                  {/* Public routes */}
                  <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                  <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                  <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
                  <Route path="/precautions" element={<PageTransition><PrecautionsPage /></PageTransition>} />
                  <Route path="/local-ngos" element={<PageTransition><LocalNGOsPage /></PageTransition>} />
                  <Route path="/evacuation-support" element={<PageTransition><EvacuationSupportPage /></PageTransition>} />
                  <Route path="/incois" element={<PageTransition><INCOISPage /></PageTransition>} />
                  <Route path="/social" element={<PageTransition><SocialMediaPage /></PageTransition>} />
                  <Route path="/weather" element={<PageTransition><WeatherPage /></PageTransition>} />
                  
                  {/* Protected routes with role guards */}
                  <Route 
                    path="/dashboard/citizen" 
                    element={
                      <RoleGuard allowedRoles={['citizen']}>
                        <PageTransition><CitizenDashboard /></PageTransition>
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/dashboard/official" 
                    element={
                      <RoleGuard allowedRoles={['official']}>
                        <PageTransition><OfficialDashboard /></PageTransition>
                      </RoleGuard>
                    } 
                  />
                  <Route 
                    path="/dashboard/analyst" 
                    element={
                      <RoleGuard allowedRoles={['analyst']}>
                        <PageTransition><AnalystDashboard /></PageTransition>
                      </RoleGuard>
                    } 
                  />
                  
                  {/* Fallback route */}
                  <Route path="*" element={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-primary-navy mb-4">404</h1>
                        <p className="text-gray-600 mb-8">Page not found</p>
                        <a href="/" className="btn-primary">Go Home</a>
                      </div>
                    </div>
                  } />
                </Routes>
                </ErrorBoundary>
            </main>
            {!isLanding && <Footer />}
          </div>
            </ReportsProvider>
          </LocationProvider>
        </NotificationProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
