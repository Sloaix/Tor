import PageLoading from '@/components/PageLoading'
import { Suspense } from 'react'
import { HashRouter as Router, Routes } from 'react-router-dom'
import { ROUTES, RouteType, renderRoutes } from './ROUTES'

export default () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Router>
        <Routes>{ROUTES.map((route: RouteType, index) => renderRoutes(route, index))}</Routes>
      </Router>
    </Suspense>
  )
}
