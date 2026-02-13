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
 * This schema defines the expected response from the AI model, including validation of the answer and article details.
 *
 * @property {boolean} isValid - Whether the provided `correctAnswer` is medically accurate.
 * @property {string} [articleTitle] - The title of the scientific article found by the AI.
 * @property {string} [articleUrl] - The direct URL to the article or its PubMed/DOI page.
 * @property {string} [snippet] - A relevant excerpt from the article that supports the answer.
 * @property {string} reasoning - A brief medical explanation for the validation result, or the reason for an error if the answer is not valid.
 * @property {string} [validated_correct_answer] - If the original `correctAnswer` is incorrect, this field suggests the correct answer from the provided options.
 */
export const FindScientificArticleOutputSchema = z.object({
  isValid: z.boolean().describe("Whether the provided correctAnswer is medically accurate."),
  articleTitle: z.string().optional().describe("The title of the scientific article found by the AI."),
  articleUrl: z.string().optional().describe("The direct URL to the article or its PubMed/DOI page."),
  snippet: z.string().optional().describe("A relevant excerpt from the article that supports the answer."),
  reasoning: z.string().describe("A brief medical explanation for the validation result, or the reason for an error if the answer is not valid."),
  validated_correct_answer: z.string().optional().describe("If the original correctAnswer is incorrect, this field suggests the correct answer from the provided options."),
});

/**
 * TypeScript type inferred from the `FindScientificArticleOutputSchema`.
 * Provides static type checking for the AI model's response.
 */
export type FindScientificArticleOutput = z.infer<typeof FindScientificArticleOutputSchema>;
