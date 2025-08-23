export type CardType = 'events' | 'champions' | 'tactics' | 'skills';
export type CardRarity = 'common' | 'rare' | 'unique';
export type Strategy = 'aggressive' | 'balanced' | 'defensive';
export type KeyStat = 'strength' | 'intelligence' | 'charisma';

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
  }; // Stats for creature cards
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
}

export interface ChampionSlot {
  slot: 1 | 2 | 3;
  cardId: string;
  attachedSkills: string[];
  status: string[];
}

export interface PlayerState {
  id: 'player' | 'opponent';
  hp: number;
  mp: number;
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
}
