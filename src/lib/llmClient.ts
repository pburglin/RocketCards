// src/lib/llmClient.ts
import { getLLMBaseConfig, isLLMTurnResolverEnabled } from './llmConfig';
import { PlayerState, MatchState } from '../types/game';

// Define the structure for LLM responses
export interface LLMPlayDecision {
  cardId: string;
  reason: string;
}

export interface LLMStrategyResponse {
  plays: LLMPlayDecision[];
  endTurn: boolean;
}

export interface LLMResolutionResponse {
  playerDelta: {
    hp?: number;
    mp?: number;
    fatigue?: number;
  };
  opponentDelta: {
    hp?: number;
    mp?: number;
    fatigue?: number;
  };
  logEntries: string[];
}

// Convert game state to JSON format for LLM
export const gameStateToJSON = (matchState: MatchState, playerState: PlayerState, opponentState: PlayerState) => {
  return {
    match: {
      turn: matchState.turn,
      phase: matchState.phase,
      activePlayer: matchState.activePlayer,
      rules: matchState.rules
    },
    player: {
      hp: playerState.hp,
      mp: playerState.mp,
      fatigue: playerState.fatigue,
      hand: playerState.hand,
      champions: playerState.champions,
      creaturesInPlay: playerState.creaturesInPlay
    },
    opponent: {
      hp: opponentState.hp,
      mp: opponentState.mp,
      fatigue: opponentState.fatigue,
      hand: opponentState.hand,
      champions: opponentState.champions,
      creaturesInPlay: opponentState.creaturesInPlay
    }
  };
};

// Call LLM API for opponent strategy decisions
export const getOpponentStrategy = async (
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): Promise<LLMStrategyResponse> => {
  if (!isLLMTurnResolverEnabled()) {
    throw new Error('LLM turn resolver is not enabled');
  }

  const config = getLLMBaseConfig();
  const gameState = gameStateToJSON(matchState, playerState, opponentState);

  const prompt = `
${config.systemPrompt}

Current game state:
${JSON.stringify(gameState, null, 2)}

Based on the opponent's hand and the current battlefield situation, determine the best strategy for the opponent's turn. 
Return a JSON response with the following structure:
{
  "plays": [
    {
      "cardId": "string - ID of card to play",
      "reason": "string - brief explanation of why this card was chosen"
    }
  ],
  "endTurn": "boolean - whether to end the turn after playing cards"
}

Guidelines:
- Only return cards that are actually in the opponent's hand
- Consider costs and whether the opponent can afford to play the cards
- Prioritize strategic plays that advance the opponent's position
- You can play multiple cards if the opponent has enough resources
- Set endTurn to true when no more beneficial plays can be made
`;

  try {
    // Check if this is Ollama (localhost) to adjust request format
    const isOllama = config.endpoint.includes('localhost:11434') || config.endpoint.includes('127.0.0.1:11434');
    
    // Adjust endpoint and headers for Ollama
    const endpoint = isOllama ? 'http://localhost:11434/api/generate' : config.endpoint;
    const headers = isOllama ? { 'Content-Type': 'application/json' } : config.headers;
    
    const requestBody = isOllama ? {
      model: config.modelName,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature,
        stop: ['\n\n']
      }
    } : {
      model: config.modelName,
      prompt: prompt,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stop: ['\n\n']
    };
    
    console.log('LLM Strategy Request:', {
      endpoint: endpoint,
      isOllama: isOllama,
      headers: headers,
      body: requestBody
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('LLM Strategy Raw Response:', {
      status: response.status,
      data: data
    });
    
    // Handle different response formats (OpenAI vs Ollama)
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].text) {
      // OpenAI format
      content = data.choices[0].text;
    } else if (data.response) {
      // Ollama format (old format)
      content = data.response;
    } else if (data.message && data.message.content) {
      // Ollama chat format
      content = data.message.content;
    } else if (typeof data === 'string') {
      // Direct string response
      content = data;
    } else {
      // Try to find response in other possible fields
      content = JSON.stringify(data);
    }
    
    console.log('LLM Strategy Extracted Content:', content);
    
    try {
      // Try to extract JSON from the response
      let jsonString = content.trim();
      
      // Remove any markdown code blocks if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
      }
      
      const parsedResponse = JSON.parse(jsonString);
      console.log('LLM Strategy Parsed Response:', parsedResponse);
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content, parseError);
      // Try to extract JSON from the response using regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('LLM Strategy Parsed Response (regex extracted):', parsedResponse);
          return parsedResponse;
        } catch (regexParseError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0], regexParseError);
        }
      }
      // Return a safe default response
      return {
        plays: [],
        endTurn: true
      };
    }
  } catch (error) {
    console.error('LLM API call failed:', error);
    // Return a safe default response
    return {
      plays: [],
      endTurn: true
    };
  }
};

// Call LLM API for effect resolution
export const resolveEffectsWithLLM = async (
  matchState: MatchState,
  playerState: PlayerState,
  opponentState: PlayerState
): Promise<LLMResolutionResponse> => {
  if (!isLLMTurnResolverEnabled()) {
    throw new Error('LLM turn resolver is not enabled');
  }

  const config = getLLMBaseConfig();
  const gameState = gameStateToJSON(matchState, playerState, opponentState);

  const prompt = `
${config.systemPrompt}

Current game state after card plays:
${JSON.stringify(gameState, null, 2)}

Resolve all card effects and determine the resulting changes to player and opponent states.
Return a JSON response with the following structure:
{
  "playerDelta": {
    "hp": "number - change in player HP (positive for gain, negative for loss)",
    "mp": "number - change in player MP (positive for gain, negative for loss)",
    "fatigue": "number - change in player fatigue (positive for increase)"
  },
  "opponentDelta": {
    "hp": "number - change in opponent HP (positive for gain, negative for loss)",
    "mp": "number - change in opponent MP (positive for gain, negative for loss)",
    "fatigue": "number - change in opponent fatigue (positive for increase)"
  },
  "logEntries": ["string - descriptive log messages of what happened"]
}

Guidelines:
- Calculate exact numerical changes based on card effects
- Include descriptive log entries for each effect that occurs
- Be deterministic and consistent in your calculations
- Consider all cards that were played this turn
- Account for interactions between multiple card effects
`;

  try {
    // Check if this is Ollama (localhost) to adjust request format
    const isOllama = config.endpoint.includes('localhost:11434') || config.endpoint.includes('127.0.0.1:11434');
    
    // Adjust endpoint and headers for Ollama
    const endpoint = isOllama ? 'http://localhost:11434/api/generate' : config.endpoint;
    const headers = isOllama ? { 'Content-Type': 'application/json' } : config.headers;
    
    const requestBody = isOllama ? {
      model: config.modelName,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature,
        stop: ['\n\n']
      }
    } : {
      model: config.modelName,
      prompt: prompt,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stop: ['\n\n']
    };
    
    console.log('LLM Effect Resolution Request:', {
      endpoint: endpoint,
      isOllama: isOllama,
      headers: headers,
      body: requestBody
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('LLM Effect Resolution Raw Response:', {
      status: response.status,
      data: data
    });
    
    // Handle different response formats (OpenAI vs Ollama)
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].text) {
      // OpenAI format
      content = data.choices[0].text;
    } else if (data.response) {
      // Ollama format (old format)
      content = data.response;
    } else if (data.message && data.message.content) {
      // Ollama chat format
      content = data.message.content;
    } else if (typeof data === 'string') {
      // Direct string response
      content = data;
    } else {
      // Try to find response in other possible fields
      content = JSON.stringify(data);
    }
    
    console.log('LLM Effect Resolution Extracted Content:', content);
    
    try {
      // Try to extract JSON from the response
      let jsonString = content.trim();
      
      // Remove any markdown code blocks if present
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
      }
      
      const parsedResponse = JSON.parse(jsonString);
      console.log('LLM Effect Resolution Parsed Response:', parsedResponse);
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content, parseError);
      // Try to extract JSON from the response using regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          console.log('LLM Effect Resolution Parsed Response (regex extracted):', parsedResponse);
          return parsedResponse;
        } catch (regexParseError) {
          console.error('Failed to parse extracted JSON:', jsonMatch[0], regexParseError);
        }
      }
      // Return a safe default response
      return {
        playerDelta: {},
        opponentDelta: {},
        logEntries: []
      };
    }
  } catch (error) {
    console.error('LLM API call failed:', error);
    // Return a safe default response
    return {
      playerDelta: {},
      opponentDelta: {},
      logEntries: []
    };
  }
};