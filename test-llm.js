// Simple test script to verify LLM integration
import { isLLMTurnResolverEnabled, getLLMBaseConfig } from './src/lib/llmConfig.js';
import { getOpponentStrategy, resolveEffectsWithLLM } from './src/lib/llmClient.js';

async function testLLM() {
  console.log('Testing LLM Integration...');
  
  // Check if LLM is enabled
  const enabled = isLLMTurnResolverEnabled();
  console.log('LLM Enabled:', enabled);
  
  if (!enabled) {
    console.log('LLM is not enabled. Set VITE_ENABLE_LLM_TURN_RESOLVER=true in .env');
    return;
  }
  
  // Get configuration
  const config = getLLMBaseConfig();
  console.log('LLM Config:', config);
  
  // Test connection
  try {
    console.log('Testing LLM connection...');
    
    // Create test game state
    const testMatchState = {
      turn: 1,
      phase: 'main',
      activePlayer: 'player',
      log: [],
      rules: {
        handLimit: 4,
        championSlots: 3,
        playLimitPerTurn: 1
      }
    };
    
    const testPlayerState = {
      id: 'player',
      hp: 28,
      mp: 6,
      maxHp: 30,
      maxMp: 10,
      fatigue: 0,
      hand: ['card1'],
      deck: [],
      discard: [],
      champions: [],
      extraPlaysRemaining: 1,
      flags: [],
      creaturesInPlay: []
    };
    
    const testOpponentState = {
      id: 'opponent',
      hp: 28,
      mp: 6,
      maxHp: 30,
      maxMp: 10,
      fatigue: 0,
      hand: ['card2'],
      deck: [],
      discard: [],
      champions: [],
      extraPlaysRemaining: 1,
      flags: [],
      creaturesInPlay: []
    };
    
    // Test opponent strategy
    console.log('Testing opponent strategy...');
    const strategyResponse = await getOpponentStrategy(testMatchState, testPlayerState, testOpponentState);
    console.log('Strategy Response:', strategyResponse);
    
    // Test effect resolution
    console.log('Testing effect resolution...');
    const effectResponse = await resolveEffectsWithLLM(testMatchState, testPlayerState, testOpponentState);
    console.log('Effect Resolution Response:', effectResponse);
    
    console.log('LLM Integration Test Complete!');
  } catch (error) {
    console.error('LLM Test Failed:', error);
  }
}

testLLM().catch(console.error);