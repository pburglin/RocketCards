import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { Gamepad2, User, Settings, Clock, Shuffle } from 'lucide-react'

export default function PlayLobbyPage() {
  const navigate = useNavigate()
  const { decks, selectedDeck, setSelectedDeck, startMatch } = useGameStore()
  const [opponent, setOpponent] = useState<'ai' | 'pvp'>('ai')
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [timedMatch, setTimedMatch] = useState(true)
  const [mulliganEnabled, setMulliganEnabled] = useState(true)
  const [seed, setSeed] = useState('')
  const [errors, setErrors] = useState<{deck?: string}>({})
  
  useEffect(() => {
    if (decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decks[0])
    }
  }, [decks, selectedDeck, setSelectedDeck])
  
  const handleStartMatch = () => {
    if (!selectedDeck) {
      setErrors({ deck: 'Please select a deck' })
      return
    }
    
    startMatch({
      deck: selectedDeck,
      opponentType: opponent,
      aiDifficulty,
      timedMatch,
      mulliganEnabled,
      seed: seed || undefined
    })
    
    navigate('/game')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
                  {deck.name} ({deck.collection.name} - {deck.cards.length}/30)
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
                      <p className="text-sm text-text-secondary">60 seconds per turn</p>
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
            onClick={() => navigate('/deck-builder')}
          >
            Back to Deck Builder
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
    </div>
  )
}
