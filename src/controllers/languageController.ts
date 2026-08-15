import { Request, Response } from 'express';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n/i18n.config';
import { ResponseService } from '../utils/response';
import { asString } from '../utils/helper';

export const getTranslation = (req: Request, res: Response) => {
  const lang = asString(req.query.lang) || 'en';
  const key = asString(req.query.key);

  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return ResponseService({
      data: null,
      status: 400,
      success: false,
      message: `Unsupported language '${lang}'. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
      res,
    });
  }

  if (key) {
    const translation = i18n.t(key, { lng: lang });
    return ResponseService({
      data: { language: lang, translation },
      status: 200,
      success: true,
      message: 'Translation fetched successfully',
      res,
    });
  }

  const bundle = i18n.getResourceBundle(lang, 'translation');
  return ResponseService({
    data: { language: lang, translations: bundle },
    status: 200,
    success: true,
    message: 'Translations fetched successfully',
    res,
  });
};

export const listLanguages = (_req: Request, res: Response) => {
  return ResponseService({
    data: SUPPORTED_LANGUAGES,
    status: 200,
    success: true,
    message: 'Supported languages fetched successfully',
    res,
  });
};
