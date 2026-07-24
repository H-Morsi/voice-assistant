import React from 'react'
import { createRoot } from 'react-dom/client'
import Overlay from './components/Overlay'
import { useAppStore } from './store/useAppStore'

function OverlayApp() {
  const { 
    overlayMode, 
    isListening, 
    isProcessing, 
    geminiConnected,
    onToggleListening,
    setOverlayMode 
  } = useAppStore()

  if (overlayMode === 'hidden') return null

  return (
    <Overlay
      mode={overlayMode}
      isListening={isListening}
      isProcessing={isProcessing}
      geminiConnected={geminiConnected}
      onToggleListening={onToggleListening}
      onToggleOverlay={() => setOverlayMode('hidden')}
    />
  )
}

createRoot(document.getElementById('overlay-root')).render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>
)