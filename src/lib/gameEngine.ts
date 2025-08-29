import { 
  PlayerState, 
  MatchState, 
  Card, 
  Profile, 
  Deck 
} from '../types/game'

// Constants from .env (would be loaded from environment in real app)
const GAME_DECK_SIZE = 30
const GAME_STARTING_HAND = 3
const GAME_HAND_LIMIT = 4
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
  turnInitiative?: 'player' | 'random' | 'opponent'
}): {
  matchState: MatchState
  playerState: PlayerState
  opponentState: PlayerState
} {
  // Shuffle player deck
  const playerDeck = [...options.deck.cards]
  shuffleArray(playerDeck, options.seed)
  
  // Create opponent deck (for now, just copy player deck and shuffle it separately)
  const opponentDeck = [...options.deck.cards]
  shuffleArray(opponentDeck, options.seed ? options.seed + '_opponent' : undefined)
  
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
    turn: 1,
    phase: 'main',
    activePlayer: 'player', // This will be overridden below based on turnInitiative
    log: [],
    rules: {
      handLimit: GAME_HAND_LIMIT,
      championSlots: GAME_CHAMPION_SLOTS,
      playLimitPerTurn: 1
    },
    timedMatch: options.timedMatch,
    mulliganEnabled: options.mulliganEnabled,
    rngSeed: options.seed || generateRandomSeed(),
    turnInitiative: options.turnInitiative,
    currentPlayerInTurn: 'first' // Track which player is currently playing within the turn
  }
  
  // Set the active player based on turn initiative for the first turn
  if (options.turnInitiative === 'player') {
    matchState.activePlayer = 'player';
  } else if (options.turnInitiative === 'opponent') {
    matchState.activePlayer = 'opponent';
  } else if (options.turnInitiative === 'random') {
    // Use the seed to generate a deterministic random value for the first turn
    const seedString = matchState.rngSeed + matchState.turn;
    let seedValue = 0;
    for (let i = 0; i < seedString.length; i++) {
      seedValue = (seedValue << 5) - seedValue + seedString.charCodeAt(i);
      seedValue |= 0; // Convert to 32bit integer
    }
    // Use a simple hash to determine random player (0 or 1)
    const randomValue = Math.abs(seedValue) % 2;
    matchState.activePlayer = randomValue === 0 ? 'player' : 'opponent';
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
  console.log('playCard called:', { activePlayer: matchState.activePlayer, cardId });
  
  // Create deep copies of the input objects to avoid direct mutations
  const newMatchState: MatchState = JSON.parse(JSON.stringify(matchState));
  const newPlayerState: PlayerState = JSON.parse(JSON.stringify(playerState));
  const newOpponentState: PlayerState = JSON.parse(JSON.stringify(opponentState));
  
  // Check if it's the correct player's turn
  const currentPlayerState = newMatchState.activePlayer === 'player' ? newPlayerState : newOpponentState;
  const otherPlayerState = newMatchState.activePlayer === 'player' ? newOpponentState : newPlayerState;
  
  console.log('Current player state:', {
    id: currentPlayerState.id,
    hp: currentPlayerState.hp,
    mp: currentPlayerState.mp,
    hand: currentPlayerState.hand,
    extraPlaysRemaining: currentPlayerState.extraPlaysRemaining
  });
  
  // Check if in main phase
  if (newMatchState.phase !== 'main') {
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play card - not in main phase`, turn: newMatchState.turn });
    return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
  }
  
  // Check if card is in hand
  const cardIndex = currentPlayerState.hand.indexOf(cardId)
  if (cardIndex === -1) {
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play card - card not in hand`, turn: newMatchState.turn });
    return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
  }
  
  // Check play limit based on fatigue
  const maxPlays = currentPlayerState.fatigue < 3 ? 2 : currentPlayerState.fatigue <= 5 ? 1 : 0;
  const canPlay = currentPlayerState.extraPlaysRemaining > 0 && maxPlays > 0;
  
  console.log('Play limit check:', {
    extraPlaysRemaining: currentPlayerState.extraPlaysRemaining,
    maxPlays: maxPlays,
    canPlay: canPlay,
    fatigue: currentPlayerState.fatigue
  });
  
  if (!canPlay) {
    if (maxPlays <= 0) {
      // Cannot play due to high fatigue
      newMatchState.log.push({ message: 'Cannot play card - Fatigue too high', turn: newMatchState.turn });
      return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState };
    } else {
      // Apply penalty for overplay
      currentPlayerState.hp -= 2;
      currentPlayerState.fatigue += 1;
      currentPlayerState.extraPlaysRemaining -= 1;
      newMatchState.log.push({ message: 'Penalty: Overplay - Lost 2 HP and gained 1 Fatigue', turn: newMatchState.turn });
      
      // Immediately end turn
      
      return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState };
    }
  }
  
  // Check costs
  // Find the card in collections
  let card: Card | undefined;
  for (const collection of collections) {
    card = collection.cards.find((c: any) => c.id === cardId);
    if (card) break;
  }
  
  if (!card) {
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play card - card not found in collections`, turn: newMatchState.turn });
    return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
  }
  
  if (currentPlayerState.hp + card.cost.HP < 0) {
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play ${card.title} - HP cost too high (${currentPlayerState.hp + card.cost.HP})`, turn: newMatchState.turn });
    return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
  }
  
  if (currentPlayerState.mp + card.cost.MP < 0) {
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play ${card.title} - MP cost too high (${currentPlayerState.mp + card.cost.MP})`, turn: newMatchState.turn });
    return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
  }
  
  // Pay costs
  currentPlayerState.hp += card.cost.HP
  currentPlayerState.mp += card.cost.MP
  currentPlayerState.fatigue += card.cost.fatigue
  
  // Check if this is a champion card
  if (card.type === 'champions') {
    // Check if it's a persistent champion (no creatureStats) or creature champion (has creatureStats)
    if (card.creatureStats !== undefined) {
      // This is a creature champion - treat as creature
      const instanceId = `${cardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!currentPlayerState.creaturesInPlay) {
        currentPlayerState.creaturesInPlay = [];
      }
      
      const creatureEntry = {
        cardId: cardId,
        instanceId: instanceId,
        currentHp: card.creatureStats?.hp || 1,
        currentMp: card.creatureStats?.mp || 0,
        maxHp: card.creatureStats?.maxHp || (card.creatureStats?.hp || 1),
        maxMp: card.creatureStats?.maxMp || (card.creatureStats?.mp || 0),
        remainingDuration: typeof card.duration === 'number' ? card.duration : undefined,
        playedOnTurn: newMatchState.turn,
        canAttack: false // Cannot attack on the turn it's played
      };
      
      currentPlayerState.creaturesInPlay.push(creatureEntry);
      
      // Remove card from hand
      currentPlayerState.hand.splice(cardIndex, 1);
      
      // Add to log
      newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played creature ${card.title}`, turn: newMatchState.turn });
    } else {
      // This is a persistent champion - check if player already has a champion
      if (currentPlayerState.champions && currentPlayerState.champions.length > 0) {
        // Player already has a champion, cannot play another one
        newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play champion - already has one in play`, turn: newMatchState.turn });
        return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState };
      }
      
      // Add champion to player's champions (only one allowed)
      if (!currentPlayerState.champions) {
        currentPlayerState.champions = [];
      }
      
      const championSlot = {
        slot: 1 as const, // Only one champion slot
        cardId: cardId,
        attachedSkills: [],
        status: [],
        currentHp: card.championStats?.hp || 10, // Default champion HP if not specified
        maxHp: card.championStats?.maxHp || (card.championStats?.hp || 10) // Default max HP
      };
      
      currentPlayerState.champions.push(championSlot);
      
      // Remove card from hand
      currentPlayerState.hand.splice(cardIndex, 1);
      
      // Add to log
      newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played champion ${card.title}`, turn: newMatchState.turn });
    }
  } else if (card.type === 'skills') {
    // This is a skill card - check if player has a champion to attach it to
    if (!currentPlayerState.champions || currentPlayerState.champions.length === 0) {
      // No champion to attach skill to
      newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} cannot play skill card - no champion in play`, turn: newMatchState.turn });
      return { success: false, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState };
    }
    
    // Attach skill to the first champion (since only one champion is allowed)
    currentPlayerState.champions[0].attachedSkills.push(cardId);
    
    // Remove card from hand
    currentPlayerState.hand.splice(cardIndex, 1);
    
    // Add to log
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} attached skill ${card.title} to champion`, turn: newMatchState.turn });
  } else if (card.duration !== undefined || card.creatureStats !== undefined) {
    // This is a creature card that stays in play
    const instanceId = `${cardId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!currentPlayerState.creaturesInPlay) {
      currentPlayerState.creaturesInPlay = [];
    }
    
    const creatureEntry = {
      cardId: cardId,
      instanceId: instanceId,
      currentHp: card.creatureStats?.hp || 1,
      currentMp: card.creatureStats?.mp || 0,
      maxHp: card.creatureStats?.maxHp || (card.creatureStats?.hp || 1),
      maxMp: card.creatureStats?.maxMp || (card.creatureStats?.mp || 0),
      remainingDuration: typeof card.duration === 'number' ? card.duration : undefined,
      playedOnTurn: newMatchState.turn,
      canAttack: false // Cannot attack on the turn it's played
    };
    
    currentPlayerState.creaturesInPlay.push(creatureEntry);
    
    // Remove card from hand
    currentPlayerState.hand.splice(cardIndex, 1);
    
    // Add to log
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played creature ${card.title}`, turn: newMatchState.turn });
  } else {
    // Move card from hand to discard (instant effect cards)
    currentPlayerState.hand.splice(cardIndex, 1)
    currentPlayerState.discard.push(cardId)
    
    // Apply card effects (simplified for MVP)
    if (card.effect.includes('+3 MP')) {
      currentPlayerState.mp = Math.min(currentPlayerState.mp + 3, calculatePlayerStats(
        'balanced', // would use actual strategy
        'intelligence' // would use actual key stat
      ).mp)
    }
    
    if (card.tags.includes('extra_play:+1')) {
      currentPlayerState.extraPlaysRemaining += 1
    }
    
    // Parse and apply damage effects
    if (card.effect.includes('damage')) {
      const damageMatch = card.effect.match(/deal (\d+) damage/i);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        dealDamage(newMatchState, currentPlayerState, otherPlayerState, damage, collections, cardId);
      }
    }
    
    // Add to log
    newMatchState.log.push({ message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} played ${card.title}`, turn: newMatchState.turn });
  }
  
  // Decrement extra plays
  currentPlayerState.extraPlaysRemaining -= 1
  
  return { success: true, matchState: newMatchState, playerState: newPlayerState, opponentState: newOpponentState }
}

// Function to deal damage, targeting creatures first, then champions, then player HP
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
  } else if (defenderState.champions && defenderState.champions.length > 0) {
    // No creatures, target a random champion
    const randomIndex = Math.floor(Math.random() * defenderState.champions.length);
    const targetChampion = defenderState.champions[randomIndex];
    
    // Find the champion card to get the title
    let championTitle = "Champion";
    for (const collection of collections) {
      const card = collection.cards.find((c: any) => c.id === targetChampion.cardId);
      if (card) {
        championTitle = card.title;
        break;
      }
    }
    
    // Deal damage to champion
    targetChampion.currentHp -= damage;
    
    matchState.log.push({ message: `${attackSourceTitle} dealt ${damage} damage to ${championTitle}`, turn: matchState.turn });
    
    // Check if champion is destroyed
    if (targetChampion.currentHp <= 0) {
      // Remove champion from play and add to discard
      const removedChampion = defenderState.champions.splice(randomIndex, 1)[0];
      defenderState.discard.push(removedChampion.cardId);
      matchState.log.push({ message: `${championTitle} was destroyed`, turn: matchState.turn });
    }
  } else {
    // No creatures or champions, damage player directly
    defenderState.hp -= damage;
    matchState.log.push({ message: `${attackSourceTitle} dealt ${damage} damage to ${defenderState.id}`, turn: matchState.turn });
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
  // Create deep copies of the input objects to avoid direct mutations
  const newMatchState: MatchState = JSON.parse(JSON.stringify(matchState));
  const newPlayerState: PlayerState = JSON.parse(JSON.stringify(playerState));
  const newOpponentState: PlayerState = JSON.parse(JSON.stringify(opponentState));
  
  // Store the current active player state before processing
  const currentPlayerState = newMatchState.activePlayer === 'player' ? newPlayerState : newOpponentState;
  const originalPlayerState = newMatchState.activePlayer === 'player' ? playerState : opponentState;
  const maxPlaysAllowed = originalPlayerState.fatigue < 3 ? 2 : originalPlayerState.fatigue <= 5 ? 1 : 0;
  const cardsPlayedThisTurn = originalPlayerState.extraPlaysRemaining < maxPlaysAllowed;
  
  // Check duration-based card expiration for both players
  checkDurationExpiration(newMatchState, newPlayerState, collections);
  checkDurationExpiration(newMatchState, newOpponentState, collections);
  
  // Check for creatures with HP or MP at zero or below
  checkCreatureStats(newMatchState, newPlayerState, collections);
  checkCreatureStats(newMatchState, newOpponentState, collections);
  
  // Check for champions with HP at zero or below
  checkChampionStats(newMatchState, newPlayerState, collections);
  checkChampionStats(newMatchState, newOpponentState, collections);
  
  // Enable creatures to attack on subsequent turns
  if (newPlayerState.creaturesInPlay) {
    newPlayerState.creaturesInPlay.forEach(creature => {
      if (creature.playedOnTurn < newMatchState.turn) {
        creature.canAttack = true;
      }
    });
  }
  
  if (newOpponentState.creaturesInPlay) {
    newOpponentState.creaturesInPlay.forEach(creature => {
      if (creature.playedOnTurn < newMatchState.turn) {
        creature.canAttack = true;
      }
    });
  }
  
  // Combat phase: creatures deal damage to opponent's creatures/player
  processCombatPhase(newMatchState, newPlayerState, newOpponentState, collections);
  
  // Cleanup phase
  // Discard down to hand limit
  while (newPlayerState.hand.length > GAME_HAND_LIMIT) {
    const cardId = newPlayerState.hand.pop()
    if (cardId) {
      newPlayerState.discard.push(cardId)
      // Add log message for discarded card
      newMatchState.log.push({
        message: `Player discarded card due to hand limit (${GAME_HAND_LIMIT} cards)`,
        turn: newMatchState.turn
      });
    }
  }
  
  // Also check opponent hand limit
  while (newOpponentState.hand.length > GAME_HAND_LIMIT) {
    const cardId = newOpponentState.hand.pop()
    if (cardId) {
      newOpponentState.discard.push(cardId)
      // Add log message for discarded card
      newMatchState.log.push({
        message: `Opponent discarded card due to hand limit (${GAME_HAND_LIMIT} cards)`,
        turn: newMatchState.turn
      });
    }
  }
  
  // Determine the next player based on currentPlayerInTurn and turnInitiative
  const previousPlayer = newMatchState.activePlayer;
  let turnIncremented = false;
  
  // If this is the first player's turn within the current turn
  if (newMatchState.currentPlayerInTurn === 'first') {
    // Switch to the second player within the same turn
    if (newMatchState.turnInitiative === 'player') {
      // Player was first, so opponent is second
      newMatchState.activePlayer = 'opponent';
    } else if (newMatchState.turnInitiative === 'opponent') {
      // Opponent was first, so player is second
      newMatchState.activePlayer = 'player';
    } else {
      // Random - determine second player based on who was first
      // If player was first, opponent is second, and vice versa
      newMatchState.activePlayer = previousPlayer === 'player' ? 'opponent' : 'player';
    }
    newMatchState.currentPlayerInTurn = 'second';
  } else {
    // This is the second player's turn, so we complete the turn and start a new one
    newMatchState.turn = newMatchState.turn + 1;
    turnIncremented = true;
    
    // Determine who starts the next turn based on turnInitiative
    if (newMatchState.turnInitiative === 'player') {
      // Player always starts first in the turn
      newMatchState.activePlayer = 'player';
    } else if (newMatchState.turnInitiative === 'opponent') {
      // Opponent always starts first in the turn
      newMatchState.activePlayer = 'opponent';
    } else {
      // Random - randomly assign who starts each turn
      // Use the seed and turn number to generate a deterministic random value
      const seedString = newMatchState.rngSeed + newMatchState.turn;
      let seedValue = 0;
      for (let i = 0; i < seedString.length; i++) {
        seedValue = (seedValue << 5) - seedValue + seedString.charCodeAt(i);
        seedValue |= 0; // Convert to 32bit integer
      }
      // Use a simple hash to determine random player (0 or 1)
      const randomValue = Math.abs(seedValue) % 2;
      newMatchState.activePlayer = randomValue === 0 ? 'player' : 'opponent';
    }
    newMatchState.currentPlayerInTurn = 'first';
  }
  
  // Perform start phase actions for the new active player (skip separate start phase)
  const startDetails: any = {
    mpRestored: 0,
    hand: newMatchState.activePlayer === 'player' ? [...newPlayerState.hand] : [...newOpponentState.hand],
    cardDrawn: null
  };
  
  // Restore MP for active player (only when starting a new turn, not when switching players within turn)
  if (turnIncremented) {
    if (newMatchState.activePlayer === 'player') {
      const mpBefore = newPlayerState.mp;
      newPlayerState.mp = Math.min(newPlayerState.mp + 3, 10);
      startDetails.mpRestored = newPlayerState.mp - mpBefore;
    } else {
      const mpBefore = newOpponentState.mp;
      newOpponentState.mp = Math.min(newOpponentState.mp + 3, 10);
      startDetails.mpRestored = newOpponentState.mp - mpBefore;
    }
  }
  
  // Draw a card for the active player (always when it's their turn to play, not just when turn increments)
  let drawnCardId = null;
  if (newMatchState.activePlayer === 'player' && newPlayerState.deck.length > 0) {
    // Check if player's hand is at maximum capacity
    if (newPlayerState.hand.length >= GAME_HAND_LIMIT) {
      // Cannot draw card - hand is full
      newMatchState.log.push({
        message: `Player could not draw a card - hand limit reached (${GAME_HAND_LIMIT} cards)`,
        turn: newMatchState.turn
      });
    } else {
      const drawnCard = newPlayerState.deck.pop()
      if (drawnCard) {
        newPlayerState.hand.push(drawnCard)
        drawnCardId = drawnCard;
        startDetails.hand = [...newPlayerState.hand];
      }
    }
  } else if (newMatchState.activePlayer === 'opponent' && newOpponentState.deck.length > 0) {
    // Check if opponent's hand is at maximum capacity
    if (newOpponentState.hand.length >= GAME_HAND_LIMIT) {
      console.log('Opponent hand is full, checking for playable cards');
      // Check if opponent has any playable cards
      const { champions, creatures, effects } = categorizeCards(newOpponentState.hand, collections, newOpponentState);
      const hasPlayableCards = champions.length > 0 || creatures.length > 0 || effects.length > 0;
      
      console.log('Opponent card categorization - Champions:', champions.length, 'Creatures:', creatures.length, 'Effects:', effects.length);
      
      if (!hasPlayableCards) {
        console.log('Opponent has no playable cards, discarding random card');
        // Opponent has no playable cards, discard a random card to avoid endless loops
        if (newOpponentState.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * newOpponentState.hand.length);
          const discardedCardId = newOpponentState.hand.splice(randomIndex, 1)[0];
          newOpponentState.discard.push(discardedCardId);
          
          // Find the card title for the log message
          let cardTitle = "a card";
          const discardedCard = getCardFromCollections(discardedCardId, collections);
          if (discardedCard) {
            cardTitle = discardedCard.title;
          }
          
          newMatchState.log.push({
            message: `Opponent discarded ${cardTitle} (no playable cards)`,
            turn: newMatchState.turn
          });
          
          // Now try to draw a card since hand is no longer full
          const drawnCard = newOpponentState.deck.pop();
          if (drawnCard) {
            newOpponentState.hand.push(drawnCard);
            drawnCardId = drawnCard;
            startDetails.hand = [...newOpponentState.hand];
            newMatchState.log.push({
              message: `Opponent drew a card`,
              turn: newMatchState.turn
            });
          }
        }
      } else {
        console.log('Opponent has playable cards, not discarding');
        // Cannot draw card - hand is full but has playable cards
        newMatchState.log.push({
          message: `Opponent could not draw a card - hand limit reached (${GAME_HAND_LIMIT} cards)`,
          turn: newMatchState.turn
        });
      }
    } else {
      const drawnCard = newOpponentState.deck.pop()
      if (drawnCard) {
        newOpponentState.hand.push(drawnCard)
        drawnCardId = drawnCard;
        startDetails.hand = [...newOpponentState.hand];
      }
    }
  }
  
  // Add log entries for start phase actions
  if (turnIncremented && startDetails.mpRestored > 0) {
    newMatchState.log.push({
      message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} restored ${startDetails.mpRestored} MP`,
      turn: newMatchState.turn
    });
  }
  
  if (drawnCardId) {
    newMatchState.log.push({
      message: `${newMatchState.activePlayer === 'player' ? 'Player' : 'Opponent'} drew a card`,
      turn: newMatchState.turn
    });
  }
  
  // Reset play limit for active player based on fatigue (always reset when player changes)
  const activePlayerState = newMatchState.activePlayer === 'player' ? newPlayerState : newOpponentState;
  const originalActivePlayerState = newMatchState.activePlayer === 'player' ? playerState : opponentState;
  const maxPlays = originalActivePlayerState.fatigue < 3 ? 2 : originalActivePlayerState.fatigue <= 5 ? 1 : 0;
  
  if (newMatchState.activePlayer === 'player') {
    newPlayerState.extraPlaysRemaining = maxPlays;
  } else {
    newOpponentState.extraPlaysRemaining = maxPlays;
  }
  
  // Skip to main phase directly
  newMatchState.phase = 'main'
  
  // If the previous player didn't play any cards, decrease their fatigue by 1 (only when completing a full turn)
  if (turnIncremented && !cardsPlayedThisTurn && maxPlaysAllowed > 0) {
    if (previousPlayer === 'player') {
      newPlayerState.fatigue = Math.max(0, newPlayerState.fatigue - 1);
    } else {
      newOpponentState.fatigue = Math.max(0, newOpponentState.fatigue - 1);
    }
  }
  
  return {
    matchState: newMatchState,
    playerState: newPlayerState,
    opponentState: newOpponentState
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

// Function to check and remove creatures with HP or MP at zero or below
function checkCreatureStats(
  matchState: MatchState,
  playerState: PlayerState,
  collections: any[]
): void {
  if (!playerState.creaturesInPlay || playerState.creaturesInPlay.length === 0) {
    return;
  }
  
  // Check each creature for HP or MP at zero or below
  for (let i = playerState.creaturesInPlay.length - 1; i >= 0; i--) {
    const creature = playerState.creaturesInPlay[i];
    
    // Skip creatures with duration-based expiration (handled by checkDurationExpiration)
    let card: any = null;
    for (const collection of collections) {
      card = collection.cards.find((c: any) => c.id === creature.cardId);
      if (card) break;
    }
    
    // Skip if this is a duration-based card
    if (card && card.duration !== undefined) {
      continue;
    }
    
    // Check if HP or MP is at zero or below
    if (creature.currentHp <= 0 || creature.currentMp <= 0) {
      // Find card title for log
      let cardTitle = "Creature";
      if (card) {
        cardTitle = card.title;
      }
      
      // Remove creature from play and add to discard
      const removedCreature = playerState.creaturesInPlay.splice(i, 1)[0];
      playerState.discard.push(removedCreature.cardId);
      
      // Add log entry
      const reason = creature.currentHp <= 0 ? "HP" : "MP";
      matchState.log.push({ message: `${cardTitle} was removed (ran out of ${reason})`, turn: matchState.turn });
    }
  }
}

// Function to check and remove champions with HP at zero or below
function checkChampionStats(
  matchState: MatchState,
  playerState: PlayerState,
  collections: any[]
): void {
  if (!playerState.champions || playerState.champions.length === 0) {
    return;
  }
  
  // Check each champion for HP at zero or below
  for (let i = playerState.champions.length - 1; i >= 0; i--) {
    const champion = playerState.champions[i];
    
    // Check if HP is at zero or below
    if (champion.currentHp <= 0) {
      // Find card title for log
      let cardTitle = "Champion";
      let card: any = null;
      for (const collection of collections) {
        card = collection.cards.find((c: any) => c.id === champion.cardId);
        if (card) {
          cardTitle = card.title;
          break;
        }
      }
      
      // Remove champion from play and add to discard
      const removedChampion = playerState.champions.splice(i, 1)[0];
      playerState.discard.push(removedChampion.cardId);
      
      // Add log entry
      matchState.log.push({ message: `${cardTitle} was removed (ran out of HP)`, turn: matchState.turn });
    }
  }
}

// Function to process combat phase where creatures deal damage
function processCombatPhase(
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState,
  collections: any[]
): void {
  // Player's champion attacks and uses skills
  if (playerState.champions && playerState.champions.length > 0) {
    const champion = playerState.champions[0];
    
    // Find the champion card to get AP
    let championCard: any = null;
    for (const collection of collections) {
      championCard = collection.cards.find((c: any) => c.id === champion.cardId);
      if (championCard) break;
    }
    
    const championAp = championCard?.championStats?.ap || 1; // Default to 1 AP if not specified
    
    // Champion attacks
    dealDamage(matchState, playerState, opponentState, championAp, collections, champion.cardId);
    
    // Apply skill effects
    for (const skillId of champion.attachedSkills) {
      let skillCard: any = null;
      for (const collection of collections) {
        skillCard = collection.cards.find((c: any) => c.id === skillId);
        if (skillCard) break;
      }
      
      if (skillCard) {
        // Apply skill effect (for now, just deal damage based on effect text)
        if (skillCard.effect.includes('damage')) {
          const damageMatch = skillCard.effect.match(/deal (\d+) damage/i);
          if (damageMatch) {
            const damage = parseInt(damageMatch[1]);
            dealDamage(matchState, playerState, opponentState, damage, collections, skillId);
          }
        }
        
        // Add skill effect to log
        matchState.log.push({ message: `Player's champion used skill ${skillCard.title}`, turn: matchState.turn });
      }
    }
  }
  
  // Opponent's champion attacks and uses skills
  if (opponentState.champions && opponentState.champions.length > 0) {
    const champion = opponentState.champions[0];
    
    // Find the champion card to get AP
    let championCard: any = null;
    for (const collection of collections) {
      championCard = collection.cards.find((c: any) => c.id === champion.cardId);
      if (championCard) break;
    }
    
    const championAp = championCard?.championStats?.ap || 1; // Default to 1 AP if not specified
    
    // Champion attacks
    dealDamage(matchState, opponentState, playerState, championAp, collections, champion.cardId);
    
    // Apply skill effects
    for (const skillId of champion.attachedSkills) {
      let skillCard: any = null;
      for (const collection of collections) {
        skillCard = collection.cards.find((c: any) => c.id === skillId);
        if (skillCard) break;
      }
      
      if (skillCard) {
        // Apply skill effect (for now, just deal damage based on effect text)
        if (skillCard.effect.includes('damage')) {
          const damageMatch = skillCard.effect.match(/deal (\d+) damage/i);
          if (damageMatch) {
            const damage = parseInt(damageMatch[1]);
            dealDamage(matchState, opponentState, playerState, damage, collections, skillId);
          }
        }
        
        // Add skill effect to log
        matchState.log.push({ message: `Opponent's champion used skill ${skillCard.title}`, turn: matchState.turn });
      }
    }
  }
  
  // Player's creatures attack opponent's creatures/player
  if (playerState.creaturesInPlay && playerState.creaturesInPlay.length > 0) {
    for (const creature of playerState.creaturesInPlay) {
      // Only attack if creature can attack
      if (creature.canAttack) {
        // Find the creature card to get AP
        let card: any = null;
        for (const collection of collections) {
          card = collection.cards.find((c: any) => c.id === creature.cardId);
          if (card) break;
        }
        
        const ap = card?.creatureStats?.ap || 1; // Default to 1 AP if not specified
        
        // Deal damage to opponent
        dealDamage(matchState, playerState, opponentState, ap, collections, creature.cardId);
      }
    }
  }
  
  // Opponent's creatures attack player's creatures/player
  if (opponentState.creaturesInPlay && opponentState.creaturesInPlay.length > 0) {
    for (const creature of opponentState.creaturesInPlay) {
      // Only attack if creature can attack
      if (creature.canAttack) {
        // Find the creature card to get AP
        let card: any = null;
        for (const collection of collections) {
          card = collection.cards.find((c: any) => c.id === creature.cardId);
          if (card) break;
        }
        
        const ap = card?.creatureStats?.ap || 1; // Default to 1 AP if not specified
        
        // Deal damage to player
        dealDamage(matchState, opponentState, playerState, ap, collections, creature.cardId);
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
  // Create deep copies of the input objects to avoid direct mutations
  const newMatchState: MatchState = JSON.parse(JSON.stringify(matchState));
  const newPlayerState: PlayerState = JSON.parse(JSON.stringify(playerState));
  const newOpponentState: PlayerState = JSON.parse(JSON.stringify(opponentState));
  
  // Set player HP to 0 to trigger loss
  newPlayerState.hp = 0
  newMatchState.log.push({ message: 'Player conceded the match', turn: newMatchState.turn })
  
  return {
    matchState: newMatchState,
    playerState: newPlayerState,
    opponentState: newOpponentState
  }
}

// Helper functions
function shuffleArray(array: any[], seed?: string): void {
  let currentIndex = array.length
  let temporaryValue: any
  let randomIndex: number
  
  // Use seed for deterministic shuffling if provided
  const random = seed ? seededRandom(seed) : Math.random
  
  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
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

// Helper function to get card by ID from collections
function getCardFromCollections(cardId: string, collections: any[]): any {
  for (const collection of collections) {
    const card = collection.cards.find((c: any) => c.id === cardId);
    if (card) return card;
  }
  return null;
}

// Helper function to evaluate board state
function evaluateBoardState(opponentState: PlayerState): { hasChampion: boolean, creatureCount: number } {
  const hasChampion = opponentState.champions && opponentState.champions.length > 0;
  const creatureCount = opponentState.creaturesInPlay ? opponentState.creaturesInPlay.length : 0;
  return { hasChampion, creatureCount };
}

// Helper function to categorize cards
function categorizeCards(hand: string[], collections: any[], opponentState: PlayerState) {
  const champions: string[] = [];
  const creatures: string[] = [];
  const effects: string[] = [];
  
  hand.forEach(cardId => {
    const card = getCardFromCollections(cardId, collections);
    if (!card) {
      console.log('Card not found in collections:', cardId);
      return;
    }
    
    // Check if card is affordable
    const isAffordable = (opponentState.hp + card.cost.HP >= 0) && (opponentState.mp + card.cost.MP >= 0);
    if (!isAffordable) {
      console.log('Card not affordable:', card.title, 'HP:', opponentState.hp, 'Card HP cost:', card.cost.HP, 'MP:', opponentState.mp, 'Card MP cost:', card.cost.MP);
      return;
    }
    
    if (card.type === 'champions') {
      champions.push(cardId);
    } else if (card.type === 'creatures' || (card.creatureStats && card.duration !== undefined)) {
      creatures.push(cardId);
    } else {
      effects.push(cardId);
    }
  });
  
  return { champions, creatures, effects };
}

// Helper function to sort creatures by cost (prioritize lower cost)
function sortCreaturesByCost(creatures: string[], collections: any[]): string[] {
  return [...creatures].sort((a, b) => {
    const cardA = getCardFromCollections(a, collections);
    const cardB = getCardFromCollections(b, collections);
    if (!cardA || !cardB) return 0;
    
    const costA = Math.abs(cardA.cost.MP) + Math.abs(cardA.cost.HP);
    const costB = Math.abs(cardB.cost.MP) + Math.abs(cardB.cost.HP);
    return costA - costB;
  });
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
  
  // Keep track of cards we've already tried to avoid infinite loops
  const triedCards = new Set<string>();
  
  // Continue trying to play cards while opponent can play
  while (opponentState.hand.length > 0 && opponentState.extraPlaysRemaining > 0) {
    // Evaluate current board state
    const boardState = evaluateBoardState(opponentState);
    const { champions, creatures, effects } = categorizeCards(opponentState.hand, collections, opponentState);
    
    console.log('Board state evaluation:', boardState);
    console.log('Categorized cards - Champions:', champions.length, 'Creatures:', creatures.length, 'Effects:', effects.length);
    
    // Strategy: Play cards based on priority
    let cardToPlay: string | null = null;
    let playReason = '';
    
    // Priority 1: Play champion if none in play
    if (!boardState.hasChampion && champions.length > 0) {
      // Try champions in order, skipping already tried ones
      for (const championId of champions) {
        if (!triedCards.has(championId)) {
          cardToPlay = championId;
          playReason = 'playing champion (priority 1)';
          break;
        }
      }
    }
    // Priority 2: Play creatures if we have less than 2
    else if (boardState.creatureCount < 2 && creatures.length > 0) {
      // Sort creatures by cost (prefer cheaper ones) and try them
      const sortedCreatures = sortCreaturesByCost(creatures, collections);
      for (const creatureId of sortedCreatures) {
        if (!triedCards.has(creatureId)) {
          cardToPlay = creatureId;
          playReason = 'playing creature to build board (priority 2)';
          break;
        }
      }
    }
    // Priority 3: Play effects/skills once we have sufficient board state
    else if (boardState.hasChampion && boardState.creatureCount >= 2 && effects.length > 0) {
      // Try effects, skipping already tried ones
      for (const effectId of effects) {
        if (!triedCards.has(effectId)) {
          cardToPlay = effectId;
          playReason = 'playing effect with sufficient board state (priority 3)';
          break;
        }
      }
    }
    // Priority 4: Play additional creatures if we have board state
    else if (boardState.hasChampion && creatures.length > 0) {
      const sortedCreatures = sortCreaturesByCost(creatures, collections);
      for (const creatureId of sortedCreatures) {
        if (!triedCards.has(creatureId)) {
          cardToPlay = creatureId;
          playReason = 'playing additional creature (priority 4)';
          break;
        }
      }
    }
    // Priority 5: Play any remaining champions (shouldn't happen normally)
    else if (champions.length > 0) {
      // Try remaining champions, skipping already tried ones
      for (const championId of champions) {
        if (!triedCards.has(championId)) {
          cardToPlay = championId;
          playReason = 'playing remaining champion (priority 5)';
          break;
        }
      }
    }
    
    // If no card to play, break the loop
    if (!cardToPlay) {
      break;
    }
    
    // Mark this card as tried
    triedCards.add(cardToPlay);
    
    // Play the selected card
    const card = getCardFromCollections(cardToPlay, collections);
    if (card) {
      console.log('Opponent playing card:', card.title, 'Reason:', playReason);
      const result = playCard(matchState, playerState, opponentState, cardToPlay, collections);
      if (result.success) {
        console.log('Opponent card played successfully');
        // Update states for next iteration
        matchState = result.matchState;
        playerState = result.playerState;
        opponentState = result.opponentState;
        continue; // Try to play another card
      } else {
        console.log('Failed to play opponent card:', card.title);
        matchState.log.push({ message: `Opponent failed to play ${card.title}`, turn: matchState.turn });
        // Continue to try next card
      }
    }
  }
  
  // End the turn
  matchState.log.push({ message: `Opponent ended their turn`, turn: matchState.turn });
  console.log('Opponent ended their turn');
  // Return the current state - let the calling function handle turn ending
  return {
    matchState,
    playerState,
    opponentState
  };
}

// Function to discard a champion
export function discardChampion(
  matchState: MatchState,
  playerState: PlayerState,
  championIndex: number
): {
  success: boolean
  matchState: MatchState
  playerState: PlayerState
} {
  // Create deep copies of the input objects to avoid direct mutations
  const newMatchState: MatchState = JSON.parse(JSON.stringify(matchState));
  const newPlayerState: PlayerState = JSON.parse(JSON.stringify(playerState));
  
  if (!newPlayerState.champions || championIndex < 0 || championIndex >= newPlayerState.champions.length) {
    return { success: false, matchState: newMatchState, playerState: newPlayerState };
  }
  
  const champion = newPlayerState.champions[championIndex];
  const cardId = champion.cardId;
  
  // Remove champion from play and add to discard pile
  newPlayerState.champions.splice(championIndex, 1);
  newPlayerState.discard.push(cardId);
  
  // Add to log
  newMatchState.log.push({ message: `Player discarded champion`, turn: newMatchState.turn });
  
  return { success: true, matchState: newMatchState, playerState: newPlayerState };
}

// Function to discard a card from hand
export function discardHandCard(
  matchState: MatchState,
  playerState: PlayerState,
  cardIndex: number
): {
  success: boolean
  matchState: MatchState
  playerState: PlayerState
} {
  if (cardIndex < 0 || cardIndex >= playerState.hand.length) {
    return { success: false, matchState, playerState };
  }
  
  const cardId = playerState.hand[cardIndex];
  
  // Remove card from hand and add to discard pile
  playerState.hand.splice(cardIndex, 1);
  playerState.discard.push(cardId);
  
  // Add to log
  matchState.log.push({ message: `Player discarded card from hand`, turn: matchState.turn });
  
  return { success: true, matchState, playerState };
}

// Function to discard a creature
export function discardCreature(
  matchState: MatchState,
  playerState: PlayerState,
  creatureIndex: number
): {
  success: boolean
  matchState: MatchState
  playerState: PlayerState
} {
  // Create deep copies of the input objects to avoid direct mutations
  const newMatchState: MatchState = JSON.parse(JSON.stringify(matchState));
  const newPlayerState: PlayerState = JSON.parse(JSON.stringify(playerState));
  
  if (!newPlayerState.creaturesInPlay || creatureIndex < 0 || creatureIndex >= newPlayerState.creaturesInPlay.length) {
    return { success: false, matchState: newMatchState, playerState: newPlayerState };
  }
  
  const creature = newPlayerState.creaturesInPlay[creatureIndex];
  const cardId = creature.cardId;
  
  // Remove creature from play and add to discard pile
  newPlayerState.creaturesInPlay.splice(creatureIndex, 1);
  newPlayerState.discard.push(cardId);
  
  // Add to log
  newMatchState.log.push({ message: `Player discarded creature`, turn: newMatchState.turn });
  
  return { success: true, matchState: newMatchState, playerState: newPlayerState };
}
