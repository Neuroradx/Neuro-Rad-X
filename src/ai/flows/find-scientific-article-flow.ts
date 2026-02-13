'use server';

import { ai } from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { FindScientificArticleInputSchema, FindScientificArticleOutputSchema } from '@/types/ai-schemas';
import { getPrompt } from './find-scientific-article-prompt';

/**
 * @file Genkit flow to find scientific articles for medical questions.
 * Exports a callable flow wrapper for server actions.
 * Using Genkit 1.x syntax.
 */
export const findScientificArticleFlow = ai.defineFlow(
  {
    name: 'findScientificArticleFlow',
    inputSchema: FindScientificArticleInputSchema,
    outputSchema: FindScientificArticleOutputSchema,
  },
  async (input) => {
    const { questionStem, options, correctAnswer } = input;
    const prompt = getPrompt(questionStem, options, correctAnswer);

    try {
      const llmResponse = await ai.generate({
        model: gemini15Flash,
        prompt: prompt,
        config: {
          temperature: 0.1,
        },
        output: {
          format: 'json',
          schema: FindScientificArticleOutputSchema,
        },
      });

      const output = llmResponse.output;

      if (!output) {
        throw new Error("AI did not return a valid JSON object.");
      }

      return output;
    } catch (e: any) {
      console.error("AI Flow Error:", e);
      return {
        isValid: false,
        reasoning: `Error: ${e.message}`,
      };
    }
  }
);
