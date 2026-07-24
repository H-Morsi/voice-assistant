// Gemini Live API Service - WebSocket connection to Google's multimodal live API

let ws = null
let isConnected = false
let apiKey = null
let selectedSourceId = null
let messageHandlers = new Map()
let messageId = 0
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 3

// Callbacks
let onAudioResponse = null
let onTextResponse = null
let onTranscription = null
let onError = null
let onConnectionChange = null
let onScreenFrameRequest = null

// Audio playback
let audioContext = null
let audioQueue = []
let isPlaying = false

export async function startGeminiLive(key, sourceId, callbacks) {
  if (isConnected) return true
  
  apiKey = key
  selectedSourceId = sourceId
  onAudioResponse = callbacks.onAudioResponse
  onTextResponse = callbacks.onTextResponse
  onTranscription = callbacks.onTranscription
  onError = callbacks.onError
  onConnectionChange = callbacks.onConnectionChange
  onScreenFrameRequest = callbacks.onScreenFrameRequest

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
        
        // Start screen capture if source selected
        if (selectedSourceId && onScreenFrameRequest) {
          startScreenCaptureLoop()
        }
        
        resolve(true)
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
          console.log(`Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
          setTimeout(() => startGeminiLive(apiKey, selectedSourceId, callbacks), 2000 * reconnectAttempts)
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
      model: 'models/gemini-3.1-flash-live-preview',
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
    
    if (msg.serverContent) {
      const sc = msg.serverContent
      
      // Audio output from model
      if (sc.modelTurn) {
        for (const part of sc.modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            if (onAudioResponse) {
              onAudioResponse(part.inlineData.data)
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
          onTranscription(text, true) // true = isFinal
        }
      }
      
      // Turn complete
      if (sc.turnComplete) {
        console.log('Turn complete')
      }
    }
    
    if (msg.setupComplete) {
      console.log('Setup complete')
    }
    
  } catch (err) {
    console.error('Error parsing message:', err)
  }
}

export function sendAudio(audioBase64) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
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
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
  const msg = {
    realtimeInput: {
      video: {
        data: imageBase64,
        mimeType
      }
    }
  }
  ws.send(JSON.stringify(msg))
}

export function sendText(text) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
  const msg = {
    realtimeInput: {
      text: text
    }
  }
  ws.send(JSON.stringify(msg))
}

export function stopGeminiLive() {
  if (ws) {
    ws.close()
    ws = null
  }
  isConnected = false
  apiKey = null
  selectedSourceId = null
  reconnectAttempts = 0
}

export function getConnectionStatus() {
  return isConnected
}

// Screen capture loop
let screenCaptureInterval = null

function startScreenCaptureLoop() {
  if (screenCaptureInterval) return
  
  const INTERVAL_MS = 3000 // 3 seconds
  
  screenCaptureInterval = setInterval(async () => {
    if (!isConnected || !onScreenFrameRequest) return
    
    try {
      const frame = await onScreenFrameRequest(selectedSourceId)
      if (frame) {
        sendScreenFrame(frame)
      }
    } catch (err) {
      console.error('Screen capture error:', err)
    }
  }, INTERVAL_MS)
}

function stopScreenCaptureLoop() {
  if (screenCaptureInterval) {
    clearInterval(screenCaptureInterval)
    screenCaptureInterval = null
  }
}

// Audio playback
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
  
  try {
    // Decode audio (Gemini returns 24kHz PCM)
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