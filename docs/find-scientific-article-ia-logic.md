# Lógica de la función IA para buscar artículo científico

Documento que describe el flujo completo de **"Find Source with AI"**: desde la pulsación del botón en Admin hasta la actualización de la referencia del artículo y los mensajes mostrados al usuario.

---

## 1. Objetivo

- **Validar** si la respuesta correcta marcada por el editor es médicamente correcta.
- **Generar** una query de búsqueda optimizada para PubMed (basada en [tiab] o [tw], regla de los 3-ANDs y últimos 10 años).
- **Ejecutar** esa query en la API de PubMed y devolver el **primer artículo** encontrado (título, URL y, si aplica, snippet).
- **Hacer un Fallback** automático con una query amplia si la primera estrategia no retorna resultados.
- **Rellenar** en el formulario la referencia científica y mostrar en un log la query, uso de fallback, conceptos y mensajes de validez.

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
         ├──► [LLM: Gemini 1.5 Flash] + prompt de optimización NLM
         │         └── JSON: isValid, pubmed_query, broad_pubmed_query, original_concepts, reasoning, ...
         │
         └──► [PubMed E-utilities: esearch + esummary]
                   └── primer artículo de pubmed_query
                   └── si falla → buscar primer artículo de broad_pubmed_query
                   └── articleTitle, articleUrl, snippet
```

- **Entrada:** pregunta, opciones y respuesta correcta sugerida.
- **Salida:** validación (isValid), query PubMed (y su broad fallback), conceptos, razonamiento, y —si la búsqueda devuelve algo— título, URL y snippet del primer artículo; además unos flags `search_returned_zero_results` y `used_broad_query` si PubMed falló la primera / devuelve resultados con respaldo.

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
   - Rol: Experto en la National Library of Medicine.
   - Filtro temporal obligatorio (últimos 10 años: `"last 10 years"[dp]`).
   - Instrucciones orientadas a utilizar etiquetas `[tiab]` en lugar de MeSH restrictivos, eliminar filtros de nombres de revistas en la query (esos se filtran a posteriori o simplemente se prioriza frecura) y respetar la "regla de los 3 ANDs".
   - Mandato para generar un plan de contingencia: `broad_pubmed_query` combinando a simple vista "(Enfermedad OR sinónimos) AND (Concepto clave)".
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
   - Si no hay artículo (o 0 resultados) y existe un `broad_pubmed_query`, se vuelve a llamar a `findFirstPubMedArticle` usando la query amplia y se marca `used_broad_query: true`.
   - Si hay artículo (tras cualquiera de los 2 intentos): se rellenan `articleTitle`, `articleUrl` y `snippet`.
   - Si no hay artículo tras ambos intentos: se marca `search_returned_zero_results: true`.

5. **Respuesta del flow**  
   Se devuelve un objeto que cumple `FindScientificArticleOutputSchema`, con todos los campos normalizados (incluyendo banderas de validación y de fallback).

6. **Manejo de errores**  
   Si el LLM o el parseo fallan, el flow devuelve `isValid: false`, `reasoning: "Error: ..."`, y no se ejecuta PubMed.

---

## 5. Prompt (Estrategia Menos-Es-Más)

Ubicación: `src/ai/flows/find-scientific-article-prompt.ts`.

- **Rol:** Experto en Recuperación de Información de la NLM.
- **Filtro de fecha:** Obligatorio en toda query: `"last 10 years"[dp]`.
- **Regla de los 3 ANDs:** La consulta optimizada se divide como máximo en 3~4 conjuntos AND, priorizando el tag `[tiab]` para lograr mayor frescura sobre los MeSH y evitando filtrar revistas por su nombre (para no generar conjuntos vacíos).
- **Ejemplo radiológico estructurado:** `"Enfermedad" AND "Hallazgo" AND "MRI"`.
- **Query Auxiliar:** `broad_pubmed_query` que obvia ramificaciones menores enfocándose exclusívamente en 1 o 2 conceptos madre.
- **Salida esperada (JSON):**
  - `isValid`, `pubmed_query`, `broad_pubmed_query`, `original_concepts`, `reasoning`, `validated_correct_answer` (opcional), `evidence_sources` (opcional).
- **Restricciones:** No inventar artículos; la IA solo genera las queries; el sistema es quien ejecuta PubMed.

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

Si la query es muy restrictiva y PubMed devuelve 0 resultados, se intenta usar de respaldo la `broad_pubmed_query`. Si a pesar del fallback no hay resultados, se marca `search_returned_zero_results: true`.

---

## 7. Salida (output)

Definida en `FindScientificArticleOutputSchema`:

| Campo                      | Tipo     | Descripción breve                                                                 |
|----------------------------|----------|-----------------------------------------------------------------------------------|
| `isValid`                  | boolean  | Si la respuesta correcta sugerida es médicamente adecuada.                        |
| `pubmed_query`             | string   | Query completa enviada a PubMed (estructurada con tags [tiab] y filtro de fechas).|
| `broad_pubmed_query`       | string?  | Fallback con query amplia (1-2 ANDs).                                             |
| `original_concepts`       | string[] | Conceptos clave en inglés.                                                       |
| `reasoning`                | string   | Justificación de la validación y de la estrategia de búsqueda.                   |
| `validated_correct_answer` | string?  | Si `isValid === false`, opción que la IA considera correcta.                      |
| `evidence_sources`        | string[]?| Tipo de evidencia a la cual la IA apunta de forma heurística.                     |
| `articleTitle`             | string?  | Título del primer artículo devuelto por PubMed.                                  |
| `articleUrl`               | string?  | URL del artículo.                                                                |
| `snippet`                  | string?  | Fragmento del abstract (máx. 500 caracteres).                                     |
| `search_returned_zero_results` | boolean? | `true` si todas las queries probadas retornaron 0 resultados.               |
| `used_broad_query`         | boolean? | `true` si la query estructural falló y se requirió buscar el broad query.         |

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
