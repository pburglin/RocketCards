# RocketCards - Browser-Based Card Game Platform

[https://rocketcards.netlify.app/](https://rocketcards.netlify.app/)

RocketCards is a browser-based online card game platform where players choose a themed card collection (Fantasy, Politics, Monsters, Anime, etc.), set a player profile, build a deck, and battle an AI or human opponent. Game state and round effects are resolved in collaboration with a configurable LLM via an OpenAI Completions-compatible API.

## Overview

RocketCards combines classic card game strategy with cutting-edge AI to create dynamic, ever-evolving gameplay experiences. The platform features:

- Multiple themed card collections with unique mechanics
- Deep customization through player profiles and deck building
- Configurable AI opponents (Basic deterministic or Advanced LLM-powered)
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

- `VITE_LLM_*`: Configure your LLM provider (OpenAI-compatible API)
- `VITE_ENABLE_LLM_TURN_RESOLVER`: Enable LLM-based opponent AI and effect resolution
- `GAME_*`: Tune game mechanics like deck size, starting resources, etc.
- `VITE_ENABLE_*`: Toggle features like timed matches and AI opponents

### AI Configuration

When `VITE_ENABLE_LLM_TURN_RESOLVER=true`, the Play Lobby will show both "Basic AI" (deterministic algorithm) and "Advanced AI" (LLM-powered) options. By default, "Advanced AI" is selected when LLM is enabled, but you can switch to "Basic AI" for deterministic gameplay.

### LLM Configuration

RocketCards supports any OpenAI-compatible API for LLM integration, including local LLMs via Ollama. The LLM is used for:

- **Opponent AI Strategy**: Advanced decision-making for AI opponents (when Advanced AI is selected in Play Lobby)
- **Effect Resolution**: Deterministic resolution of complex card interactions

To enable LLM features:

1. Set `VITE_ENABLE_LLM_TURN_RESOLVER=true` in your `.env` file
2. Configure your LLM provider:
   - `VITE_LLM_API_ENDPOINT`: Your LLM API endpoint (e.g., "https://api.openai.com/v1/completions" or "http://localhost:11434" for Ollama)
   - `VITE_LLM_API_KEY`: Your API key (use "ollama" for Ollama)
   - `VITE_LLM_MODEL_NAME`: Model to use (e.g., "gpt-3.5-turbo-instruct" or "llama3")

### Local LLM Setup with Ollama

For local development, you can use Ollama with models like Llama 3. This is recommended for testing and development:

1. Install Ollama from [https://ollama.com/](https://ollama.com/)
2. Pull a compatible model (Llama 3 is recommended):
   ```bash
   ollama pull llama3
   ```
   Or try other models like:
   ```bash
   ollama pull qwen2.5:14b  # 14B parameter model
   ollama pull qwen2.5:7b   # 7B parameter model (faster)
   ```
3. Start the Ollama service (usually starts automatically after installation):
   ```bash
   ollama serve
   ```
4. Configure your `.env` file for Ollama:
   ```env
   VITE_ENABLE_LLM_TURN_RESOLVER=true
   VITE_LLM_API_ENDPOINT="http://localhost:11434"
   VITE_LLM_API_KEY="ollama"  # Ollama doesn't require a real key
   VITE_LLM_MODEL_NAME="llama3"
   VITE_LLM_MAX_TOKENS=2000
   VITE_LLM_TEMPERATURE=0.7
   ```

**Note**: When using Ollama locally, make sure the Ollama service is running before starting the game. The service typically runs on port 11434.

### Testing LLM Connection

When LLM is enabled (`VITE_ENABLE_LLM_TURN_RESOLVER=true`), you can test your LLM connection from the Play Lobby page by clicking the "Test LLM Connection" button. This button is now visible whenever LLM is enabled, not just when Advanced AI is selected. The test sends a dummy prompt to verify that your LLM configuration is working correctly before starting a match.

To prevent abuse, the test button is disabled for 1 minute after each click.

### Cloud LLM Providers

#### OpenAI
```env
VITE_ENABLE_LLM_TURN_RESOLVER=true
VITE_LLM_API_ENDPOINT="https://api.openai.com/v1/completions"
VITE_LLM_API_KEY="your_openai_api_key"
VITE_LLM_MODEL_NAME="gpt-3.5-turbo-instruct"
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### Anthropic Claude
```env
VITE_ENABLE_LLM_TURN_RESOLVER=true
VITE_LLM_API_ENDPOINT="https://api.anthropic.com/v1/completions"
VITE_LLM_API_KEY="your_anthropic_api_key"
VITE_LLM_MODEL_NAME="claude-2"
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### Google Gemini
```env
VITE_ENABLE_LLM_TURN_RESOLVER=true
VITE_LLM_API_ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
VITE_LLM_API_KEY="your_google_api_key"
VITE_LLM_MODEL_NAME="gemini-pro"
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

#### OpenRouter (Recommended free option)
```env
VITE_ENABLE_LLM_TURN_RESOLVER=true
VITE_LLM_API_ENDPOINT="https://openrouter.ai/api/v1/chat/completions"
VITE_LLM_API_KEY="your_openrouter_api_key"
VITE_LLM_MODEL_NAME="qwen/qwen3-14b:free"  # Free model
VITE_LLM_MAX_TOKENS=2000
VITE_LLM_TEMPERATURE=0.7
```

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
4. **End phase**: Cleanup and discard down to hand limit

**Note**: When LLM is enabled, card effect resolution happens automatically after each card play, and opponent AI decisions are made using LLM when Advanced AI is selected.

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