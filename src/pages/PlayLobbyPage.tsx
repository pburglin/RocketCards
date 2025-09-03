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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [startingHp, setStartingHp] = useState(28)
  const [maxHp, setMaxHp] = useState(30)
  const [startingMp, setStartingMp] = useState(6)
  const [maxMp, setMaxMp] = useState(10)
  const [startingHand, setStartingHand] = useState(3)
  const [maxHand, setMaxHand] = useState(4)
  const [errors, setErrors] = useState<{deck?: string}>({})
  const [showLoading, setShowLoading] = useState(false)
  
  useEffect(() => {
    // If user somehow gets here without profile or deck, redirect to play flow
    if (!profile || decks.length === 0) {
      // Use setTimeout to defer the navigation to the next tick
      // This prevents the "Cannot update a component while rendering" warning
      setTimeout(() => {
        navigate('/play-flow')
      }, 0)
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
        turnInitiative,
        startingHp,
        maxHp,
        startingMp,
        maxMp,
        startingHand,
        maxHand
      })
      
      setShowLoading(false);
      // Use setTimeout to defer the navigation to the next tick
      // This prevents the "Cannot update a component while rendering" warning
      setTimeout(() => {
        navigate('/game')
      }, 0)
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
    <div className="container mx-auto px-4 py-6">
      {/* Progress Indicator */}
      <SetupProgressIndicator
        currentStep="play"
        hasProfile={!!profile}
        hasDeck={decks.length > 0}
      />
      
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Play Lobby</h1>
      </div>
      
      <Card className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Start a New Match</h2>
          
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
            <div className="grid grid-cols-1 gap-4">
              <Card
                className={`p-4 border ${
                  opponent === 'ai' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setOpponent('ai')}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-surface rounded-full flex items-center justify-center mr-4 flex-shrink-0">
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
                } opacity-50 cursor-not-allowed`}
                onClick={() => {}}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-surface rounded-full flex items-center justify-center mr-4 flex-shrink-0">
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
              <div className="grid grid-cols-1 gap-4">
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
          
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Match Settings</Label>
              <div className="grid grid-cols-1 gap-4">
                {/* Turn Initiative */}
                <div className="p-4 bg-surface-light rounded-lg">
                  <Label className="mb-2 block">Turn Initiative</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className={`px-2 py-3 text-xs sm:text-sm rounded transition-colors ${
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
                      className={`px-2 py-3 text-xs sm:text-sm rounded transition-colors ${
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
                      className={`px-2 py-3 text-xs sm:text-sm rounded transition-colors ${
                        turnInitiative === 'opponent'
                          ? 'bg-primary text-white'
                          : 'bg-surface border border-border text-text'
                      }`}
                      onClick={() => setTurnInitiative('opponent')}
                    >
                      Opponent
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    {turnInitiative === 'player' && 'Player starts first'}
                    {turnInitiative === 'random' && 'Random start'}
                    {turnInitiative === 'opponent' && 'Opponent starts first'}
                  </p>
                </div>
                
                {/* Seed */}
                <div className="p-4 bg-surface-light rounded-lg">
                  <Label className="mb-2 block">Seed (Optional)</Label>
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Custom seed"
                    className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Leave empty for random
                  </p>
                </div>
                
                {/* Timed Match */}
                <label
                  className="flex items-center justify-between p-4 bg-surface-light rounded-lg cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-text-secondary mr-2" />
                    <div>
                      <p className="font-medium text-sm">Timed Match</p>
                      <p className="text-xs text-text-secondary">10s per turn</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-9 h-5 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={timedMatch}
                      onChange={(e) => setTimedMatch(e.target.checked)}
                      className="toggle toggle-primary toggle-sm absolute opacity-0 w-0 h-0"
                    />
                    <div className="toggle-slider rounded-full"></div>
                  </div>
                </label>
                
                {/* Mulligan */}
                <label
                  className="flex items-center justify-between p-4 bg-surface-light rounded-lg cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center">
                    <Shuffle className="w-4 h-4 text-text-secondary mr-2" />
                    <div>
                      <p className="font-medium text-sm">Mulligan</p>
                      <p className="text-xs text-text-secondary">First turn</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-9 h-5 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={mulliganEnabled}
                      onChange={(e) => setMulliganEnabled(e.target.checked)}
                      className="toggle toggle-primary toggle-sm absolute opacity-0 w-0 h-0"
                    />
                    <div className="toggle-slider rounded-full"></div>
                  </div>
                </label>
              </div>
              
              {/* Advanced Settings */}
              <div className="border-t border-border pt-6">
                <button
                  type="button"
                  className="flex items-center text-text-secondary hover:text-text transition-colors"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="font-medium">Advanced Game Settings</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAdvancedSettings && (
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Starting HP</Label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={startingHp}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 28;
                          const newStartingHp = Math.max(1, Math.min(100, value));
                          setStartingHp(newStartingHp);
                          // Auto-adjust max HP if starting HP is higher
                          if (newStartingHp > maxHp) {
                            setMaxHp(newStartingHp);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 28</p>
                    </div>
                    
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Max HP</Label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxHp}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 30;
                          const newMaxHp = Math.max(1, Math.min(100, value));
                          setMaxHp(newMaxHp);
                          // Ensure max HP is not less than starting HP
                          if (newMaxHp < startingHp) {
                            setStartingHp(newMaxHp);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 30</p>
                    </div>
                    
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Starting MP</Label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={startingMp}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 6;
                          const newStartingMp = Math.max(1, Math.min(20, value));
                          setStartingMp(newStartingMp);
                          // Auto-adjust max MP if starting MP is higher
                          if (newStartingMp > maxMp) {
                            setMaxMp(newStartingMp);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 6</p>
                    </div>
                    
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Max MP</Label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={maxMp}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 10;
                          const newMaxMp = Math.max(1, Math.min(20, value));
                          setMaxMp(newMaxMp);
                          // Ensure max MP is not less than starting MP
                          if (newMaxMp < startingMp) {
                            setStartingMp(newMaxMp);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 10</p>
                    </div>
                    
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Starting Hand</Label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={startingHand}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 3;
                          const newStartingHand = Math.max(1, Math.min(8, value));
                          setStartingHand(newStartingHand);
                          // Auto-adjust max hand if starting hand is higher
                          if (newStartingHand > maxHand) {
                            setMaxHand(newStartingHand);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 3 cards</p>
                    </div>
                    
                    <div className="p-4 bg-surface-light rounded-lg">
                      <Label className="mb-2 block">Max Cards in Hand</Label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={maxHand}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 4;
                          const newMaxHand = Math.max(1, Math.min(8, value));
                          setMaxHand(newMaxHand);
                          // Ensure max hand is not less than starting hand
                          if (newMaxHand < startingHand) {
                            setStartingHand(newMaxHand);
                          }
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded text-text text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <p className="mt-1 text-xs text-text-secondary">Default: 4 cards</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/play-setup')}
            className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
          >
            Back to Setup
          </Button>
          <Button
            onClick={handleStartMatch}
            disabled={!selectedDeck}
            className="px-6 py-2 text-sm sm:px-8 sm:py-3 sm:text-base"
          >
            Start Match
          </Button>
        </div>
      </Card>
      
      {/* Loading Animation Modal */}
      {showLoading && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto scrollable-touch"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLoading(false)
            }
          }}
        >
          <div className="text-center animate-fade-in-up my-8 md:my-0">
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
