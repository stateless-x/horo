import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

export const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * Generate a fortune reading using Claude
 */
export async function generateFortuneReading(
  prompt: string,
  maxTokens: number = 500
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response type from Claude');
}
