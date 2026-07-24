import React, { useEffect, useRef } from 'react'
import { Mic, MicOff, Sparkles, Volume2, X, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function Overlay({ 
  mode, 
  isListening, 
  isProcessing, 
  geminiConnected, 
  onToggleListening, 
  onToggleOverlay 
}) {
  const { setOverlayMode } = useAppStore()
  const overlayRef = useRef(null)

  // Draggable overlay
  useEffect(() => {
    if (!overlayRef.current) return
    
    let isDragging = false
    let startX, startY, initialX, initialY

    const handleMouseDown = (e) => {
      // Only drag from the header area, not buttons
      if (e.target.closest('button')) return
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      initialX = overlayRef.current.offsetLeft
      initialY = overlayRef.current.offsetTop
      e.preventDefault()
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      overlayRef.current.style.left = `${initialX + dx}px`
      overlayRef.current.style.top = `${initialY + dy}px`
    }

    const handleMouseUp = () => {
      isDragging = false
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (mode === 'hidden') return null

  const isCompact = mode === 'compact'

  return (
    <div
      ref={overlayRef}
      className={`fixed pointer-events-none z-50 transition-all duration-300 ${
        isCompact 
          ? 'w-64 h-20 bottom-20 right-4' 
          : 'w-72 h-48 bottom-20 right-4'
      }`}
      style={{
        transform: isCompact ? 'scale(0.9)' : 'scale(1)',
        opacity: isCompact ? 0.9 : 1,
      }}
    >
      <div 
        className="pointer-events-auto glass-panel w-full h-full flex flex-col overflow-hidden shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-500 recording-pulse' : (geminiConnected ? 'bg-accent-green' : 'bg-white/20')}`} />
            <span className={`text-xs font-medium ${isListening ? 'text-red-400' : 'text-white/60'}`}>
              {isListening ? 'LISTENING' : (isProcessing ? 'THINKING...' : 'READY')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleListening}
              className={`no-drag p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={12} /> : <Mic size={12} />}
            </button>
            {!isCompact && (
              <button
                onClick={() => setOverlayMode('compact')}
                className="no-drag p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                <ChevronUp size={12} />
              </button>
            )}
            <button
              onClick={onToggleOverlay}
              className="no-drag p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {!isCompact && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl">
              <Sparkles size={14} className="text-accent-blue" />
              <span className="text-xs text-white/60 flex-1 text-left">
                {geminiConnected ? 'Gemini Live connected' : 'Click mic to connect'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-white/5 rounded-xl text-center">
                <Volume2 size={14} className="mx-auto text-white/40 mb-1" />
                <span className="text-[10px] text-white/40">Voice</span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl text-center">
                <span className="text-[10px] text-white/40">Screen</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-2">
              <p className="text-[10px] text-white/30 text-center">
                Hotkey: Space (PTT) • Say "Hey Assistant" (Wake)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}