import classNames from 'classnames'
import { name } from '../../../package.json'

export default ({ className }: { className?: string }) => {
  return (
    <div
      data-tauri-drag-region
      className={classNames(
        className,
        'z-[99999] px-4 flex justify-between items-center w-full border-b-[1px] border-gray-200 select-none py-2'
      )}
    >
      <div className="inline-flex justify-center items-end shrink-0 space-x-2">
        <div className="w-[1.4rem] mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 580 580">
            <circle cx="290" cy="290" r="270" stroke="#000" stroke-width="40" />
            <path
              stroke="#000"
              stroke-width="40"
              d="M40 195h500m-281 5v340m202-346-15.724 4.88C348.269 228.983 276.318 310.917 259 411"
            />
          </svg>
        </div>
        <div className="text-gray-700 space-x-1">
          <span className="font-bold text-2xl leading-none">
            {/* 首字母大写 */}
            {name.replace(/^\S/, (s) => s.toUpperCase())}
          </span>
        </div>
      </div>
    </div>
  )
}
