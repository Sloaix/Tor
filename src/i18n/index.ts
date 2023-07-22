import { ipcRenderer } from 'electron'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import EN from './en'
import HANS from './hans'

const resources = {
  en: {
    translation: EN
  },
  hans: {
    translation: HANS
  }
}

const getLanguage = async () => {
  const locale = await ipcRenderer.invoke('get-system-locale')
  console.log(`locale: ${locale}`)
  const hans = ['hans', 'zh-Hans', 'zh-cn', 'zh-hans-cn', 'zh-sg', 'zh-hans-sg']

  if (hans.some((l) => l.toLowerCase() === locale.toLowerCase())) {
    return 'hans'
  }

  return 'en'
}

export const initLanguage = async () => {
  let lang = await getLanguage()

  i18n.use(initReactI18next).init({
    resources: resources,
    lng: lang,
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
}

export default i18n
