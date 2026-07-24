const { app, BrowserWindow, ipcMain, desktopCapturer, safeStorage } = require('electron')
const path = require('path')
const fs = require('fs')

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json')

let mainWindow
let config = {}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
      if (safeStorage.isEncryptionAvailable()) {
        const buf = Buffer.from(raw, 'hex')
        const decrypted = safeStorage.decryptString(buf)
        config = JSON.parse(decrypted)
      } else {
        config = JSON.parse(raw)
      }
    }
  } catch { config = {} }
}

function saveConfig() {
  try {
    const raw = JSON.stringify(config, null, 2)
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(raw)
      fs.writeFileSync(CONFIG_PATH, encrypted.toString('hex'))
    } else {
      fs.writeFileSync(CONFIG_PATH, raw)
    }
  } catch (e) { console.error('Config save failed:', e) }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#030712',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  loadConfig()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC Handlers
ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.handle('window:close', () => mainWindow?.close())
ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() || false)
ipcMain.handle('window:startDrag', () => mainWindow?.webContents.sendInputEvent({ type: 'mouseDown', x: 0, y: 0, button: 'left', clickCount: 1 }))

ipcMain.handle('config:get', (_, key) => {
  if (key) return config[key]
  return config
})

ipcMain.handle('config:set', (_, key, value) => {
  config[key] = value
  saveConfig()
  return true
})

ipcMain.handle('config:delete', (_, key) => {
  delete config[key]
  saveConfig()
  return true
})

ipcMain.handle('screen:getSources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 320, height: 180 },
    fetchWindowIcons: true,
  })
  return sources.map(s => ({
    id: s.id,
    name: s.name,
    thumbnail: s.thumbnail.toDataURL(),
    display_id: s.display_id,
  }))
})

ipcMain.handle('screen:capture', async (_, sourceId) => {
  // This would capture a frame - for now return null, handled in renderer
  return null
})

ipcMain.handle('dialog:save-pdf', async (_, defaultName) => {
  const { dialog } = require('electron')
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'voice-assistant-notes.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  return result
})

ipcMain.handle('file:write', async (_, filePath, base64Data) => {
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
  return true
})