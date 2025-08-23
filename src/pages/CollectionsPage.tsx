import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Search, Filter, BookOpen, LayoutGrid, List, Sliders } from 'lucide-react'

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()

  const collections = [
    {
      id: 'fantasy',
      name: 'Fantasy Realms',
      description: 'Epic battles in magical worlds with dragons, wizards, and ancient artifacts',
      cards: 42,
      image: 'https://images.pexels.com/photos/10403203/pexels-photo-10403203.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 'politics',
      name: 'Political Arena',
      description: 'Strategic maneuvering in the halls of power with campaigns, debates, and policy battles',
      cards: 38,
      image: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 'monsters',
      name: 'Monster Mayhem',
      description: 'Collect and battle terrifying creatures from myth and legend',
      cards: 45,
      image: 'https://images.pexels.com/photos/10239830/pexels-photo-10239830.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      id: 'anime',
      name: 'Anime All-Stars',
      description: 'Iconic characters and moments from beloved anime series',
      cards: 50,
      image: 'https://images.pexels.com/photos/10239830/pexels-photo-10239830.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  ]

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
        {collections
          .filter(collection => 
            collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(collection => (
            <Card 
              key={collection.id} 
              className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-bold">{collection.name}</CardTitle>
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
    </div>
  )
}
