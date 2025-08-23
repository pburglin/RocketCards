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
    phase: 'main',
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
    flags: [],
    creaturesInPlay: []
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
    flags: [],
    creaturesInPlay: []
  }
  
  return {
    matchState,
    playerState,
    opponentState
  }
}


export function playCard(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState,
  cardId: string,
  collections: any[]
): {
  success: boolean
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Check if it's the player's turn
  if (matchState.activePlayer !== 'player') {
    return { success: false, matchState, playerState, opponentState }
  }
  
  // Check if in main phase
  if (matchState.phase !== 'main') {
    return { success: false, matchState, playerState, opponentState }
  }
  
  // Check if card is in hand
  const cardIndex = playerState.hand.indexOf(cardId)
  if (cardIndex === -1) {
    return { success: false, matchState, playerState, opponentState }
  }
  
  // Check play limit
  if (playerState.extraPlaysRemaining <= 0) {
    // Apply penalty for overplay
    playerState.hp -= 2
    playerState.fatigue += 1
    matchState.log.push({ message: 'Penalty: Overplay - Lost 2 HP and gained 1 Fatigue', turn: matchState.turn })
    
    // Immediately end turn
    
    return { success: false, matchState, playerState, opponentState }
  }
  
  // Check costs
  // Find the card in collections
  let card: Card | undefined;
  for (const collection of collections) {
    card = collection.cards.find((c: any) => c.id === cardId);
    if (card) break;
  }
  
  if (!card) {
    return { success: false, matchState, playerState, opponentState }
  }
  
  if (playerState.hp + card.cost.HP < 0) {
    return { success: false, matchState, playerState, opponentState }
  }
  
  if (playerState.mp + card.cost.MP < 0) {
    return { success: false, matchState, playerState, opponentState }
  }
  
  // Pay costs
  playerState.hp += card.cost.HP
  playerState.mp += card.cost.MP
  playerState.fatigue += card.cost.fatigue
  
  // Check if card has duration (creature card)
  if (card.duration !== undefined || card.creatureStats !== undefined) {
    // This is a creature card that stays in play
    const instanceId = `${cardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!playerState.creaturesInPlay) {
      playerState.creaturesInPlay = [];
    }
    
    const creatureEntry = {
      cardId: cardId,
      instanceId: instanceId,
      currentHp: card.creatureStats?.hp || 1,
      currentMp: card.creatureStats?.mp || 0,
      maxHp: card.creatureStats?.maxHp || (card.creatureStats?.hp || 1),
      maxMp: card.creatureStats?.maxMp || (card.creatureStats?.mp || 0),
      remainingDuration: typeof card.duration === 'number' ? card.duration : undefined
    };
    
    playerState.creaturesInPlay.push(creatureEntry);
    
    // Remove card from hand
    playerState.hand.splice(cardIndex, 1);
    
    // Add to log
    matchState.log.push({ message: `${matchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played creature ${card.title}`, turn: matchState.turn });
  } else {
    // Move card from hand to discard (instant effect cards)
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
    
    // Parse and apply damage effects
    if (card.effect.includes('damage')) {
      const damageMatch = card.effect.match(/deal (\d+) damage/i);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        if (matchState.activePlayer === 'player') {
          dealDamage(matchState, playerState, opponentState, damage, collections, cardId);
        } else {
          dealDamage(matchState, opponentState, playerState, damage, collections, cardId);
        }
      }
    }
    
    // Add to log
    matchState.log.push({ message: `${matchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played ${card.title}`, turn: matchState.turn });
  }
  
  // Decrement extra plays
  playerState.extraPlaysRemaining -= 1
  
  return { success: true, matchState, playerState, opponentState }
}

// Function to deal damage, targeting creatures first
export function dealDamage(
  matchState: MatchState,
  attackerState: PlayerState,
  defenderState: PlayerState,
  damage: number,
  collections: any[],
  attackSourceCardId?: string
): void {
  let attackSourceTitle = "Attack";
  if (attackSourceCardId) {
    // Find the card title
    for (const collection of collections) {
      const card = collection.cards.find((c: any) => c.id === attackSourceCardId);
      if (card) {
        attackSourceTitle = card.title;
        break;
      }
    }
  }
  
  // Check if defender has creatures in play
  if (defenderState.creaturesInPlay && defenderState.creaturesInPlay.length > 0) {
    // Target a random creature
    const randomIndex = Math.floor(Math.random() * defenderState.creaturesInPlay.length);
    const targetCreature = defenderState.creaturesInPlay[randomIndex];
    
    // Find the creature card to get the title
    let creatureTitle = "Creature";
    for (const collection of collections) {
      const card = collection.cards.find((c: any) => c.id === targetCreature.cardId);
      if (card) {
        creatureTitle = card.title;
        break;
      }
    }
    
    // Deal damage to creature
    targetCreature.currentHp -= damage;
    
    matchState.log.push({ message: `${attackSourceTitle} dealt ${damage} damage to ${creatureTitle}`, turn: matchState.turn });
    
    // Check if creature is destroyed
    if (targetCreature.currentHp <= 0) {
      // Remove creature from play and add to discard
      const removedCreature = defenderState.creaturesInPlay.splice(randomIndex, 1)[0];
      defenderState.discard.push(removedCreature.cardId);
      matchState.log.push({ message: `${creatureTitle} was destroyed`, turn: matchState.turn });
    }
  } else {
    // No creatures, damage player directly
    defenderState.hp -= damage;
    matchState.log.push({ message: `${attackSourceTitle} dealt ${damage} damage to player`, turn: matchState.turn });
  }
}

export function resolveEffects(): void {
  // In real implementation, would call LLM API here
  // For MVP, we'll just move to end phase
}

export function endTurn(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState,
  collections: any[]
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Check duration-based card expiration for both players
  checkDurationExpiration(matchState, playerState, collections);
  checkDurationExpiration(matchState, opponentState, collections);
  
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
  const previousPlayer = matchState.activePlayer
  matchState.activePlayer = matchState.activePlayer === 'player' ? 'opponent' : 'player'
  
  // Perform start phase actions for the new active player (skip separate start phase)
  const startDetails: any = {
    mpRestored: 0,
    hand: matchState.activePlayer === 'player' ? [...playerState.hand] : [...opponentState.hand],
    cardDrawn: null
  };
  
  // Restore MP for active player
  if (matchState.activePlayer === 'player') {
    const mpBefore = playerState.mp;
    playerState.mp = Math.min(playerState.mp + 3, 10);
    startDetails.mpRestored = playerState.mp - mpBefore;
  } else {
    const mpBefore = opponentState.mp;
    opponentState.mp = Math.min(opponentState.mp + 3, 10);
    startDetails.mpRestored = opponentState.mp - mpBefore;
  }
  
  // Draw a card for the active player
  let drawnCardId = null;
  if (matchState.activePlayer === 'player' && playerState.deck.length > 0) {
    const drawnCard = playerState.deck.pop()
    if (drawnCard) {
      playerState.hand.push(drawnCard)
      drawnCardId = drawnCard;
      startDetails.hand = [...playerState.hand];
    }
  } else if (matchState.activePlayer === 'opponent' && opponentState.deck.length > 0) {
    const drawnCard = opponentState.deck.pop()
    if (drawnCard) {
      opponentState.hand.push(drawnCard)
      drawnCardId = drawnCard;
      startDetails.hand = [...opponentState.hand];
    }
  }
  
  // Reset play limit for active player
  if (matchState.activePlayer === 'player') {
    playerState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  } else {
    opponentState.extraPlaysRemaining = matchState.rules.playLimitPerTurn;
  }
  
  // Add log entries for start phase actions
  if (startDetails.mpRestored > 0) {
    matchState.log.push({
      message: `${matchState.activePlayer === 'player' ? 'Player' : 'Opponent'} restored ${startDetails.mpRestored} MP`,
      turn: matchState.turn
    });
  }
  
  if (drawnCardId) {
    matchState.log.push({
      message: `${matchState.activePlayer === 'player' ? 'Player' : 'Opponent'} drew a card`,
      turn: matchState.turn
    });
  }
  
  // Skip to main phase directly
  matchState.phase = 'main'
  
  return {
    matchState,
    playerState,
    opponentState
  }
}

// Function to check and remove expired duration-based cards
function checkDurationExpiration(
  matchState: MatchState,
  playerState: PlayerState,
  collections: any[]
): void {
  if (!playerState.creaturesInPlay || playerState.creaturesInPlay.length === 0) {
    return;
  }
  
  // Check each creature for duration-based expiration
  for (let i = playerState.creaturesInPlay.length - 1; i >= 0; i--) {
    const creature = playerState.creaturesInPlay[i];
    
    // Find the card to check duration
    let card: any = null;
    for (const collection of collections) {
      card = collection.cards.find((c: any) => c.id === creature.cardId);
      if (card) break;
    }
    
    if (card && card.duration !== undefined) {
      if (typeof card.duration === 'number') {
        // Numeric duration - decrement and check if expired
        if (creature.remainingDuration !== undefined) {
          creature.remainingDuration -= 1;
          
          // Find card title for log
          let cardTitle = "Creature";
          if (card) {
            cardTitle = card.title;
          }
          
          matchState.log.push({ message: `${cardTitle} duration: ${creature.remainingDuration} turns remaining`, turn: matchState.turn });
          
          if (creature.remainingDuration <= 0) {
            const removedCreature = playerState.creaturesInPlay.splice(i, 1)[0];
            playerState.discard.push(removedCreature.cardId);
            matchState.log.push({ message: `${cardTitle} expired (duration reached 0)`, turn: matchState.turn });
          }
        }
      } else if (card.duration === 'HP') {
        // HP-based duration - remove when HP reaches 0
        if (creature.currentHp <= 0) {
          const removedCreature = playerState.creaturesInPlay.splice(i, 1)[0];
          playerState.discard.push(removedCreature.cardId);
          
          // Find card title for log
          let cardTitle = "Creature";
          if (card) {
            cardTitle = card.title;
          }
          matchState.log.push({ message: `${cardTitle} expired (HP reached 0)`, turn: matchState.turn });
        }
      } else if (card.duration === 'MP') {
        // MP-based duration - remove when MP reaches 0
        if (creature.currentMp <= 0) {
          const removedCreature = playerState.creaturesInPlay.splice(i, 1)[0];
          playerState.discard.push(removedCreature.cardId);
          
          // Find card title for log
          let cardTitle = "Creature";
          if (card) {
            cardTitle = card.title;
          }
          matchState.log.push({ message: `${cardTitle} expired (MP reached 0)`, turn: matchState.turn });
        }
      }
    }
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
  matchState.log.push({ message: 'Player conceded the match', turn: matchState.turn })
  
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

export function playOpponentAI(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState,
  collections: any[]
): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  console.log('playOpponentAI called', {
    activePlayer: matchState.activePlayer,
    turn: matchState.turn,
    opponentHand: opponentState.hand.length,
    extraPlays: opponentState.extraPlaysRemaining
  });
  
  // Simple AI: play a random card if possible
  if (opponentState.hand.length > 0 && opponentState.extraPlaysRemaining > 0) {
    // Find a playable card (one that doesn't cause negative HP/MP)
    const playableCards = opponentState.hand.filter(cardId => {
      let card: any = null;
      for (const collection of collections) {
        card = collection.cards.find((c: any) => c.id === cardId);
        if (card) break;
      }
      if (!card) return false;
      
      // Check if costs are affordable
      return (opponentState.hp + card.cost.HP >= 0) && (opponentState.mp + card.cost.MP >= 0);
    });
    
    console.log('Playable cards found:', playableCards.length);
    
    if (playableCards.length > 0) {
      // Play a random playable card
      const randomCardId = playableCards[Math.floor(Math.random() * playableCards.length)];
      
      // Find the card title for logging
      let cardTitle = randomCardId;
      for (const collection of collections) {
        const card = collection.cards.find((c: any) => c.id === randomCardId);
        if (card) {
          cardTitle = card.title;
          break;
        }
      }
      
      console.log('Opponent playing card:', cardTitle);
      const result = playCard(matchState, playerState, opponentState, randomCardId, collections);
      if (result.success) {
        matchState.log.push({ message: `Opponent played ${cardTitle}`, turn: matchState.turn });
        console.log('Opponent card played successfully');
        return {
          matchState: result.matchState,
          playerState: result.playerState,
          opponentState: result.opponentState
        };
      } else {
        console.log('Failed to play opponent card');
      }
    }
  }
  
  // If no card was played, end the turn
  matchState.log.push({ message: `Opponent ended their turn`, turn: matchState.turn });
  console.log('Opponent ended their turn');
  return { matchState, playerState, opponentState };
}
