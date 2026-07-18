import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en'
import ru from './ru'

// Russian-only instance: force 'ru' and skip browser language detection.
// 'en' is kept only as a silent fallback for any not-yet-translated key.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    lng: 'ru',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en,
      ru,
    },
  })
}
