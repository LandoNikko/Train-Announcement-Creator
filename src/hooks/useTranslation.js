import { translations } from '../locales/translations'

export const useTranslation = (language) => {
  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key
  }

  return { t }
}

