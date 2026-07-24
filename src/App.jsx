import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Settings, X, Maximize, Minimize, ChevronDown, ChevronUp, Monitor, Bot, Sparkles, Volume2, VolumeX, Moon, Sun, KeyRound, Globe, Database, Mail, Bell, BellOff, Send, Loader2, Zap, User } from 'lucide-react'
import { useAppStore } from './store/useAppStore'
import TitleBar from './components/TitleBar'
import Overlay from './components/Overlay'
import ChatPanel from './components/ChatPanel'
import SettingsPanel from './components/SettingsPanel'
import { startGeminiLive, stopGeminiLive } from './services/geminiLive'
import { initializeNvidia } from './services/nvidia'

export default function App() {
  const {
    settings,
    settingsLoaded,
    loadSettings,
    showSettings,
    setShowSettings,
    overlayMode,
    setOverlayMode,
    showChatPanel,
    setShowChatPanel,
    isListening,
    isProcessing,
    messages,
    addMessage,
    currentInput,
    setCurrentInput,
    wakeWordEnabled,
    setWakeWordEnabled,
    pushToTalkEnabled,
    setPushToTalkEnabled,
    screenCaptureActive,
    setScreenCaptureActive,
    activeDelegations,
  } = useAppStore()

  const [geminiConnected, setGeminiConnected] = useState(false)
  const [selectedScreenSource, setSelectedScreenSource] = useState(null)
  const [screenSources, setScreenSources] = useState([])
  const chatEndRef = useRef(null)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
    initializeNvidia()
  }, [loadSettings])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Request audio permission
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.requestAudioPermission()
    }
  }, [])

  // Get screen sources
  const fetchScreenSources = async () => {
    if (window.electronAPI) {
      const sources = await window.electronAPI.getScreenSources()
      setScreenSources(sources)
      if (sources.length > 0 && !selectedScreenSource) {
        setSelectedScreenSource(sources[0].id)
      }
    }
  }

  useEffect(() => {
    fetchScreenSources()
  }, [])

  // Toggle listening
  const toggleListening = async () => {
    if (isListening) {
      await stopGeminiLive()
      setGeminiConnected(false)
    } else {
      if (!settings.geminiApiKey) {
        alert('Please set your Gemini API key in Settings first')
        setShowSettings(true)
        return
      }
      
      const connected = await startGeminiLive(
        settings.geminiApiKey,
        selectedScreenSource,
        (text, isFinal) => {
          if (isFinal) {
            addMessage({ role: 'user', content: text })
          }
        },
        (text, isFinal) => {
          if (isFinal) {
            addMessage({ role: 'assistant', content: text })
          }
        },
        (connected) => setGeminiConnected(connected),
        (error) => {
          console.error('Gemini error:', error)
          addMessage({ role: 'assistant', content: `Error: ${error.message}` })
        }
      )
      setGeminiConnected(connected)
    }
  }

  // Handle text input submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentInput.trim()) return
    
    const userMessage = currentInput.trim()
    setCurrentInput('')
    addMessage({ role: 'user', content: userMessage })
    
    // If Gemini is connected, it will handle voice. Otherwise use Nvidia for text.
    if (!geminiConnected && settings.nvidiaApiKey) {
      // Delegate to Nvidia orchestrator
      try {
        addMessage({ 
          role: 'assistant', 
          content: 'Text chat with Nvidia NIM orchestrator coming soon. Use voice for now.' 
        })
      } catch (err) {
        addMessage({ role: 'assistant', content: `Error: ${err.message}` })
      }
    }
  }

  // Handle delegation from orchestrator
  const handleDelegation = async (taskType, description) => {
    if (!settings.nvidiaApiKey) {
      alert('Nvidia NIM API key required for delegation')
      setShowSettings(true)
      return
    }
    
    addMessage({ 
      role: 'assistant', 
      content: `Delegating ${taskType} task: ${description}... (implementation coming soon)` 
    })
  }

  if (!settingsLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-white/30">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-bg-primary">
      {/* Custom Title Bar */}
      <TitleBar 
        onMinimize={() => window.electronAPI?.minimize()}
        onMaximize={() => window.electronAPI?.maximize()}
        onClose={() => window.electronAPI?.close()}
        isMaximized={false}
        title="Voice Assistant"
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${geminiConnected ? 'bg-accent-green' : 'bg-white/10'}`} />
            <span className={`text-white/60 ${geminiConnected ? 'text-accent-green' : ''}`}>
              {geminiConnected ? 'Gemini Live ●' : 'Gemini Live ○'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${screenCaptureActive ? 'bg-accent-cyan' : 'bg-white/10'}`} />
            <span className={`text-white/60 ${screenCaptureActive ? 'text-accent-cyan' : ''}`}>
              Screen {screenCaptureActive ? '●' : '○'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOverlayMode(overlayMode === 'expanded' ? 'compact' : 'expanded')}
            className="no-drag p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
            title={overlayMode === 'expanded' ? 'Compact overlay' : 'Expand overlay'}
          >
            {overlayMode === 'expanded' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`no-drag p-1.5 rounded-lg transition-all ${showChatPanel ? 'bg-white/5 text-white/60' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
            title="Toggle chat panel"
          >
            <Bot size={14} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="no-drag p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
            title="Settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        {showChatPanel && (
          <div className="w-[38%] min-w-[320px] max-w-[450px] border-r border-white/5 flex flex-col">
            <ChatPanel
              messages={messages}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              onSubmit={handleSubmit}
              isListening={isListening}
              isProcessing={isProcessing}
              geminiConnected={geminiConnected}
              onToggleListening={toggleListening}
              chatEndRef={chatEndRef}
              activeDelegations={activeDelegations}
              onDelegation={handleDelegation}
            />
          </div>
        )}

        {/* Right: Main View / Settings */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showSettings ? (
            <SettingsPanel 
              onClose={() => setShowSettings(false)}
              screenSources={screenSources}
              selectedScreenSource={selectedScreenSource}
              setSelectedScreenSource={setSelectedScreenSource}
              onFetchSources={fetchScreenSources}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-white/30 max-w-md">
                <Sparkles size={48} className="mx-auto mb-4 text-accent-blue/50" />
                <h2 className="text-xl font-medium text-white/60 mb-2">Voice Assistant Ready</h2>
                <p className="text-sm text-white/40 mb-6">
                  Click the microphone or use wake word to start. 
                  The assistant can see your screen and hear your voice.
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Mic size={12} /> Voice
                  </span>
                  <span className="flex items-center gap-1">
                    <Monitor size={12} /> Screen
                  </span>
                  <span className="flex items-center gap-1">
                    <Bot size={12} /> Delegation
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      <Overlay 
        mode={overlayMode}
        isListening={isListening}
        isProcessing={isProcessing}
        geminiConnected={geminiConnected}
        onToggleListening={toggleListening}
        onToggleOverlay={() => setOverlayMode('hidden')}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          screenSources={screenSources}
          selectedScreenSource={selectedScreenSource}
          setSelectedScreenSource={setSelectedScreenSource}
          onFetchSources={fetchScreenSources}
        />
      )}
    </div>
  )
}