'use server';

import { ai } from '@/ai/genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import {
  QuestionQualityInputSchema,
  QuestionQualityOutputSchema,
  type QuestionQualityOutput,
} from '@/types/ai-schemas';
import { getQuestionQualityPrompt } from './question-quality-prompt';
import * as cheerio from 'cheerio';

/**
 * Try to resolve a URL (DOI or http) and extract basic metadata (Title, Description) to verify relevance.
 */
async function fetchReferenceMetadata(articleReference: string | null | undefined): Promise<{ resolves: boolean | null; metadata: string | null }> {
  if (!articleReference?.trim()) return { resolves: null, metadata: null };
  const str = articleReference.trim();
  const doiMatch = str.match(/10\.\d{4,}\/[^\s)]+/);
  const urlMatch = str.match(/https?:\/\/[^\s)]+/);
  const url = doiMatch
    ? `https://doi.org/${doiMatch[0].replace(/[.,;:]+$/, '')}`
    : urlMatch
      ? urlMatch[0].replace(/[.,;:]+$/, '')
      : null;
  if (!url) return { resolves: null, metadata: null };
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) return { resolves: false, metadata: null };

    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

    const metadataStr = `Title: ${title.trim()} | Description: ${description.trim()}`.trim();
    return { resolves: true, metadata: metadataStr.length > 20 ? metadataStr : null };
  } catch {
    return { resolves: false, metadata: null };
  }
}

export const questionQualityFlow = ai.defineFlow(
  {
    name: 'questionQualityFlow',
    inputSchema: QuestionQualityInputSchema,
    outputSchema: QuestionQualityOutputSchema,
  },
  async (input) => {
    const { questionStem, options, correctAnswerIndex, explanation, articleReference } = input;

    // 1. Fetch metadata BEFORE the LLM call to provide semantic context
    const { resolves, metadata } = await fetchReferenceMetadata(articleReference);

    const prompt = getQuestionQualityPrompt(questionStem, options, correctAnswerIndex, explanation, articleReference ?? undefined, metadata);

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

      // 2. Override LLM output if the URL actually failed to resolve
      if (articleReference?.trim()) {
        if (resolves === false) {
          referencePlausible = 'fail';
          referenceMessage = (referenceMessage ? `${referenceMessage}. ` : '') + 'URL/DOI did not resolve (possible hallucination/dead link).';
        } else if (resolves === true && referencePlausible === 'pass') {
          referenceMessage = (referenceMessage ? `${referenceMessage}. ` : '') + 'Reference URL resolved and content matched successfully.';
        }
      }

      const result: QuestionQualityOutput = {
        questionWellFormed: safe(output.questionWellFormed),
        questionMessage: typeof output.questionMessage === 'string' ? output.questionMessage : undefined,
        optionsCoherent: safe(output.optionsCoherent),
        optionsMessage: typeof output.optionsMessage === 'string' ? output.optionsMessage : undefined,
        correctAnswerValid: safe(output.correctAnswerValid),
        correctAnswerMessage: typeof output.correctAnswerMessage === 'string' ? output.correctAnswerMessage : undefined,
        explanationClarity: safe(output.explanationClarity),
        explanationMessage: typeof output.explanationMessage === 'string' ? output.explanationMessage : undefined,
        referencePlausible,
        referenceMessage,
        evidenceLevel: typeof output.evidenceLevel === 'string' ? output.evidenceLevel : undefined,
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
        explanationClarity: 'warning',
        referencePlausible: 'warning',
        referenceMessage: `Analysis failed: ${message}`,
        evidenceLevel: 'Unknown',
        overallReasoning: 'Quality check could not be completed.',
      } as QuestionQualityOutput;
    }
  }
);
