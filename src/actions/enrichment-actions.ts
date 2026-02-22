'use server';

import { adminDb } from '@/lib/firebase-admin';
import { findScientificArticleFlow } from '@/ai/flows/find-scientific-article-flow';
import { questionQualityFlow } from '@/ai/flows/question-quality-flow';
import type { FindScientificArticleInput, FindScientificArticleOutput, QuestionQualityInput, QuestionQualityOutput } from '@/types/ai-schemas';
import { Timestamp } from 'firebase-admin/firestore';
import { verifyAdminRole } from '@/lib/auth-helpers';

/**
 * @fileOverview Acciones de servidor para el enriquecimiento de preguntas con IA.
 * Implementa la búsqueda de fuentes científicas y estadísticas de progreso.
 */

/**
 * Función de utilidad para convertir recursivamente Timestamps de Firestore a cadenas ISO.
 * Necesario para Next.js 15 al devolver datos desde Server Actions a Client Components.
 */
function serializeTimestamps(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Manejar Timestamp de Firestore (Admin SDK)
  if (obj instanceof Timestamp || (typeof obj.toDate === 'function')) {
    return obj.toDate().toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeTimestamps(item));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = serializeTimestamps(obj[key]);
    }
  }
  return newObj;
}

/**
 * Acción para buscar un artículo científico individual usando el flujo de IA.
 * Requiere rol admin.
 */
export async function findScientificArticleAction(
  input: FindScientificArticleInput,
  callerUid: string
): Promise<{ success: boolean; data?: FindScientificArticleOutput; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  try {
    // Llamada directa al flujo de Genkit 1.x
    const result = await findScientificArticleFlow(input);
    return { 
      success: true, 
      data: serializeTimestamps(result) 
    };
  } catch (error: any) {
    console.error("Error en findScientificArticleAction:", error);
    return { 
      success: false, 
      error: error.message || "No se pudo encontrar el artículo mediante IA." 
    };
  }
}

/**
 * Runs the question quality check flow (question phrasing, options, correct answer, reference plausibility).
 * Requires admin role.
 */
export async function runQuestionQualityCheckAction(
  input: QuestionQualityInput,
  callerUid: string
): Promise<{ success: boolean; data?: QuestionQualityOutput; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  try {
    const result = await questionQualityFlow(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error en runQuestionQualityCheckAction:', error);
    return { success: false, error: error.message || 'Quality check failed.' };
  }
}

/**
 * Obtiene estadísticas del estado de enriquecimiento bibliográfico en la base de datos.
 * Requiere rol admin.
 */
export async function getQuestionEnrichmentStats(callerUid: string): Promise<{ success: boolean; total?: number; enriched?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: "Admin SDK no inicializado." };

  try {
    const questionsRef = adminDb.collection('questions');
    
    // Conteo total de documentos
    const totalSnapshot = await questionsRef.count().get();
    
    // Conteo de preguntas que ya tienen referencia científica (campo no nulo)
    const enrichedQuery = questionsRef.where('scientificArticle.article_reference', '!=', null);
    const enrichedSnapshot = await enrichedQuery.count().get();

    return {
      success: true,
      total: totalSnapshot.data().count,
      enriched: enrichedSnapshot.data().count
    };
  } catch (error: any) {
    console.error("Error al obtener estadísticas de enriquecimiento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Procesa preguntas en lotes para buscar fuentes bibliográficas automáticamente.
 * Requiere rol admin.
 */
export async function enrichQuestionsWithSources(
  batchSize: number,
  lastDocId: string | null,
  callerUid: string
) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: "Admin SDK no inicializado." };

  try {
    let query = adminDb.collection('questions')
      .where('scientificArticle.article_reference', '==', null)
      .limit(batchSize);

    if (lastDocId) {
      const lastDoc = await adminDb.collection('questions').doc(lastDocId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return { success: true, processed: 0, updated: 0, nextCursor: null };
    }

    let updatedCount = 0;
    const nextCursor = snapshot.docs[snapshot.size - 1].id;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const en = data.translations?.en;
      
      if (en && en.questionText) {
        const options = (en.options || []).map((o: any) => o.text);
        const correctIdx = data.correctAnswerIndex ?? 0;
        const correctAnswer = options[correctIdx] || "";

        if (correctAnswer) {
          // Ejecutar flujo de IA para validación y búsqueda
          const aiResult = await findScientificArticleFlow({
            questionStem: en.questionText,
            options,
            correctAnswer
          });

          // Solo actualizar si la IA encontró una fuente válida
          if (aiResult.isValid && aiResult.articleTitle && aiResult.articleUrl) {
            await doc.ref.update({
              'scientificArticle.article_reference': `${aiResult.articleTitle}. Disponible en: ${aiResult.articleUrl}`,
              'scientificArticle.explanation': aiResult.snippet || null,
              'lastUpdatedAt': Timestamp.now()
            });
            updatedCount++;
          }
        }
      }
    }

    return { 
      success: true, 
      processed: snapshot.size, 
      updated: updatedCount, 
      nextCursor: snapshot.size < batchSize ? null : nextCursor 
    };
  } catch (error: any) {
    console.error("Error en enriquecimiento masivo por lotes:", error);
    return { success: false, error: error.message };
  }
}
