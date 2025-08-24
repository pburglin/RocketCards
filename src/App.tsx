import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { initializeGame } from './lib/gameEngine'
import LandingPage from './pages/LandingPage'
import CollectionsPage from './pages/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import DeckBuilderPage from './pages/DeckBuilderPage'
import PlayLobbyPage from './pages/PlayLobbyPage'
import PlaySetupPage from './pages/PlaySetupPage'
import PlayFlow from './pages/PlayFlow'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import SettingsPage from './pages/SettingsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import DisclaimerPage from './pages/DisclaimerPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const { loadGameState, initializeCollections } = useGameStore()

  useEffect(() => {
    // Initialize game state on app load
    initializeGame()
    initializeCollections()
    // loadGameState() - no longer needed, persistence is handled automatically
  }, [])

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
                  <Route path="/profile" element={<ProfileSetupPage />} />
                  <Route path="/deck-builder" element={<DeckBuilderPage />} />
                  <Route path="/play" element={<PlayLobbyPage />} />
                  <Route path="/play-flow" element={<PlayFlow />} />
                  <Route path="/play-setup" element={<PlaySetupPage />} />
                  <Route path="/game" element={<GamePage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/cookies" element={<CookiePolicyPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export default App
