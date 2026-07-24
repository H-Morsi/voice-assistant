// Screen Capture Service
// Uses mss-like approach via Electron's desktopCapturer

let captureInterval = null
let isCapturing = false

export async function startScreenCapture(onFrame, intervalMs = 3000) {
  if (isCapturing) return
  
  if (!window.electronAPI) {
    console.warn('electronAPI not available')
    return
  }
  
  isCapturing = true
  
  const capture = async () => {
    if (!isCapturing) return
    
    try {
      // Get screen sources
      const sources = await window.electronAPI.getScreenSources()
      if (sources && sources.length > 0) {
        // Capture the primary screen
        const primaryScreen = sources[0]
        const frame = await window.electronAPI.captureScreen(primaryScreen.id)
        if (frame && onFrame) {
          onFrame(frame)
        }
      }
    } catch (err) {
      console.error('Screen capture error:', err)
    }
  }
  
  // Initial capture
  await capture()
  
  // Set up interval
  captureInterval = setInterval(capture, intervalMs)
}

export function stopScreenCapture() {
  if (captureInterval) {
    clearInterval(captureInterval)
    captureInterval = null
  }
  isCapturing = false
}

export function getCaptureStatus() {
  return isCapturing
}

// Audio capture for push-to-talk
let audioContext = null
let mediaStream = null
let mediaRecorder = null
let audioChunks = []
let onAudioDataCallback = null

export async function startAudioCapture(onAudioData) {
  onAudioDataCallback = onAudioData
  audioChunks = []
  
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    })
    
    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'audio/webm;codecs=opus'
    })
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && onAudioDataCallback) {
        onAudioDataCallback(event.data)
      }
    }
    
    mediaRecorder.start(100) // 100ms chunks
    return true
  } catch (err) {
    console.error('Audio capture error:', err)
    return false
  }
}

export function stopAudioCapture() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }
  mediaRecorder = null
  mediaStream = null
  onAudioDataCallback = null
}

// Wake word detection (simple energy-based for now, can be replaced with Porcupine)
let wakeWordDetector = null
let wakeWordCallback = null

export function startWakeWordDetection(onWakeWord) {
  wakeWordCallback = onWakeWord
  // This would integrate with Porcupine or similar in production
  // For now, we'll use a simple energy threshold
  console.log('Wake word detection started (placeholder)')
}

export function stopWakeWordDetection() {
  wakeWordCallback = null
  wakeWordDetector = null
}

// Convert audio blob to base64 for API
export async function audioBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Convert base64 to audio blob
export function base64ToAudioBlob(base64, mimeType = 'audio/wav') {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// Play audio from base64
export function playAudioBase64(base64, mimeType = 'audio/wav') {
  const blob = base64ToAudioBlob(base64, mimeType)
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.play()
  return audio
}