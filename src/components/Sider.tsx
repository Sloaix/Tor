import { MENUS } from '@/router/ROUTES'
import { Menu } from '@arco-design/web-react/es'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const MenuItem = Menu.Item

export default () => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([MENUS[0].name!!])
  const navigate = useNavigate()
  const isSelected = (key: string) => {
    return selectedKeys.includes(key)
  }

  useEffect(() => {
    // 默认导航到第一个菜单
    navigate(`${MENUS[0].path}`, { replace: true })
  }, [])

  return (
    <div className="border-r shrink-0">
      <Menu
        selectedKeys={selectedKeys}
        onClickMenuItem={(key, event, keyPath) => {
          setSelectedKeys(keyPath)
        }}
      >
        {MENUS.map((route, index) => {
          return (
            <MenuItem
              onClick={() => {
                navigate(`./${route.path}`, { replace: true })
              }}
              key={route.name!!}
            >
              <div className={classNames('flex items-center space-x-2', { 'font-bold': isSelected(route.name!!) })}>
                <span className="py-4 px-4 text-2xl">{route.icon}</span>
              </div>
            </MenuItem>
          )
        })}
      </Menu>
    </div>
  )
}
