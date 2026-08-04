/**
 * Unified LLM client with automatic fallback.
 * Tries Gemini first (free), falls back to Anthropic if Gemini fails or isn't configured.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export type LLMProvider = 'gemini' | 'anthropic';

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generate text using the best available LLM.
 * Tries Gemini first, falls back to Anthropic automatically.
 */
export async function generate(options: GenerateOptions): Promise<string> {
  const { prompt, maxTokens = 4096, temperature = 0.1 } = options;

  // Try Gemini first if key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      return result.response.text();
    } catch (geminiError: any) {
      console.warn('Gemini failed, falling back to Anthropic:', geminiError.message?.slice(0, 100));
      // Fall through to Anthropic
    }
  }

  // Fallback to Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Anthropic');
    return content.text;
  }

  throw new Error('No LLM configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY.');
}
