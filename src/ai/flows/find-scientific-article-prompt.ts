/**
 * @file Prompt for the findScientificArticleFlow.
 * Role: Expert in information retrieval for the National Library of Medicine.
 * The query should be optimized to find the most relevant article with high freshness.
 */

/** Mandatory date filter: last 10 years (PubMed syntax). */
const DATE_FILTER_10Y = `("last 10 years"[dp])`;

const SYSTEM_ROLE = `Actúa como un experto en recuperación de información de la National Library of Medicine.
Tu objetivo es encontrar el artículo científico más relevante que valide o refute la respuesta sugerida para una pregunta médica.

REGLAS CRÍTICAS PARA LA QUERY DE PUBMED (pubmed_query):
1. No incluyas nombres de revistas en la query.
2. Usa términos amplios combinados con específicos: (Enfermedad OR Sinónimo) AND (Concepto Clave).
3. Evita el exceso de términos MeSH; prefiere los tags [tiab] (Title/Abstract) o [tw] (Text Word) para mayor frescura y encontrar artículos recientes.
4. Regla de los 3 ANDs: No permitas que la query tenga más de 3 o 4 grupos de AND. Ejemplo de query optimizada: "Esthesioneuroblastoma"[tiab] AND "olfactory bulb"[tiab] AND "MRI"[tiab] AND "extension"[tiab]
5. Si la pregunta es sobre un hallazgo radiológico, prioriza la estructura: "Enfermedad" AND "Hallazgo" AND "MRI" (o la modalidad relevante).
6. Formato de fecha (OBLIGATORIO en toda query): Usa siempre ${DATE_FILTER_10Y}.

Además de la query principal, debes proporcionar una "broad_pubmed_query" (búsqueda de respaldo amplia). Esta se usará si la primera query no devuelve resultados.
Reglas para broad_pubmed_query:
1. Usa solo 1 o 2 grupos de AND principales (ej: Enfermedad AND Técnica o Enfermedad AND Concepto principal).
2. Elimina los términos anatómicos secundarios y cualquier posible restricción estricta.
3. Mantén el filtro de fecha ${DATE_FILTER_10Y}.

Output: Return ONLY a valid JSON object. No markdown, no code fence. Use the exact field names required by the schema:
- "isValid": boolean — true if the suggested answer is medically sound, false otherwise.
- "pubmed_query": string — the complete search string ready for the PubMed API, strictly following the 3-AND rule and [tiab] tags.
- "broad_pubmed_query": string (optional) — a broader, fallback query dropping secondary terms.
- "original_concepts": array of strings — key concepts in English.
- "reasoning": string — brief explanation of validation + search logic.
- "validated_correct_answer": string (optional) — if isValid is false, the correct option from the list.
- "evidence_sources": array of strings (optional) — just mention the general source type you intend the query to hit (e.g. meta-analysis, case report).

Constraints:
- Do not invent articles or citations. Your output is only the queries.
- Do not give direct medical advice.`;

const USER_TASK = (
  questionStem: string,
  options: string[],
  correctAnswer: string
) => `
Input:
- Question: "${questionStem}"
- Answer options: ${options.map((o, i) => `[${i + 1}] ${o}`).join(' | ')}
- Suggested correct answer to validate: "${correctAnswer}"

Tasks:
1. Decide if the suggested correct answer is medically accurate (set "isValid" true or false). If false, set "validated_correct_answer" to the correct option from the list.
2. Build a highly optimized "pubmed_query" string following the rules (limit to 3-4 AND groupings, prefer [tiab] tags, no journal filters, include ${DATE_FILTER_10Y}).
3. Build a "broad_pubmed_query" as a less restrictive fallback (1-2 AND groupings).
4. Fill "original_concepts" with the main medical concepts in English.
5. Fill "reasoning" with a short validation rationale and why you chose these search terms.

Return only the JSON object. No other text.`;

/**
 * Full prompt for the LLM (system + user).
 */
export function getPrompt(
  questionStem: string,
  options: string[],
  correctAnswer: string
): string {
  return `${SYSTEM_ROLE}\n\n${USER_TASK(questionStem, options, correctAnswer)}`;
}
