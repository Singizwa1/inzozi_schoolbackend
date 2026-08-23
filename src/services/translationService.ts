import crypto from 'crypto';
import { translate } from 'google-translate-api-x';
import { TranslationCache } from '../database/models/TranslationCache';

// Only 'rw' and 'fr' are ever requested - 'en' (the source language everything
// is authored in) is always a no-op passthrough, never sent to the API or cache.
export type TargetLang = 'rw' | 'fr';
const SUPPORTED_TARGET_LANGS: readonly string[] = ['rw', 'fr'];

const hashFor = (targetLang: string, text: string): string =>
  crypto.createHash('sha256').update(`${targetLang}:${text}`).digest('hex');

/**
 * Translates a single piece of user-authored freeform text (school mission,
 * gallery caption, rejection reason, etc). Uses Google's public web-translate
 * endpoint (no API key/billing) via `google-translate-api-x` - unofficial and
 * unsupported by Google, so it can be rate-limited or blocked without notice.
 * Returns the original text unchanged if:
 *  - the target language isn't one we support (including 'en', the source language)
 *  - the text is empty
 *  - the translate call fails or is blocked for any reason
 * Successful translations are cached indefinitely by content hash, so the
 * same School.mission is only ever looked up once per target language -
 * keeping real call volume low, which is what this unofficial route tolerates best.
 */
export const translateText = async (text: string | null | undefined, targetLang: string): Promise<string> => {
  if (!text || !SUPPORTED_TARGET_LANGS.includes(targetLang)) return text ?? '';

  const hash = hashFor(targetLang, text);
  const cached = await TranslationCache.findOne({ where: { sourceHash: hash, targetLang } });
  if (cached) return cached.translatedText;

  try {
    const result = await translate(text, { to: targetLang });
    const translated = Array.isArray(result) ? result[0]?.text ?? text : result.text;
    await TranslationCache.create({ sourceHash: hash, targetLang, sourceText: text, translatedText: translated });
    return translated;
  } catch (err) {
    console.error(`Translation failed (targetLang=${targetLang}):`, err);
    return text;
  }
};

/**
 * Translates several fields of one record in a single batched call (one
 * round trip instead of one per field). Fields already in `cached` are
 * skipped; only genuine cache misses are sent together. Returns a new
 * object - never mutates `fields`.
 */
export const translateFields = async <T extends Record<string, string | null | undefined>>(
  fields: T,
  targetLang: string
): Promise<T> => {
  if (!SUPPORTED_TARGET_LANGS.includes(targetLang)) return fields;

  const entries = Object.entries(fields).filter(([, v]) => !!v) as [string, string][];
  if (entries.length === 0) return fields;

  const result: Record<string, string> = {};
  const misses: [string, string][] = [];

  for (const [key, value] of entries) {
    const hash = hashFor(targetLang, value);
    const cached = await TranslationCache.findOne({ where: { sourceHash: hash, targetLang } });
    if (cached) {
      result[key] = cached.translatedText;
    } else {
      misses.push([key, value]);
    }
  }

  if (misses.length > 0) {
    try {
      const translations = await translate(
        misses.map(([, v]) => v),
        { to: targetLang }
      );
      const translatedList = Array.isArray(translations) ? translations : [translations];
      await Promise.all(
        misses.map(([key, value], i) => {
          const translated = translatedList[i]?.text ?? value;
          result[key] = translated;
          return TranslationCache.create({
            sourceHash: hashFor(targetLang, value),
            targetLang,
            sourceText: value,
            translatedText: translated,
          });
        })
      );
    } catch (err) {
      console.error(`Batch translation failed (targetLang=${targetLang}):`, err);
      misses.forEach(([key, value]) => { result[key] = value; });
    }
  }

  return { ...fields, ...result } as T;
};
