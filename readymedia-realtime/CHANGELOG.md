# Changelog

All notable changes to ReadyMedia Realtime will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.1] - 2025-01-16

### Added
- **Bruker-spesifikk API-nøkkel**: Hver bruker kan legge inn sin egen ElevenLabs API-nøkkel direkte i applikasjonen
- **API-nøkkel modal**: Popup ved første besøk for å legge inn API-nøkkel
- **Lokal datalagring**: Alle data lagres kun lokalt i nettleseren (localStorage og IndexedDB)
- **Transcript UI**: Grunnleggende UI for transcript-visning og nedlasting (under utvikling)
- **Clear All Data**: Funksjonalitet for å slette alle data (API-nøkkel, innstillinger, transcripts)
- **Vercel-deployment**: Full støtte for deployment til Vercel med serverless functions

### Changed
- **Token-generering**: Server aksepterer nå API-nøkkel fra request body (bruker-spesifikk) eller miljøvariabel
- **Datalagring**: Alle data lagres kun lokalt, ingen lagring på serveren
- **Personvern**: Forbedret personvern med isolert lagring per nettleser

### Fixed
- ✅ API-nøkkel huskes mellom sesjoner
- ✅ Bedre feilhåndtering for IndexedDB
- ✅ Forbedret logging for debugging

### Known Issues
- ⚠️ Transcript-lagring og nedlasting er under utvikling og kan ha noen problemer
- Full transcript-funksjonalitet kommer i en senere versjon

### Technical
- IndexedDB for lokal lagring av transcripts
- localStorage for API-nøkkel og innstillinger
- Serverless functions for Vercel-deployment
- Forbedret error handling og logging

---

## [6.0.0] - 2025-01-16

### Added
- **Display Modes**: Three new display modes replacing old layout options
  - Fullscreen Short: Compact fullscreen with 8 lines, teleprompter-style auto-scroll
  - Fullscreen Long: Extended fullscreen with 12 lines, smooth scrolling (default)
  - Captions Lower: Bottom strip mode with 2-3 lines, fixed position
- **Chroma Key Theme**: New theme optimized for chroma keying with green background (#00D800), white text, and black stroke
- **Info Modal**: New information modal with app details, API information, and keyboard shortcuts
- **Language Selection**: Dropdown menu to choose between English, Norwegian, German, French, Swedish, Danish, or Auto-detection
- **Auto-typography**: Display modes automatically set optimal typography settings
  - Fullscreen Short: Roboto, L (64px), line spacing 1.3
  - Fullscreen Long: Roboto, M (52px), line spacing 1.5 (default)
  - Captions Lower: Open Sans, XS (36px), line spacing 1.2
- **Transcript Saving**: Automatic saving of transcripts to `.txt` files in `transcripts/` folder
- **Comprehensive Documentation**: Added detailed documentation about language selection and API limitations

### Changed
- **Default Display Mode**: Changed from Fullscreen Short to Fullscreen Long
- **Default Language**: Changed from Auto-detection to English
- **UI Language**: GUI language now follows selected transcription language (default: English)
- **Theme Selection**: Changed from buttons to dropdown menu
- **Control Panel Layout**: Improved spacing and alignment of control groups
- **Keyboard Shortcuts**: 'B' key now cycles through display modes instead of layout toggle
- **Fullscreen Mode**: Now properly hides all UI elements (status bar, control panel, info modal)

### Fixed
- ✅ Language selection locked during transcription to prevent crashes
- ✅ Dropdown menu text visibility in dark theme
- ✅ Control panel hide/show functionality (H key)
- ✅ Text color in light theme for better readability
- ✅ Text color differentiation: New text is prominent, old text fades
- ✅ Display mode default settings and typography auto-application
- ✅ Info modal positioning and content display
- ✅ Microphone refresh button layout issues

### Documentation
- Added comprehensive section on language selection and API limitations
- Added troubleshooting guide for language-related issues
- Updated README with detailed information about ElevenLabs API behavior
- Added technical background on how `language_code` parameter works

### Technical
- Improved logging for language code debugging
- Enhanced error handling and user feedback
- Better UI/UX with improved spacing and alignment
- Optimized text rendering with unified lines array
- Direct DOM updates to prevent text blinking

---

## [1.0.0] - 2025-01-15

### Added
- Initial release of ReadyMedia Realtime
- Real-time speech-to-text using ElevenLabs Scribe v2 Realtime
- Automatic language detection (Norwegian, English, and more)
- Two display modes: Fullscreen and Bottom Stripe (2-4 lines)
- Two themes: Light and Dark with high contrast
- Typography controls: 5 fonts, 6 sizes, adjustable line height
- Text flow options: Scroll and Fade
- Keyboard shortcuts for quick control
- Universal Design (UU) compliance - WCAG 2.1 AA/AAA
- Zero-retention mode (no audio/text storage)
- Local storage for user preferences
- Audio level visualization
- Connection status indicators
- Responsive control panel
- Fullscreen API support
- 1920×1080 optimization with safe areas

### Backend
- Express.js server for token generation
- ElevenLabs API proxy
- CORS support
- Health check endpoint
- Environment variable configuration

### Documentation
- Comprehensive README with installation guide
- Quick Start guide (5 minutes to launch)
- Deployment guide for production
- systemd service file for Linux servers
- Nginx configuration examples
- Docker support

### Security
- API key never exposed to client
- HTTPS/WSS encrypted communication
- GDPR-compliant data handling

---

## [2.0.0] - 2025-01-14

### Fixed
- ✅ WebSocket connection issues - corrected URL format and token authentication
- ✅ Audio message protocol - fixed message format to match ElevenLabs API specification
- ✅ Base64 encoding bug - fixed call stack overflow for large audio chunks
- ✅ Error handling - improved error messages and logging
- ✅ Message type handling - support for both `message_type` and `type` fields
- ✅ Reconnection logic - improved token refresh on reconnect

### Changed
- Updated WebSocket URL format to match ElevenLabs API documentation
- Changed message format to include `message_type: 'input_audio_chunk'` and `commit: false`
- Improved error handling for `input_error` messages
- Enhanced logging for better debugging

### Technical
- Fixed base64 encoding to use chunked approach (8192 bytes chunks)
- Removed unnecessary initial configuration message
- Updated WebSocket connection to use token as query parameter
- Improved error messages with specific error codes

---

## [4.0.0] - 2025-01-15

### Added
- 🌍 **Language Selection**: Dropdown menu to choose transcription language
  - Auto-detection (default)
  - Norwegian (Bokmål)
  - English
  - German
  - French
  - Swedish
  - Danish
- 🌐 **Multi-language UI**: GUI automatically follows selected language
  - English (default UI language)
  - Norwegian
  - Swedish
  - German
  - French
  - Danish
  - All buttons, labels, and messages are translated
- 💾 **Transcript Saving**: Automatic saving of transcripts to `.txt` files
  - Files saved in `transcripts/` folder
  - Filename format: `readymedia_realtime_YYYYMMDD_HHMMSS.txt`
  - Includes date, time, selected language, and project information
  - Saved automatically when recording stops

### Fixed
- ✅ Dropdown menu text visibility in dark theme (black background for options)
- ✅ Fullscreen mode now properly hides all UI elements (status bar, control panel, keyboard shortcuts)
- ✅ Text colors in light theme for better readability (black text on white background)
- ✅ Text color differentiation: New (partial) text is more prominent, old (committed) text is grayed out
  - Dark theme: New text = white, Old text = gray
  - Light theme: New text = black, Old text = gray
- ✅ Removed redundant "Valgt:" (Selected) language display
- ✅ Reverted bottom stripe max 4 lines limitation (restored original behavior)

### Changed
- Default UI language changed from Norwegian to English
- Language selection now updates both transcription language and UI language
- Auto-detection mode uses English UI by default
- Improved language detection display (only shown when auto-detection is active)

### Technical
- Added comprehensive translation system with support for 6 languages
- Implemented `updateUI()` method for dynamic language switching
- Added `getTranslations()` helper method
- Added `/api/save-transcript` endpoint on backend
- Added `fs` module for file system operations
- Enhanced `applySettings()` to call `updateUI()` on initialization
- Updated HTML `lang` attribute dynamically based on UI language

---

## [5.0.0] - 2025-01-15

### Added
- 🎬 **Chroma Key Theme**: New theme optimized for video mixing and chroma keying
  - Chroma Key Green background (#00D800)
  - White text (#FFFFFF) with black stroke (2px) for optimal visibility
  - Perfect for use in video mixers and streaming software
  - Control panel and status bar automatically hidden in fullscreen mode
- 🎨 **Theme Dropdown Menu**: Changed theme selection from buttons to dropdown menu
  - More intuitive interface with 3 theme options
  - Supports Dark, Light, and Chroma Key themes
- ▶️ **Enhanced Start Button**: Start transcription button now has:
  - Blue color (#3b82f6) when ready to start
  - Play icon (▶️) when ready
  - Stop icon (⏹️) when recording (green background)
  - Better visual indication of the primary action

### Fixed
- ✅ **Language Selection Lock**: Language dropdown is now locked during transcription
  - Prevents crashes when changing language during active transcription
  - Visual indication (disabled state) when locked
  - Automatically unlocks when transcription stops
  - Prevents accidental language changes that could disrupt the session

### Changed
- Theme selection changed from toggle buttons to dropdown menu for better UX
- Start transcription button styling improved for better visibility and clarity
- Keyboard shortcut (T) now cycles through all three themes: dark → light → chroma → dark

### Technical
- Added `setTheme()` method for direct theme setting
- Enhanced `toggleTheme()` to cycle through all three themes
- Added disabled state styling for control-select elements
- Improved button state management for start/stop transcription
- Added chroma key specific CSS with text-stroke and text-shadow for cross-browser compatibility

---

## [Unreleased]

### Planned Features
- [ ] Translation support (DeepL/Google/OpenAI)
- [ ] SRT/WebVTT export
- [ ] Word-level timestamps with karaoke highlighting
- [ ] Terminology filtering for custom vocabulary
- [ ] Multiple audio source mixing
- [ ] Speaker identification and color coding
- [ ] Session recording (opt-in)
- [ ] Cloud storage integration
- [ ] Multi-language UI
- [ ] Mobile app support
- [ ] Advanced audio processing (noise reduction, echo cancellation)

---

[1.0.0]: https://github.com/din-bruker/readymedia-realtime/releases/tag/v1.0.0
