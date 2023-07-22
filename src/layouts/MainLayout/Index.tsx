import Sider from '@/components/Sider'
import { Outlet } from 'react-router-dom'
import AppBar from './AppBar'
import PageLayout from '../PageLayout'

export default () => {
  return (
    <div className="w-full h-full flex flex-col">
      <AppBar className="draggable shrink-0" />
      <div className="flex grow h-0">
        {/* 侧边栏 */}
        <Sider />
        {/* 主内容 */}
        <PageLayout />
      </div>
    </div>
  )
}
