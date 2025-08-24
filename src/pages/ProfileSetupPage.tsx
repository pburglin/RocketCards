import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Label } from '../components/ui/Label'
import { calculatePlayerStats } from '../lib/gameEngine'
import { Shield, Sword, Sparkles, Flame, Star, Coins } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { profile, saveProfile, collections } = useGameStore()
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [strategy, setStrategy] = useState<'aggressive' | 'balanced' | 'defensive'>(profile?.strategy || 'balanced')
  const [keyStat, setKeyStat] = useState<'strength' | 'intelligence' | 'charisma'>(profile?.keyStat || 'intelligence')
  const [errors, setErrors] = useState<{displayName?: string}>({})
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens'>('profile')
  
  const stats = calculatePlayerStats(strategy, keyStat)
  
  // Calculate MP regen based on strategy
  const mpRegen = strategy === 'aggressive' ? 4 : strategy === 'balanced' ? 3 : 2
  
  // Get all token-purchasable cards
  const tokenCards = collections.flatMap(collection =>
    collection.cards.filter(card => card.tokenCost)
  )
  
  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName)
      setStrategy(profile.strategy)
      setKeyStat(profile.keyStat)
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: {displayName?: string} = {}
    
    if (displayName.length < 3 || displayName.length > 20) {
      newErrors.displayName = 'Display name must be 3-20 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    saveProfile({
      displayName,
      strategy,
      keyStat,
      hp: stats.hp,
      mp: stats.mp,
      tokens: 0 // Initialize with 0 tokens
    })
    
    // Navigate to deck builder after profile creation
    navigate('/deck-builder')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Progress Indicator */}
      <SetupProgressIndicator
        currentStep="profile"
        hasProfile={false}
        hasDeck={false}
      />
      
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
          <Sword className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Profile {profile ? 'Management' : 'Setup'}</h1>
      </div>
      
      {profile && (
        <div className="mb-6">
          <div className="flex border-b border-border">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center ${
                activeTab === 'tokens'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-secondary hover:text-text'
              }`}
              onClick={() => setActiveTab('tokens')}
            >
              <Coins className="w-4 h-4 mr-2" />
              Token Shop ({profile.tokens || 0} tokens)
            </button>
          </div>
        </div>
      )}
      
      <Card className="p-6">
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="displayName" className="mb-2 block">Display Name</Label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your display name"
              />
              {errors.displayName && (
                <p className="mt-2 text-sm text-error">{errors.displayName}</p>
              )}
            </div>
            
            <div className="mb-6">
              <Label className="mb-2 block">Strategy</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <input
                    type="radio"
                    id="aggressive"
                    name="strategy"
                    value="aggressive"
                    checked={strategy === 'aggressive'}
                    onChange={(e) => e.target.checked && setStrategy('aggressive')}
                    className="hidden"
                  />
                  <label
                    htmlFor="aggressive"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      strategy === 'aggressive'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Flame className="w-6 h-6 text-error mb-2" />
                    <span className="font-medium mb-1">Aggressive</span>
                    <span className="text-sm text-text-secondary">+4 MP, MP Regen: 4</span>
                  </label>
                </div>
                
                <div className="text-center">
                  <input
                    type="radio"
                    id="balanced"
                    name="strategy"
                    value="balanced"
                    checked={strategy === 'balanced'}
                    onChange={(e) => e.target.checked && setStrategy('balanced')}
                    className="hidden"
                  />
                  <label
                    htmlFor="balanced"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      strategy === 'balanced'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Sparkles className="w-6 h-6 text-success mb-2" />
                    <span className="font-medium mb-1">Balanced</span>
                    <span className="text-sm text-text-secondary">+2 HP, +2 MP, MP Regen: 3</span>
                  </label>
                </div>
                
                <div className="text-center">
                  <input
                    type="radio"
                    id="defensive"
                    name="strategy"
                    value="defensive"
                    checked={strategy === 'defensive'}
                    onChange={(e) => e.target.checked && setStrategy('defensive')}
                    className="hidden"
                  />
                  <label
                    htmlFor="defensive"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      strategy === 'defensive'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Shield className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-medium mb-1">Defensive</span>
                    <span className="text-sm text-text-secondary">+4 HP, MP Regen: 2</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <Label className="mb-2 block">Key Stat</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <input
                    type="radio"
                    id="strength"
                    name="keyStat"
                    value="strength"
                    checked={keyStat === 'strength'}
                    onChange={(e) => e.target.checked && setKeyStat('strength')}
                    className="hidden"
                  />
                  <label
                    htmlFor="strength"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      keyStat === 'strength'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium mb-1">Strength</span>
                    <span className="text-sm text-text-secondary">+8 HP, +2 MP</span>
                  </label>
                </div>
                
                <div className="text-center">
                  <input
                    type="radio"
                    id="intelligence"
                    name="keyStat"
                    value="intelligence"
                    checked={keyStat === 'intelligence'}
                    onChange={(e) => e.target.checked && setKeyStat('intelligence')}
                    className="hidden"
                  />
                  <label
                    htmlFor="intelligence"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      keyStat === 'intelligence'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium mb-1">Intelligence</span>
                    <span className="text-sm text-text-secondary">+2 HP, +6 MP</span>
                  </label>
                </div>
                
                <div className="text-center">
                  <input
                    type="radio"
                    id="charisma"
                    name="keyStat"
                    value="charisma"
                    checked={keyStat === 'charisma'}
                    onChange={(e) => e.target.checked && setKeyStat('charisma')}
                    className="hidden"
                  />
                  <label
                    htmlFor="charisma"
                    className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer ${
                      keyStat === 'charisma'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium mb-1">Charisma</span>
                    <span className="text-sm text-text-secondary">+2 HP, +2 MP</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-8 bg-surface-light p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Calculated Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">HP</p>
                  <p className="text-2xl font-bold text-primary">{stats.hp}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">MP</p>
                  <p className="text-2xl font-bold text-secondary">{stats.mp}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-text-secondary">MP Regen</p>
                <p className="text-xl font-bold text-accent">{mpRegen}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!displayName || displayName.length < 3 || displayName.length > 20}
              >
                Save Profile
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Token Shop</h2>
            <p className="text-text-secondary mb-6">
              Spend your tokens to purchase exclusive special cards that can be added to your decks.
            </p>
            
            {tokenCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenCards.map(card => {
                  // Find the collection for this card
                  const collection = collections.find(c => c.id === card.collection);
                  
                  return (
                    <Card key={card.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card.description)}?width=64&height=64&nologo=true&private=true&safe=true&seed=1`}
                              alt={card.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card.title)}?width=64&height=64&nologo=true&private=true&safe=true&seed=1`
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold">{card.title}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                card.rarity === 'common' ? 'bg-surface-light text-text-secondary' :
                                card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                'bg-accent/20 text-accent'
                              }`}>
                                {card.rarity}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                🔑 {card.tokenCost} tokens
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {card.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-text-secondary">
                          {collection?.name}
                        </div>
                        <Button size="sm" disabled>
                          Purchase in Deck Builder
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No special cards available for purchase yet.</p>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-surface-light rounded-lg">
              <h3 className="font-bold mb-2">How to Purchase Cards</h3>
              <p className="text-sm text-text-secondary">
                Special cards can be purchased in the Deck Builder. Look for cards with the 🔑 token cost indicator
                and click the "Buy" button to purchase them with your tokens.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
