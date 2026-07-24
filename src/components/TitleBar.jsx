import React from 'react'
import { Minimize, Maximize, X, Sun, Moon, Sparkles, Mic, MicOff, Bot, ChevronDown, ChevronUp, Settings } from 'lucide-react'

export default function TitleBar({ 
  onMinimize, 
  onMaximize, 
  onClose, 
  onSettings,
  isMaximized = false,
  isListening = false,
  showOverlay = true,
  onToggleOverlay,
}) {
  return (
    <div 
      className="drag flex items-center justify-between h-10 px-3 bg-gray-950/50 border-b border-white/5 -webkit-app-region:drag"
      onDoubleClick={onMaximize}
    >
      {/* Left: App title + status */}
      <div className="drag flex items-center gap-2 -webkit-app-region:drag">
        <div className="w-2 h-2 rounded-full bg-accent-purple" />
        <span className="text-xs font-semibold text-white/60">Voice Assistant</span>
        <span className="text-[10px] text-white/20 font-mono">v1.0.0</span>
      </div>

      {/* Center: Voice status indicator */}
      <div className="drag flex items-center gap-2 -webkit-app-region:drag">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${
          isListening 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-white/5 text-white/30 border border-white/10'
        }`}>
          {isListening ? <Mic size={10} /> : <MicOff size={10} />}
          <span>{isListening ? 'LISTENING' : 'IDLE'}</span>
        </div>
      </div>

      {/* Right: Window controls */}
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={onSettings}
          className="no-drag p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
          title="Settings"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={onMinimize}
          className="no-drag p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
          title="Minimize"
        >
          <Minimize size={14} />
        </button>
        <button
          onClick={onMaximize}
          className="no-drag p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
          title={isMaximized ? 'Unmaximize' : 'Maximize'}
        >
          {isMaximized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          onClick={onClose}
          className="no-drag p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}