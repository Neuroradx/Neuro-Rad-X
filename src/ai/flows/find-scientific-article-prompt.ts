/**
 * @file Defines the prompt for the findScientificArticleFlow.
 */

/**
 * Generates a prompt for the AI to find a scientific article.
 */
export const getPrompt = (questionStem: string, options: string[], correctAnswer: string) => `
  Act as an Expert Medical Research Assistant specializing in Neuroradiology. Academic context.

  Task:
  1. Analyze: "${questionStem}"
  2. Options: ${options.join(', ')}
  3. Verify if "${correctAnswer}" is correct based on medical literature (PubMed, Radiopaedia).

  Actions:
  - If answer is correct, set 'isValid' to true. Provide article details.
  - If incorrect, set 'isValid' to false, explain in 'reasoning', and suggest the correct option.

  Output:
  - Return ONLY a valid JSON object. No markdown.
  - Include 'articleTitle', 'articleUrl', and 'snippet' if valid.
`;
