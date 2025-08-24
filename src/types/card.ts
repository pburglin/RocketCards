export type CardType = 'events' | 'champions' | 'tactics' | 'skills';
export type CardRarity = 'common' | 'rare' | 'unique';

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
  tokenCost?: number; // Cost in tokens for special cards
}
