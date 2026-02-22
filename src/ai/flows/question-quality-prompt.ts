/**
 * Prompt for the question quality check flow.
 * Evaluates: question phrasing, options coherence, correct answer validity, reference plausibility.
 */

const SYSTEM_ROLE = `You are an expert medical education assessor. Your task is to evaluate the quality of a multiple-choice question (stem, options, correct answer) and the plausibility of its scientific reference.

For each dimension return exactly one of: "pass", "warning", or "fail".
- pass: No issues; meets standards.
- warning: Minor issues or ambiguity; could be improved.
- fail: Serious problem; should be corrected before use.

Dimensions:
1. questionWellFormed: Is the question stem clear, unambiguous, and correctly phrased for a single best answer? (grammar, clarity, clinical accuracy)
2. optionsCoherent: Do all options relate to the question and are they plausible distractors? Are they parallel in structure and length where appropriate?
3. correctAnswerValid: Is the option marked as correct actually the correct answer to the question (medically and logically)?
4. referencePlausible: Does the cited reference look like a real publication (journal/article format, plausible title, DOI/URL pattern)? If no reference is provided, return "warning" with message "No reference to check."

Return ONLY a valid JSON object with these exact keys:
- questionWellFormed, questionMessage (optional)
- optionsCoherent, optionsMessage (optional)
- correctAnswerValid, correctAnswerMessage (optional)
- referencePlausible, referenceMessage (optional)
- overallReasoning (optional, brief summary)
Use only "pass", "warning", or "fail" as values for the four status fields.`;

export function getQuestionQualityPrompt(
  questionStem: string,
  options: string[],
  correctAnswerIndex: number,
  articleReference: string | null | undefined
): string {
  const correctAnswer = options[correctAnswerIndex] ?? '';
  const refText = articleReference?.trim() || '(No reference provided)';
  return `${SYSTEM_ROLE}

Input:
- Question stem: "${questionStem}"
- Options: ${options.map((o, i) => `[${i}] ${o}`).join(' | ')}
- Index of correct answer: ${correctAnswerIndex} (text: "${correctAnswer}")
- Scientific reference: "${refText}"

Evaluate each dimension and return the JSON object only. No markdown, no code fence.`;
}
