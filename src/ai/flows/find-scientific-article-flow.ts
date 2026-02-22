'use server';

import { ai } from '@/ai/genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import { FindScientificArticleInputSchema, FindScientificArticleOutputSchema } from '@/types/ai-schemas';
import { getPrompt } from './find-scientific-article-prompt';
import { findFirstPubMedArticle } from '@/ai/lib/pubmed-api';

/**
 * @file Genkit flow to find scientific articles for medical questions.
 * 1) AI acts as Biomedical Query Engineer: validates answer and builds a PubMed-optimized query.
 * 2) Flow runs that query against PubMed and attaches the first real article (title, URL).
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
        model: gemini20Flash,
        prompt: prompt,
        config: {
          temperature: 0.1,
        },
        output: {
          format: 'json',
          schema: FindScientificArticleOutputSchema,
        },
      });

      const output = llmResponse.output as Record<string, unknown>;

      if (!output || typeof output !== 'object') {
        throw new Error("AI did not return a valid JSON object.");
      }

      const pubmedQuery = typeof output.pubmed_query === 'string' ? output.pubmed_query : '';
      const originalConcepts = Array.isArray(output.original_concepts) ? output.original_concepts : [];
      const evidenceSources = Array.isArray(output.evidence_sources) ? output.evidence_sources : [];

      let searchReturnedZeroResults = false;
      if (pubmedQuery) {
        try {
          const article = await findFirstPubMedArticle(pubmedQuery);
          if (article) {
            output.articleTitle = article.title;
            output.articleUrl = article.url;
            if (article.abstract) output.snippet = article.abstract.slice(0, 500);
          } else {
            searchReturnedZeroResults = true;
          }
        } catch (pubmedErr: unknown) {
          console.warn("[findScientificArticleFlow] PubMed fetch failed:", pubmedErr);
          searchReturnedZeroResults = true;
        }
      }

      return {
        isValid: Boolean(output.isValid),
        pubmed_query: pubmedQuery,
        original_concepts: originalConcepts,
        reasoning: typeof output.reasoning === 'string' ? output.reasoning : '',
        validated_correct_answer: typeof output.validated_correct_answer === 'string' ? output.validated_correct_answer : undefined,
        evidence_sources: evidenceSources.length > 0 ? evidenceSources : undefined,
        articleTitle: typeof output.articleTitle === 'string' ? output.articleTitle : undefined,
        articleUrl: typeof output.articleUrl === 'string' ? output.articleUrl : undefined,
        snippet: typeof output.snippet === 'string' ? output.snippet : undefined,
        search_returned_zero_results: searchReturnedZeroResults || undefined,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("AI Flow Error:", e);
      return {
        isValid: false,
        pubmed_query: '',
        original_concepts: [],
        reasoning: `Error: ${message}`,
        search_returned_zero_results: undefined,
      };
    }
  }
);
