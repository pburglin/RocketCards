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
}
