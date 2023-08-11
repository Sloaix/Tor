import { Button } from '@arco-design/web-react'
import { useTranslation } from 'react-i18next'
import { version } from '../../package.json'

export default () => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex flex-col items-center py-8">
        <div className="w-[6rem]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 580 580">
            <circle cx="290" cy="290" r="270" stroke="#000" strokeWidth="40" />
            <path
              stroke="#000"
              strokeWidth="40"
              d="M40 195h500m-281 5v340m202-346-15.724 4.88C348.269 228.983 276.318 310.917 259 411"
            />
          </svg>
        </div>

        <div className="font-bold mt-6 space-x-2">
          <span className="text-2xl">Tor</span>
          <span className="text-md text-gray-500">v{version}</span>
        </div>
        <p className="text-gray-600 text-center mt-4">{t('page.about.intro')}</p>
      </div>

      <div className="flex flex-col items-center mt-4">
        <Button
          type="primary"
          size="large"
          onClick={() => {
            // 用外部浏览器打开
            window.open('https://github.com/sloaix/tor')
          }}
        >
          {t('page.about.repo')}
        </Button>
        <div className="text-sm text-gray-500 mt-2 space-x-2">
          <span>{t('page.about.author')}</span>
          <span>Sloaix</span>
        </div>
      </div>
    </div>
  )
}
