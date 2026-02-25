import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { SYSTEM_PROMPT } from './prompts';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * Generate a fortune reading using Gemini 2.5 Flash
 *
 * All fortune readings use the same mystical narrator system prompt
 * to ensure consistent tone and voice across all features.
 *
 * The LLM NEVER runs on the frontend - all calls go through this backend API.
 */
export async function generateFortuneReading(
  prompt: string,
  maxTokens: number = 500
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.8, // Slightly higher for more creative/mystical responses
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}
