import { useLanguageStore } from '../store/language.store';
import { tr, TranslationKeys } from '../i18n/locales/tr';
import { en } from '../i18n/locales/en';

const translations: Record<'tr' | 'en', TranslationKeys> = {
  tr,
  en,
};

export const translate = (key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
  const language = useLanguageStore.getState()?.language || 'tr';
  let str = translations[language]?.[key] || translations['tr'][key] || String(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    });
  }
  return str;
};

export const useTranslation = () => {
  const { language, setLanguage } = useLanguageStore();

  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
    let str = translations[language]?.[key] || translations['tr'][key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    return str;
  };

  return {
    t,
    language,
    setLanguage,
  };
};
