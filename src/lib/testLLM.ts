// src/lib/testLLM.ts
import { getLLMBaseConfig, isLLMTurnResolverEnabled } from './llmConfig';
import { gameStateToJSON } from './llmClient';
import { PlayerState, MatchState } from '../types/game';

export const testLLMConnection = async () => {
  if (!isLLMTurnResolverEnabled()) {
    console.log('LLM is not enabled');
    return { success: false, message: 'LLM is not enabled' };
  }

  const config = getLLMBaseConfig();
  console.log('LLM Config:', config);

  // Create a simple test game state
  const testMatchState: MatchState = {
    turn: 1,
    phase: 'main',
    activePlayer: 'player',
    log: [],
    rules: {
      handLimit: 4,
      championSlots: 3,
      playLimitPerTurn: 1
    },
    timedMatch: false,
    mulliganEnabled: true,
    rngSeed: 'test123',
    turnInitiative: 'random',
    currentPlayerInTurn: 'first'
  };

  const testPlayerState: PlayerState = {
    id: 'player',
    hp: 28,
    mp: 6,
    maxHp: 30,
    maxMp: 10,
    fatigue: 0,
    hand: ['card1', 'card2'],
    deck: [],
    discard: [],
    champions: [],
    extraPlaysRemaining: 1,
    flags: [],
    creaturesInPlay: []
  };

  const testOpponentState: PlayerState = {
    id: 'opponent',
    hp: 28,
    mp: 6,
    maxHp: 30,
    maxMp: 10,
    fatigue: 0,
    hand: ['card3', 'card4'],
    deck: [],
    discard: [],
    champions: [],
    extraPlaysRemaining: 1,
    flags: [],
    creaturesInPlay: []
  };

  const gameState = gameStateToJSON(testMatchState, testPlayerState, testOpponentState);
  
  const prompt = `
${config.systemPrompt}

Test game state:
${JSON.stringify(gameState, null, 2)}

Respond with a simple JSON object: {"test": "success", "message": "LLM connection working"}
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
        num_predict: 100,
        temperature: 0.1,
        stop: ['\n\n']
      }
    } : {
      model: config.modelName,
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.1,
      stop: ['\n\n']
    };

    console.log('Testing LLM connection with request:', {
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

    console.log('LLM Response Status:', response.status);
    console.log('LLM Response Headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error Response:', errorText);
      return { success: false, message: `LLM API error: ${response.status} ${response.statusText}`, details: errorText };
    }

    const data = await response.json();
    console.log('LLM Response Data:', data);

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
    
    console.log('LLM Response Content:', content);

    return { success: true, message: 'LLM connection successful', data: content };
  } catch (error) {
    console.error('LLM Test Failed:', error);
    return { success: false, message: 'LLM test failed', error: error instanceof Error ? error.message : String(error) };
  }
};