# Lógica de la función IA para buscar artículo científico

Documento que describe el flujo completo de **"Find Source with AI"**: desde la pulsación del botón en Admin hasta la actualización de la referencia del artículo y los mensajes mostrados al usuario.

---

## 1. Objetivo

- **Validar** si la respuesta correcta marcada por el editor es médicamente correcta.
- **Generar** una query de búsqueda optimizada para PubMed (MeSH, filtros de evidencia y de fecha).
- **Ejecutar** esa query en la API de PubMed y devolver el **primer artículo** encontrado (título, URL y, si aplica, snippet).
- **Rellenar** en el formulario la referencia científica y mostrar en un log la query, conceptos, fuentes de evidencia y mensajes de “sin resultados” o “respuesta incorrecta”.

---

## 2. Arquitectura (capas)

```
[UI: Edit Question / Review Questions]
         │
         ▼
[Server Action: findScientificArticleAction]  ← verifica rol admin (callerUid)
         │
         ▼
[Genkit Flow: findScientificArticleFlow]
         │
         ├──► [LLM: Gemini 1.5 Flash] + prompt "Gold Standard"
         │         └── JSON: isValid, pubmed_query, original_concepts, reasoning, evidence_sources, ...
         │
         └──► [PubMed E-utilities: esearch + esummary]
                   └── primer artículo → articleTitle, articleUrl, snippet
```

- **Entrada:** pregunta, opciones y respuesta correcta sugerida.
- **Salida:** validación (isValid), query PubMed, conceptos, razonamiento, fuentes de evidencia, y —si la búsqueda devuelve algo— título, URL y snippet del primer artículo; además un flag `search_returned_zero_results` cuando PubMed no devuelve resultados.

---

## 3. Entrada (input)

Definida en `src/types/ai-schemas.ts` (`FindScientificArticleInputSchema`):

| Campo           | Tipo     | Descripción                                      |
|-----------------|----------|--------------------------------------------------|
| `questionStem`  | string   | Enunciado de la pregunta (p. ej. traducción EN).|
| `options`       | string[] | Texto de cada opción de respuesta.              |
| `correctAnswer` | string   | Opción que el editor ha marcado como correcta.  |

La UI obtiene estos valores del formulario (Edit Question: `values.translations.en.questionText`, `values.translations.en.options`, y la opción marcada como correcta).

---

## 4. Flujo del Genkit Flow (`findScientificArticleFlow`)

Ubicación: `src/ai/flows/find-scientific-article-flow.ts`.

1. **Construcción del prompt**  
   Se llama a `getPrompt(questionStem, options, correctAnswer)` (definido en `find-scientific-article-prompt.ts`). El prompt incluye:
   - Rol: "Gold Standard" Scientific Validation Engineer.
   - Filtro temporal obligatorio (últimos 10 años).
   - Listas de revistas: Priority 1 (evidencia: Cochrane, JBI, BMJ EBM, Syst Rev, Campbell) y lista dorada (Radiology, AJNR, Lancet Neurol, etc.).
   - Instrucciones para devolver un **único JSON** con los campos del schema de salida.

2. **Llamada al LLM**  
   - Modelo: **Gemini 1.5 Flash** (Genkit + Google AI).  
   - `temperature: 0.1`.  
   - Salida forzada en **JSON** según `FindScientificArticleOutputSchema`.

3. **Parseo de la respuesta**  
   Se extraen del objeto devuelto por la IA:
   - `pubmed_query`, `original_concepts`, `evidence_sources`, `isValid`, `reasoning`, `validated_correct_answer`, etc.

4. **Ejecución en PubMed**  
   - Si `pubmed_query` no está vacío:
     - Se llama a `findFirstPubMedArticle(pubmed_query)` (`src/ai/lib/pubmed-api.ts`).
     - Internamente: **esearch** (hasta 3 PMIDs) → **esummary** (detalle del primero).
   - Si hay artículo: se rellenan `articleTitle`, `articleUrl` y `snippet` (primeros 500 caracteres del abstract si existe).
   - Si no hay artículo o hay error de red/API: se marca `search_returned_zero_results: true`.

5. **Respuesta del flow**  
   Se devuelve un objeto que cumple `FindScientificArticleOutputSchema`, con todos los campos normalizados (incl. `search_returned_zero_results` y `evidence_sources` opcionales).

6. **Manejo de errores**  
   Si el LLM o el parseo fallan, el flow devuelve `isValid: false`, `reasoning: "Error: ..."`, y no se ejecuta PubMed.

---

## 5. Prompt (Gold Standard)

Ubicación: `src/ai/flows/find-scientific-article-prompt.ts`.

- **Rol:** Experto en Recuperación de Información Biomédica; transforma pregunta + respuesta en una búsqueda PubMed de alta evidencia.
- **Filtro de fecha:** Obligatorio en toda query:  
  `("2016/01/01"[Date - Publication] : "3000"[Date - Publication])`.
- **Estructura de la query:**  
  `(Conceptos MeSH / términos) AND (revistas preferidas en OR) AND (filtro de fecha)`.
- **Revistas:**  
  - Priority 1: Cochrane Database Syst Rev, JBI Evid Synth, Campbell Syst Rev, BMJ Evid Based Med, Syst Rev (abreviaturas NLM).  
  - Lista dorada: Radiology, Radiol Artif Intell, Lancet Digit Health, Radiographics, Eur Radiol, Invest Radiol, AJR Am J Roentgenol, y el resto definido en `GOLDEN_JOURNALS_SPECIALTY` (todas con sufijo `[Journal]`).
- **Salida esperada (JSON):**
  - `isValid`, `pubmed_query`, `original_concepts`, `reasoning`, `validated_correct_answer` (opcional), `evidence_sources` (opcional).
- **Restricciones:** No inventar artículos; la IA solo genera la query; el sistema es quien ejecuta PubMed.

---

## 6. API de PubMed

Ubicación: `src/ai/lib/pubmed-api.ts`.

- **Base URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`.
- **searchPubMed(query, retmax)**  
  - `esearch.fcgi`: `db=pubmed`, `term=<query>`, `retmode=json`, `retmax` (por defecto 5; el flow usa 3).
  - Devuelve lista de PMIDs.
- **fetchPubMedArticles(pmids)**  
  - `esummary.fcgi`: obtiene título y metadatos para los PMIDs; se usa el primer resultado válido.
  - Devuelve `{ pmid, title, abstract?, url }` con `url = https://pubmed.ncbi.nlm.nih.gov/<pmid>/`.
- **findFirstPubMedArticle(query)**  
  - Ejecuta `searchPubMed(query, 3)` y luego `fetchPubMedArticles(ids)`; devuelve el primer artículo o `null`.

Si la query es muy restrictiva (10 años + revistas de alto impacto) y PubMed devuelve 0 resultados, el flow no rellena artículo y pone `search_returned_zero_results: true`.

---

## 7. Salida (output)

Definida en `FindScientificArticleOutputSchema`:

| Campo                      | Tipo     | Descripción breve                                                                 |
|----------------------------|----------|-----------------------------------------------------------------------------------|
| `isValid`                  | boolean  | Si la respuesta correcta sugerida es médicamente adecuada.                        |
| `pubmed_query`             | string   | Query completa enviada a PubMed (con filtro de fecha y revistas).                 |
| `original_concepts`       | string[] | Conceptos clave en inglés.                                                       |
| `reasoning`                | string   | Justificación de la validación y de la estrategia de búsqueda.                   |
| `validated_correct_answer` | string?  | Si `isValid === false`, opción que la IA considera correcta.                      |
| `evidence_sources`        | string[]?| Revistas o tipos de fuente incluidos en la búsqueda.                              |
| `articleTitle`             | string?  | Título del primer artículo devuelto por PubMed (rellenado por el flow).          |
| `articleUrl`               | string?  | URL del artículo (PubMed o DOI) (rellenado por el flow).                         |
| `snippet`                  | string?  | Fragmento del abstract (rellenado por el flow, máx. 500 caracteres).              |
| `search_returned_zero_results` | boolean? | `true` si la query se ejecutó pero PubMed no devolvió ningún artículo.       |

---

## 8. Server Action

Ubicación: `src/actions/enrichment-actions.ts` → `findScientificArticleAction(input, callerUid)`.

- **Autorización:** `verifyAdminRole(callerUid)`; si falla, devuelve `{ success: false, error: 'Unauthorized access.' }`.
- **Ejecución:** Llama a `findScientificArticleFlow(input)`.
- **Serialización:** Los datos devueltos se pasan por `serializeTimestamps` para convertir cualquier `Timestamp` de Firestore en string ISO (compatibilidad con Client Components).
- **Respuesta:**  
  - Éxito: `{ success: true, data: FindScientificArticleOutput }`.  
  - Error: `{ success: false, error: string }`.

---

## 9. Uso en la UI

### Edit Question (`src/app/admin/edit-question/page.tsx`)

- **Botón "Find Source with AI":** Requiere tener una opción marcada como correcta y usuario autenticado.
- **Llamada:** `findScientificArticleAction({ questionStem, options, correctAnswer }, currentUser.uid)`.
- **Log mostrado al usuario:**
  - Query PubMed, conceptos, evidence_sources.
  - Si `search_returned_zero_results`: mensaje de advertencia indicando que no se encontró evidencia de alto impacto en los últimos 10 años.
  - Si hay artículo: éxito con título y URL; se rellena `scientificArticle.article_reference` con `"<articleTitle>. Available at: <articleUrl>"`.
  - Si `!isValid`: advertencia de respuesta posiblemente incorrecta y, si existe, la respuesta sugerida por la IA.
  - Siempre que exista: reasoning y snippet si aplica.

### Review Questions (`src/app/admin/review-questions/page.tsx`)

- Misma acción con el enunciado y opciones del ítem en revisión.
- Si `search_returned_zero_results`: toast de “No high-impact evidence…” y no se rellena referencia.
- Si hay artículo: se actualiza la referencia sugerida y toast “Source Found”.
- Si validado pero sin URL: toast “Validated” sin rellenar referencia.

---

## 10. Resumen del flujo de datos

1. Usuario marca la respuesta correcta y pulsa "Find Source with AI".
2. La UI recoge pregunta, opciones y respuesta correcta y llama a `findScientificArticleAction(..., callerUid)`.
3. La Server Action verifica admin y ejecuta `findScientificArticleFlow`.
4. El flow construye el prompt Gold Standard y llama al LLM (Gemini 1.5 Flash); obtiene JSON con validación y `pubmed_query`.
5. El flow ejecuta `findFirstPubMedArticle(pubmed_query)` (esearch + esummary) y rellena título, URL y snippet del primer resultado, o marca `search_returned_zero_results` si no hay resultados o hay error.
6. La acción devuelve el output serializado a la UI.
7. La UI muestra en el log la query, conceptos, fuentes de evidencia, mensaje de “sin evidencia” si aplica, y rellena la referencia del artículo cuando existe `articleTitle` y `articleUrl`.

---

## Referencia de archivos

| Componente        | Archivo |
|-------------------|--------|
| Schema entrada/salida | `src/types/ai-schemas.ts` |
| Prompt            | `src/ai/flows/find-scientific-article-prompt.ts` |
| Flow Genkit       | `src/ai/flows/find-scientific-article-flow.ts` |
| API PubMed        | `src/ai/lib/pubmed-api.ts` |
| Server Action     | `src/actions/enrichment-actions.ts` |
| UI Edit Question  | `src/app/admin/edit-question/page.tsx` |
| UI Review Questions | `src/app/admin/review-questions/page.tsx` |
| Verificación journals | `docs/journals-pubmed-nlm-verification.md` |
