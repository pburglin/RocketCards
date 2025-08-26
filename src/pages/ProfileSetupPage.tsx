import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Label } from '../components/ui/Label'
import { calculatePlayerStats } from '../lib/gameEngine'
import { Shield, Sword, Sparkles, Flame, Star, Coins, X } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { profile, saveProfile, collections, purchaseCardWithTokens } = useGameStore()
  const [displayName, setDisplayName] = useState(profile?.displayName || 'Player')
  const [strategy, setStrategy] = useState<'aggressive' | 'balanced' | 'defensive'>(profile?.strategy || 'balanced')
  const [keyStat, setKeyStat] = useState<'strength' | 'intelligence' | 'charisma'>(profile?.keyStat || 'intelligence')
  const [errors, setErrors] = useState<{displayName?: string}>({})
  const [activeTab, setActiveTab] = useState<'profile' | 'tokens'>('profile')
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
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
    
    // Use "Player" as default if display name is empty
    const finalDisplayName = displayName.trim() || 'Player'
    
    if (finalDisplayName.length < 3 || finalDisplayName.length > 20) {
      newErrors.displayName = 'Display name must be 3-20 characters'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    saveProfile({
      displayName: finalDisplayName,
      strategy,
      keyStat,
      hp: stats.hp,
      mp: stats.mp,
      tokens: profile?.tokens || 0 // Preserve existing tokens or initialize with 0
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
      
      {error && (
        <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-success/20 border border-success rounded-lg text-success">
          {success}
        </div>
      )}
      
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
                placeholder="Enter your display name (default: Player)"
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
                disabled={displayName.length > 0 && (displayName.length < 3 || displayName.length > 20)}
              >
                Save Profile
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Token Shop</h2>
            <p className="text-text-secondary mb-6">
              Spend your tokens to unlock exclusive special cards that can be added to your decks.
            </p>
            
            {tokenCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenCards.map(card => {
                  // Find the collection for this card
                  const collection = collections.find(c => c.id === card.collection);
                  const hasEnoughTokens = profile && profile.tokens !== undefined && profile.tokens >= (card.tokenCost || 0);
                  
                  return (
                    <Card
                      key={card.id}
                      className={`p-4 cursor-pointer card-hover-effect transition-all duration-300 ${
                        hasEnoughTokens ? 'hover:shadow-lg hover:shadow-primary/20' : 'opacity-70'
                      }`}
                      onClick={() => {
                        // Show card details modal
                        setSelectedCard(card);
                        setShowCardModal(true);
                      }}
                    >
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
                        <Button
                          size="sm"
                          disabled={!hasEnoughTokens}
                          className={!hasEnoughTokens ? 'opacity-50 cursor-not-allowed' : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasEnoughTokens && profile) {
                              // Show card details modal for purchase
                              setSelectedCard(card);
                              setShowCardModal(true);
                            }
                          }}
                        >
                          {!hasEnoughTokens ? 'Not enough tokens' : 'Unlock'}
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
                Special cards can be unlocked here and in the Deck Builder in exchange for game tokens. Look for cards with the token cost indicator and click the "Unlock" button to purchase them with your tokens.
              </p>
            </div>
          </div>
        )}
      </Card>
      
      {/* Card Details Modal */}
      {showCardModal && selectedCard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative h-64 mb-4">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(selectedCard?.description)}?width=256&height=256&nologo=true&private=true&safe=true&seed=1`}
                    alt={selectedCard?.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      selectedCard?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                      selectedCard?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {selectedCard?.rarity?.charAt(0).toUpperCase() + selectedCard?.rarity?.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mb-4">
                  {selectedCard?.cost?.HP !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      HP: {selectedCard?.cost?.HP}
                    </div>
                  )}
                  {selectedCard?.cost?.MP !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      MP: {selectedCard?.cost?.MP}
                    </div>
                  )}
                  {selectedCard?.cost?.fatigue !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      Fatigue: {selectedCard?.cost?.fatigue}
                    </div>
                  )}
                  {selectedCard?.duration !== undefined && selectedCard?.duration !== null && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      Duration: {typeof selectedCard.duration === 'number'
                        ? `${selectedCard.duration} turns`
                        : selectedCard.duration === 'HP'
                          ? 'HP-based'
                          : 'MP-based'}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedCard?.title}</h2>
                <p className="text-text-secondary mb-4 capitalize">
                  {selectedCard?.type} Card
                </p>
                
                {selectedCard?.championStats && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Champion Stats</h3>
                    <div className="flex space-x-4">
                      {selectedCard.championStats.ap !== undefined && (
                        <div className="px-3 py-1 bg-error/20 text-error rounded">
                          AP: {selectedCard.championStats.ap}
                        </div>
                      )}
                      {selectedCard.championStats.dp !== undefined && (
                        <div className="px-3 py-1 bg-secondary/20 text-secondary rounded">
                          DP: {selectedCard.championStats.dp}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedCard?.creatureStats && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Creature Stats</h3>
                    <div className="flex space-x-4">
                      {selectedCard.creatureStats.ap !== undefined && (
                        <div className="px-3 py-1 bg-error/20 text-error rounded">
                          AP: {selectedCard.creatureStats.ap}
                        </div>
                      )}
                      {selectedCard.creatureStats.dp !== undefined && (
                        <div className="px-3 py-1 bg-secondary/20 text-secondary rounded">
                          DP: {selectedCard.creatureStats.dp}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Effect</h3>
                  <p className="text-text-secondary">{selectedCard?.effect}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-text-secondary">{selectedCard?.description}</p>
                </div>
                
                {selectedCard?.flavor && (
                  <div className="italic text-text-secondary border-l-2 border-primary pl-4 py-2">
                    "{selectedCard?.flavor}"
                  </div>
                )}
                
                <div className="mt-8">
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-amber-500/20 rounded-lg">
                      <p className="text-amber-400 font-medium">🔑 Special Card - {selectedCard?.tokenCost} tokens required</p>
                      <p className="text-sm text-text-secondary mt-1">Special cards can be unlocked here and in the Deck Builder in exchange for game tokens. Look for cards with the token cost indicator and click the "Unlock" button to purchase them with your tokens.</p>
                    </div>
                    <Button
                      className="w-full"
                      disabled={!profile || (profile.tokens || 0) < (selectedCard?.tokenCost || 0)}
                      onClick={() => {
                        if (purchaseCardWithTokens(selectedCard.id)) {
                          setSuccess(`${selectedCard.title} unlocked! You can now add this special card to your deck.`);
                          setTimeout(() => setSuccess(''), 3000);
                          // Close modal
                          setShowCardModal(false);
                        } else {
                          setError('Failed to unlock card. Please try again.');
                          setTimeout(() => setError(''), 3000);
                        }
                      }}
                    >
                      🔓 Unlock Card
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCardModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
