import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, Minus, Save, Upload, Download, X, Sparkles } from 'lucide-react'

export default function DeckBuilderPage() {
  const navigate = useNavigate()
  const { 
    collections, 
    decks, 
    selectedDeck, 
    selectedCollection, 
    setSelectedCollection, 
    addToDeck, 
    removeFromDeck, 
    saveDeck, 
    autoBuildDeck 
  } = useGameStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [deckName, setDeckName] = useState(selectedDeck?.name || 'My Deck')
  const [deckCards, setDeckCards] = useState<{[key: string]: number}>({})
  
  useEffect(() => {
    if (selectedDeck) {
      const cardCounts: {[key: string]: number} = {}
      selectedDeck.cards.forEach(cardId => {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
      })
      setDeckCards(cardCounts)
    }
  }, [selectedDeck])

  const filteredCards = (selectedCollection?.cards || []).filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter === '' || card.type === typeFilter) &&
    (rarityFilter === '' || card.rarity === rarityFilter)
  )

  const getCardCount = (cardId: string) => deckCards[cardId] || 0

  const handleAddToDeck = (cardId: string) => {
    const count = getCardCount(cardId)
    
    // Find the card to get its rarity
    let card = null;
    if (selectedCollection) {
      card = selectedCollection.cards.find(c => c.id === cardId);
    }
    
    if (!card) return;
    
    const maxAllowed = card.rarity === 'common' ? 4 : card.rarity === 'rare' ? 2 : 1
    
    if (count >= maxAllowed) {
      // Show error modal
      return
    }
    
    addToDeck(cardId)
    setDeckCards(prev => ({
      ...prev,
      [cardId]: (prev[cardId] || 0) + 1
    }))
  }

  const handleRemoveFromDeck = (cardId: string) => {
    removeFromDeck(cardId)
    setDeckCards(prev => {
      const newCount = (prev[cardId] || 0) - 1
      if (newCount <= 0) {
        const { [cardId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [cardId]: newCount }
    })
  }

  const deckSize = Object.values(deckCards).reduce((sum, count) => sum + count, 0)
  const isDeckFull = deckSize === 30
  const isDeckValid = deckSize === 30

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mr-4">
          <LayoutGrid className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Deck Builder</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card className="p-4 h-full">
            <h2 className="text-xl font-bold mb-4">Collections</h2>
            <div className="space-y-2 mb-6">
              {collections.map(collection => (
                <Button
                  key={collection.id}
                  variant={selectedCollection?.id === collection.id ? 'primary' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCollection(collection)}
                >
                  {collection.name}
                </Button>
              ))}
            </div>
            
            <h2 className="text-xl font-bold mb-4">Deck Stats</h2>
            <div className="bg-surface-light p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Size</span>
                <span className={isDeckValid ? 'text-success' : 'text-error'}>
                  {deckSize}/30
                </span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${
                    isDeckValid ? 'bg-success' : 'bg-error'
                  }`} 
                  style={{ width: `${(deckSize / 30) * 100}%` }}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Type Distribution</h3>
                {['events', 'champions', 'tactics', 'skills'].map(type => {
                  const count = Object.entries(deckCards).filter(([cardId, _]) => {
                    const card = selectedCollection?.cards.find(c => c.id === cardId)
                    return card?.type === type
                  }).length
                  return (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={autoBuildDeck} disabled={!selectedCollection}>
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-build
              </Button>
              <Button onClick={() => setShowImportModal(true)} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Import Deck
              </Button>
              <Button onClick={() => setShowExportModal(true)} variant="outline" disabled={!isDeckValid}>
                <Upload className="w-4 h-4 mr-2" />
                Export Deck
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-bold mb-4 md:mb-0">
                {selectedCollection ? `${selectedCollection.name} Collection` : 'Select a Collection'}
              </h2>
              
              {selectedCollection && (
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="w-full md:w-48 px-3 py-2 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Deck name"
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-48 px-3 py-2 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Search cards..."
                    />
                  </div>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full md:w-32 px-3 py-2 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="events">Events</option>
                    <option value="champions">Champions</option>
                    <option value="tactics">Tactics</option>
                    <option value="skills">Skills</option>
                  </select>
                  
                  <select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value)}
                    className="w-full md:w-32 px-3 py-2 bg-surface-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="unique">Unique</option>
                  </select>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        // Clear deck logic
                        setDeckCards({})
                      }} 
                      variant="outline"
                      disabled={!selectedCollection}
                      className="flex-1 md:flex-none"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Clear Deck
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        if (isDeckValid) {
                          saveDeck(deckName)
                          navigate('/play')
                        }
                      }} 
                      disabled={!isDeckValid}
                      className="flex-1 md:flex-none"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Deck
                    </Button>
                  </div>
                </div>
              )}
            </div>
              
            <div className="mt-6">
              {selectedCollection ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Available Cards</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {filteredCards.map(card => (
                      <Card
                        key={card.id}
                        className="p-3 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
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
                              <h3 className="font-bold text-lg">{card.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                card.rarity === 'common' ? 'bg-surface-light text-text-secondary' :
                                card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                'bg-accent/20 text-accent'
                              }`}>
                                {card.rarity}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex space-x-1">
                            {card.cost.HP !== 0 && (
                              <div className="px-2 py-1 bg-surface-light rounded text-xs">
                                HP: {card.cost.HP}
                              </div>
                            )}
                            {card.cost.MP !== 0 && (
                              <div className="px-2 py-1 bg-surface-light rounded text-xs">
                                MP: {card.cost.MP}
                              </div>
                            )}
                            {card.cost.fatigue !== 0 && (
                              <div className="px-2 py-1 bg-surface-light rounded text-xs">
                                Fatigue: {card.cost.fatigue}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleAddToDeck(card.id)}
                            disabled={isDeckFull && !deckCards[card.id]}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {deckCards[card.id] ? `Add ${getCardCount(card.id) + 1}` : 'Add'}
                          </Button>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {card.description}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="capitalize">{card.type}</span>
                          <span className="text-text-secondary">
                            {card.effect}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Your Deck</h2>
                    {Object.keys(deckCards).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(deckCards).map(([cardId, count]) => {
                          const card = selectedCollection.cards.find(c => c.id === cardId)
                          if (!card) return null
                          
                          return (
                            <Card
                              key={cardId}
                              className="p-3 bg-surface-light border border-border"
                            >
                              <div className="flex justify-between items-start mb-2">
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
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      card.rarity === 'common' ? 'bg-surface-light text-text-secondary' :
                                      card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                      'bg-accent/20 text-accent'
                                    }`}>
                                      {card.rarity}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-2 py-1 bg-surface rounded text-xs">
                                    x{count}
                                  </span>
                                  <Button
                                    onClick={() => handleRemoveFromDeck(cardId)}
                                    variant="outline"
                                    size="sm"
                                    className="p-1 w-8 h-8"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex space-x-1">
                                  {card.cost.HP !== 0 && (
                                    <div className="px-2 py-1 bg-surface rounded text-xs">
                                      HP: {card.cost.HP}
                                    </div>
                                  )}
                                  {card.cost.MP !== 0 && (
                                    <div className="px-2 py-1 bg-surface rounded text-xs">
                                      MP: {card.cost.MP}
                                    </div>
                                  )}
                                  {card.cost.fatigue !== 0 && (
                                    <div className="px-2 py-1 bg-surface rounded text-xs">
                                      Fatigue: {card.cost.fatigue}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                {card.description}
                              </p>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span className="capitalize">{card.type}</span>
                                <span className="text-text-secondary">
                                  {card.effect}
                                </span>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-surface-light p-6 rounded-lg text-center">
                        <p className="text-text-secondary mb-4">Your deck is empty</p>
                        <p className="text-sm text-text-secondary/70 max-w-md mx-auto">
                          Select cards from the collection to build your 30-card deck. 
                          Common cards can be included up to 4 times, Rare cards up to 2 times, 
                          and Unique cards only once.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-surface-light p-8 rounded-lg text-center">
                  <h2 className="text-xl font-bold mb-4">Select a Collection</h2>
                  <p className="text-text-secondary mb-6">
                    Choose a collection from the left panel to start building your deck
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {collections.map(collection => (
                      <button
                        key={collection.id}
                        onClick={() => setSelectedCollection(collection)}
                        className="p-4 rounded-lg bg-surface border border-border hover:bg-surface-light transition-colors"
                      >
                        <div className="h-24 mb-3">
                          <img 
                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(collection.name)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                            alt={collection.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <h3 className="font-bold mt-2">{collection.name}</h3>
                        <p className="text-sm text-text-secondary">{collection.cards.length} cards</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Import Deck Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4">Import Deck</h2>
            <p className="text-text-secondary mb-4">
              Paste your deck JSON below to import it
            </p>
            
            <textarea
              className="w-full h-40 px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Deck JSON..."
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowImportModal(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button>
                Import
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Deck Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-4">Export Deck</h2>
            <p className="text-text-secondary mb-4">
              Copy your deck JSON below to save it
            </p>
            
            <textarea
              readOnly
              value={JSON.stringify({
                name: deckName,
                collection: selectedCollection?.id,
                cards: Object.keys(deckCards)
              }, null, 2)}
              className="w-full h-40 px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowExportModal(false)}
                className="mr-2"
              >
                Close
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(
                JSON.stringify({
                  name: deckName,
                  collection: selectedCollection?.id,
                  cards: Object.keys(deckCards)
                }, null, 2)
              )}>
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
