import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, Minus, Save, Upload, Download, X, Sparkles, Trash2, Edit3 } from 'lucide-react'
import SetupProgressIndicator from '../components/SetupProgressIndicator'

export default function DeckBuilderPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    collections,
    decks,
    selectedDeck,
    selectedCollection,
    setSelectedCollection,
    setSelectedDeck,
    addToDeck,
    removeFromDeck,
    saveDeck,
    deleteDeck,
    autoBuildDeck,
    purchaseCardWithTokens,
    isCardPurchased,
    profile
  } = useGameStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [deckName, setDeckName] = useState(selectedDeck?.name || '')
  const [deckCards, setDeckCards] = useState<{[key: string]: number}>({})
  const [showExistingDecks, setShowExistingDecks] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{show: boolean, deckName: string}>({show: false, deckName: ''})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNoDecksMessage, setShowNoDecksMessage] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [enabledTokenCards, setEnabledTokenCards] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    // Check if user came from Play Lobby (no decks exist)
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('from') === 'play-lobby' && decks.length === 0) {
      setShowNoDecksMessage(true)
      // Auto-select the first collection if none selected
      if (!selectedCollection && collections.length > 0) {
        setSelectedCollection(collections[0])
      }
    } else if (decks.length === 0) {
      setShowNoDecksMessage(true)
    } else {
      setShowNoDecksMessage(false)
    }
  }, [decks, selectedCollection, collections, setSelectedCollection])

  useEffect(() => {
    if (selectedDeck) {
      const cardCounts: {[key: string]: number} = {}
      selectedDeck.cards.forEach(cardId => {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
      })
      setDeckCards(cardCounts)
      // Only set the deck name if it's not the default "Auto-Built Deck"
      if (selectedDeck.name && selectedDeck.name !== 'Auto-Built Deck') {
        setDeckName(selectedDeck.name)
      } else if (selectedCollection && selectedDeck.name === 'Auto-Built Deck') {
        // If it's an auto-built deck, use the collection name
        setDeckName(`${selectedCollection.name} Deck`)
      } else {
        setDeckName(selectedDeck.name || '')
      }
    }
  }, [selectedDeck?.cards.length, selectedCollection])

  // Sync local deckCards state when selectedDeck.cards changes from external sources
  useEffect(() => {
    if (selectedDeck) {
      const cardCounts: {[key: string]: number} = {}
      selectedDeck.cards.forEach(cardId => {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
      })
      setDeckCards(cardCounts)
    }
  }, [selectedDeck?.cards.length])

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
    
    if (!card) {
      setError('Card not found in collection')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    // Check if this is a token-purchased card that has already been bought
    if (card.tokenCost && count === 0 && !isCardPurchased(cardId)) {
      setError('Token cards must be purchased first')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    // Common cards can be included unlimited times
    const maxAllowed = card.rarity === 'common' ? Infinity : card.rarity === 'rare' ? 2 : 1
    
    if (count >= maxAllowed) {
      setError(`Maximum copies (${maxAllowed}) of this ${card.rarity} card reached`)
      setTimeout(() => setError(''), 3000)
      return
    }
    
    // Check if deck is full
    const deckSize = Object.values(deckCards).reduce((sum, count) => sum + count, 0)
    if (deckSize >= 30) {
      setError('Deck is full (30 cards maximum)')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    addToDeck(cardId)
    setDeckCards(prev => ({
      ...prev,
      [cardId]: (prev[cardId] || 0) + 1
    }))
    setError('')
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

  const handleSelectExistingDeck = (deck: any) => {
    // Find the collection for this deck
    const collection = collections.find(c => c.id === (deck.collection?.id || deck.collection))
    if (collection) {
      setSelectedCollection(collection)
      setSelectedDeck(deck)
      setDeckName(deck.name)
      setShowExistingDecks(false)
      
      // Rebuild deckCards from the selected deck
      const cardCounts: {[key: string]: number} = {}
      deck.cards.forEach((cardId: string) => {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1
      })
      setDeckCards(cardCounts)
    }
  }

  const handleDeleteDeck = (deckName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmation({show: true, deckName})
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError('Please upload a valid JSON file')
        setTimeout(() => setError(''), 3000)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setError('File size must be less than 1MB')
        setTimeout(() => setError(''), 3000)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const deckData = JSON.parse(e.target?.result as string)
          if (deckData.name && deckData.collection && Array.isArray(deckData.cards)) {
            setImportData(JSON.stringify(deckData, null, 2))
            setShowImportModal(true)
          } else {
            setError('Invalid deck format. Required fields: name, collection, cards')
            setTimeout(() => setError(''), 3000)
          }
        } catch (err) {
          setError('Invalid JSON file')
          setTimeout(() => setError(''), 3000)
        } finally {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
      reader.onerror = () => {
        setError('Error reading file')
        setTimeout(() => setError(''), 3000)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      reader.readAsText(file)
    }
  }

  const deckSize = Object.values(deckCards).reduce((sum, count) => sum + count, 0)
  const isDeckFull = deckSize === 30
  const isDeckValid = deckSize === 30

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Indicator */}
      <SetupProgressIndicator
        currentStep="deck"
        hasProfile={true}
        hasDeck={decks.length > 0 || isDeckValid}
      />
      
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mr-4">
          <LayoutGrid className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Deck Builder</h1>
      </div>
      
      {showNoDecksMessage && decks.length === 0 && (
        <div className="mb-6 p-4 bg-info/20 border border-info rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-info rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-info font-medium">
              You need to create a deck to play. Select a collection below and build your 30-card deck.
            </p>
          </div>
        </div>
      )}
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Collections</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExistingDecks(!showExistingDecks)}
                className="text-xs"
              >
                {showExistingDecks ? 'Hide' : 'Show'} Decks ({decks.length})
              </Button>
            </div>
            
            {showExistingDecks ? (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Your Decks</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {decks.map(deck => (
                    <div
                      key={deck.name}
                      className="flex items-center justify-between p-2 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80"
                      onClick={() => handleSelectExistingDeck(deck)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{deck.name}</p>
                        <p className="text-xs text-text-secondary truncate">
                          {(typeof deck.collection === 'string' ? deck.collection : deck.collection?.name) || 'Unknown Collection'} • {deck.cards.length} cards
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDeleteDeck(deck.name, e)}
                          className="p-1 w-8 h-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {decks.length === 0 && (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No saved decks yet
                    </p>
                  )}
                </div>
              </div>
            ) : (
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
            )}
            
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
              <Button
                onClick={() => {
                  autoBuildDeck()
                }}
                disabled={!selectedCollection}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Auto-build
              </Button>
              <Button 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click()
                  }
                }}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Import Deck
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
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
                        // Also clear the selected deck in store
                        if (selectedDeck) {
                          setSelectedDeck({ ...selectedDeck, cards: [] })
                        }
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
                          setSuccess('Deck saved successfully!')
                          setTimeout(() => {
                            setSuccess('')
                            // Redirect to play lobby after successful deck creation
                            navigate('/play')
                          }, 1000)
                        } else {
                          setError('Deck must have exactly 30 cards to save')
                          setTimeout(() => setError(''), 3000)
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
                        className={`p-3 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ${
                          card.tokenCost ? 'border-2 border-amber-500/50' : ''
                        }`}
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
                              <div className="flex items-center gap-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  card.rarity === 'common' ? 'bg-surface-light text-text-secondary' :
                                  card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                  'bg-accent/20 text-accent'
                                }`}>
                                  {card.rarity}
                                </span>
                                {card.tokenCost && (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs border cursor-pointer ${
                                      enabledTokenCards.has(card.id)
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                                        : 'bg-surface-light text-text-secondary border-border cursor-not-allowed'
                                    }`}
                                    onClick={() => {
                                      if (enabledTokenCards.has(card.id)) {
                                        if (purchaseCardWithTokens(card.id)) {
                                          setSuccess(`${card.title} unlocked! You can now add this special card to your deck.`);
                                          setTimeout(() => setSuccess(''), 3000);
                                          // Remove from enabled set
                                          setEnabledTokenCards(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(card.id);
                                            return newSet;
                                          });
                                        } else {
                                          setError('Not enough tokens or card already purchased');
                                          setTimeout(() => setError(''), 3000);
                                        }
                                      }
                                    }}
                                  >
                                    🔑 {card.tokenCost} tokens
                                  </span>
                                )}
                              </div>
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
                          
                          {card.tokenCost ? (
                            isCardPurchased(card.id) ? (
                              <Button
                                onClick={() => handleAddToDeck(card.id)}
                                disabled={(() => {
                                  // Find the card to get its rarity
                                  const cardInCollection = selectedCollection?.cards.find(c => c.id === card.id);
                                  if (!cardInCollection) return true;
                                  
                                  // Check if we can add more of this card
                                  const count = getCardCount(card.id);
                                  // Common cards can be included unlimited times
                                  const maxAllowed = cardInCollection.rarity === 'common' ? Infinity : cardInCollection.rarity === 'rare' ? 2 : 1;
                                  const isAtMax = count >= maxAllowed;
                                  
                                  // Disable if deck is full and we don't already have this card, or if we're at max copies
                                  return (isDeckFull && !deckCards[card.id]) || isAtMax;
                                })()}
                                size="sm"
                                className={(() => {
                                  // Find the card to get its rarity
                                  const cardInCollection = selectedCollection?.cards.find(c => c.id === card.id);
                                  if (!cardInCollection) return '';
                                  
                                  // Check if we can add more of this card
                                  const count = getCardCount(card.id);
                                  // Common cards can be included unlimited times
                                  const maxAllowed = cardInCollection.rarity === 'common' ? Infinity : cardInCollection.rarity === 'rare' ? 2 : 1;
                                  const isAtMax = count >= maxAllowed;
                                  
                                  // Visibly disable if at max copies or deck is full
                                  const isDisabled = (isDeckFull && !deckCards[card.id]) || isAtMax;
                                  
                                  return isDisabled ? 'opacity-50 cursor-not-allowed' : '';
                                })()}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                {deckCards[card.id] ? `Add ${getCardCount(card.id) + 1}` : 'Add'}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  if (isCardPurchased(card.id)) {
                                    // If already purchased, show card details
                                    setSelectedCard(card)
                                    setShowCardModal(true)
                                  } else {
                                    // Enable the token cost display for this card
                                    setEnabledTokenCards(prev => {
                                      const newSet = new Set(prev);
                                      newSet.add(card.id);
                                      return newSet;
                                    });
                                  }
                                }}
                                size="sm"
                              >
                                {isCardPurchased(card.id) ? 'Unlocked' : `Unlock ${card.tokenCost} 🔑`}
                              </Button>
                            )
                          ) : (
                            <Button
                              onClick={() => handleAddToDeck(card.id)}
                              disabled={(() => {
                                // Find the card to get its rarity
                                const cardInCollection = selectedCollection?.cards.find(c => c.id === card.id);
                                if (!cardInCollection) return true;
                                
                                // Check if we can add more of this card
                                const count = getCardCount(card.id);
                                // Common cards can be included unlimited times
                                const maxAllowed = cardInCollection.rarity === 'common' ? Infinity : cardInCollection.rarity === 'rare' ? 2 : 1;
                                const isAtMax = count >= maxAllowed;
                                
                                // Disable if deck is full and we don't already have this card, or if we're at max copies
                                return (isDeckFull && !deckCards[card.id]) || isAtMax;
                              })()}
                              size="sm"
                              className={(() => {
                                // Find the card to get its rarity
                                const cardInCollection = selectedCollection?.cards.find(c => c.id === card.id);
                                if (!cardInCollection) return '';
                                
                                // Check if we can add more of this card
                                const count = getCardCount(card.id);
                                // Common cards can be included unlimited times
                                const maxAllowed = cardInCollection.rarity === 'common' ? Infinity : cardInCollection.rarity === 'rare' ? 2 : 1;
                                const isAtMax = count >= maxAllowed;
                                
                                // Visibly disable if at max copies or deck is full
                                const isDisabled = (isDeckFull && !deckCards[card.id]) || isAtMax;
                                
                                return isDisabled ? 'opacity-50 cursor-not-allowed' : '';
                              })()}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              {deckCards[card.id] ? `Add ${getCardCount(card.id) + 1}` : 'Add'}
                            </Button>
                          )}
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
                          Common cards can be included unlimited times, Rare cards up to 2 times,
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
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-40 px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder='{"name": "My Deck", "collection": "fantasy", "cards": ["card1", "card2", ...]}'
            />
            
            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportModal(false)
                  setImportData('')
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={() => {
                try {
                  const deckData = JSON.parse(importData)
                  if (deckData.name && deckData.collection && Array.isArray(deckData.cards)) {
                    // Find the collection
                    const collection = collections.find(c => c.id === deckData.collection)
                    if (collection) {
                      setSelectedCollection(collection)
                      setDeckName(deckData.name)
                      
                      // Clear current deck
                      setDeckCards({})
                      // Also clear the selected deck in store
                      if (selectedDeck) {
                        setSelectedDeck({ ...selectedDeck, cards: [] })
                      }
                      
                      const newDeckCards: {[key: string]: number} = {}
                      let validCards = 0
                      let invalidCards = 0
                      
                      // Process each card in the imported deck
                      deckData.cards.forEach((cardId: string) => {
                        const card = collection.cards.find(c => c.id === cardId)
                        if (card) {
                          const currentCount = newDeckCards[cardId] || 0
                          // Common cards can be included unlimited times
                          const maxAllowed = card.rarity === 'common' ? Infinity : card.rarity === 'rare' ? 2 : 1
                          if (currentCount < maxAllowed) {
                            newDeckCards[cardId] = currentCount + 1
                            addToDeck(cardId)
                            validCards++
                          } else {
                            invalidCards++
                          }
                        } else {
                          invalidCards++
                        }
                      })
                      
                      setDeckCards(newDeckCards)
                      setShowImportModal(false)
                      setImportData('')
                      
                      if (invalidCards > 0) {
                        setError(`Deck imported with ${validCards} valid cards. ${invalidCards} cards were skipped due to rarity limits or missing cards.`)
                      } else {
                        setSuccess('Deck imported successfully!')
                      }
                      setTimeout(() => setError(''), 5000)
                    } else {
                      setError('Collection not found')
                      setTimeout(() => setError(''), 3000)
                    }
                  } else {
                    setError('Invalid deck format. Required fields: name, collection, cards')
                    setTimeout(() => setError(''), 3000)
                  }
                } catch (e) {
                  console.error('Invalid JSON', e)
                  setError('Invalid JSON format')
                  setTimeout(() => setError(''), 3000)
                }
              }}>
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
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => {
                  const deckData = JSON.stringify({
                    name: deckName,
                    collection: selectedCollection?.id,
                    cards: Object.keys(deckCards)
                  }, null, 2)
                  const blob = new Blob([deckData], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  setSuccess('Deck downloaded successfully!')
                  setTimeout(() => setSuccess(''), 3000)
                  setShowExportModal(false)
                }}
              >
                Download JSON
              </Button>
              <Button onClick={() => {
                const deckData = JSON.stringify({
                  name: deckName,
                  collection: selectedCollection?.id,
                  cards: Object.keys(deckCards)
                }, null, 2)
                navigator.clipboard.writeText(deckData)
                setSuccess('Deck copied to clipboard!')
                setTimeout(() => setSuccess(''), 3000)
                setShowExportModal(false)
              }}>
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-md w-full relative">
            <h2 className="text-2xl font-bold mb-4">Delete Deck</h2>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete the deck "{deleteConfirmation.deckName}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({show: false, deckName: ''})}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  deleteDeck(deleteConfirmation.deckName)
                  setDeleteConfirmation({show: false, deckName: ''})
                  setSuccess('Deck deleted successfully!')
                  setTimeout(() => setSuccess(''), 3000)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
                  {selectedCard.tokenCost && !isCardPurchased(selectedCard.id) ? (
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
                                setSuccess(`${selectedCard.title} unlocked! You can now add this special card to your deck.`);
                                setTimeout(() => setSuccess(''), 3000);
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
                  ) : (
                    <Button
                      onClick={() => {
                        handleAddToDeck(selectedCard.id)
                        setShowCardModal(false)
                      }}
                      className="w-full"
                      disabled={(() => {
                        // Check if we can add more of this card
                        const count = getCardCount(selectedCard.id);
                        // Common cards can be included unlimited times
                        const maxAllowed = selectedCard.rarity === 'common' ? Infinity : selectedCard.rarity === 'rare' ? 2 : 1;
                        const isAtMax = count >= maxAllowed;
                        
                        // Disable if deck is full and we don't already have this card, or if we're at max copies
                        const isDeckFull = Object.values(deckCards).reduce((sum, count) => sum + count, 0) >= 30;
                        return (isDeckFull && !deckCards[selectedCard.id]) || isAtMax;
                      })()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {deckCards[selectedCard.id] ? `Add ${getCardCount(selectedCard.id) + 1}` : 'Add to Deck'}
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
