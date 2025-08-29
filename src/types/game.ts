export type CardType = 'events' | 'champions' | 'tactics' | 'skills';
export type CardRarity = 'common' | 'rare' | 'unique';
export type Strategy = 'aggressive' | 'balanced' | 'defensive';
export type KeyStat = 'strength' | 'intelligence' | 'charisma';
export type TurnInitiative = 'player' | 'random' | 'opponent';

export interface Card {
  id: string;
  title: string;
  description: string;
  imageDescription: string;
  type: CardType;
  rarity: CardRarity;
  effect: string;
  cost: {
    HP: number;
    MP: number;
    fatigue: number;
  };
  tags: string[];
  flavor?: string;
  collection: string;
  duration?: number | 'HP' | 'MP'; // New field for card duration
  creatureStats?: {
    hp: number;
    mp: number;
    maxHp: number;
    maxMp: number;
    ap?: number; // Attack Power
    dp?: number; // Defense Power
  }; // Stats for creature cards
  championStats?: {
    ap?: number; // Attack Power for champions
    dp?: number; // Defense Power for champions
    hp?: number; // Health Points for champions
    maxHp?: number; // Maximum Health Points for champions
  }; // Stats for champion cards
  tokenCost?: number; // Cost in tokens for special cards
}

export interface CardCollection {
  id: string;
  name: string;
  description: string;
  cards: Card[];
}

export interface Deck {
  name: string;
  cards: string[];
  collection?: CardCollection | string; // Can be either the full collection object or just the ID
}

export interface Profile {
  displayName: string;
  strategy: Strategy;
  keyStat: KeyStat;
  hp: number;
  mp: number;
  tokens: number; // Add token balance to profile
  purchasedCards?: string[]; // Track IDs of cards purchased with tokens
}

export interface ChampionSlot {
  slot: 1 | 2 | 3;
  cardId: string;
  attachedSkills: string[];
  status: string[];
  currentHp: number;
  maxHp: number;
}

export interface PlayerState {
  id: 'player' | 'opponent';
  hp: number;
  mp: number;
  maxHp: number;
  maxMp: number;
  fatigue: number;
  hand: string[];
  deck: string[];
  discard: string[];
  champions: ChampionSlot[];
  extraPlaysRemaining: number;
  flags: string[];
  // Add field to track active creatures in play
  creaturesInPlay?: {
    cardId: string;
    instanceId: string; // Unique identifier for each creature instance
    currentHp: number;
    currentMp: number;
    maxHp: number;
    maxMp: number;
    remainingDuration?: number; // For cards with numeric duration
    playedOnTurn: number; // Track which turn the creature was played
    canAttack: boolean; // Whether the creature can attack this turn
  }[];
}

export interface MatchRules {
  handLimit: number;
  championSlots: number;
  playLimitPerTurn: number;
}

export interface LogEntry {
  message: string;
  turn: number;
}

export interface MatchState {
  turn: number;
  phase: 'main' | 'battle' | 'resolve';
  activePlayer: 'player' | 'opponent';
  log: LogEntry[];
  lastLLMResult?: any;
  rngSeed: string;
  rules: MatchRules;
  timedMatch?: boolean;
  mulliganEnabled?: boolean;
  turnInitiative?: TurnInitiative;
  currentPlayerInTurn?: 'first' | 'second'; // Track which player is currently playing within the turn
}
