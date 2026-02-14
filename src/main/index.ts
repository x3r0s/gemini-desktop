import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  session,
  shell,
  Tray,
  WebContentsView
} from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { getSettings, updateSettings, type AppSettings } from './settings'

// Google blocks Chromium-based embedded browsers from signing in.
// Using a Firefox UA bypasses this detection entirely.
// ref: https://github.com/nativefier/nativefier/issues/831
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0'
app.userAgentFallback = FIREFOX_UA

const TITLEBAR_HEIGHT = 32
const isMac = process.platform === 'darwin'

let mainWindow: BrowserWindow | null = null
let geminiView: WebContentsView | null = null
let tray: Tray | null = null
let isQuitting = false

function getIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'build', 'icons', 'png', '16x16.png')
  }
  return path.join(__dirname, '../../build/icons/png/16x16.png')
}

function getWindowIconPath(): string {
  if (app.isPackaged) {
    if (process.platform === 'win32') {
      return path.join(process.resourcesPath, 'build', 'icons', 'win', 'icon.ico')
    }
    return path.join(process.resourcesPath, 'build', 'icons', 'png', '256x256.png')
  }
  if (process.platform === 'win32') {
    return path.join(__dirname, '../../build/icons/win/icon.ico')
  }
  return path.join(__dirname, '../../build/icons/png/256x256.png')
}

function layoutViews(): void {
  if (!mainWindow || !geminiView) return
  const { width, height } = mainWindow.getContentBounds()
  const topOffset = isMac ? 0 : TITLEBAR_HEIGHT
  geminiView.setBounds({ x: 0, y: topOffset, width, height: height - topOffset })
}

function isGoogleAuthURL(url: string): boolean {
  return (
    url.includes('accounts.google.com') ||
    url.includes('accounts.youtube.com') ||
    url.includes('myaccount.google.com')
  )
}

function applySettings(settings: AppSettings): void {
  mainWindow?.setAlwaysOnTop(settings.alwaysOnTop)
  app.setLoginItemSettings({ openAtLogin: settings.launchAtStartup })
}

function createWindow(): void {
  const settings = getSettings()

  // Persistent session — cookies, localStorage, IndexedDB, and HTTP cache
  const geminiSession = session.fromPartition('persist:gemini', { cache: true })
  geminiSession.setUserAgent(FIREFOX_UA)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: isMac,
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    trafficLightPosition: isMac ? { x: 12, y: 10 } : undefined,
    icon: getWindowIconPath(),
    show: false,
    alwaysOnTop: settings.alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // Gemini content view
  geminiView = new WebContentsView({
    webPreferences: {
      session: geminiSession,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  mainWindow.contentView.addChildView(geminiView)
  geminiView.webContents.loadURL('https://gemini.google.com')

  geminiView.webContents.setWindowOpenHandler(({ url }) => {
    if (isGoogleAuthURL(url)) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('resize', layoutViews)
  mainWindow.once('ready-to-show', () => {
    layoutViews()
    mainWindow?.show()
  })

  // Close behavior based on settings
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      const s = getSettings()
      if (s.closeToTray) {
        e.preventDefault()
        mainWindow?.hide()
      } else {
        isQuitting = true
        app.quit()
      }
    }
  })

  // Load the React titlebar
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  const icon = nativeImage.createFromPath(getIconPath()).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('Gemini Desktop')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

function createMacMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => {
            mainWindow?.webContents.send('settings:open')
          }
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function registerGlobalShortcut(): void {
  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow?.isVisible() && mainWindow.isFocused()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

// Window control IPC
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window:close', () => mainWindow?.close())

// Navigation IPC
ipcMain.on('view:go-back', () => {
  if (geminiView?.webContents.canGoBack()) geminiView.webContents.goBack()
})
ipcMain.on('view:go-forward', () => {
  if (geminiView?.webContents.canGoForward()) geminiView.webContents.goForward()
})
ipcMain.on('view:reload', () => geminiView?.webContents.reload())

// Settings IPC
ipcMain.handle('settings:get', () => getSettings())
ipcMain.handle('settings:update', (_e, partial: Partial<AppSettings>) => {
  const updated = updateSettings(partial)
  applySettings(updated)
  return updated
})

app.whenReady().then(() => {
  createWindow()
  createTray()
  registerGlobalShortcut()
  if (isMac) createMacMenu()

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.checkForUpdatesAndNotify().catch(() => {})
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  } else {
    createWindow()
  }
})
