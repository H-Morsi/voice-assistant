const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  startDrag: () => ipcRenderer.send('window:startDrag'),

  // Config (encrypted via safeStorage)
  getConfig: (key) => ipcRenderer.invoke('config:get', key),
  setConfig: (key, value) => ipcRenderer.invoke('config:set', key, value),
  deleteConfig: (key) => ipcRenderer.invoke('config:delete', key),

  // Screen capture
  getScreenSources: () => ipcRenderer.invoke('screen:getSources'),
  captureScreen: (sourceId) => ipcRenderer.invoke('screen:capture', sourceId),

  // Dialogs
  savePdfDialog: (defaultName) => ipcRenderer.invoke('dialog:save-pdf', defaultName),
  writeFile: (filePath, base64Data) => ipcRenderer.invoke('file:write', filePath, base64Data),

  // App
  quit: () => ipcRenderer.invoke('app:quit'),
})