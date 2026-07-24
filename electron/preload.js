const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  startDrag: () => ipcRenderer.send('window:startDrag'),

  // Overlay window
  overlay: {
    show: () => ipcRenderer.invoke('overlay:show'),
    hide: () => ipcRenderer.invoke('overlay:hide'),
    toggle: () => ipcRenderer.invoke('overlay:toggle'),
    setPosition: (x, y) => ipcRenderer.invoke('overlay:setPosition', x, y),
    setSize: (w, h) => ipcRenderer.invoke('overlay:setSize', w, h),
    setAlwaysOnTop: (flag) => ipcRenderer.invoke('overlay:setAlwaysOnTop', flag),
  },

  // Config
  getConfig: (key) => ipcRenderer.invoke('config:get', key),
  setConfig: (key, value) => ipcRenderer.invoke('config:set', key, value),
  deleteConfig: (key) => ipcRenderer.invoke('config:delete', key),

  // Screen capture
  getScreenSources: () => ipcRenderer.invoke('screen:getSources'),
  captureScreen: (sourceId) => ipcRenderer.invoke('screen:capture', sourceId),

  // Global shortcuts
  registerShortcut: (accelerator, callback) => ipcRenderer.invoke('shortcut:register', accelerator, callback),
  unregisterShortcut: (accelerator) => ipcRenderer.invoke('shortcut:unregister', accelerator),
  unregisterAllShortcuts: () => ipcRenderer.invoke('shortcut:unregisterAll'),

  // Audio
  requestAudioPermission: () => ipcRenderer.invoke('audio:requestPermission'),

  // Screen info
  getMonitors: () => ipcRenderer.invoke('screen:getMonitors'),

  // App
  quit: () => ipcRenderer.invoke('app:quit'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
})