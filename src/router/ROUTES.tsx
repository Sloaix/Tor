import MainLayout from '@/layouts/MainLayout/Index'
import About from '@/pages/About'
import MetadataViewer from '@/pages/MetadataViewer'
import TorrentGenerator from '@/pages/TorrentGenerator'
import { FileCode, HammerAndAnvil, Help } from '@icon-park/react'
import { ReactNode } from 'react'
import { Navigate, Route } from 'react-router-dom'

export type RouteType = {
  path: string // 路径
  element?: JSX.Element // 组件
  name?: string // 名称
  description?: string // 描述
  icon?: ReactNode // 图标
  menuNode?: boolean // 是否为菜单节点
  children?: RouteType[] // 子路由
}

export const ROUTES: RouteType[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="metadata-viewer" replace={true} />
      },
      {
        path: 'metadata-viewer',
        element: <MetadataViewer />,
        name: 'page.metadata-viewer.title',
        description: 'page.metadata-viewer.description',
        icon: <FileCode />,
        menuNode: true
      },
      {
        path: 'torrent-generator',
        element: <TorrentGenerator />,
        name: 'page.torrent-generator.title',
        description: 'page.torrent-generator.description',
        icon: <HammerAndAnvil theme="outline" />,
        menuNode: true
      },
      {
        path: 'about',
        element: <About />,
        name: 'page.about.title',
        description: 'page.about.description',
        icon: <Help theme="outline" />,
        menuNode: true
      }
    ]
  }
]

/**
 * 根据路径查找当前路由
 * @param path 路径
 * @returns 当前路由
 */
export const findRouteByPath = (path: string) => {
  let target: RouteType | undefined
  if (path.startsWith('/')) {
    path = path.slice(1)
  }
  walk(ROUTES, (route) => {
    if (route.path === path) {
      target = route
    }
  })

  if (!target) {
    throw new Error(`Can't find route by path: ${path}`)
  }

  return target
}

/**
 * 遍历路由数组
 * @param routes 路由数组
 * @param callback 回调函数
 */
function walk(routes: RouteType[], callback: (route: RouteType) => void) {
  routes.forEach((route) => {
    callback(route)
    if (route.children) {
      walk(route.children, callback)
    }
  })
}

/**
 * 渲染路由
 * @param route 路由
 * @param key key
 * @returns 路由组件
 */
export const renderRoutes = (route: RouteType, key: string | number) => {
  return (
    <Route path={route.path} element={route.element} key={key}>
      {route.children && route.children.map((subRoute: RouteType, index) => renderRoutes(subRoute, index))}
    </Route>
  )
}

/**
 * 查找工具箱路由
 * @param routes  路由数组
 * @returns 工具箱路由
 */
export const findToolBoxRoutes = (routes: RouteType[]): RouteType[] => {
  const menus: RouteType[] = []
  walk(routes, (route) => {
    if (route.menuNode) {
      menus.push(route)
    }
  })
  return menus
}

export const MENUS = findToolBoxRoutes(ROUTES)
