import React, { useEffect, useRef, useState } from 'react'
import { Send, Bot, User, Zap, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function ChatPanel({
  messages,
  currentInput,
  setCurrentInput,
  onSubmit,
  isListening,
  isProcessing,
  geminiConnected,
  onToggleListening,
  chatEndRef,
  activeDelegations,
  onDelegation,
}) {
  const scrollRef = useRef(null)
  const [showDelegationInput, setShowDelegationInput] = useState(false)
  const [delegationType, setDelegationType] = useState('research')
  const [delegationDescription, setDelegationDescription] = useState('')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeDelegations])

  const delegationTypes = [
    { id: 'research', label: 'Research', icon: '🔍', desc: 'Web research, fact-finding' },
    { id: 'code', label: 'Code', icon: '💻', desc: 'Write, debug, explain code' },
    { id: 'analysis', label: 'Analysis', icon: '📊', desc: 'Data/log analysis' },
    { id: 'summarize', label: 'Summarize', icon: '📝', desc: 'Long documents, meetings' },
    { id: 'plan', label: 'Plan', icon: '📋', desc: 'Multi-step task planning' },
  ]

  const handleDelegationSubmit = (e) => {
    e.preventDefault()
    if (!delegationDescription.trim()) return
    onDelegation(delegationType, delegationDescription)
    setShowDelegationInput(false)
    setDelegationDescription('')
  }

  return (
    <div className="flex flex-col h-full glass-panel border-l border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-accent-purple" />
          <span className="text-sm font-semibold text-white/80">MEETING CHAT</span>
          <span className="text-[10px] text-white/20">meeting-aware LLM</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleListening}
            className={`no-drag p-2 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 border border-white/10'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button
            onClick={() => setShowDelegationInput(!showDelegationInput)}
            className="no-drag p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all"
            title="Delegate to sub-agent"
          >
            <Zap size={14} />
          </button>
        </div>
      </div>

      {/* Active Delegations */}
      {activeDelegations.length > 0 && (
        <div className="px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-accent-purple" />
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">ACTIVE DELEGATIONS</span>
          </div>
          <div className="space-y-1.5">
            {activeDelegations.map((d) => (
              <div key={d.id} className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-accent-purple font-medium">
                    {d.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-white/30">{d.status}</span>
                </div>
                <p className="text-xs text-white/70 truncate">{d.description}</p>
                {d.result && (
                  <p className="text-xs text-accent-green mt-1">✓ Completed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delegation Input */}
      {showDelegationInput && (
        <div className="px-3 py-2 border-b border-white/5 bg-accent-purple/5 animate-slide-up">
          <form onSubmit={handleDelegationSubmit} className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {delegationTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setDelegationType(type.id)}
                  className={`no-drag flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap shrink-0 ${
                    delegationType === type.id
                      ? 'bg-accent-purple text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            <textarea
              value={delegationDescription}
              onChange={(e) => setDelegationDescription(e.target.value)}
              placeholder="Describe the task for the sub-agent..."
              rows={2}
              className="input-field resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDelegationInput(false)}
                className="btn-secondary text-[11px] px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-[11px] px-3 py-1.5"
              >
                Delegate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            <span>Ask a question or delegate a task</span>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''} animate-slide-up`}>
            {msg.role !== 'user' && (
              <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-accent-purple" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-accent-blue/15 border border-accent-blue/20' : 'bg-white/5'} rounded-xl px-3 py-2`}>
              <p className="text-sm text-white/80 whitespace-pre-wrap">{msg.content || (msg.role === 'assistant' ? '...' : '')}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={12} className="text-accent-blue" />
              </div>
            )}
          </div>
        ))}

        {/* Active delegations as messages */}
        {activeDelegations.map((d) => (
          d.status === 'working' && (
            <div key={`delegation-${d.id}`} className="flex gap-2 animate-slide-up">
              <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={12} className="text-accent-purple animate-spin" />
              </div>
              <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-xl px-3 py-2 max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-medium text-accent-purple uppercase tracking-wider">{d.type}</span>
                  <Loader2 size={12} className="text-accent-purple animate-spin" />
                </div>
                <p className="text-sm text-white/70">{d.description}</p>
              </div>
            </div>
          )
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
            placeholder="Ask about the meeting..."
            className="no-drag flex-1 input-field"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!currentInput.trim() || isProcessing}
            className="no-drag p-2 rounded-xl bg-accent-blue/20 border border-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send size={14} />
          </button>
        </form>
        {(isProcessing || isListening) && (
          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-white/30">
            <Loader2 size={12} className="text-accent-blue animate-spin" />
            <span>{isListening ? 'Listening...' : 'Processing...'}</span>
          </div>
        )}
      </div>
    </div>
  )
}