# RocketCards - Browser-Based Card Game Platform

RocketCards is a browser-based online card game platform where players choose a themed card collection (Fantasy, Politics, Monsters, Anime, etc.), set a player profile, build a deck, and battle an AI or human opponent. Game state and round effects are resolved in collaboration with a configurable LLM via an OpenAI Completions-compatible API.

## Overview

RocketCards combines classic card game strategy with cutting-edge AI to create dynamic, ever-evolving gameplay experiences. The platform features:

- Multiple themed card collections with unique mechanics
- Deep customization through player profiles and deck building
- AI-powered effect resolution for dynamic gameplay
- Beautiful, responsive UI with immersive animations
- Local persistence for profiles, decks, and matches

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Installation

1. Clone the repository (or start from this template)
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file from the example:
```bash
cp .env.example .env
```
4. Update `.env` with your LLM API key and configuration

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Configuration

### Environment Variables

All game parameters and LLM configuration are controlled through environment variables. See `.env.example` for a complete list.

Key configuration options:

- `LLM_API_*`: Configure your LLM provider (OpenAI-compatible API)
- `GAME_*`: Tune game mechanics like deck size, starting resources, etc.
- `ENABLE_*`: Toggle features like timed matches and AI opponents

### Card Collections

Card collections are defined in JSON files in `public/cards/`:

```
public/
  └── cards/
      ├── fantasy.json
      ├── politics.json
      ├── monsters.json
      └── anime.json
```

Each collection follows this schema:

```json
{
  "collection": "fantasy",
  "version": "1.0.0",
  "cards": [
    {
      "id": "champion_dragon_unbound",
      "title": "Dragon Unbound",
      "description": "Ancient dragon breaks its chains and takes flight over a burning citadel",
      "imageDescription": "Ancient red dragon breaking chains above a burning citadel, smoke and fire, dramatic sky",
      "type": "champions",
      "rarity": "unique",
      "effect": "On summon: deal 3 damage to all enemy champions; When attacking: +2 damage if MP >= 5",
      "cost": { "HP": 0, "MP": -5, "fatigue": 0 },
      "tags": ["reaction:false","duration:persistent"],
      "flavor": "Freedom paid in fire.",
      "collection": "fantasy"
    }
  ]
}
```

## Game Mechanics

### Player Profile

Players choose a strategy (Aggressive, Balanced, Defensive) and key stat (Strength, Intelligence, Charisma) which affects their starting HP and MP:

- **HP** = 24 + (8 if Strength is key stat, else 2) + (4 if Defensive, 2 if Balanced, 0 if Aggressive)
- **MP** = 6 + (6 if Intelligence is key stat, else 2) + (0 if Defensive, 2 if Balanced, 4 if Aggressive)

### Turn Structure

1. **Start phase**: Draw card, handle reshuffle penalties
2. **Main phase**: Play cards (1 per turn by default)
3. **Battle phase**: Champion actions and skill activations
4. **LLM resolution phase**: Resolve effects with LLM
5. **End phase**: Cleanup and discard down to hand limit

### Deck Building

- Deck size: 30 cards
- Copy limits: Common ≤ 4, Rare ≤ 2, Unique ≤ 1
- Starting hand: 5 cards with one mulligan allowed

## Development

### Architecture

The application follows a modular architecture:

- `src/`: Main application code
  - `components/`: Reusable UI components
  - `pages/`: Application views
  - `store/`: Zustand state management
  - `lib/`: Game engine and utilities
  - `types/`: TypeScript interfaces
  - `assets/`: Static assets

### Adding New Features

1. **New card collection**:
   - Create a new JSON file in `public/cards/`
   - Follow the collection schema
   - The app will automatically detect and load it

2. **New game mechanics**:
   - Update `src/lib/gameEngine.ts`
   - Add new card types or effects as needed
   - Update the LLM system prompt in `.env`

3. **UI improvements**:
   - Modify components in `src/components/`
   - Update Tailwind configuration in `tailwind.config.js`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Sound effects from Mixkit - https://mixkit.co/free-sound-effects/game/