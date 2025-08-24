import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Play, 
  Info, 
  Settings, 
  LogIn, 
  RotateCw,
  Gamepad,
  Plus,
  AlertTriangle,
  X,
  Flag,
  Hand
} from 'lucide-react'

export default function GamePage() {
  const navigate = useNavigate()
  const {
    matchState,
    playerState,
    opponentState,
    playCard: playCardAction,
    endTurn: endTurnAction,
    resolveLLM,
    concede,
    collections,
    selectedDeck
  } = useGameStore()
  
  const [showCardModal, setShowCardModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showPenalty, setShowPenalty] = useState(false)
  const [penaltyMessage, setPenaltyMessage] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [actionLog, setActionLog] = useState<string[]>([])
  
  useEffect(() => {
    if (!matchState) {
      navigate('/play')
      return
    }
    
    // Initialize game state - but don't auto-trigger phase transitions
    // Let the user click the button to proceed
  }, [matchState, navigate])
  
  // Check for game over conditions
  useEffect(() => {
    if (playerState?.hp !== undefined && opponentState?.hp !== undefined) {
      if (playerState.hp <= 0 || opponentState.hp <= 0) {
        navigate('/results')
      }
    }
  }, [playerState?.hp, opponentState?.hp, navigate])
  
  const getCardTitle = (cardId: string, collections: any[]) => {
    if (!cardId) return 'Unknown Card';
    
    for (const collection of collections) {
      const card = collection.cards.find((c: any) => c.id === cardId);
      if (card) return card.title;
    }
    return cardId; // fallback to ID if not found
  };
  
  const handlePlayCard = (cardId: string) => {
    if (matchState?.phase !== 'main') return
    
    // Check if card can be played
    const canPlay = playCardAction(cardId)
    if (!canPlay) {
      setPenaltyMessage('Invalid play - check costs and phase')
      setShowPenalty(true)
    }
  }
  
  const handleEndTurn = () => {
    if (matchState?.phase !== 'main' && matchState?.phase !== 'battle') return
    
    endTurnAction()
  }
  
  const handleConcede = () => {
    concede()
    navigate('/results')
  }
  
  const handleResolve = async () => {
    if (matchState?.phase !== 'resolve') return
    
    setIsResolving(true)
    try {
      const result = await resolveLLM()
      setActionLog([...actionLog, ...result.log])
    } finally {
      setIsResolving(false)
    }
  }
  
  const renderPhase = () => {
    if (!matchState) return null
    
    switch (matchState.phase) {
      case 'main':
        return (
          <div className="bg-surface-light p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Main Phase</h2>
            <p className="text-text-secondary mb-6">
              You can play {playerState?.extraPlaysRemaining || 0} card{(playerState?.extraPlaysRemaining || 0) !== 1 ? 's' : ''} this turn
              {playerState?.fatigue !== undefined && (
                <span className="ml-2">
                  (Fatigue: {playerState.fatigue} -
                  {playerState.fatigue < 3 ? ' 2 cards allowed' :
                   playerState.fatigue <= 5 ? ' 1 card allowed' : ' 0 cards allowed'})
                </span>
              )}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-4">Your Hand</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {playerState?.hand?.map((cardId, index) => {
                    // Find the actual card object from the selected deck or collections
                    let card = null;
                    if (selectedDeck?.collection) {
                      if (typeof selectedDeck.collection === 'string') {
                        // If collection is stored as ID, find it in collections
                        const collection = collections.find(c => c.id === selectedDeck.collection);
                        if (collection) {
                          card = collection.cards.find((c: any) => c.id === cardId);
                        }
                      } else if (selectedDeck.collection.cards) {
                        // If collection is stored as object
                        card = selectedDeck.collection.cards.find((c: any) => c.id === cardId);
                      }
                    }
                    if (!card) {
                      // Fallback: search through all collections
                      for (const collection of collections) {
                        card = collection.cards.find((c: any) => c.id === cardId);
                        if (card) break;
                      }
                    }
                    
                    // If still no card found, create a mock card
                    if (!card) {
                      card = {
                        id: cardId,
                        title: cardId,
                        description: 'Unknown card',
                        type: 'unknown',
                        rarity: 'common',
                        effect: 'Unknown effect',
                        cost: { HP: 0, MP: 0, fatigue: 0 },
                        tags: []
                      };
                    }
                    
                    return (
                      <div
                        key={`${cardId}-${index}`}
                        className="relative card-hover-effect cursor-pointer bg-surface rounded-lg shadow-lg overflow-hidden"
                        onClick={() => {
                          setSelectedCard(card)
                          setShowCardModal(true)
                        }}
                      >
                        <div className="relative">
                          <img
                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card?.description || card?.title || 'card')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                            alt={card?.title || cardId}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card?.title || cardId || 'card')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              card?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                              card?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                              'bg-accent/20 text-accent'
                            }`}>
                              {card?.rarity?.charAt(0).toUpperCase() + card?.rarity?.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm mb-1 truncate">{card?.title || cardId}</h4>
                          <p className="text-xs text-text-secondary mb-2 line-clamp-2">{card?.effect || 'No effect'}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {card?.cost?.HP !== 0 && (
                              <span className="px-1 py-0.5 bg-error/20 text-error text-xs rounded">
                                HP: {card?.cost?.HP}
                              </span>
                            )}
                            {card?.cost?.MP !== 0 && (
                              <span className="px-1 py-0.5 bg-secondary/20 text-secondary text-xs rounded">
                                MP: {card?.cost?.MP}
                              </span>
                            )}
                            {card?.cost?.fatigue !== 0 && (
                              <span className="px-1 py-0.5 bg-warning/20 text-warning text-xs rounded">
                                F: {card?.cost?.fatigue}
                              </span>
                            )}
                            {card?.duration !== undefined && card?.duration !== null && (
                              <span className="px-1 py-0.5 bg-primary/20 text-primary text-xs rounded">
                                {typeof card.duration === 'number'
                                  ? `${card.duration} turns`
                                  : card.duration === 'HP'
                                    ? 'HP-based'
                                    : 'MP-based'}
                              </span>
                            )}
                            {card?.type && (
                              <span className="px-1 py-0.5 bg-accent/20 text-accent text-xs rounded capitalize">
                                {card.type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                          <div className="p-3 w-full">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayCard(cardId);
                              }}
                              className="w-full"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Campaign History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {matchState.log.length > 0 ? (
                    [...matchState.log]
                      .sort((a, b) => b.turn - a.turn || matchState.log.indexOf(b) - matchState.log.indexOf(a))
                      .map((logEntry, index) => (
                        <div key={index} className="bg-surface p-3 rounded-lg border-l-4 border-primary">
                          <p className="text-sm">
                            <span className="font-bold text-primary">Turn {logEntry.turn}:</span> {logEntry.message}
                          </p>
                        </div>
                      ))
                  ) : (
                    <div className="bg-surface p-4 rounded-lg text-text-secondary text-center">
                      <p>No events yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )
        
      case 'battle':
        return (
          <div className="bg-surface-light p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Battle Phase</h2>
            <p className="text-text-secondary mb-6">
              Declare champion actions and skill activations
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-4">Your Champion</h3>
                <div className="space-y-4">
                  {playerState?.champions?.map((champion, index) => (
                    <Card 
                      key={index} 
                      className="p-4 border ${
                        champion.status.includes('exhausted') ? 'opacity-50' : ''
                      }"
                    >
                      <div className="flex justify-between items-start">
                        <CardTitle>{champion.cardId}</CardTitle>
                        <span className="px-2 py-1 bg-surface-light rounded text-xs">
                          Slot {champion.slot}
                        </span>
                      </div>
                      <CardDescription className="mt-2">
                        {champion.attachedSkills.length} attached skills
                      </CardDescription>
                      <div className="mt-4 flex space-x-2">
                        <Button 
                          disabled={champion.status.includes('exhausted')}
                          onClick={() => {
                            // Handle champion action
                          }}
                        >
                          Attack
                        </Button>
                        <Button 
                          disabled={champion.status.includes('silenced')}
                          onClick={() => {
                            // Handle skill activation
                          }}
                        >
                          Activate Skill
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Opponent Champion</h3>
                <div className="space-y-4">
                  {opponentState?.champions?.map((champion, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle>{champion.cardId}</CardTitle>
                        <span className="px-2 py-1 bg-surface-light rounded text-xs">
                          Slot {champion.slot}
                        </span>
                      </div>
                      <CardDescription className="mt-2">
                        {champion.attachedSkills.length} attached skills
                      </CardDescription>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        )
        
      case 'resolve':
        return (
          <div className="bg-surface-light p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Resolving Effects</h2>
            <div className="bg-surface p-4 rounded-lg min-h-40 flex items-center justify-center">
              {isResolving ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-surface-light border-t-primary h-full w-full" />
                  </div>
                  <p className="text-lg">Resolving effects with LLM...</p>
                  <p className="text-sm text-text-secondary mt-2">
                    This may take a few seconds
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg mb-4">Effects ready to resolve</p>
                  <Button onClick={handleResolve}>
                    Resolve Effects
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-4">
            <Gamepad className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Game</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowSettings(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            onClick={handleConcede}
            variant="outline"
            size="sm"
            className="text-error border-error hover:bg-error/10"
          >
            <Hand className="w-4 h-4 mr-2" />
            Concede
          </Button>
        </div>
      </div>
      
      {/* Opponent Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Opponent HP</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4">
              <div
                className="h-4 rounded-full bg-error"
                style={{ width: `${((opponentState?.hp || 0) / 30) * 100}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{opponentState?.hp}</span>
          </div>
        </div>
        
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Opponent MP</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-secondary"
                style={{ width: `${Math.min(100, Math.max(0, ((opponentState?.mp || 0) / 10) * 100))}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{opponentState?.mp}</span>
          </div>
        </div>
        
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Opponent Fatigue</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  (opponentState?.fatigue || 0) < 3 ? 'bg-success' :
                  (opponentState?.fatigue || 0) <= 5 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${((opponentState?.fatigue || 0) / 10) * 100}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{opponentState?.fatigue}</span>
          </div>
        </div>
      </div>
      
      {/* Campaign Board */}
      <div className="bg-surface-light p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-6">Campaign Board</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <div>
            <h3 className="text-lg font-bold mb-4">Your Champion</h3>
            <div className="grid grid-cols-1 gap-4">
              {playerState?.champions && playerState.champions.length > 0 ? (
                playerState.champions.map((champion, index) => {
                  // Find the card to get title and details
                  let card = null;
                  for (const collection of collections) {
                    card = collection.cards.find((c: any) => c.id === champion.cardId);
                    if (card) break;
                  }
                  
                  return (
                    <Card
                      key={index}
                      className={`p-4 ${
                        champion?.status?.includes('exhausted') ? 'opacity-50' : ''
                      }`}
                    >
                      {card && (
                        <div className="relative mb-3">
                          <img
                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card?.description || card?.title || 'champion')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                            alt={card?.title || champion?.cardId}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card?.title || champion?.cardId || 'champion')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                            }}
                          />
                          <div className="absolute top-1 right-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              card?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                              card?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                              'bg-accent/20 text-accent'
                            }`}>
                              {card?.rarity?.charAt(0).toUpperCase() + card?.rarity?.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <CardTitle>{card?.title || champion?.cardId}</CardTitle>
                        <span className="px-2 py-1 bg-surface-light rounded text-xs">
                          Slot {champion?.slot}
                        </span>
                      </div>
                      {card?.championStats && (
                        <div className="flex space-x-4 text-xs mt-2">
                          {card.championStats.ap !== undefined && (
                            <div>
                              <span className="text-error">AP: </span>
                              <span>{card.championStats.ap}</span>
                            </div>
                          )}
                          {card.championStats.dp !== undefined && (
                            <div>
                              <span className="text-secondary">DP: </span>
                              <span>{card.championStats.dp}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <CardDescription className="mt-2">
                        {champion?.attachedSkills?.length} attached skills
                      </CardDescription>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          disabled={champion?.status?.includes('exhausted')}
                          onClick={() => {
                            // Handle champion action
                          }}
                        >
                          Attack
                        </Button>
                        <Button
                          disabled={champion?.status?.includes('silenced')}
                          onClick={() => {
                            // Handle skill activation
                          }}
                        >
                          Activate Skill
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle champion discard
                            const { discardChampion } = useGameStore.getState();
                            discardChampion(index);
                          }}
                        >
                          Discard
                        </Button>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-text-secondary">No Champion</p>
                </div>
              )}
            </div>
            
            {/* Player Creatures */}
            {playerState?.creaturesInPlay && playerState.creaturesInPlay.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-bold mb-3">Your Creatures</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playerState.creaturesInPlay.map((creature, index) => {
                    // Find the card to get title and details
                    let card = null;
                    for (const collection of collections) {
                      card = collection.cards.find((c: any) => c.id === creature.cardId);
                      if (card) break;
                    }
                    
                    return (
                      <Card key={index} className="p-3 bg-surface">
                        {card && (
                          <div className="relative mb-2">
                            <img
                              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card?.description || card?.title || 'creature')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                              alt={card?.title || creature.cardId}
                              className="w-full h-20 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card?.title || creature.cardId || 'creature')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                              }}
                            />
                            <div className="absolute top-1 right-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                card?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                                card?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                'bg-accent/20 text-accent'
                              }`}>
                                {card?.rarity?.charAt(0).toUpperCase() + card?.rarity?.slice(1)}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-sm">{card?.title || creature.cardId}</CardTitle>
                          {creature.remainingDuration !== undefined && (
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                              {creature.remainingDuration} turns
                            </span>
                          )}
                        </div>
                        {card?.creatureStats && (
                          <div className="flex space-x-4 text-xs mb-2">
                            {card.creatureStats.ap !== undefined && (
                              <div>
                                <span className="text-error">AP: </span>
                                <span>{card.creatureStats.ap}</span>
                              </div>
                            )}
                            {card.creatureStats.dp !== undefined && (
                              <div>
                                <span className="text-secondary">DP: </span>
                                <span>{card.creatureStats.dp}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex space-x-4 text-xs">
                          <div>
                            <span className="text-error">HP: </span>
                            <span>{creature.currentHp}/{creature.maxHp}</span>
                          </div>
                          <div>
                            <span className="text-secondary">MP: </span>
                            <span>{creature.currentMp}/{creature.maxMp}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            creature.canAttack ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                          }`}>
                            {creature.canAttack ? 'Can Attack' : 'Cannot Attack'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Handle creature discard
                              const { discardCreature } = useGameStore.getState();
                              discardCreature(index);
                            }}
                          >
                            Discard
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Dashed vertical separator */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-border transform -translate-x-1/2"></div>
          
          <div className="md:pl-8">
            <h3 className="text-lg font-bold mb-4">Opponent Champion</h3>
            <div className="grid grid-cols-1 gap-4">
              {opponentState?.champions && opponentState.champions.length > 0 ? (
                opponentState.champions.map((champion, index) => {
                  // Find the card to get title and details
                  let card = null;
                  for (const collection of collections) {
                    card = collection.cards.find((c: any) => c.id === champion.cardId);
                    if (card) break;
                  }
                  
                  return (
                    <Card key={index} className="p-4">
                      {card && (
                        <div className="relative mb-3">
                          <img
                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card?.description || card?.title || 'champion')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                            alt={card?.title || champion?.cardId}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card?.title || champion?.cardId || 'champion')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                            }}
                          />
                          <div className="absolute top-1 right-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              card?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                              card?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                              'bg-accent/20 text-accent'
                            }`}>
                              {card?.rarity?.charAt(0).toUpperCase() + card?.rarity?.slice(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <CardTitle>{card?.title || champion?.cardId}</CardTitle>
                        <span className="px-2 py-1 bg-surface-light rounded text-xs">
                          Slot {champion?.slot}
                        </span>
                      </div>
                      {card?.championStats && (
                        <div className="flex space-x-4 text-xs mt-2">
                          {card.championStats.ap !== undefined && (
                            <div>
                              <span className="text-error">AP: </span>
                              <span>{card.championStats.ap}</span>
                            </div>
                          )}
                          {card.championStats.dp !== undefined && (
                            <div>
                              <span className="text-secondary">DP: </span>
                              <span>{card.championStats.dp}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <CardDescription className="mt-2">
                        {champion?.attachedSkills?.length} attached skills
                      </CardDescription>
                    </Card>
                  );
                })
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
                  <p className="text-text-secondary">No Champion</p>
                </div>
              )}
            </div>
            
            {/* Opponent Creatures */}
            {opponentState?.creaturesInPlay && opponentState.creaturesInPlay.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-bold mb-3">Opponent Creatures</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {opponentState.creaturesInPlay.map((creature, index) => {
                    // Find the card to get title and details
                    let card = null;
                    for (const collection of collections) {
                      card = collection.cards.find((c: any) => c.id === creature.cardId);
                      if (card) break;
                    }
                    
                    return (
                      <Card key={index} className="p-3 bg-surface">
                        {card && (
                          <div className="relative mb-2">
                            <img
                              src={`https://image.pollinations.ai/prompt/${encodeURIComponent(card?.description || card?.title || 'creature')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`}
                              alt={card?.title || creature.cardId}
                              className="w-full h-20 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(card?.title || creature.cardId || 'creature')}?width=128&height=128&nologo=true&private=true&safe=true&seed=1`
                              }}
                            />
                            <div className="absolute top-1 right-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                card?.rarity === 'common' ? 'bg-surface text-text-secondary' :
                                card?.rarity === 'rare' ? 'bg-secondary/20 text-secondary' :
                                'bg-accent/20 text-accent'
                              }`}>
                                {card?.rarity?.charAt(0).toUpperCase() + card?.rarity?.slice(1)}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-sm">{card?.title || creature.cardId}</CardTitle>
                          {creature.remainingDuration !== undefined && (
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                              {creature.remainingDuration} turns
                            </span>
                          )}
                        </div>
                        {card?.creatureStats && (
                          <div className="flex space-x-4 text-xs mb-2">
                            {card.creatureStats.ap !== undefined && (
                              <div>
                                <span className="text-error">AP: </span>
                                <span>{card.creatureStats.ap}</span>
                              </div>
                            )}
                            {card.creatureStats.dp !== undefined && (
                              <div>
                                <span className="text-secondary">DP: </span>
                                <span>{card.creatureStats.dp}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex space-x-4 text-xs">
                          <div>
                            <span className="text-error">HP: </span>
                            <span>{creature.currentHp}/{creature.maxHp}</span>
                          </div>
                          <div>
                            <span className="text-secondary">MP: </span>
                            <span>{creature.currentMp}/{creature.maxMp}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            creature.canAttack ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                          }`}>
                            {creature.canAttack ? 'Can Attack' : 'Cannot Attack'}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Player Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Your HP</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4">
              <div
                className="h-4 rounded-full bg-error"
                style={{ width: `${((playerState?.hp || 0) / 30) * 100}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{playerState?.hp}</span>
          </div>
        </div>
        
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Your MP</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-secondary"
                style={{ width: `${Math.min(100, Math.max(0, ((playerState?.mp || 0) / 10) * 100))}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{playerState?.mp}</span>
          </div>
        </div>
        
        <div className="bg-surface-light p-4 rounded-lg">
          <h3 className="text-sm text-text-secondary mb-2">Your Fatigue</h3>
          <div className="flex items-center">
            <div className="w-full bg-surface rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  (playerState?.fatigue || 0) < 3 ? 'bg-success' :
                  (playerState?.fatigue || 0) <= 5 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${((playerState?.fatigue || 0) / 10) * 100}%` }}
              />
            </div>
            <span className="ml-3 font-bold">{playerState?.fatigue}</span>
          </div>
        </div>
      </div>
      
      {/* Game Phase Content */}
      {renderPhase()}
      
      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                // Handle mulligan
              }}
              disabled={matchState?.turn !== 0}
            >
              <RotateCw className="w-5 h-5 mr-2" />
              Mulligan
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleEndTurn}
            >
              <Flag className="w-5 h-5 mr-2" />
              End Turn
            </Button>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              Turn {matchState?.turn}
            </div>
            <div className="text-sm text-text-secondary">
              {matchState?.phase ? matchState.phase.charAt(0).toUpperCase() + matchState.phase.slice(1) : ''} Phase
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleConcede}
              className="text-error border-error hover:bg-error/10"
            >
              <Hand className="w-5 h-5 mr-2" />
              Concede
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
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
                
                <div className="mt-8 flex space-x-4">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      handlePlayCard(selectedCard?.id)
                      setShowCardModal(false)
                    }}
                    disabled={matchState?.phase !== 'main'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Card
                  </Button>
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
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Game Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h3 className="font-medium">Animations</h3>
                  <p className="text-sm text-text-secondary">Enable card and effect animations</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="toggle toggle-primary"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h3 className="font-medium">Timed Matches</h3>
                  <p className="text-sm text-text-secondary">60 seconds per turn</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="toggle toggle-primary"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h3 className="font-medium">Sound Effects</h3>
                  <p className="text-sm text-text-secondary">Card plays and effects</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="toggle toggle-primary"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-text-secondary">Use dark color scheme</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="toggle toggle-primary"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Penalty Modal */}
      {showPenalty && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-light rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowPenalty(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Penalty</h2>
              <p className="text-text-secondary">{penaltyMessage}</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowPenalty(false)}
                className="px-8"
              >
                Acknowledge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
