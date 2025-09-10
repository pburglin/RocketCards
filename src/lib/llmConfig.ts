// src/lib/llmConfig.ts
export interface LLMConfig {
  apiEndpoint: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  enableLLMTurnResolver: boolean;
}

// Load configuration from environment variables (Vite only exposes VITE_ prefixed variables to client-side)
export const getLLMConfig = (): LLMConfig => {
  return {
    apiEndpoint: import.meta.env.VITE_LLM_API_ENDPOINT || "http://localhost:11434",
    apiKey: import.meta.env.VITE_LLM_API_KEY || "ollama",
    modelName: import.meta.env.VITE_LLM_MODEL_NAME || "gpt-oss:20b",
    maxTokens: parseInt(import.meta.env.VITE_LLM_MAX_TOKENS || "2048"),
    temperature: parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || "0.7"),
    systemPrompt: import.meta.env.VITE_LLM_SYSTEM_PROMPT || "You are the RocketCards engine. Resolve effects deterministically based on the game state and card effects. Return a JSON patch with resource deltas and board changes.",
    enableLLMTurnResolver: (import.meta.env.VITE_ENABLE_LLM_TURN_RESOLVER || "false").toLowerCase() === "true"
  };
};

// Check if LLM turn resolver is enabled
export const isLLMTurnResolverEnabled = (): boolean => {
  return getLLMConfig().enableLLMTurnResolver;
};

// Get base configuration for API calls
export const getLLMBaseConfig = () => {
  const config = getLLMConfig();
  return {
    endpoint: config.apiEndpoint,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    modelName: config.modelName,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    systemPrompt: config.systemPrompt
  };
};