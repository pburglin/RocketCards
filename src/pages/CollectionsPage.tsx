import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Search, Filter, BookOpen, LayoutGrid, List, Sliders, X, Info } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { loadCollection } from '../lib/collectionLoader'
import { Card as CardType } from '../types/card'
import { imageCacheService } from '../lib/imageCacheService'
import { getCardImageUrl, getCollectionImageUrl, preloadCollectionImages, preloadCardImages, preloadCollectionImagesProgressive, preloadCardImagesProgressive } from '../lib/cardImageUtils'

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const [selectedCardImageUrl, setSelectedCardImageUrl] = useState<string>('')
  const { collections } = useGameStore()
  const navigate = useNavigate()

  // Transform collections for display (add card counts and images)
  const [collectionDisplayData, setCollectionDisplayData] = useState<any[]>([])
  
  useEffect(() => {
    const loadCollectionImages = async () => {
      // Preload all collection images first (high priority) with progressive loading
      const collectionImages = collections.map(collection => ({
        id: collection.id,
        description: collection.description
      }))
      await preloadCollectionImagesProgressive(collectionImages)
      
      const displayData = await Promise.all(
        collections.map(async collection => {
          try {
            const imageUrl = await getCollectionImageUrl(collection.id, 128, 128)
            return {
              id: collection.id,
              name: collection.name,
              description: collection.description,
              cards: collection.cards.length,
              image: imageUrl,
              firstCard: collection.cards[0]
            }
          } catch (error) {
            console.error(`Failed to load image for collection ${collection.id}:`, error)
            return {
              id: collection.id,
              name: collection.name,
              description: collection.description,
              cards: collection.cards.length,
              image: `https://image.pollinations.ai/prompt/${encodeURIComponent(collection.description)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`,
              firstCard: collection.cards[0]
            }
          }
        })
      )
      setCollectionDisplayData(displayData)
      
      // Preload first few cards from each collection (medium priority) with progressive loading
      const firstCards = collections.slice(0, 3).flatMap(collection =>
        collection.cards.slice(0, 5).map(card => ({
          id: card.id,
          description: card.description
        }))
      )
      if (firstCards.length > 0) {
        preloadCardImagesProgressive(firstCards, 'medium')
      }
    }
    
    if (collections.length > 0) {
      loadCollectionImages()
    }
  }, [collections])

  useEffect(() => {
    // Initialize collections in the store
    const initialize = async () => {
      const { useGameStore } = await import('../store/gameStore')
      const store = useGameStore.getState()
      if (store.initializeCollections) {
        await store.initializeCollections()
      }
    }
    initialize()
  }, [])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.code === 'Escape' && showCardModal) {
        setShowCardModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCardModal]);

  useEffect(() => {
    const loadCardImage = async () => {
      if (showCardModal && selectedCard) {
        try {
          const imageUrl = await getCardImageUrl(selectedCard.id, selectedCard.description, 256, 256);
          setSelectedCardImageUrl(imageUrl);
        } catch (error) {
          console.error(`Failed to load image for card ${selectedCard.id}:`, error);
          // Fallback to pollinations.ai URL
          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(selectedCard.description)}?width=256&height=256&nologo=true&private=true&safe=true&seed=1`;
          setSelectedCardImageUrl(fallbackUrl);
        }
      }
    };
    
    loadCardImage();
  }, [showCardModal, selectedCard]);

  // Lazy load collection card images when user hovers over collection
  const handleCollectionHover = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId)
    if (collection) {
      // Preload all cards in this collection with low priority
      const cards = collection.cards.map(card => ({
        id: card.id,
        description: card.description
      }))
      preloadCardImages(cards, 'low')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Card Collections</h1>
          <p className="text-text-secondary">Choose a collection to explore its cards and build your deck</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            size="sm"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <LayoutGrid className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Sliders className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-text-secondary" />
        <input
          type="text"
          placeholder="Search collections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-light border border-border rounded-lg text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {collectionDisplayData
          .filter(collection =>
            collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(collection => (
            <Card
              key={collection.id}
              className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              onMouseEnter={() => handleCollectionHover(collection.id)}
            >
              <div
                className="relative h-48 overflow-hidden rounded-t-lg cursor-pointer"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle
                    className="text-xl font-bold cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/collections/${collection.id}`)}
                  >
                    {collection.name}
                  </CardTitle>
                  <span className="px-3 py-1 bg-surface-light rounded-full text-sm">
                    {collection.cards} cards
                  </span>
                </div>
                <CardDescription className="text-text-secondary">
                  {collection.description}
                </CardDescription>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => navigate(`/collections/${collection.id}`)}
                    className="w-full md:w-auto"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Collection
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        }
      </div>
      
      {/* Card Details Modal */}
      {showCardModal && selectedCard && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto scrollable-touch"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCardModal(false)
            }
          }}
        >
          <div className="bg-surface-light rounded-xl p-6 max-w-2xl w-full relative my-8 md:my-0">
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
                    src={selectedCardImageUrl}
                    alt={selectedCard.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    onError={async (e) => {
                      const img = e.currentTarget;
                      try {
                        const fallbackUrl = await getCardImageUrl(selectedCard.id, selectedCard.description, 256, 256);
                        img.src = fallbackUrl;
                      } catch (error) {
                        console.error(`Failed to load fallback image for card ${selectedCard.id}:`, error);
                      }
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      imageCacheService.cacheImage(img.src);
                    }}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
