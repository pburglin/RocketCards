import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LayoutGrid, User, Gamepad2, AlertCircle } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'

export default function PlaySetupPage() {
  const navigate = useNavigate()
  const { decks, profile, selectedDeck, setSelectedDeck } = useGameStore()
  const [currentStep, setCurrentStep] = useState<'deck' | 'profile'>('deck')
  const [errors, setErrors] = useState<{deck?: string, profile?: string}>({})

  useEffect(() => {
    // If a deck is already selected, move to profile step
    if (selectedDeck) {
      setCurrentStep('profile')
    }
  }, [selectedDeck])

  const handleSelectDeck = (deck: any) => {
    setSelectedDeck(deck)
    setErrors({})
    setCurrentStep('profile')
  }

  const handleStartGame = () => {
    if (!selectedDeck) {
      setErrors({ deck: 'Please select a deck' })
      return
    }
    
    if (!profile) {
      setErrors({ profile: 'Please set up your profile' })
      return
    }
    
    navigate('/play')
  }

  const handleBackToDeck = () => {
    setCurrentStep('deck')
  }

  const handleBuildDeck = () => {
    navigate('/deck-builder')
  }

  if (decks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Indicator */}
        <SetupProgressIndicator
          currentStep="deck"
          hasProfile={!!profile}
          hasDeck={false}
        />
        
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mr-4">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">No Decks Found</h1>
        </div>
        
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Build Your First Deck</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            You need to create a deck of cards before you can play the game.
            Visit the Deck Builder to create your first 30-card deck.
          </p>
          <Button onClick={handleBuildDeck} className="px-8 py-3">
            <LayoutGrid className="w-5 h-5 mr-2" />
            Go to Deck Builder
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Indicator */}
      <SetupProgressIndicator
        currentStep={currentStep}
        hasProfile={!!profile}
        hasDeck={decks.length > 0}
      />
      
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mr-4">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Game Setup</h1>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${currentStep === 'deck' ? 'text-primary' : 'text-text-secondary'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            currentStep === 'deck' ? 'bg-primary text-white' : 'bg-surface-light'
          }`}>
            1
          </div>
          <span className="font-medium">Select Deck</span>
        </div>
        
        <div className="flex-1 h-1 bg-surface-light mx-4" />
        
        <div className={`flex items-center ${currentStep === 'profile' ? 'text-primary' : 'text-text-secondary'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            currentStep === 'profile' ? 'bg-primary text-white' : 'bg-surface-light'
          }`}>
            2
          </div>
          <span className="font-medium">Player Profile</span>
        </div>
      </div>
      
      {currentStep === 'deck' ? (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Select Your Deck</h2>
          
          {errors.deck && (
            <div className="mb-6 p-4 bg-error/20 border border-error rounded-lg">
              <p className="text-error">{errors.deck}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {decks.map(deck => (
              <Card
                key={deck.name}
                className={`p-4 cursor-pointer border-2 transition-all ${
                  selectedDeck?.name === deck.name 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSelectDeck(deck)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">{deck.name}</h3>
                  {selectedDeck?.name === deck.name && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  {(typeof deck.collection === 'string' ? deck.collection : deck.collection?.name) || 'Unknown Collection'}
                </p>
                <div className="flex justify-between text-sm">
                  <span>Cards:</span>
                  <span className="font-medium">{deck.cards.length}/30</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-primary" 
                    style={{ width: `${(deck.cards.length / 30) * 100}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleBuildDeck}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Build New Deck
              </Button>
              <Button 
                onClick={() => selectedDeck && setCurrentStep('profile')}
                disabled={!selectedDeck}
                className="px-8"
              >
                Continue
                <User className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Player Profile</h2>
          
          {errors.profile && (
            <div className="mb-6 p-4 bg-error/20 border border-error rounded-lg">
              <p className="text-error">{errors.profile}</p>
            </div>
          )}
          
          {profile ? (
            <div className="mb-8">
              <div className="bg-surface-light p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{profile.displayName}</h3>
                    <p className="text-text-secondary">
                      Strategy: <span className="capitalize">{profile.strategy}</span> | 
                      Key Stat: <span className="capitalize">{profile.keyStat}</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-sm text-text-secondary">HP</p>
                    <p className="text-2xl font-bold text-primary">{profile.hp}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-lg">
                    <p className="text-sm text-text-secondary">MP</p>
                    <p className="text-2xl font-bold text-secondary">{profile.mp}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-text-secondary text-center mb-6">
                Ready to start your game with this profile? You can update your profile later in settings.
              </p>
            </div>
          ) : (
            <div className="mb-8 text-center py-8">
              <User className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Profile Set Up</h3>
              <p className="text-text-secondary mb-6">
                Create a player profile to customize your stats and gameplay experience.
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBackToDeck}
            >
              Back
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
              >
                {profile ? 'Edit Profile' : 'Create Profile'}
              </Button>
              <Button 
                onClick={handleStartGame}
                disabled={!selectedDeck || !profile}
                className="px-8"
              >
                Start Game
                <Gamepad2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}