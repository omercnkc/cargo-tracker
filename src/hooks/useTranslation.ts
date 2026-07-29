import { useLanguageStore } from '../store/language.store';
import { tr, TranslationKeys } from '../i18n/locales/tr';
import { en } from '../i18n/locales/en';

const translations: Record<'tr' | 'en', TranslationKeys> = {
  tr,
  en,
};

export const useTranslation = () => {
  const { language, setLanguage } = useLanguageStore();

  const t = (key: keyof TranslationKeys): string => {
    return translations[language][key] || translations['tr'][key] || String(key);
  };

  return {
    t,
    language,
    setLanguage,
  };
};
