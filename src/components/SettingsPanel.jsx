import React, { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Save, Loader2, Mic, MicOff, Monitor, Zap, Sparkles, Database, Globe, KeyRound, Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function SettingsPanel({ onClose }) {
  const { 
    settings, 
    updateSetting, 
    loadSettings,
    wakeWordEnabled,
    setWakeWordEnabled,
    pushToTalkEnabled,
    setPushToTalkEnabled,
  } = useAppStore()
  
  const [showKeys, setShowKeys] = useState({})
  const [saved, setSaved] = useState({})
  const [activeTab, setActiveTab] = useState('ai')
  const [screenSources, setScreenSources] = useState([])
  const [selectedScreenSource, setSelectedScreenSource] = useState(null)
  const [fetchingSources, setFetchingSources] = useState(false)

  const toggleShow = (key) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleChange = async (key, value) => {
    await updateSetting(key, value)
    setSaved((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000)
  }

  const fetchSources = async () => {
    if (!window.electronAPI) return
    setFetchingSources(true)
    try {
      const sources = await window.electronAPI.getScreenSources()
      setScreenSources(sources)
      if (sources.length > 0 && !selectedScreenSource) {
        setSelectedScreenSource(sources[0].id)
        await updateSetting('screenSourceId', sources[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch screen sources:', err)
    } finally {
      setFetchingSources(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const tabs = [
    { id: 'ai', label: 'AI Models', icon: Sparkles },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'screen', label: 'Screen', icon: Monitor },
    { id: 'delegation', label: 'Delegation', icon: Zap },
    { id: 'advanced', label: 'Advanced', icon: Database },
  ]

  const sectionClass = "space-y-5"
  const labelClass = "text-xs font-medium text-white/40 uppercase tracking-wider mb-1 block"
  const inputClass = "no-drag w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-accent-blue/40 transition-all font-mono"
  const savedBadge = (key) => saved[key] ? <span className="text-[10px] text-accent-green ml-2 animate-fade-in">saved</span> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-[580px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white/80">Settings</h2>
          <button onClick={onClose} className="no-drag p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`no-drag flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-all -mb-px border-b-2 ${
                activeTab === tab.id
                  ? 'text-accent-blue border-accent-blue'
                  : 'text-white/30 hover:text-white/60 border-transparent'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-6">
          
          {/* AI Models Tab */}
          {activeTab === 'ai' && (
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-accent-blue" />
                <span className={labelClass}>AI Models & APIs</span>
              </div>

              {/* Gemini API */}
              <div>
                <label className={labelClass}>Gemini API Key {savedBadge('geminiApiKey')}</label>
                <div className="relative">
                  <input
                    type={showKeys.geminiApiKey ? 'text' : 'password'}
                    value={settings.geminiApiKey}
                    onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                    placeholder="AIza... (from aistudio.google.com/apikey)"
                    className={inputClass}
                  />
                  <button onClick={() => toggleShow('geminiApiKey')} className="no-drag absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showKeys.geminiApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-white/20 mt-1">Required for voice+screen live interaction. Free tier at Google AI Studio.</p>
              </div>

              {/* Nvidia NIM */}
              <div>
                <label className={labelClass}>Nvidia NIM API Key {savedBadge('nvidiaApiKey')}</label>
                <div className="relative">
                  <input
                    type={showKeys.nvidiaApiKey ? 'text' : 'password'}
                    value={settings.nvidiaApiKey}
                    onChange={(e) => handleChange('nvidiaApiKey', e.target.value)}
                    placeholder="nvapi-... (from build.nvidia.com)"
                    className={inputClass}
                  />
                  <button onClick={() => toggleShow('nvidiaApiKey')} className="no-drag absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showKeys.nvidiaApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-white/20 mt-1">Required for sub-agent delegation (research, coding, analysis).</p>
              </div>

              <div>
                <label className={labelClass}>Nvidia Base URL {savedBadge('nvidiaBaseUrl')}</label>
                <input
                  type="text"
                  value={settings.nvidiaBaseUrl}
                  onChange={(e) => handleChange('nvidiaBaseUrl', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Orchestrator Model {savedBadge('nvidiaModel')}</label>
                <input
                  type="text"
                  value={settings.nvidiaModel}
                  onChange={(e) => handleChange('nvidiaModel', e.target.value)}
                  className={inputClass}
                />
                <p className="text-[10px] text-white/20 mt-1">Model for main orchestrator (e.g., nemotron-3-ultra, deepseek-v4, llama-3.1-70b).</p>
              </div>

              <div>
                <label className={labelClass}>Sub-Agent Model {savedBadge('subAgentModel')}</label>
                <input
                  type="text"
                  value={settings.subAgentModel}
                  onChange={(e) => handleChange('subAgentModel', e.target.value)}
                  className={inputClass}
                />
                <p className="text-[10px] text-white/20 mt-1">Model for delegated sub-agents (can be same or different from orchestrator).</p>
              </div>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-4">
                <Mic size={14} className="text-accent-green" />
                <span className={labelClass}>Voice Settings</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mic size={18} className={wakeWordEnabled ? 'text-accent-green' : 'text-white/30'} />
                    <div>
                      <p className="text-sm font-medium text-white/80">Wake Word Detection</p>
                      <p className="text-[10px] text-white/30">Say "Hey Assistant" to activate (hands-free)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wakeWordEnabled}
                      onChange={(e) => setWakeWordEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-blue/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MicOff size={18} className="text-white/40" />
                    <div>
                      <p className="text-sm font-medium text-white/80">Push-to-Talk</p>
                      <p className="text-[10px] text-white/30">Hold Space key to speak (precision mode)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushToTalkEnabled}
                      onChange={(e) => setPushToTalkEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-blue/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Wake Word Phrase {savedBadge('wakeWord')}</label>
                  <input
                    type="text"
                    value={settings.wakeWord}
                    onChange={(e) => handleChange('wakeWord', e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-white/20 mt-1">Default: "hey assistant". Requires Porcupine integration for production.</p>
                </div>

                <div>
                  <label className={labelClass}>Push-to-Talk Key {savedBadge('pushToTalkKey')}</label>
                  <input
                    type="text"
                    value={settings.pushToTalkKey}
                    onChange={(e) => handleChange('pushToTalkKey', e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-white/20 mt-1">Key to hold for push-to-talk (e.g., Space, Shift, Control).</p>
                </div>
              </div>
            </div>
          )}

          {/* Screen Tab */}
          {activeTab === 'screen' && (
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={14} className="text-accent-cyan" />
                <span className={labelClass}>Screen Capture</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Screen Source to Capture {savedBadge('screenSourceId')}</label>
                  <div className="relative">
                    <select
                      value={selectedScreenSource || ''}
                      onChange={(e) => {
                        const id = e.target.value
                        setSelectedScreenSource(id)
                        handleChange('screenSourceId', id)
                      }}
                      className={inputClass + ' appearance-none'}
                    >
                      <option value="">Select a screen or window...</option>
                      {screenSources.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.name} {source.displayId ? `(Display ${source.displayId})` : '(Window)'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={fetchSources}
                      disabled={fetchingSources}
                      className="btn-secondary text-[11px] px-3 py-1.5"
                    >
                      {fetchingSources ? <Loader2 size={12} className="animate-spin" /> : 'Refresh Sources'}
                    </button>
                    {selectedScreenSource && (
                      <span className="text-[10px] text-accent-green">✓ Capturing this source</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Capture Interval (ms) {savedBadge('screenCaptureInterval')}</label>
                  <input
                    type="number"
                    value={settings.screenCaptureInterval}
                    onChange={(e) => handleChange('screenCaptureInterval', parseInt(e.target.value))}
                    min="1000"
                    max="10000"
                    step="500"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-white/20 mt-1">How often to send screen frames to Gemini Live API. Lower = more current, higher = less bandwidth.</p>
                </div>

                <div>
                  <label className={labelClass}>JPEG Quality {savedBadge('screenJpegQuality')}</label>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={settings.screenJpegQuality}
                    onChange={(e) => handleChange('screenJpegQuality', parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-accent-blue"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>Lower quality (smaller, faster)</span>
                    <span>{settings.screenJpegQuality}%</span>
                    <span>Higher quality (larger, slower)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Monitor size={18} className="text-white/40" />
                    <div>
                      <p className="text-sm font-medium text-white/80">Include System Audio</p>
                      <p className="text-[10px] text-white/30">Capture audio from applications (meetings, videos)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeSystemAudio}
                      onChange={(e) => handleChange('includeSystemAudio', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-blue/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-cyan"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Delegation Tab */}
          {activeTab === 'delegation' && (
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-accent-purple" />
                <span className={labelClass}>Sub-Agent Delegation</span>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/60">
                  When you ask complex questions, the orchestrator can delegate to specialized sub-agents 
                  using your Nvidia NIM API key. Each sub-agent gets an isolated context window.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'research', label: 'Research Agent', desc: 'Web search, fact-finding, comparisons', icon: '🔍' },
                    { id: 'code', label: 'Code Agent', desc: 'Write, debug, explain, refactor code', icon: '💻' },
                    { id: 'analysis', label: 'Analysis Agent', desc: 'Data/log analysis, patterns, insights', icon: '📊' },
                    { id: 'summarize', label: 'Summarize Agent', desc: 'Condense long content, meetings, docs', icon: '📝' },
                  ].map((agent) => (
                    <div key={agent.id} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-accent-purple/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{agent.icon}</span>
                        <span className="text-sm font-medium text-white/80">{agent.label}</span>
                      </div>
                      <p className="text-[10px] text-white/40">{agent.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
                  <p className="text-sm text-accent-purple font-medium mb-1">Delegation Settings</p>
                  <div className="space-y-2 text-[11px] text-white/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoDelegate}
                        onChange={(e) => handleChange('autoDelegate', e.target.checked)}
                        className="w-4 h-4 accent-accent-purple"
                      />
                      Auto-delegate complex queries (orchestrator decides)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.delegateWithScreenContext}
                        onChange={(e) => handleChange('delegateWithScreenContext', e.target.checked)}
                        className="w-4 h-4 accent-accent-purple"
                      />
                      Include screen context when delegating
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.parallelDelegation}
                        onChange={(e) => handleChange('parallelDelegation', e.target.checked)}
                        className="w-4 h-4 accent-accent-purple"
                      />
                      Run multiple sub-agents in parallel
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className={sectionClass}>
              <div className="flex items-center gap-2 mb-4">
                <Database size={14} className="text-white/50" />
                <span className={labelClass}>Advanced</span>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-white/70 mb-2">Data & Privacy</p>
                  <div className="space-y-2 text-[11px] text-white/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.encryptKeys}
                        onChange={(e) => handleChange('encryptKeys', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Encrypt API keys using OS safe storage (recommended)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.localOnly}
                        onChange={(e) => handleChange('localOnly', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Local-only mode (no cloud APIs, limited functionality)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.saveConversations}
                        onChange={(e) => handleChange('saveConversations', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Save conversation history locally
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-white/70 mb-2">Performance</p>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Max Context Messages {savedBadge('maxContextMessages')}</label>
                      <input
                        type="number"
                        value={settings.maxContextMessages}
                        onChange={(e) => handleChange('maxContextMessages', parseInt(e.target.value))}
                        min="5"
                        max="50"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Response Token Limit {savedBadge('maxResponseTokens')}</label>
                      <input
                        type="number"
                        value={settings.maxResponseTokens}
                        onChange={(e) => handleChange('maxResponseTokens', parseInt(e.target.value))}
                        min="512"
                        max="8192"
                        step="512"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-white/70 mb-2">Window Behavior</p>
                  <div className="space-y-2 text-[11px] text-white/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.startMinimized}
                        onChange={(e) => handleChange('startMinimized', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Start minimized to tray
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.closeToTray}
                        onChange={(e) => handleChange('closeToTray', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Close button minimizes to tray instead of quitting
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartListening}
                        onChange={(e) => handleChange('autoStartListening', e.target.checked)}
                        className="w-4 h-4 accent-accent-blue"
                      />
                      Auto-start listening on launch
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
                        if (window.electronAPI) {
                          window.electronAPI.setConfig('reset', true)
                        }
                      }
                    }}
                    className="btn-danger text-[11px] px-3 py-1.5 flex-1"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={onClose}
                    className="btn-primary text-[11px] px-4 py-1.5"
                  >
                    <Save size={12} className="mr-1" /> Done
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-white/20">Keys are encrypted using OS-level safe storage</span>
          <button
            onClick={onClose}
            className="no-drag text-[11px] px-3 py-1.5 rounded-lg bg-accent-blue text-white hover:bg-accent-blue/80 transition-all font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}