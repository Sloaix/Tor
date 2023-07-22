import '@arco-design/web-react/dist/css/arco.css'
import { DEFAULT_ICON_CONFIGS, IconProvider } from '@icon-park/react'
import '@icon-park/react/styles/index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n'
import { initLanguage } from './i18n'
import './index.css'
import RouterView from './router/RouterView'
const IconConfig = { ...DEFAULT_ICON_CONFIGS, prefix: 'icon' }

const App = () => {
  return (
    <IconProvider value={IconConfig}>
      <React.StrictMode>
        <RouterView />
      </React.StrictMode>
    </IconProvider>
  )
}

const main = async () => {
  await initLanguage()
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}

main()
