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
}

export interface MatchRules {
  handLimit: number;
  championSlots: number;
  playLimitPerTurn: number;
}

export interface MatchState {
  turn: number;
  phase: 'start' | 'main' | 'battle' | 'resolve' | 'end';
  activePlayer: 'player' | 'opponent';
  log: string[];
  lastLLMResult?: any;
  rngSeed: string;
  rules: MatchRules;
}
