# Voice Assistant

A screen-aware voice assistant desktop app inspired by Comet/Perplexity — sees your screen, hears your voice, live chat, and delegates complex tasks to sub-agents via Nvidia NIM.

## Features

- **🎤 Voice-First Interface** — Hybrid wake word ("Hey Assistant") + push-to-talk (Space)
- **👁️ Screen Awareness** — Captures full desktop (all monitors) via Electron's desktopCapturer, sends frames to Gemini Live API
- **🧠 Gemini Live API** — Single WebSocket for audio + video → streaming voice response (free tier on Google AI Studio)
- **🤖 Nvidia NIM Orchestrator** — Complex queries delegated to sub-agents (research, code, analysis, summarize, plan) via your NIM API key
- **💬 Chat Panel** — Text fallback, message history, active delegation tracking
- **🔧 Settings Panel** — API keys, screen source, capture interval, delegation preferences
- **🪟 Transparent Overlay** — Compact/expanded floating UI, always-on-top, draggable
- **🔐 Secure Storage** — API keys encrypted via Electron safeStorage (OS keychain)

## Quick Start

```bash
# Clone
git clone https://github.com/H-Morsi/voice-assistant.git
cd voice-assistant

# Install
npm install

# Development (two terminals)
npm run dev              # Terminal 1: Vite dev server
npm run electron:start   # Terminal 2: Electron (after Vite loads)

# Or combined
npm run electron:dev

# Build for production
npm run electron:build
```

## Required API Keys

Set in Settings (⚙️) after first launch:

| Service | Key | Required For |
|---------|-----|--------------|
| [Google AI Studio](https://aistudio.google.com/apikey) | `GEMINI_API_KEY` | Voice + screen live interaction (free tier generous) |
| [Nvidia NIM](https://build.nvidia.com/) | `NVIDIA_API_KEY` | Sub-agent delegation (research, code, analysis) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  ┌──────────────┐  ┌──────────────────────────────────────┐ │
│  │ Main Window  │  │ Overlay Window (transparent, top)    │ │
│  │  (Chat+UI)   │  │  - VU meter, status, mic toggle      │ │
│  └──────────────┘  └──────────────────────────────────────┘ │
│         │                         │                          │
│         ▼                         ▼                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  IPC / preload → desktopCapturer → screen frames        ││
│  │  IPC / preload → globalShortcut (Space PTT)             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer (React + Vite)                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ Gemini Live Service  │  │ Nvidia NIM Service           │ │
│  │  - WebSocket to      │  │  - Orchestrator LLM          │ │
│  │    generativelanguage│  │  - delegate_to_sub_agent()   │ │
│  │  - audio/pcm + JPEG  │  │  - Sub-agents: research,     │ │
│  │  - streaming audio   │  │    code, analysis, summarize,│ │
│  │    playback          │  │    plan                      │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Usage

1. **Launch** → Click mic or say "Hey Assistant" or hold `Space` (PTT)
2. **Speak** naturally — "What's on my screen?", "Summarize this page", "Research React hooks"
3. **Complex tasks** → Orchestrator auto-delegates to specialized sub-agents via Nvidia NIM
4. **Overlay** → Click chevron to expand/collapse floating widget

## Settings

- **AI Models** — Gemini API key, Nvidia NIM key/base URL/models
- **Voice** — Wake word toggle, PTT key, wake phrase
- **Screen** — Source selector (per monitor/window), capture interval (1-10s), JPEG quality
- **Delegation** — Auto-delegate, include screen context, parallel sub-agents
- **Advanced** — Encryption, local-only mode, context length, window behavior

## Build Outputs

- `dist-electron/Voice Assistant-1.0.0.AppImage` — Linux portable
- `dist-electron/voice-assistant_1.0.0_amd64.snap` — Snap package
- Windows: run `npm run electron:build` on Windows for NSIS installer

## Tech Stack

- **Electron 30** + **React 19** + **Vite 5**
- **Tailwind CSS 3** (glassmorphism UI)
- **Zustand** (state)
- **Lucide React** (icons)
- **Google GenAI SDK** (Gemini Live WebSocket)
- **OpenAI SDK** → **Nvidia NIM** (orchestrator + sub-agents)

## License

MIT