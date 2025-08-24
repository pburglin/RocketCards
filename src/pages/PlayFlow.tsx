import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Gamepad2, User, Layout } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function PlayFlow() {
  const navigate = useNavigate()
  const { profile, decks } = useGameStore()
  const hasProfile = !!profile
  const hasDeck = decks.length > 0

  useEffect(() => {
    // Check if user has completed all prerequisites
    if (hasProfile && hasDeck) {
      // All prerequisites met, go to play lobby
      navigate('/play')
    } else if (!hasProfile) {
      // No profile, go to profile setup
      navigate('/profile')
    } else if (hasProfile && !hasDeck) {
      // Has profile but no deck, go to deck builder
      navigate('/deck-builder')
    }
  }, [hasProfile, hasDeck, navigate])

  const getCurrentStep = () => {
    if (!hasProfile) return 'profile'
    if (hasProfile && !hasDeck) return 'deck'
    return 'play'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <SetupProgressIndicator 
        currentStep={getCurrentStep()} 
        hasProfile={hasProfile} 
        hasDeck={hasDeck} 
      />
      
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mr-4">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Getting Started</h1>
      </div>

      <Card className="p-8 text-center">
        <div className="mb-6">
          {getCurrentStep() === 'profile' && (
            <>
              <User className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Create Your Player Profile</h2>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Before you can play, you need to create a player profile to customize your stats and gameplay experience.
              </p>
            </>
          )}
          
          {getCurrentStep() === 'deck' && (
            <>
              <Layout className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Build Your First Deck</h2>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                You need to create a deck of cards before you can play the game. 
                Visit the Deck Builder to create your first 30-card deck.
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={() => {
              if (getCurrentStep() === 'profile') {
                navigate('/profile')
              } else if (getCurrentStep() === 'deck') {
                navigate('/deck-builder')
              }
            }}
            className="px-8 py-3"
          >
            Continue to {getCurrentStep() === 'profile' ? 'Profile Setup' : 'Deck Builder'}
          </Button>
        </div>
      </Card>
    </div>
  )
}