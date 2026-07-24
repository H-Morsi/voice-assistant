import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Voice state
  isListening: false,
  isProcessing: false,
  wakeWordEnabled: true,
  pushToTalkEnabled: true,
  
  // Screen capture
  screenCaptureActive: false,
  screenFrames: [],
  lastScreenAnalysis: null,
  
  // Chat
  messages: [],
  currentInput: '',
  
  // Settings
  settings: {
    geminiApiKey: '',
    nvidiaApiKey: '',
    nvidiaBaseUrl: 'https://integrate.api.nvidia.com/v1',
    nvidiaModel: 'nvidia/nemotron-3-ultra',
    deepgramApiKey: '',
    wakeWord: 'hey assistant',
    pushToTalkKey: 'Space',
    screenCaptureInterval: 3000,
    autoStartListening: true,
  },
  settingsLoaded: false,
  
  // UI state
  showSettings: false,
  showChatPanel: true,
  overlayMode: 'compact', // 'compact' | 'expanded' | 'hidden'
  
  // Sub-agent delegation
  activeDelegations: [],
  
  // Actions
  setListening: (val) => set({ isListening: val }),
  setProcessing: (val) => set({ isProcessing: val }),
  setWakeWordEnabled: (val) => set({ wakeWordEnabled: val }),
  setPushToTalkEnabled: (val) => set({ pushToTalkEnabled: val }),
  
  setScreenCaptureActive: (val) => set({ screenCaptureActive: val }),
  addScreenFrame: (frame) => set((s) => ({ 
    screenFrames: [...s.screenFrames.slice(-9), frame] // keep last 10
  })),
  setLastScreenAnalysis: (analysis) => set({ lastScreenAnalysis: analysis }),
  
  addMessage: (msg) => set((s) => ({ 
    messages: [...s.messages, { ...msg, id: msg.id || Date.now() + Math.random() }] 
  })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  setCurrentInput: (val) => set({ currentInput: val }),
  
  updateSetting: async (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }))
    if (window.electronAPI) {
      await window.electronAPI.setConfig(key, value)
    }
  },
  loadSettings: async () => {
    if (window.electronAPI) {
      const cfg = await window.electronAPI.getConfig()
      if (cfg) {
        set((s) => ({ settings: { ...s.settings, ...cfg }, settingsLoaded: true }))
      } else {
        set({ settingsLoaded: true })
      }
    } else {
      set({ settingsLoaded: true })
    }
  },
  
  setShowSettings: (val) => set({ showSettings: val }),
  setShowChatPanel: (val) => set({ showChatPanel: val }),
  setOverlayMode: (val) => set({ overlayMode: val }),
  
  addDelegation: (delegation) => set((s) => ({
    activeDelegations: [...s.activeDelegations, delegation]
  })),
  updateDelegation: (id, updates) => set((s) => ({
    activeDelegations: s.activeDelegations.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  removeDelegation: (id) => set((s) => ({
    activeDelegations: s.activeDelegations.filter(d => d.id !== id)
  })),
}))