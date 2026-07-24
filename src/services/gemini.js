// Gemini Live API Service
// Handles WebSocket connection to Google's Gemini Multimodal Live API

let ws = null
let isConnected = false
let messageHandlers = new Map()
let messageId = 0
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3
let apiKey = null
let model = 'gemini-3.1-flash-live-preview'

// Audio queues
let sendAudioQueue = []
let receiveAudioQueue = []
let isProcessingAudio = false

// Callbacks
let onAudioResponse = null
let onTextResponse = null
let onTranscription = null
let onError = null
let onConnectionChange = null

export function setApiKey(key) {
  apiKey = key
}

export function setModel(m) {
  model = m
}

export function setCallbacks(callbacks) {
  onAudioResponse = callbacks.onAudioResponse || null
  onTextResponse = callbacks.onTextResponse || null
  onTranscription = callbacks.onTranscription || null
  onError = callbacks.onError || null
  onConnectionChange = callbacks.onConnectionChange || null
}

async function connect() {
  if (!apiKey) {
    throw new Error('API key not set')
  }
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    return // Already connected
  }
  
  return new Promise((resolve, reject) => {
    try {
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
      ws = new WebSocket(url)
      
      ws.onopen = () => {
        console.log('✅ Gemini Live API connected')
        isConnected = true
        reconnectAttempts = 0
        if (onConnectionChange) onConnectionChange(true)
        sendSetup()
        resolve()
      }
      
      ws.onmessage = (event) => {
        handleMessage(event.data)
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        if (onError) onError(error)
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        isConnected = false
        if (onConnectionChange) onConnectionChange(false)
        
        // Attempt reconnection
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          console.log(`Reconnecting... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
          setTimeout(() => connect(), 2000 * reconnectAttempts)
        }
      }
    } catch (err) {
      reject(err)
    }
  })
}

function sendSetup() {
  const setupMsg = {
    setup: {
      model: `models/${model}`,
      generation_config: {
        response_modalities: ['AUDIO'],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: 'Puck'
            }
          }
        },
        output_audio_transcription: {},
        input_audio_transcription: {},
      },
      system_instruction: {
        parts: [{
          text: `You are a live screen-aware voice assistant on the user's desktop. 
You receive audio (what the user says) and periodic screenshots of their screen. 
Respond conversationally in voice. If you see something relevant on screen, reference it naturally. 
Keep responses concise — 1-3 sentences. Be helpful and friendly.`
        }]
      }
    }
  }
  ws.send(JSON.stringify(setupMsg))
}

function handleMessage(data) {
  try {
    const msg = JSON.parse(data)
    
    // Handle server content
    if (msg.serverContent) {
      const sc = msg.serverContent
      
      // Audio output from model
      if (sc.modelTurn) {
        for (const part of sc.modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            const audioB64 = part.inlineData.data
            if (onAudioResponse) {
              onAudioResponse(audioB64)
            }
          }
        }
      }
      
      // Output transcription (what model said)
      if (sc.outputTranscription) {
        const text = sc.outputTranscription.text
        if (onTextResponse) {
          onTextResponse(text)
        }
      }
      
      // Input transcription (what model heard)
      if (sc.inputTranscription) {
        const text = sc.inputTranscription.text
        if (onTranscription) {
          onTranscription(text, 'user')
        }
      }
      
      // Turn complete
      if (sc.turnComplete) {
        console.log('Turn complete')
      }
    }
    
    // Handle setup complete
    if (msg.setupComplete) {
      console.log('Setup complete')
    }
    
  } catch (err) {
    console.error('Error parsing message:', err)
  }
}

export function sendAudio(audioBase64) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, queuing audio')
    sendAudioQueue.push(audioBase64)
    return
  }
  
  const msg = {
    realtimeInput: {
      audio: {
        data: audioBase64,
        mimeType: 'audio/pcm;rate=16000'
      }
    }
  }
  ws.send(JSON.stringify(msg))
}

export function sendScreenFrame(imageBase64, mimeType = 'image/jpeg') {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  
  const msg = {
    realtimeInput: {
      video: {
        data: imageBase64,
        mimeType: mimeType
      }
    }
  }
  ws.send(JSON.stringify(msg))
}

export function sendText(text) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return
  }
  
  const msg = {
    realtimeInput: {
      text: text
    }
  }
  ws.send(JSON.stringify(msg))
}

export function disconnect() {
  if (ws) {
    ws.close()
    ws = null
  }
  isConnected = false
  sendAudioQueue = []
  receiveAudioQueue = []
}

export function getConnectionStatus() {
  return isConnected
}

// Audio playback helper
let audioContext = null
let audioQueue = []
let isPlaying = false

export function initAudioPlayback() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export async function playAudioBase64(base64) {
  const ctx = initAudioPlayback()
  
  // Convert base64 to array buffer
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  // Decode audio (assuming 24kHz PCM from Gemini)
  try {
    const audioBuffer = await ctx.decodeAudioData(bytes.buffer)
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)
    source.start(0)
  } catch (err) {
    console.error('Audio playback error:', err)
    // Fallback: create audio element
    const blob = new Blob([bytes], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.play()
  }
}