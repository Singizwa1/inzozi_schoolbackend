import { Router } from 'express';
import { getTranslation, listLanguages } from '../controllers/languageController';

const router = Router();

/**
 * @swagger
 * /api/i18n/languages:
 *   get:
 *     summary: List supported languages
 *     tags: [Internationalization]
 *     responses:
 *       200:
 *         description: List of supported language codes
 */
router.get('/i18n/languages', listLanguages);

/**
 * @swagger
 * /api/i18n:
 *   get:
 *     summary: Get translations for a language, or a single key
 *     tags: [Internationalization]
 *     parameters:
 *       - name: lang
 *         in: query
 *         schema:
 *           type: string
 *           enum: [en, fr, rw]
 *           default: en
 *       - name: key
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: If provided, returns just that key's translation
 *     responses:
 *       200:
 *         description: Translation(s) fetched successfully
 *       400:
 *         description: Unsupported language
 */
router.get('/i18n', getTranslation);

export default router;
