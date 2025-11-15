# 📁 Prosjektstruktur - ReadyMedia Realtime

```
readymedia-realtime/
│
├── 📄 README.md                    # Hoveddo kumentasjon
├── 📄 QUICKSTART.md                # 5-minutters oppstartsguide
├── 📄 DEPLOYMENT.md                # Produksjonsutrulling
├── 📄 TROUBLESHOOTING.md           # Feilsøking
├── 📄 CHANGELOG.md                 # Versjonshistorikk
├── 📄 LICENSE                      # MIT-lisens
├── 📄 .gitignore                   # Git ekskluderinger
├── 📄 readymedia-realtime.service  # systemd service-fil
│
├── 📂 server/                      # Backend (Node.js)
│   ├── 📄 server.js                # Hovedserver
│   ├── 📄 package.json             # Dependencies
│   ├── 📄 .env.example             # Eksempelkonfigurasjon
│   ├── 📄 .env                     # Din konfigurasjon (ikke i git)
│   └── 📄 test-server.js           # Testscript
│
└── 📂 client/                      # Frontend (HTML/CSS/JS)
    ├── 📄 index.html               # Hovedside
    ├── 📄 styles.css               # Styling (tema, layout, UU)
    └── 📄 app.js                   # Applikasjonslogikk
```

## 🔑 Nøkkelkomponenter

### Backend (`server/`)

**server.js** (125 linjer)
- Express.js server
- Token-generering for Scribe API
- Static file serving
- Health check endpoint
- CORS-støtte

**Endepunkter:**
- `GET /api/health` - Server status
- `POST /api/scribe-token` - Generer single-use token
- `GET /*` - Serve frontend

### Frontend (`client/`)

**index.html** (160 linjer)
- Semantisk HTML5-struktur
- Kontrollpanel med alle innstillinger
- Status-bar med tilkoblingsindikator
- Tekstvisning-område
- Hotkeys-hjelpemeny

**styles.css** (600+ linjer)
- CSS custom properties (variables)
- Mørk og lys tema
- Fullskjerm og bunnstripe-layout
- Responsive design
- Accessibility (WCAG 2.1)
- Prefers-reduced-motion support
- 1920×1080 optimalisering

**app.js** (700+ linjer)
- `ReadyMediaRealtime` klasse
- WebSocket-tilkobling til Scribe API
- Web Audio API for lydfangst
- PCM-konvertering (Float32 → Int16)
- Partial og committed transcript-håndtering
- Hotkey-system
- Settings persistence (localStorage)
- Error handling og reconnect-logikk

## 🌐 Dataflyt

```
┌─────────────┐
│  Mikrofon   │ 
│ (Focusrite) │
└──────┬──────┘
       │ Audio Stream (48kHz PCM)
       ↓
┌─────────────────────┐
│   Web Audio API     │
│ (Browser/client/    │
│      app.js)        │
└──────┬──────────────┘
       │ Int16 PCM chunks
       ↓
┌─────────────────────┐
│  WebSocket (WSS)    │
│ to Scribe API       │
└──────┬──────────────┘
       │ Base64 encoded audio
       ↓
┌─────────────────────┐
│ ElevenLabs Scribe   │
│   v2 Realtime       │
│   (STT Engine)      │
└──────┬──────────────┘
       │ JSON messages
       │ (partial/committed)
       ↓
┌─────────────────────┐
│  Frontend Display   │
│ (client/app.js +    │
│  client/styles.css) │
└─────────────────────┘
```

## 🔐 Sikkerhetsflyt

```
1. Frontend requests token
   │
   ↓
2. Backend (server.js) generates
   single-use token via ElevenLabs API
   using ELEVENLABS_API_KEY from .env
   │
   ↓
3. Backend returns token to frontend
   (Token expires in 15 minutes)
   │
   ↓
4. Frontend connects to Scribe WebSocket
   using token (API key never exposed)
   │
   ↓
5. Audio streams securely via WSS
   (Zero-retention mode)
```

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",      // Web server
  "cors": "^2.8.5",          // CORS middleware
  "dotenv": "^16.3.1"        // Environment variables
}
```

### Frontend
- **Ingen eksterne dependencies!**
- Vanilla JavaScript (ES6+)
- Native Web APIs:
  - WebSocket API
  - Web Audio API
  - Fullscreen API
  - Local Storage API
  - MediaDevices API

## 🎨 CSS-arkitektur

```
styles.css (struktur)
│
├── CSS Variables (themes)
│   ├── Dark theme (default)
│   └── Light theme
│
├── Base styles
│   ├── Reset & box-sizing
│   └── Body defaults
│
├── Components
│   ├── Status bar
│   ├── Control panel
│   ├── Text display
│   └── Overlay
│
├── Themes
│   ├── [data-theme="dark"]
│   └── [data-theme="light"]
│
├── Layouts
│   ├── [data-layout="fullscreen"]
│   └── [data-layout="stripe"]
│
├── Font sizes
│   ├── [data-font-size="xs"]
│   ├── [data-font-size="s"]
│   ├── [data-font-size="m"]
│   ├── [data-font-size="l"]
│   ├── [data-font-size="xl"]
│   └── [data-font-size="xxl"]
│
├── Utilities
│   ├── Animations
│   ├── Transitions
│   └── Accessibility
│
└── Media queries
    ├── Prefers-reduced-motion
    ├── Prefers-contrast
    └── Print styles
```

## 💾 Lagrede innstillinger

Frontend lagrer følgende i localStorage:

```json
{
  "theme": "dark",                        // "dark" | "light"
  "layout": "fullscreen",                 // "fullscreen" | "stripe"
  "fontSize": "m",                        // "xs" | "s" | "m" | "l" | "xl" | "xxl"
  "fontFamily": "'Inter', sans-serif",    // Font CSS-string
  "lineHeight": "1.4",                    // 1.2-1.8
  "textFlow": "scroll",                   // "scroll" | "fade"
  "audioDeviceId": "device-uuid"          // Selected mic ID
}
```

## 🔄 Tilstandshåndtering

Frontend holder styr på:

```javascript
{
  // WebSocket
  ws: WebSocket | null,
  isConnected: boolean,
  
  // Audio
  audioContext: AudioContext | null,
  audioStream: MediaStream | null,
  isRecording: boolean,
  
  // Auth
  token: string | null,
  tokenExpiresAt: Date | null,
  
  // Transcripts
  committedTranscripts: Array<{
    id: number,
    text: string,
    language: string,
    timestamp: Date
  }>,
  partialTranscript: string,
  
  // Settings (synced to localStorage)
  settings: { ... }
}
```

## 📏 Tekniske spesifikasjoner

- **Audio format**: 48 kHz, 16-bit PCM, mono
- **Chunk size**: 4096 samples (~85ms @ 48kHz)
- **WebSocket protocol**: `wss://`
- **Commit strategy**: Manual (default)
- **Target latency**: <250ms
- **Display optimization**: 1920×1080 (16:9)
- **Safe margins**: 5% horizontal, 5% vertical
- **Font sizes**: 36-88px (XS-XXL)
- **Line height**: 1.2-1.8
- **Max line length**: ~70 characters
- **Browser support**: Chrome 90+, Edge 90+, Opera 76+

---

**Total linjekode:** ~1,500 linjer (HTML+CSS+JS)  
**Backend:** ~125 linjer  
**Frontend:** ~1,375 linjer  
**Dokumentasjon:** ~2,000 linjer
