import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { Card as CardType } from '../types/card'
import { Plus, Minus, Info, Image as ImageIcon, Filter, X } from 'lucide-react'
import { loadCollection } from '../lib/collectionLoader'

export default function CollectionDetailPage() {
  const { collectionId } = useParams<{collectionId: string}>()
  const [cards, setCards] = useState<CardType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [success, setSuccess] = useState('')
  const { addToDeck, selectedDeck, collections, purchaseCardWithTokens, isCardPurchased, profile } = useGameStore()
  const [enabledTokenCards, setEnabledTokenCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!collectionId) return
    
    const loadCollectionCards = async () => {
      const collection = await loadCollection(collectionId)
      if (collection) {
        setCards(collection.cards)
      } else {
        // Fallback to existing collections in store
        const storeCollection = collections.find(c => c.id === collectionId)
        if (storeCollection) {
          setCards(storeCollection.cards)
        }
      }
    }
    
    loadCollectionCards()
  }, [collectionId, collections])

  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter === '' || card.type === typeFilter) &&
    (rarityFilter === '' || card.rarity === rarityFilter)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link to="/collections" className="text-primary hover:text-primary-dark mr-4">
          ← Back to Collections
        </Link>
        <h1 className="text-3xl font-bold">{collectionId ? collectionId.charAt(0).toUpperCase() + collectionId.slice(1) : 'Collection'} Collection</h1>
      </div>
      
      {success && (
        <div className="mb-4 p-3 bg-success/20 border border-success rounded-lg text-success">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="bg-surface-light p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="events">Events</option>
                <option value="champions">Champions</option>
                <option value="tactics">Tactics</option>
                <option value="skills">Skills</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Rarity</label>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="unique">Unique</option>
              </select>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => (
              <Card
                key={card.id}
                className={`group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ${
                  card.tokenCost ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/30 border-2 border-amber-600/50' : ''
                }`}
              >
                <div className="relative h-40 overflow-hidden rounded-t-lg">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card.description)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card.title)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-70" />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        card.rarity === 'common' ? 'bg-surface-light text-text-secondary' :
                        card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                      </span>
                      {card.tokenCost && (
                        isCardPurchased(card.id) ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-success/20 text-success border border-success/30">
                            Unlocked
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs border cursor-pointer ${
                              enabledTokenCards.has(card.id)
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                                : 'bg-surface-light text-text-secondary border-border cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (enabledTokenCards.has(card.id)) {
                                if (purchaseCardWithTokens(card.id)) {
                                  // Show success message
                                  setSuccess(`${card.title} unlocked! You can now add this special card to your deck.`);
                                  // Remove from enabled set
                                  setEnabledTokenCards(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(card.id);
                                    return newSet;
                                  });
                                }
                              }
                            }}
                          >
                            🔑 {card.tokenCost}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-text-secondary mb-1">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                    </div>
                    <CardDescription className="text-text-secondary line-clamp-3">
                      {card.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {card.cost.HP !== 0 && (
                        <div className="px-2 py-1 bg-surface-light rounded text-sm">
                          HP: {card.cost.HP}
                        </div>
                      )}
                      {card.cost.MP !== 0 && (
                        <div className="px-2 py-1 bg-surface-light rounded text-sm">
                          MP: {card.cost.MP}
                        </div>
                      )}
                      {card.cost.fatigue !== 0 && (
                        <div className="px-2 py-1 bg-surface-light rounded text-sm">
                          Fatigue: {card.cost.fatigue}
                        </div>
                      )}
                      {card.duration !== undefined && card.duration !== null && (
                        <div className="px-2 py-1 bg-surface-light rounded text-sm">
                          {typeof card.duration === 'number'
                            ? `${card.duration} turns`
                            : card.duration === 'HP'
                              ? 'HP-based'
                              : 'MP-based'}
                        </div>
                      )}
                    </div>
                    
                    {card.tokenCost ? (
                      isCardPurchased(card.id) ? (
                        <Button
                          onClick={() => {
                            setSelectedCard(card)
                            setShowCardModal(true)
                          }}
                          size="sm"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            // Enable the token cost display for this card
                            setEnabledTokenCards(prev => {
                              const newSet = new Set(prev);
                              newSet.add(card.id);
                              return newSet;
                            });
                          }}
                          variant="outline"
                          size="sm"
                          disabled={!profile || (profile.tokens || 0) < (card.tokenCost || 0)}
                        >
                          🔓 Unlock
                        </Button>
                      )
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedCard(card)
                          setShowCardModal(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
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
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(selectedCard.description)}?width=256&height=256&nologo=true&private=true&safe=true&seed=1`}
                    alt={selectedCard.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      selectedCard.rarity === 'common' ? 'bg-surface text-text-secondary' : 
                      selectedCard.rarity === 'rare' ? 'bg-secondary/20 text-secondary' : 
                      'bg-accent/20 text-accent'
                    }`}>
                      {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mb-4">
                  {selectedCard.cost.HP !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      HP: {selectedCard.cost.HP}
                    </div>
                  )}
                  {selectedCard.cost.MP !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      MP: {selectedCard.cost.MP}
                    </div>
                  )}
                  {selectedCard.cost.fatigue !== 0 && (
                    <div className="px-3 py-1 bg-surface rounded text-sm">
                      Fatigue: {selectedCard.cost.fatigue}
                    </div>
                  )}
                  {selectedCard.duration !== undefined && selectedCard.duration !== null && (
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
                <h2 className="text-2xl font-bold mb-2">{selectedCard.title}</h2>
                <p className="text-text-secondary mb-4 capitalize">
                  {selectedCard.type} Card
                </p>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Effect</h3>
                  <p className="text-text-secondary">{selectedCard.effect}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-text-secondary">{selectedCard.description}</p>
                </div>
                
                {selectedCard.flavor && (
                  <div className="italic text-text-secondary border-l-2 border-primary pl-4 py-2">
                    "{selectedCard.flavor}"
                  </div>
                )}
                
                <div className="mt-8">
                  {selectedCard.tokenCost ? (
                    isCardPurchased(selectedCard.id) ? (
                      <div className="text-center p-4 bg-success/20 rounded-lg">
                        <p className="text-success font-medium">✅ Card Already Unlocked</p>
                        <p className="text-sm text-text-secondary mt-2">
                          This special card has already been unlocked and is available to be added to your player card decks.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center p-3 bg-amber-500/20 rounded-lg">
                          <p className="text-amber-400 font-medium">🔑 Special Card - {selectedCard.tokenCost} tokens required</p>
                          <p className="text-sm text-text-secondary mt-1">Special cards can be unlocked here and in the Deck Builder in exchange for game tokens. Look for cards with the token cost indicator and click the "Unlock" button to purchase them with your tokens.</p>
                        </div>
                        <Button
                          onClick={() => {
                            // Enable the token cost display for this card
                            setEnabledTokenCards(prev => {
                              const newSet = new Set(prev);
                              newSet.add(selectedCard.id);
                              return newSet;
                            });
                          }}
                          className="w-full"
                          disabled={!profile || (profile.tokens || 0) < (selectedCard.tokenCost || 0)}
                        >
                          🔓 Enable Token Purchase
                        </Button>
                        {enabledTokenCards.has(selectedCard.id) && (
                          <div className="mt-4 text-center">
                            <span
                              className="px-4 py-2 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer inline-block"
                              onClick={() => {
                                if (purchaseCardWithTokens(selectedCard.id)) {
                                  // Show success message
                                  setSuccess(`${selectedCard.title} unlocked! You can now add this special card to your deck.`);
                                  // Close modal
                                  setShowCardModal(false)
                                  // Remove from enabled set
                                  setEnabledTokenCards(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(selectedCard.id);
                                    return newSet;
                                  });
                                }
                              }}
                            >
                              🔑 Purchase Card for {selectedCard.tokenCost} Tokens
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <Button
                      onClick={() => {
                        if (selectedDeck) {
                          addToDeck(selectedCard.id)
                        }
                        setShowCardModal(false)
                      }}
                      className="w-full"
                      disabled={!selectedDeck}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Deck
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
