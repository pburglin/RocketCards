import { 
  PlayerState, 
  MatchState, 
  Card, 
  Profile, 
  Deck 
} from '../types/game'

// Constants from .env (would be loaded from environment in real app)
const GAME_DECK_SIZE = 30
const GAME_STARTING_HAND = 5
const GAME_HAND_LIMIT = 7
const GAME_CHAMPION_SLOTS = 3
const GAME_BASE_HP = 24
const GAME_BASE_MP = 6
const GAME_HP_STR_KEY = 8
const GAME_HP_NONKEY = 2
const GAME_MP_INT_KEY = 6
const GAME_MP_NONKEY = 2
const GAME_HP_DEFENSIVE = 4
const GAME_HP_BALANCED = 2
const GAME_HP_AGGRESSIVE = 0
const GAME_MP_DEFENSIVE = 0
const GAME_MP_BALANCED = 2
const GAME_MP_AGGRESSIVE = 4
const GAME_MP_REGEN_DEFENSIVE = 2
const GAME_MP_REGEN_BALANCED = 3
const GAME_MP_REGEN_AGGRESSIVE = 4

export function calculatePlayerStats(
  strategy: 'aggressive' | 'balanced' | 'defensive',
  keyStat: 'strength' | 'intelligence' | 'charisma'
): { hp: number, mp: number } {
  // Base values
  let hp = GAME_BASE_HP
  let mp = GAME_BASE_MP
  
  // Key stat bonus
  if (keyStat === 'strength') {
    hp += GAME_HP_STR_KEY
    mp += GAME_MP_NONKEY
  } else if (keyStat === 'intelligence') {
    hp += GAME_HP_NONKEY
    mp += GAME_MP_INT_KEY
  } else { // charisma
    hp += GAME_HP_NONKEY
    mp += GAME_MP_NONKEY
  }
  
  // Strategy modifier
  if (strategy === 'defensive') {
    hp += GAME_HP_DEFENSIVE
    mp += GAME_MP_DEFENSIVE
  } else if (strategy === 'balanced') {
    hp += GAME_HP_BALANCED
    mp += GAME_MP_BALANCED
  } else { // aggressive
    hp += GAME_HP_AGGRESSIVE
    mp += GAME_MP_AGGRESSIVE
  }
  
  return { hp, mp }
}

export function initializeMatch(options: {
  playerProfile: Profile
  deck: Deck
  opponentType: 'ai' | 'pvp'
  aiDifficulty?: 'easy' | 'medium' | 'hard'
  timedMatch?: boolean
  mulliganEnabled?: boolean
  seed?: string
}): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Shuffle player deck
  const playerDeck = [...options.deck.cards]
  shuffleArray(playerDeck, options.seed)
  
  // Create opponent deck (for now, just copy player deck)
  const opponentDeck = [...playerDeck]
  
  // Deal starting hands
  const playerHand = playerDeck.splice(0, GAME_STARTING_HAND)
  const opponentHand = opponentDeck.splice(0, GAME_STARTING_HAND)
  
  // Calculate player stats
  const { hp, mp } = calculatePlayerStats(
    options.playerProfile.strategy,
    options.playerProfile.keyStat
  )
  
  // Calculate MP regen based on strategy
  let mpRegen = 3 // balanced
  if (options.playerProfile.strategy === 'aggressive') {
    mpRegen = GAME_MP_REGEN_AGGRESSIVE
  } else if (options.playerProfile.strategy === 'defensive') {
    mpRegen = GAME_MP_REGEN_DEFENSIVE
  }
  
  const matchState: MatchState = {
    turn: 0,
    phase: 'start',
    activePlayer: 'player',
    log: [],
    rules: {
      handLimit: GAME_HAND_LIMIT,
      championSlots: GAME_CHAMPION_SLOTS,
      playLimitPerTurn: 1
    },
    rngSeed: options.seed || generateRandomSeed()
  }
  
  const playerState: PlayerState = {
    id: 'player',
    hp,
    mp,
    fatigue: 0,
    hand: playerHand,
    deck: playerDeck,
    discard: [],
    champions: [],
    extraPlaysRemaining: 1,
    flags: []
  }
  
  const opponentState: PlayerState = {
    id: 'opponent',
    hp,
    mp,
    fatigue: 0,
    hand: opponentHand,
    deck: opponentDeck,
    discard: [],
    champions: [],
    extraPlaysRemaining: 1,
    flags: []
  }
  
  return {
    matchState,
    playerState,
    opponentState
  }
}

export function startPhase(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Draw a card for the active player
  if (matchState.activePlayer === 'player' && playerState.deck.length > 0) {
    const drawnCard = playerState.deck.pop()
    if (drawnCard) {
      playerState.hand.push(drawnCard)
    }
  } else if (matchState.activePlayer === 'opponent' && opponentState.deck.length > 0) {
    const drawnCard = opponentState.deck.pop()
    if (drawnCard) {
      opponentState.hand.push(drawnCard)
    }
  }
  
  // Reset play limit for active player
  if (matchState.activePlayer === 'player') {
    playerState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  } else {
    opponentState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  }
  
  // Move to main phase
  matchState.phase = 'main'
  
  return { matchState, playerState, opponentState }
}

export function upkeepPhase(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Restore MP for active player based on their strategy
  if (matchState.activePlayer === 'player') {
    // MP regen would be calculated based on player's strategy
    playerState.mp = Math.min(playerState.mp + 3, 10) // Simplified regen
  } else {
    // For opponent, same simplified regen
    opponentState.mp = Math.min(opponentState.mp + 3, 10)
  }
  
  // Reset play limit for active player
  if (matchState.activePlayer === 'player') {
    playerState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  } else {
    opponentState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  }
  
  // Move to main phase
  matchState.phase = 'main'
  
  return { matchState, playerState, opponentState }
}

export function playCard(
  matchState: MatchState,
  playerState: PlayerState,
  cardId: string,
  collections: any[]
): {
  success: boolean
  matchState: MatchState
  playerState: PlayerState
} {
  // Check if it's the player's turn
  if (matchState.activePlayer !== 'player') {
    return { success: false, matchState, playerState }
  }
  
  // Check if in main phase
  if (matchState.phase !== 'main') {
    return { success: false, matchState, playerState }
  }
  
  // Check if card is in hand
  const cardIndex = playerState.hand.indexOf(cardId)
  if (cardIndex === -1) {
    return { success: false, matchState, playerState }
  }
  
  // Check play limit
  if (playerState.extraPlaysRemaining <= 0) {
    // Apply penalty for overplay
    playerState.hp -= 2
    playerState.fatigue += 1
    matchState.log.push('Penalty: Overplay - Lost 2 HP and gained 1 Fatigue')
    
    // Immediately end turn
    matchState.phase = 'end'
    
    return { success: false, matchState, playerState }
  }
  
  // Check costs
  // Find the card in collections
  let card: Card | undefined;
  for (const collection of collections) {
    card = collection.cards.find((c: any) => c.id === cardId);
    if (card) break;
  }
  
  if (!card) {
    return { success: false, matchState, playerState }
  }
  
  if (playerState.hp + card.cost.HP < 0) {
    return { success: false, matchState, playerState }
  }
  
  if (playerState.mp + card.cost.MP < 0) {
    return { success: false, matchState, playerState }
  }
  
  // Pay costs
  playerState.hp += card.cost.HP
  playerState.mp += card.cost.MP
  playerState.fatigue += card.cost.fatigue
  
  // Move card from hand to discard
  playerState.hand.splice(cardIndex, 1)
  playerState.discard.push(cardId)
  
  // Apply card effects (simplified for MVP)
  if (card.effect.includes('+3 MP')) {
    playerState.mp = Math.min(playerState.mp + 3, calculatePlayerStats(
      'balanced', // would use actual strategy
      'intelligence' // would use actual key stat
    ).mp)
  }
  
  if (card.tags.includes('extra_play:+1')) {
    playerState.extraPlaysRemaining += 1
  }
  
  // Decrement extra plays
  playerState.extraPlaysRemaining -= 1
  
  // Add to log
  matchState.log.push(`Player played ${card.title}`)
  
  return { success: true, matchState, playerState }
}

export function resolveEffects(): void {
  // In real implementation, would call LLM API here
  // For MVP, we'll just move to end phase
}

export function endTurn(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Cleanup phase
  // Discard down to hand limit
  while (playerState.hand.length > GAME_HAND_LIMIT) {
    const cardId = playerState.hand.pop()
    if (cardId) {
      playerState.discard.push(cardId)
    }
  }
  
  // Increment turn
  matchState.turn += 1
  
  // Switch active player
  matchState.activePlayer = matchState.activePlayer === 'player' ? 'opponent' : 'player'
  
  // Start next turn phases
  matchState.phase = 'start'
  
  return {
    matchState,
    playerState,
    opponentState
  }
}

export function concedeMatch(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Set player HP to 0 to trigger loss
  playerState.hp = 0
  matchState.log.push('Player conceded the match')
  
  return {
    matchState,
    playerState,
    opponentState
  }
}

// Helper functions
function shuffleArray(array: any[], seed?: string): void {
  let currentIndex = array.length
  let temporaryValue: any
  let randomIndex: number
  
  // Use seed for deterministic shuffling if provided
  const random = seed ? seededRandom(seed) : Math.random
  
  // Pick a remaining element...
  randomIndex = Math.floor(random() * currentIndex);
  currentIndex -= 1;

  // And swap it with the current element.
  temporaryValue = array[currentIndex];
  array[currentIndex] = array[randomIndex];
  array[randomIndex] = temporaryValue;
}

function seededRandom(seed: string): () => number {
  let seedValue = 0;
  for (let i = 0; i < seed.length; i++) {
    seedValue = (seedValue << 5) - seedValue + seed.charCodeAt(i);
    seedValue |= 0; // Convert to 32bit integer
  }
  
  return () => {
    seedValue = Math.imul(48271, seedValue) % 2147483647;
    return (seedValue - 1) / 2147483646;
  };
}

function getCardById(cardId: string): Card | undefined {
  // In a real implementation, this would look up the card from the current collection
  // For MVP, we'll need to access the collections from the store or pass them as parameters
  // This is a temporary solution - in practice, we should pass collections as a parameter
  console.warn('getCardById: This function needs access to collections from the store');
  return undefined;
}

function generateRandomSeed(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < 16; i++) {
    seed += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return seed;
}

export function initializeGame() {
  // Load collections from public/cards/*.json
  // For MVP, we'll use the mock data in the store
}
