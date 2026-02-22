'use server';

import { ai } from '@/ai/genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import {
  QuestionQualityInputSchema,
  QuestionQualityOutputSchema,
  type QuestionQualityOutput,
} from '@/types/ai-schemas';
import { getQuestionQualityPrompt } from './question-quality-prompt';

/**
 * Try to resolve a URL (DOI or http) to verify the reference is real. Returns true if fetch succeeds (2xx).
 */
async function checkReferenceUrlResolves(articleReference: string | null | undefined): Promise<boolean | null> {
  if (!articleReference?.trim()) return null;
  const str = articleReference.trim();
  const doiMatch = str.match(/10\.\d{4,}\/[^\s)]+/);
  const urlMatch = str.match(/https?:\/\/[^\s)]+/);
  const url = doiMatch
    ? `https://doi.org/${doiMatch[0].replace(/[.,;:]+$/, '')}`
    : urlMatch
      ? urlMatch[0].replace(/[.,;:]+$/, '')
      : null;
  if (!url) return null;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}

export const questionQualityFlow = ai.defineFlow(
  {
    name: 'questionQualityFlow',
    inputSchema: QuestionQualityInputSchema,
    outputSchema: QuestionQualityOutputSchema,
  },
  async (input) => {
    const { questionStem, options, correctAnswerIndex, articleReference } = input;
    const prompt = getQuestionQualityPrompt(questionStem, options, correctAnswerIndex, articleReference ?? undefined);

    try {
      const llmResponse = await ai.generate({
        model: gemini20Flash,
        prompt,
        config: { temperature: 0.2 },
        output: { format: 'json', schema: QuestionQualityOutputSchema },
      });

      const output = (llmResponse.output || {}) as Record<string, unknown>;
      const safe = (v: unknown): 'pass' | 'warning' | 'fail' =>
        v === 'pass' || v === 'warning' || v === 'fail' ? v : 'warning';

      let referencePlausible = safe(output.referencePlausible);
      let referenceMessage = typeof output.referenceMessage === 'string' ? output.referenceMessage : undefined;

      if (articleReference?.trim()) {
        const resolves = await checkReferenceUrlResolves(articleReference);
        if (resolves === false) {
          referencePlausible = 'fail';
          referenceMessage = (referenceMessage ? `${referenceMessage}. ` : '') + 'URL/DOI did not resolve (possible hallucination).';
        } else if (resolves === true && referencePlausible === 'pass') {
          referenceMessage = (referenceMessage ? `${referenceMessage}. ` : '') + 'Reference URL resolved successfully.';
        }
      }

      const result: QuestionQualityOutput = {
        questionWellFormed: safe(output.questionWellFormed),
        questionMessage: typeof output.questionMessage === 'string' ? output.questionMessage : undefined,
        optionsCoherent: safe(output.optionsCoherent),
        optionsMessage: typeof output.optionsMessage === 'string' ? output.optionsMessage : undefined,
        correctAnswerValid: safe(output.correctAnswerValid),
        correctAnswerMessage: typeof output.correctAnswerMessage === 'string' ? output.correctAnswerMessage : undefined,
        referencePlausible,
        referenceMessage,
        overallReasoning: typeof output.overallReasoning === 'string' ? output.overallReasoning : undefined,
      };
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('[questionQualityFlow]', e);
      return {
        questionWellFormed: 'warning',
        questionMessage: `Analysis failed: ${message}`,
        optionsCoherent: 'warning',
        correctAnswerValid: 'warning',
        referencePlausible: 'warning',
        referenceMessage: `Analysis failed: ${message}`,
        overallReasoning: 'Quality check could not be completed.',
      };
    }
  }
);
