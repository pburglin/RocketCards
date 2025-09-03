import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Gamepad2, User, Layout } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function PlayFlow() {
  const navigate = useNavigate()
  const { profile, decks, collections, selectedCollection, setSelectedCollection, createBasicDeck, saveDeck, basicDeckCreated, setBasicDeckCreated } = useGameStore()
  const hasProfile = !!profile
  const hasDeck = decks.length > 0
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    console.log('PlayFlow useEffect triggered', { hasProfile, hasDeck, basicDeckCreated, collectionsLength: collections.length, selectedCollection });
    
    // Check if user has completed all prerequisites
    if (hasProfile && hasDeck && !basicDeckCreated) {
      // All prerequisites met, go to play lobby
      console.log('Navigating to /play - has profile and deck');
      // Use setTimeout to defer the navigation to the next tick
      // This prevents the "Cannot update a component while rendering" warning
      setTimeout(() => {
        navigate('/play')
      }, 0)
    } else if (!hasProfile) {
      // No profile, go to profile setup
      console.log('Navigating to /profile - no profile');
      // Use setTimeout to defer the navigation to the next tick
      // This prevents the "Cannot update a component while rendering" warning
      setTimeout(() => {
        navigate('/profile')
      }, 0)
    } else if (hasProfile && !hasDeck && !basicDeckCreated) {
      // Has profile but no deck, automatically create a basic deck
      console.log('Creating basic deck - has profile but no deck');
      if (collections.length > 0 && !selectedCollection) {
        console.log('Setting selected collection');
        setSelectedCollection(collections[0])
      }
      
      if (selectedCollection) {
        console.log('Creating and saving basic deck');
        createBasicDeck()
        saveDeck(`${selectedCollection.name} Basic Deck`)
        setBasicDeckCreated(true)
        // After a short delay, navigate to play
        // Start progress bar animation
        setProgress(0);
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 20; // Update every 100ms for 5 seconds = 100% / 50 updates = 2% per update
          });
        }, 100);
        
        setTimeout(() => {
          console.log('Timeout completed, navigating to /play');
          setBasicDeckCreated(false);
          setProgress(0);
          // Use setTimeout to defer the navigation to the next tick
          // This prevents the "Cannot update a component while rendering" warning
          setTimeout(() => {
            navigate('/play');
          }, 0)
        }, 5000)
      }
    } else if (basicDeckCreated) {
      console.log('Basic deck created, showing notification');
      // Keep showing the notification and don't navigate until timeout
    }
  }, [hasProfile, hasDeck, navigate, collections, selectedCollection, setSelectedCollection, createBasicDeck, saveDeck, setBasicDeckCreated, basicDeckCreated])

  // Reset the basic deck created flag when component unmounts
  useEffect(() => {
    return () => {
      if (basicDeckCreated) {
        setBasicDeckCreated(false)
      }
    }
  }, [basicDeckCreated, setBasicDeckCreated])

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

      {basicDeckCreated && (
        <div className="mb-6 p-4 bg-info/20 border border-info rounded-lg">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-info rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-info font-medium">Basic Deck Created!</p>
          </div>
          <p className="text-info/80 text-sm mb-4">A basic deck has been automatically created for you. Redirecting to play...</p>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="h-2 rounded-full bg-info transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

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
          
          {getCurrentStep() === 'deck' && !basicDeckCreated && (
            <>
              <Layout className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Build Your First Deck</h2>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                You need to create a deck of cards before you can play the game.
                Visit the Deck Builder to create your first 30-card deck.
              </p>
            </>
          )}
          
          {getCurrentStep() === 'deck' && basicDeckCreated && (
            <>
              <Layout className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Creating Basic Deck</h2>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                Creating a basic deck with common cards for you to get started...
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => {
              if (getCurrentStep() === 'profile') {
                // Use setTimeout to defer the navigation to the next tick
                // This prevents the "Cannot update a component while rendering" warning
                setTimeout(() => {
                  navigate('/profile')
                }, 0)
              } else if (getCurrentStep() === 'deck' && !basicDeckCreated) {
                // Use setTimeout to defer the navigation to the next tick
                // This prevents the "Cannot update a component while rendering" warning
                setTimeout(() => {
                  navigate('/deck-builder')
                }, 0)
              }
            }}
            className="px-8 py-3"
            disabled={basicDeckCreated}
          >
            {basicDeckCreated ? 'Creating Deck...' : `Continue to ${getCurrentStep() === 'profile' ? 'Profile Setup' : 'Deck Builder'}`}
          </Button>
        </div>
      </Card>
    </div>
  )
}