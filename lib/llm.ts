/**
 * Unified LLM client with automatic fallback chain:
 * 1. Groq (free, 14,400 req/day, Llama 3.3 70B) — primary
 * 2. Gemini (free with billing enabled) — secondary
 * 3. Anthropic Claude — final fallback (costs money)
 *
 * Set only the keys you have. The client tries each in order and falls
 * back automatically. If all fail, it throws with a clear error.
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generate(options: GenerateOptions): Promise<string> {
  const { prompt, maxTokens = 4096, temperature = 0.1 } = options;
  const errors: string[] = [];

  // ── 1. Groq (free primary) ─────────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      });
      const text = completion.choices[0]?.message?.content;
      if (text && text.trim().length > 0) return text;
      throw new Error('Empty response from Groq');
    } catch (e: any) {
      const msg = e?.message?.slice(0, 100) || 'Unknown error';
      errors.push(`Groq: ${msg}`);
      console.warn('Groq failed, trying next provider:', msg);
    }
  }

  // ── 2. Gemini (free with billing) ─────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      });
      const text = result.response.text();
      if (text && text.trim().length > 0) return text;
      throw new Error('Empty response from Gemini');
    } catch (e: any) {
      const msg = e?.message?.slice(0, 100) || 'Unknown error';
      errors.push(`Gemini: ${msg}`);
      console.warn('Gemini failed, trying Anthropic:', msg);
    }
  }

  // ── 3. Anthropic Claude (paid fallback) ───────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      });
      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      return content.text;
    } catch (e: any) {
      const msg = e?.message?.slice(0, 100) || 'Unknown error';
      errors.push(`Anthropic: ${msg}`);
    }
  }

  throw new Error(
    `All LLM providers failed. Set at least one API key (GROQ_API_KEY recommended — free).\n${errors.join('\n')}`
  );
}
