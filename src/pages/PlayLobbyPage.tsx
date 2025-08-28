import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Label } from '../components/ui/Label'
import { useGameStore } from '../store/gameStore'
import { Gamepad2, User, Settings, Clock, Shuffle, Users } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'

export default function PlayLobbyPage() {
  const navigate = useNavigate()
  const { decks, selectedDeck, setSelectedDeck, startMatch, profile } = useGameStore()
  const [opponent, setOpponent] = useState<'ai' | 'pvp'>('ai')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [timedMatch, setTimedMatch] = useState(true)
  const [mulliganEnabled, setMulliganEnabled] = useState(true)
  const [seed, setSeed] = useState('')
  const [turnInitiative, setTurnInitiative] = useState<'player' | 'random' | 'opponent'>('random')
  const [errors, setErrors] = useState<{deck?: string}>({})
  const [showLoading, setShowLoading] = useState(false)
  
  useEffect(() => {
    // If user somehow gets here without profile or deck, redirect to play flow
    if (!profile || decks.length === 0) {
      navigate('/play-flow')
      return
    }
    
    if (decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decks[0])
    }
  }, [decks, selectedDeck, setSelectedDeck, navigate, profile])
  
  const handleStartMatch = () => {
    // Reset errors
    setErrors({})
    
    if (!selectedDeck) {
      setErrors({ deck: 'Please select a deck' })
      return
    }
    
    // Show loading animation
    setShowLoading(true);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      // Ensure the deck has the proper collection reference
      const deckToStart = {
        ...selectedDeck,
        collection: selectedDeck.collection || decks.find(d => d.name === selectedDeck.name)?.collection
      };
      
      startMatch({
        deck: deckToStart,
        opponentType: opponent,
        aiDifficulty,
        timedMatch,
        mulliganEnabled,
        seed: seed || undefined,
        turnInitiative
      })
      
      setShowLoading(false);
      navigate('/game')
    }, 2000);
  }

  // Don't render the lobby content if there's no profile
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <p className="text-text-secondary">Redirecting to profile setup...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Progress Indicator */}
      <SetupProgressIndicator
        currentStep="play"
        hasProfile={!!profile}
        hasDeck={decks.length > 0}
      />
      
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mr-4">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Play Lobby</h1>
      </div>
      
      <Card className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Start a New Match</h2>
          
          <div className="mb-6">
            <Label className="mb-2 block">Select Deck</Label>
            <select
              value={selectedDeck?.name || ''}
              onChange={(e) => {
                const deck = decks.find(d => d.name === e.target.value)
                if (deck) setSelectedDeck(deck)
              }}
              className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {decks.map(deck => (
                <option key={deck.name} value={deck.name}>
                  {deck.name} ({(typeof deck.collection === 'string' ? deck.collection : deck.collection?.name) || 'Unknown Collection'} - {deck.cards.length}/30)
                </option>
              ))}
            </select>
            {errors.deck && <p className="mt-2 text-sm text-error">{errors.deck}</p>}
          </div>
          
          <div className="mb-6">
            <Label className="mb-2 block">Opponent</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`p-4 border ${
                  opponent === 'ai' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setOpponent('ai')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-surface rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Opponent</h3>
                    <p className="text-sm text-text-secondary">Play against an AI with adjustable difficulty</p>
                  </div>
                </div>
              </Card>
              
              <Card 
                className={`p-4 border ${
                  opponent === 'pvp' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setOpponent('pvp')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-surface rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Player vs Player</h3>
                    <p className="text-sm text-text-secondary">Coming soon - Challenge real players</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {opponent === 'ai' && (
            <div className="mb-6">
              <Label className="mb-2 block">AI Difficulty</Label>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <Card 
                    key={level}
                    className={`p-4 border ${
                      aiDifficulty === level ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setAiDifficulty(level as any)}
                  >
                    <h3 className="font-bold capitalize">{level}</h3>
                    <p className="text-sm text-text-secondary">
                      {level === 'easy' && 'Predictable plays, limited strategy'}
                      {level === 'medium' && 'Balanced AI with strategic depth'}
                      {level === 'hard' && 'Advanced tactics and optimal plays'}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Match Settings</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-text-secondary mr-3" />
                    <div>
                      <p className="font-medium">Timed Match</p>
                      <p className="text-sm text-text-secondary">10 seconds per turn</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={timedMatch}
                    onChange={(e) => setTimedMatch(e.target.checked)}
                    className="toggle toggle-primary"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                  <div className="flex items-center">
                    <Shuffle className="w-5 h-5 text-text-secondary mr-3" />
                    <div>
                      <p className="font-medium">Mulligan</p>
                      <p className="text-sm text-text-secondary">First turn only</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mulliganEnabled}
                    onChange={(e) => setMulliganEnabled(e.target.checked)}
                    className="toggle toggle-primary"
                  />
                </div>
                
                <div className="p-4 bg-surface-light rounded-lg">
                  <Label className="mb-2 block">Turn Initiative</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        turnInitiative === 'player'
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text'
                      }`}
                      onClick={() => setTurnInitiative('player')}
                    >
                      Player
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        turnInitiative === 'random'
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text'
                      }`}
                      onClick={() => setTurnInitiative('random')}
                    >
                      Random
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        turnInitiative === 'opponent'
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text'
                      }`}
                      onClick={() => setTurnInitiative('opponent')}
                    >
                      Opponent
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {turnInitiative === 'player' && 'Player always starts first each turn'}
                    {turnInitiative === 'random' && 'Randomly determine who starts each turn'}
                    {turnInitiative === 'opponent' && 'Opponent always starts first each turn'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block">Seed (Optional)</Label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Custom seed for deterministic gameplay"
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-2 text-sm text-text-secondary">
                Leave empty for random seed
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/play-setup')}
          >
            Back to Setup
          </Button>
          <Button
            onClick={handleStartMatch}
            disabled={!selectedDeck}
            className="px-8 py-3"
          >
            Start Match
          </Button>
        </div>
      </Card>
      
      {/* Loading Animation Modal */}
      {showLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="text-center animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75"></div>
              <div className="absolute inset-2 rounded-full border-4 border-secondary animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-accent animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold mb-2 animate-pulse">Preparing Match</h2>
            <p className="text-text-secondary text-lg">Setting up your battlefield...</p>
            <div className="mt-6 w-64 h-2 bg-surface rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
