import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { Card as CardType } from '../types/card'
import { Plus, Minus, Info, Image as ImageIcon } from 'lucide-react'

export default function CollectionDetailPage() {
  const { collectionId } = useParams()
  const [cards, setCards] = useState<CardType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  const { addToDeck, deck } = useGameStore()

  useEffect(() => {
    // In a real app, this would fetch from public/cards/{collectionId}.json
    // For MVP, using mock data
    const mockCards: CardType[] = [
      {
        id: 'champion_dragon_unbound',
        title: 'Dragon Unbound',
        description: 'Ancient dragon breaks its chains and takes flight over a burning citadel',
        imageDescription: 'Ancient red dragon breaking chains above a burning citadel, smoke and fire, dramatic sky',
        type: 'champions',
        rarity: 'unique',
        effect: 'On summon: deal 3 damage to all enemy champions; When attacking: +2 damage if MP >= 5',
        cost: { HP: 0, MP: -5, fatigue: 0 },
        tags: ['reaction:false', 'duration:persistent'],
        flavor: 'Freedom paid in fire.',
        collection: 'fantasy'
      },
      {
        id: 'tactics_counter',
        title: 'Counter Maneuver',
        description: 'Anticipate and negate an opponent\'s move',
        imageDescription: 'Shield shattering an incoming sword strike, sparks flying',
        type: 'tactics',
        rarity: 'rare',
        effect: 'Negate the next action, +1 MP regeneration this turn',
        cost: { HP: -1, MP: -2, fatigue: 0 },
        tags: ['reaction:true', 'duration:1'],
        flavor: 'Timing is everything.',
        collection: 'fantasy'
      }
    ]
    
    setCards(mockCards)
  }, [collectionId])

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
        <h1 className="text-3xl font-bold">{collectionId?.charAt(0).toUpperCase() + collectionId?.slice(1)} Collection</h1>
      </div>

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
                className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden rounded-t-lg">
                  <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card.description)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-70" />
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      card.rarity === 'common' ? 'bg-surface-light text-text-secondary' : 
                      card.rarity === 'rare' ? 'bg-secondary/20 text-secondary' : 
                      'bg-accent/20 text-accent'
                    }`}>
                      {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                    </span>
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
                    </div>
                    
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
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
