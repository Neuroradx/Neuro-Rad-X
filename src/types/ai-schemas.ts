import { z } from 'zod';

/**
 * @file Defines the Zod schemas for the AI-powered scientific article search flow.
 * These schemas ensure that the data passed to and from the AI model is well-structured and validated.
 */

/**
 * Schema for the input of the `findScientificArticleFlow`.
 * This structure provides the AI with the necessary context to find a relevant article.
 *
 * @property {string} questionStem - The main body of the medical question.
 * @property {string[]} options - An array of possible answers for the question.
 * @property {string} correctAnswer - The answer option that is believed to be correct.
 */
export const FindScientificArticleInputSchema = z.object({
  questionStem: z.string().describe("The main body of the medical question."),
  options: z.array(z.string()).describe("An array of possible answers for the question."),
  correctAnswer: z.string().describe("The answer option that is believed to be correct."),
});

/**
 * TypeScript type inferred from the `FindScientificArticleInputSchema`.
 * Provides static type checking for the input payload.
 */
export type FindScientificArticleInput = z.infer<typeof FindScientificArticleInputSchema>;

/**
 * Schema for the structured JSON output of the `findScientificArticleFlow`.
 * The AI returns validation + a PubMed-optimized query; the flow then calls PubMed API
 * and fills articleTitle, articleUrl, snippet from the first retrieved article.
 *
 * @property {boolean} isValid - Whether the provided `correctAnswer` is medically accurate.
 * @property {string} pubmed_query - PubMed search query (MeSH/Boolean) for the system to run.
 * @property {string[]} original_concepts - Key concepts extracted from the question and answer.
 * @property {string} reasoning - Brief explanation for validation and query design.
 * @property {string} [validated_correct_answer] - If incorrect, the correct option from the list.
 * @property {string} [articleTitle] - Filled by flow from PubMed efetch (first result).
 * @property {string} [articleUrl] - Filled by flow (PubMed or DOI link).
 * @property {string} [snippet] - Filled by flow from abstract when available.
 */
export const FindScientificArticleOutputSchema = z.object({
  isValid: z.boolean().describe("Whether the provided correctAnswer is medically accurate."),
  pubmed_query: z.string().describe("PubMed-optimized search query using MeSH/Boolean and date filter, ready for the API."),
  original_concepts: z.array(z.string()).describe("Key clinical/imaging concepts in English (key_concepts_en)."),
  reasoning: z.string().describe("Brief validation rationale and search logic (evidence filters applied)."),
  validated_correct_answer: z.string().optional().describe("If the original correctAnswer is incorrect, the correct option from the provided options."),
  evidence_sources: z.array(z.string()).optional().describe("Journals or source types included in the search (e.g. Cochrane, Lancet Neurology)."),
  articleTitle: z.string().optional().describe("Title of the first article retrieved by the system from PubMed."),
  articleUrl: z.string().optional().describe("URL to the article (PubMed or DOI)."),
  snippet: z.string().optional().describe("Relevant excerpt from the article abstract."),
  search_returned_zero_results: z.boolean().optional().describe("True when the PubMed API returned no articles for the query (high-evidence gap)."),
});

/**
 * TypeScript type inferred from the `FindScientificArticleOutputSchema`.
 * Provides static type checking for the AI model's response.
 */
export type FindScientificArticleOutput = z.infer<typeof FindScientificArticleOutputSchema>;

/** Status for quality checks: pass (green), warning (yellow), fail (red). */
export const QualityStatusSchema = z.enum(['pass', 'warning', 'fail']);
export type QualityStatus = z.infer<typeof QualityStatusSchema>;

/** Input for the question quality check flow. */
export const QuestionQualityInputSchema = z.object({
  questionStem: z.string(),
  options: z.array(z.string()),
  correctAnswerIndex: z.number(),
  articleReference: z.string().optional().nullable(),
});

/** Output: one status + message per dimension. */
export const QuestionQualityOutputSchema = z.object({
  questionWellFormed: QualityStatusSchema,
  questionMessage: z.string().optional(),
  optionsCoherent: QualityStatusSchema,
  optionsMessage: z.string().optional(),
  correctAnswerValid: QualityStatusSchema,
  correctAnswerMessage: z.string().optional(),
  referencePlausible: QualityStatusSchema,
  referenceMessage: z.string().optional(),
  overallReasoning: z.string().optional(),
});

export type QuestionQualityInput = z.infer<typeof QuestionQualityInputSchema>;
export type QuestionQualityOutput = z.infer<typeof QuestionQualityOutputSchema>;
