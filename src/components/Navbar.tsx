import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Home, BookOpen, Layout, Gamepad2, User, Settings, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/deck-builder', icon: Layout, label: 'Deck Builder' },
  { path: '/play-flow', icon: Gamepad2, label: 'Play' },
  { path: '/collections', icon: BookOpen, label: 'Collections' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const location = useLocation()
  
  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  
  // Set mounted state for fade-in animations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden'
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:animate-pulse-slow" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold text-gradient">RocketCards</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-text-secondary hover:text-text hover:bg-surface-light'
                } ${isMounted ? 'animate-fade-in-up' : ''}`}
                style={{
                  animationDelay: isMounted ? `${index * 0.1}s` : '0s',
                  animationFillMode: 'both'
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            to="/help"
            className="p-2 rounded-full bg-surface-light hover:bg-surface transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-text-secondary" />
          </Link>
          <button
            className="md:hidden p-2 rounded-lg bg-surface-light hover:bg-surface transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-surface border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-text-secondary hover:text-text hover:bg-surface-light'
                  } ${isMounted ? 'animate-fade-in-up' : ''}`}
                  style={{
                    animationDelay: isMounted ? `${index * 0.1}s` : '0s',
                    animationFillMode: 'both'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
