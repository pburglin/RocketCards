# RocketCards - Browser-Based Card Game Platform

[https://rocketcards.netlify.app/](https://rocketcards.netlify.app/)

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

## Image Export CLI

### Overview

The RocketCards Image Export CLI tool allows you to download all card images from pollinations.ai to your local filesystem for offline use. This helps reduce API dependency and improves loading performance.

### Usage

```bash
# Export all images with default settings
npm run export-images

# Export with custom delay and retry settings
npm run export-images -- --delay 2000 --retries 5

# Export specific collections only
npm run export-images -- --collections fantasy,monsters

# Export to custom directory
npm run export-images -- --output ./my-card-images

# Force overwrite existing images
npm run export-images -- --force_overwrite

# Export as PNG instead of WEBP
npm run export-images -- --force_png

# Remove safe=true parameter for better image generation
npm run export-images -- --force-no-safe

# Combine multiple options
npm run export-images -- --force_overwrite --force-no-safe
```

### Options

- `--delay <ms>` or `-d <ms>`: Delay between image downloads in milliseconds (default: 1000)
- `--retries <count>` or `-r <count>`: Number of retry attempts per image (default: 3)
- `--output <dir>` or `-o <dir>`: Output directory for images (default: public/images/cards)
- `--collections <list>` or `-c <list>`: Comma-separated list of collections to export (default: all)
- `--force_overwrite` or `-f`: Force overwrite existing local images (default: false)
- `--force_png` or `-p`: Request PNG images instead of WEBP (default: false)
- `--force-no-safe` or `-s`: Remove safe=true parameter from requests (default: false)
- `--help` or `-h`: Show help message

### Features

- **Configurable Throttling**: Prevents rate limiting with customizable delays
- **Retry Mechanism**: Automatically retries failed downloads
- **Progress Tracking**: Shows detailed progress and results
- **Error Handling**: Comprehensive error reporting and recovery
- **Batch Processing**: Processes collections one at a time
- **Collection Image Export**: Downloads collection images in addition to card images
- **Format Selection**: Choose between WEBP (default) and PNG formats
- **Safe Mode Control**: Toggle safe mode for better image generation
- **Overwrite Protection**: Skip existing images unless forced to overwrite

## License & Attributions

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Attributions

- Sound effects provided by Mixkit. Visit [https://mixkit.co/free-sound-effects/game/](https://mixkit.co/free-sound-effects/game/) for more free game sound effects.
- Card images generated using AI technology provided by pollinations.ai. All card artwork and visual elements are created through AI generation services.