/**
 * Helpers for displaying topic (main_localization) and subtopic labels consistently.
 * Use instead of inline "General → categoryOther" and subcategoryDisplayNames logic.
 */
import { subcategoryDisplayNames } from "@/lib/constants";

type TFunction = (key: string, opts?: { defaultValue?: string; [k: string]: unknown }) => string;

/**
 * Returns the display label for a main category (main_localization).
 * Maps "General" to the "Other" category translation.
 */
export function getTopicDisplayName(
  mainLocalization: string | undefined,
  t: TFunction
): string {
  if (!mainLocalization) return "";
  if (mainLocalization === "General") {
    return t("studyMode.categoryOther");
  }
  return t(`topics.${mainLocalization.toLowerCase()}`, { defaultValue: mainLocalization });
}

/**
 * Returns the display label for a subtopic (sub_main_location) key.
 * Uses subcategoryDisplayNames when available, otherwise falls back to subtopics.* translation.
 */
export function getSubtopicDisplayName(
  subtopicKey: string | undefined,
  t: TFunction
): string {
  if (!subtopicKey) return "";
  const translationKey = subcategoryDisplayNames[subtopicKey] ?? `subtopics.${subtopicKey.toLowerCase()}`;
  return t(translationKey as string, { defaultValue: subtopicKey });
}
