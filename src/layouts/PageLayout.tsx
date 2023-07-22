import { Button, Tooltip } from '@arco-design/web-react/es'
import { IconArrowUp } from '@arco-design/web-react/icon'
import classNames from 'classnames'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import { create } from 'zustand'
import { RouteType, findRouteByPath } from '../router/ROUTES'

type Store = {
  scrollYMap: Map<string, number>
  curRoute?: RouteType
  setPosition: (position: number, path: string) => void
  setRoute: (route: RouteType) => void
}

const useStore = create<Store>()((set) => ({
  scrollYMap: new Map(),
  curRoute: undefined,
  setPosition: (position, path) => set((prev) => ({ ...prev, scrollYMap: prev.scrollYMap.set(path, position) })),
  setRoute: (route) => set((prev) => ({ ...prev, curRoute: route }))
}))

export default () => {
  const { t } = useTranslation()
  const location = useLocation()
  const pageRef = useRef<HTMLDivElement>(null)
  const hasVerticalScrollbar = () => pageRef.current && pageRef.current?.scrollHeight > pageRef.current?.clientHeight
  const position = useStore((state) => state.scrollYMap.get(location.pathname))
  const curRoute = useStore((state) => state.curRoute)
  const setPosition = useStore((state) => state.setPosition)
  const setRoute = useStore((state) => state.setRoute)
  const reachedTop = position === undefined || position === 0 || !hasVerticalScrollbar()

  // 恢复滚动位置
  const restoreScrollPosition = () => {
    if (!hasVerticalScrollbar()) {
      setPosition(0, location.pathname)
    } else {
      // 滚动到上次的位置
      pageRef.current?.scrollTo({
        top: position
      })
    }
  }

  useEffect(() => {
    if (!location) {
      return
    }

    // 当路由切换时,如果没有滚动条, 则不需要滚动到上次的位置
    restoreScrollPosition()

    const route = findRouteByPath(location.pathname)

    if (!route) return

    // 更新当前路由
    setRoute(route)
  }, [location])

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* 页头 */}
      <div className="inline-flex w-full space-x-4 border-b p-4 shrink-0 sticky top-0 bg-white z-10 drop-shadow-sm">
        {curRoute && (
          <div className="flex flex-col">
            {/* 页头 */}
            <div className="font-bold text-gray-700 flex items-center space-x-2">
              <span>{curRoute?.icon}</span>
              <span> {t(curRoute.name!!)}</span>
            </div>
            {/* 描述 */}
            {curRoute?.description && (
              <div className="text-sm leading-none text-gray-500">{t(curRoute.description!!)}</div>
            )}
          </div>
        )}
      </div>
      {/* 内容 */}
      <div
        className="grow h-0 p-4 pb-24 overflow-y-auto overflow-x-hidden relative"
        ref={pageRef}
        onScroll={(e) => {
          setPosition((e.target as HTMLDivElement).scrollTop, location.pathname)
        }}
      >
        <Outlet />
      </div>

      {/* 回到顶部按钮 */}
      <div
        className={classNames(
          'transition-all absolute right-8 bottom-8 drop-shadow-md',
          reachedTop ? 'opacity-0 translate-y-full' : 'opacity-100'
        )}
      >
        <Tooltip content="回到顶部" position="left">
          <Button
            size="large"
            shape="circle"
            type="primary"
            icon={<IconArrowUp />}
            onClick={() => {
              pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </Tooltip>
      </div>
    </div>
  )
}
