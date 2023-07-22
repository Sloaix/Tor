import { BrowserWindow, app, shell } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import './handler'
// import { update } from './update'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const height = 640
const width = 800
let win: BrowserWindow | null = null
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    minWidth: width,
    minHeight: height,
    width,
    height,
    title: 'Main window',
    trafficLightPosition: { x: 10, y: 10 },
    center: true,
    resizable: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff'
    },
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Hide the menu bar
  win.setMenuBarVisibility(false)
  // NOTE: Visual zoom only applies to pinch-to-zoom behavior.
  // Cmd+/-/0 zoom shortcuts are controlled by the 'zoomIn', 'zoomOut', and 'resetZoom' MenuItem roles in the application Menu.
  // To disable shortcuts, manually define the Menu and omit zoom roles from the definition.
  // disable zoom
  win.removeMenu()

  if (url) {
    // electron-vite-vue#298
    await win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools({
      mode: 'detach'
    })
  } else {
    win.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // TODO: Apply electron-updater
  // update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
