import { Link } from 'react-router-dom'
import { Gamepad2, Sparkles, Crown, Zap, ArrowRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadAllCollections } from '../lib/collectionLoader'
import { CardCollection } from '../types/game'
import { imageCacheService } from '../lib/imageCacheService'

interface CollectionDisplay {
  id: string
  name: string
  description: string
  cards: number
  gradient: string
}

export default function LandingPage() {
  const [animateIn, setAnimateIn] = useState(false)
  const [collections, setCollections] = useState<CollectionDisplay[]>([])

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimateIn(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadCollections = async () => {
      const loadedCollections = await loadAllCollections()
      const displayCollections: CollectionDisplay[] = loadedCollections.map((collection, index) => {
        const gradients = [
          'from-indigo-500 to-purple-600',
          'from-blue-500 to-cyan-600',
          'from-red-500 to-orange-600',
          'from-pink-500 to-rose-600',
          'from-green-500 to-emerald-600'
        ]
        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          cards: collection.cards.length,
          gradient: gradients[index % gradients.length]
        }
      })
      setCollections(displayCollections.slice(0, 4))
    }
    loadCollections()
  }, [])

  return (
    <div className="min-h-screen pt-16 pb-12">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(158,127,255,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(244,114,182,0.1),transparent_70%)]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface-light mb-6">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-text-secondary font-medium">New Collection: Mythical Beasts Released!</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Master the Art
              </span>
              <br />
              <span className="glowing-text">of Strategic Card Play</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              RocketCards combines classic card game strategy with cutting-edge AI to create dynamic,
              ever-evolving gameplay experiences. Choose a card collection, build your deck, and battle opponents
              with effects resolved by advanced AI models.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/collections" 
                className="btn btn-primary text-lg font-semibold py-4 px-8 shadow-lg hover:shadow-primary/25"
              >
                Explore Collections
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/play-flow"
                className="btn btn-outline border-2 text-lg font-semibold py-4 px-8"
              >
                Start Playing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Featured Collections
                </span>
              </h2>
              <p className="text-text-secondary max-w-2xl">
                Choose from our diverse range of themed card collections, each with unique mechanics and strategic depth.
              </p>
            </div>
            <Link 
              to="/collections" 
              className="mt-4 md:mt-0 text-primary hover:text-primary-dark flex items-center font-medium"
            >
              View all collections
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection, index) => (
              <Link 
                key={collection.id} 
                to={`/collections/${collection.id}`}
                className={`card card-hover-effect group relative overflow-hidden transition-all duration-300 ${
                  animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative p-6">
                  <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                    <img
                      src={imageCacheService.getCachedImage(`https://image.pollinations.ai/prompt/${encodeURIComponent(collection.name)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`) ||
                           `https://image.pollinations.ai/prompt/${encodeURIComponent(collection.name)}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                      alt={collection.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        imageCacheService.cacheImage(img.src);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-70" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-sm font-medium bg-surface-light px-3 py-1 rounded-full">
                        {collection.cards} Cards
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-text-secondary mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Themed Collection</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-text-secondary'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
                Why RocketCards Stands Out
              </span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              We've reimagined the digital card game experience with innovative features that keep every match fresh and engaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-primary" />,
                title: "AI-Powered Resolution",
                description: "Each round's effects are dynamically resolved by advanced language models, creating unique outcomes and strategic depth never seen before in card games."
              },
              {
                icon: <Crown className="w-8 h-8 text-accent" />,
                title: "Deep Customization",
                description: "Create your unique playstyle with strategic profiles, key stats, and hundreds of cards across multiple themed collections."
              },
              {
                icon: <Gamepad2 className="w-8 h-8 text-secondary" />,
                title: "Seamless Gameplay",
                description: "Intuitive interface designed for both casual players and competitive strategists, with smooth animations and responsive controls."
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className={`card p-6 transition-all duration-300 ${
                  animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 p-3 w-14 h-14 rounded-xl bg-surface-light flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface-light mb-6">
              <Star className="w-4 h-4 text-yellow-400 mr-2 fill-current" />
              <span className="text-text-secondary font-medium">Join 50,000+ Players Worldwide</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Ready to Begin Your Journey?
              </span>
            </h2>
            
            <p className="text-xl text-text-secondary mb-10">
              Create your profile, build your deck, and start playing today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/collections" 
                className="btn btn-primary text-lg font-semibold py-4 px-8 shadow-lg hover:shadow-primary/25"
              >
                Explore Collections
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/play-flow"
                className="btn btn-outline border-2 text-lg font-semibold py-4 px-8"
              >
                Start Playing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
