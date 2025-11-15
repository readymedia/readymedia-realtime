// ReadyMedia Realtime - Main Application
// WebSocket-based realtime transcription using ElevenLabs Scribe v2

class ReadyMediaRealtime {
    constructor() {
        this.ws = null;
        this.audioContext = null;
        this.audioStream = null;
        this.audioWorkletNode = null;
        this.isConnected = false;
        this.isRecording = false;
        this.token = null;
        this.tokenExpiresAt = null;
        
        // Translations
        this.translations = this.initTranslations();
        
        // Settings
        this.settings = this.loadSettings();
        
        // Transcripts
        this.committedTranscripts = [];
        this.partialTranscript = '';
        this.sessionTranscripts = []; // Store transcripts for current session
        
        // Display mode configuration
        this.displayModes = {
            'fullscreen-short': {
                layout: 'fullscreen',
                maxLines: 7,
                activeLines: 2,
                historySeconds: 10,
                flowType: 'push'
            },
            'fullscreen-long': {
                layout: 'fullscreen',
                maxLines: 12,
                activeLines: 3,
                historySeconds: 25,
                flowType: 'smoothScroll'
            },
            'captions-lower': {
                layout: 'bottomStrip',
                maxLines: 4,
                activeLines: 2,
                historySeconds: 6,
                flowType: 'push'
            }
        };
        
        // Line timestamps for history management
        this.lineTimestamps = [];
        
        // DOM elements
        this.initElements();
        
        // Event listeners
        this.initEventListeners();
        
        // Apply saved settings
        this.applySettings();
        
        // Initialize audio inputs
        this.initAudioInputs();
        
        // Start periodic cleanup of old lines
        this.startPeriodicCleanup();
    }
    
    startPeriodicCleanup() {
        // Clean up old lines every 5 seconds
        setInterval(() => {
            if (this.committedTranscripts.length > 0) {
                this.renderCommittedTranscripts();
            }
        }, 5000);
    }
    
    initElements() {
        // Status
        this.connectionStatus = document.getElementById('connectionStatus');
        this.statusText = document.getElementById('statusText');
        this.audioLevel = document.getElementById('audioLevel');
        
        // Controls
        this.audioInput = document.getElementById('audioInput');
        this.toggleMic = document.getElementById('toggleMic');
        this.refreshMics = document.getElementById('refreshMics');
        this.micHelpText = document.getElementById('micHelpText');
        this.fontFamily = document.getElementById('fontFamily');
        this.fontSize = document.getElementById('fontSize');
        this.lineHeight = document.getElementById('lineHeight');
        this.lineHeightValue = document.getElementById('lineHeightValue');
        this.themeSelect = document.getElementById('themeSelect');
        this.displayModeSelect = document.getElementById('displayModeSelect');
        this.clearText = document.getElementById('clearText');
        this.fullscreenToggle = document.getElementById('fullscreenToggle');
        this.languageSelect = document.getElementById('languageSelect');
        this.detectedLanguage = document.getElementById('detectedLanguage');
        this.infoButton = document.getElementById('infoButton');
        this.infoModal = document.getElementById('infoModal');
        this.closeInfoModal = document.getElementById('closeInfoModal');
        this.infoContent = document.getElementById('infoContent');
        
        // Display
        this.textContainer = document.getElementById('textContainer');
        this.partialText = document.getElementById('partialText');
        this.committedTexts = document.getElementById('committedTexts');
        this.controlPanel = document.getElementById('controlPanel');
        
        // Overlay
        this.overlay = document.getElementById('overlay');
        this.overlayMessage = document.getElementById('overlayMessage');
    }
    
    initEventListeners() {
        // Audio input
        this.audioInput.addEventListener('change', () => {
            this.settings.audioDeviceId = this.audioInput.value;
            this.saveSettings();
            if (this.isRecording) {
                this.stopRecording();
                setTimeout(() => this.startRecording(), 500);
            }
            // Enable mic button when device is selected
            this.toggleMic.disabled = !this.audioInput.value;
        });
        
        // Microphone toggle
        this.toggleMic.addEventListener('click', () => this.toggleMicrophone());
        
        // Refresh microphones
        this.refreshMics.addEventListener('click', async () => {
            console.log('Refreshing microphone list...');
            await this.initAudioInputs();
        });
        
        // Typography
        this.fontFamily.addEventListener('change', (e) => {
            this.settings.fontFamily = e.target.value;
            this.applyTypography();
            this.saveSettings();
        });
        
        this.fontSize.addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            document.body.setAttribute('data-font-size', e.target.value);
            this.saveSettings();
        });
        
        this.lineHeight.addEventListener('input', (e) => {
            this.settings.lineHeight = e.target.value;
            this.lineHeightValue.textContent = e.target.value;
            this.applyTypography();
            this.saveSettings();
        });
        
        // Theme toggle
        this.themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });
        
        // Display mode
        this.displayModeSelect.addEventListener('change', (e) => {
            this.setDisplayMode(e.target.value);
        });
        
        // Language selection
        this.languageSelect.addEventListener('change', (e) => {
            // Don't allow language change while recording
            if (this.isRecording) {
                // Revert to previous value
                this.languageSelect.value = this.settings.languageCode || '';
                return;
            }
            
            this.settings.languageCode = e.target.value;
            // Update UI language based on selected language (or English for auto-detect)
            this.settings.uiLanguage = e.target.value || 'en';
            this.saveSettings();
            this.updateUI();
        });
        
        // Actions
        this.clearText.addEventListener('click', () => this.clearAllText());
        this.fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
        
        // Info modal
        this.infoButton.addEventListener('click', () => this.showInfoModal());
        this.closeInfoModal.addEventListener('click', () => this.hideInfoModal());
        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal) {
                this.hideInfoModal();
            }
        });
        
        // Hotkeys
        document.addEventListener('keydown', (e) => this.handleHotkey(e));
        
        // Fullscreen change
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
    }
    
    async initAudioInputs() {
        try {
            const t = this.getTranslations();
            // Show overlay while requesting permission
            this.showOverlay(t.requestingMic);
            
            // First, request microphone permission to get device labels
            // This is required by browser security - devices are only labeled after permission
            console.log('Requesting microphone permission...');
            
            try {
                // Request temporary access to get device labels
                const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop the temporary stream
                tempStream.getTracks().forEach(track => track.stop());
                console.log('Microphone permission granted');
            } catch (permError) {
                console.warn('Microphone permission denied or not available:', permError);
                this.hideOverlay();
                this.showError(t.micPermissionDenied);
                return;
            }
            
            // Now enumerate devices - they will have proper labels
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(d => d.kind === 'audioinput');
            
            console.log(`Found ${audioDevices.length} audio input devices`);
            
            this.audioInput.innerHTML = `<option value="">${t.selectMicrophone}</option>`;
            
            if (audioDevices.length === 0) {
                this.audioInput.innerHTML = `<option value="">${t.noMicrophones}</option>`;
                this.micHelpText.style.display = 'block';
                this.hideOverlay();
                this.showError(t.noMicsFound);
                return;
            }
            
            // Hide help text if devices found
            this.micHelpText.style.display = 'none';
            
            audioDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                // Use device label if available, otherwise create a friendly name
                option.textContent = device.label || `Mikrofon ${index + 1}`;
                this.audioInput.appendChild(option);
                console.log(`Device ${index + 1}: ${device.label || 'Unnamed'} (${device.deviceId.substr(0, 12)}...)`);
            });
            
            // Select saved device if available
            if (this.settings.audioDeviceId) {
                this.audioInput.value = this.settings.audioDeviceId;
            } else if (audioDevices.length > 0) {
                // Auto-select first device
                this.audioInput.value = audioDevices[0].deviceId;
                this.settings.audioDeviceId = audioDevices[0].deviceId;
                this.saveSettings();
            }
            
            // Enable button if device selected
            if (this.audioInput.value) {
                this.toggleMic.disabled = false;
            }
            
            this.hideOverlay();
        } catch (error) {
            console.error('Failed to enumerate audio devices:', error);
            const t = this.getTranslations();
            this.hideOverlay();
            this.showError(t.couldNotLoadDevices + ': ' + error.message);
        }
    }
    
    getTranslations() {
        const lang = this.settings.uiLanguage || 'en';
        return this.translations[lang] || this.translations['en'];
    }
    
    async toggleMicrophone() {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            const t = this.getTranslations();
            this.showOverlay(t.connecting);
            
            // Get token
            console.log('Fetching token from server...');
            await this.fetchToken();
            console.log('Token received successfully');
            
            // Connect to Scribe
            console.log('Connecting to Scribe API...');
            await this.connectScribe();
            console.log('Connected to Scribe API');
            
            // Get audio stream
            const deviceId = this.audioInput.value;
            if (!deviceId) {
                throw new Error('No audio source selected');
            }
            
            console.log('Requesting audio stream from device:', deviceId);
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId },
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 48000,
                    channelCount: 1
                }
            });
            console.log('Audio stream obtained');
            
            // Setup audio processing
            console.log('Setting up audio processing...');
            await this.setupAudioProcessing();
            console.log('Audio processing ready');
            
            this.isRecording = true;
            this.toggleMic.textContent = '⏹️ ' + t.stopTranscription;
            this.toggleMic.classList.add('active');
            this.toggleMic.classList.remove('btn-start');
            
            // Lock language selection during recording
            if (this.languageSelect) {
                this.languageSelect.disabled = true;
            }
            
            // Reset session transcripts when starting new recording
            this.sessionTranscripts = [];
            
            this.hideOverlay();
            
            console.log('✅ Recording started!');
        } catch (error) {
            console.error('Failed to start recording:', error);
            const t = this.getTranslations();
            const errorMessage = error.message || error.toString() || JSON.stringify(error) || 'Unknown error';
            console.error('Full error details:', error);
            this.showError(t.couldNotLoadDevices + ': ' + errorMessage);
            this.hideOverlay();
        }
    }
    
    async stopRecording() {
        try {
            console.log('Stopping transcription...');
            
            // Stop audio stream
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
                console.log('Audio stream stopped');
            }
            
            // Close audio context
            if (this.audioContext) {
                await this.audioContext.close();
                this.audioContext = null;
                console.log('Audio context closed');
            }
            
            // Close WebSocket
            if (this.ws) {
                this.ws.close();
                this.ws = null;
                console.log('WebSocket closed');
            }
            
            this.isRecording = false;
            this.isConnected = false;
            const t = this.getTranslations();
            this.toggleMic.textContent = '▶️ ' + t.startTranscription;
            this.toggleMic.classList.remove('active');
            this.toggleMic.classList.add('btn-start');
            
            // Unlock language selection when recording stops
            if (this.languageSelect) {
                this.languageSelect.disabled = false;
            }
            this.updateConnectionStatus(false);
            
            // Save transcript if we have any transcripts
            if (this.sessionTranscripts.length > 0) {
                this.saveTranscript();
            }
            
            console.log('✅ Transkribering stoppet');
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    }
    
    async fetchToken() {
        try {
            console.log('Requesting token from /api/scribe-token...');
            const response = await fetch('/api/scribe-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Token response status:', response.status);
            
            if (!response.ok) {
                let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                    console.error('Token error details:', errorData);
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            
            if (!data.token) {
                throw new Error('Ingen token mottatt fra server');
            }
            
            this.token = data.token;
            this.tokenExpiresAt = new Date(data.expiresAt);
            
            console.log('✅ Token obtained, expires at:', this.tokenExpiresAt);
        } catch (error) {
            console.error('Token fetch error:', error);
            throw new Error('Token-generering feilet: ' + (error.message || 'Ukjent feil. Sjekk at API-nøkkelen er korrekt i .env'));
        }
    }
    
    async connectScribe() {
        return new Promise((resolve, reject) => {
            // ElevenLabs Scribe v2 WebSocket URL - token as query parameter
            // Add language_code if specified (empty string = auto-detect)
            let wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&audio_format=pcm_48000&commit_strategy=manual&token=${encodeURIComponent(this.token)}`;
            
            // Add language_code parameter if a specific language is selected
            if (this.settings.languageCode) {
                wsUrl += `&language_code=${encodeURIComponent(this.settings.languageCode)}`;
            }
            
            console.log('Connecting to WebSocket:', wsUrl.substring(0, 150) + '...');
            console.log('Token (first 20 chars):', this.token?.substring(0, 20) + '...');
            console.log('Full token length:', this.token?.length);
            
            try {
                this.ws = new WebSocket(wsUrl);
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(new Error('Failed to create WebSocket: ' + error.message));
                return;
            }
            
            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.updateConnectionStatus(true);
                // Session starts automatically - no need to send initial message
                resolve();
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleScribeMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error, event.data);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.error('WebSocket readyState:', this.ws?.readyState);
                console.error('WebSocket URL:', wsUrl.substring(0, 100) + '...');
                this.isConnected = false;
                this.updateConnectionStatus(false);
                // Create a more descriptive error
                const wsError = new Error(`WebSocket connection failed. Check console for details. ReadyState: ${this.ws?.readyState}`);
                reject(wsError);
            };
            
            this.ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                console.log('Close code:', event.code, '- Reason:', event.reason || 'No reason provided');
                console.log('Was connected:', this.isConnected);
                this.isConnected = false;
                this.updateConnectionStatus(false);
                
                // If connection failed during initial connection (before onopen), reject the promise
                // 1006 = abnormal closure, 1002 = protocol error, 1003 = unsupported data
                if (event.code !== 1000 && !this.isConnected) {
                    let errorMsg = `WebSocket closed with code ${event.code}`;
                    if (event.reason) {
                        errorMsg += `: ${event.reason}`;
                    } else {
                        // Common error codes
                        if (event.code === 1006) {
                            errorMsg += ': Connection failed (check network/firewall)';
                        } else if (event.code === 1002) {
                            errorMsg += ': Protocol error (check token format)';
                        } else if (event.code === 1003) {
                            errorMsg += ': Unsupported data (check API compatibility)';
                        } else {
                            errorMsg += ': Connection failed';
                        }
                    }
                    const closeError = new Error(errorMsg);
                    reject(closeError);
                }
                
                if (this.isRecording) {
                    // Try to reconnect with new token (tokens expire after 15 min)
                    setTimeout(async () => {
                        if (this.isRecording) {
                            console.log('Attempting to reconnect...');
                            try {
                                await this.fetchToken();
                                await this.connectScribe();
                            } catch (error) {
                                console.error('Reconnection failed:', error);
                                const t = this.getTranslations();
                                this.showError('Connection failed. Please try starting recording again.');
                            }
                        }
                    }, 2000);
                }
            };
            
            // Timeout
            setTimeout(() => {
                if (!this.isConnected) {
                    reject(new Error('Connection timeout'));
                }
            }, 10000);
        });
    }
    
    async setupAudioProcessing() {
        this.audioContext = new AudioContext({ sampleRate: 48000 });
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        
        // Create script processor for audio chunks
        const bufferSize = 4096;
        const processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
        
        processor.onaudioprocess = (e) => {
            if (!this.isConnected) return;
            
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Update audio level visualization
            const level = this.calculateAudioLevel(inputData);
            this.updateAudioLevel(level);
            
            // Convert to PCM Int16
            const pcmData = this.floatTo16BitPCM(inputData);
            
            // Send to Scribe
            this.sendAudioChunk(pcmData);
        };
        
        source.connect(processor);
        processor.connect(this.audioContext.destination);
    }
    
    floatTo16BitPCM(float32Array) {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    }
    
    calculateAudioLevel(samples) {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += samples[i] * samples[i];
        }
        return Math.sqrt(sum / samples.length);
    }
    
    updateAudioLevel(level) {
        const percentage = Math.min(100, level * 500);
        this.audioLevel.style.width = percentage + '%';
    }
    
    sendAudioChunk(pcmData) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        
        try {
            // Convert to base64 - use chunked approach to avoid call stack overflow
            const uint8Array = new Uint8Array(pcmData.buffer);
            let binary = '';
            const chunkSize = 8192; // Process in chunks to avoid stack overflow
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, i + chunkSize);
                binary += String.fromCharCode.apply(null, chunk);
            }
            const base64Audio = btoa(binary);
            
            // ElevenLabs Scribe v2 protocol message format
            // According to official docs, we need message_type, audio_base_64, commit, and sample_rate
            const message = {
                message_type: 'input_audio_chunk',
                audio_base_64: base64Audio,
                commit: false,
                sample_rate: 48000
            };
            
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Failed to send audio chunk:', error);
        }
    }
    
    handleScribeMessage(data) {
        // ElevenLabs uses message_type field, not type
        const messageType = data.message_type || data.type;
        
        switch (messageType) {
            case 'session_started':
                console.log('Session started:', data);
                break;
                
            case 'partial_transcript':
                this.updatePartialTranscript(data.text, data.language_code);
                break;
                
            case 'committed_transcript':
                this.addCommittedTranscript(data.text, data.language_code);
                break;
                
            case 'committed_transcript_with_timestamps':
                console.log('Timestamps:', data.words);
                // Also add as committed transcript
                if (data.text) {
                    this.addCommittedTranscript(data.text, data.language_code);
                }
                break;
                
            case 'auth_error':
            case 'quota_exceeded':
            case 'transcriber_error':
                console.error('Scribe error:', data);
                this.showError('Error: ' + (data.message || data.type));
                break;
                
            case 'input_error':
                // Don't spam console with input_error - might be too frequent
                // Only log if it's not the common "protocol message" error
                if (data.error && !data.error.includes('protocol message')) {
                    console.error('Scribe input error:', data);
                }
                break;
                
            case 'error':
                console.error('Scribe error:', data);
                this.showError('Error: ' + (data.message || data.type));
                break;
                
            default:
                // Only log unknown types that aren't input_error
                if (data.message_type !== 'input_error') {
                    console.log('Unknown message type:', data);
                }
        }
    }
    
    updatePartialTranscript(text, languageCode) {
        this.partialTranscript = text;
        this.partialText.textContent = text;
        
        if (languageCode) {
            this.updateLanguageDisplay(languageCode);
        }
    }
    
    addCommittedTranscript(text, languageCode) {
        if (!text || !text.trim()) return;
        
        const now = Date.now();
        const transcriptEntry = {
            id: now,
            text: text.trim(),
            language: languageCode,
            timestamp: new Date(now)
        };
        
        this.committedTranscripts.push(transcriptEntry);
        this.lineTimestamps.push(now);
        
        // Also add to session transcripts for saving
        this.sessionTranscripts.push(transcriptEntry);
        
        // Clear partial
        this.partialTranscript = '';
        this.partialText.textContent = '';
        
        // Render with new display mode logic
        this.renderCommittedTranscripts();
        
        // Update language
        if (languageCode) {
            this.updateLanguageDisplay(languageCode);
        }
    }
    
    renderCommittedTranscripts() {
        const displayMode = this.settings.displayMode || 'fullscreen-short';
        const config = this.displayModes[displayMode];
        if (!config) return;
        
        const now = Date.now();
        const historyMs = config.historySeconds * 1000;
        
        // Remove old lines based on time
        const validIndices = [];
        for (let i = 0; i < this.committedTranscripts.length; i++) {
            const age = now - this.lineTimestamps[i];
            if (age < historyMs) {
                validIndices.push(i);
            }
        }
        
        // Keep only valid transcripts
        this.committedTranscripts = validIndices.map(i => this.committedTranscripts[i]);
        this.lineTimestamps = validIndices.map(i => this.lineTimestamps[i]);
        
        // Limit to maxLines
        if (this.committedTranscripts.length > config.maxLines) {
            const removeCount = this.committedTranscripts.length - config.maxLines;
            this.committedTranscripts = this.committedTranscripts.slice(removeCount);
            this.lineTimestamps = this.lineTimestamps.slice(removeCount);
        }
        
        // Render lines with color based on activeLines
        const lines = this.committedTranscripts.map((entry, index) => {
            const isActive = index >= this.committedTranscripts.length - config.activeLines;
            const lineClass = isActive ? 'transcript-line active' : 'transcript-line history';
            return `<div class="${lineClass}">${this.escapeHtml(entry.text)}</div>`;
        });
        
        this.committedTexts.innerHTML = lines.join('');
        
        // Handle scrolling based on flowType
        if (config.flowType === 'smoothScroll') {
            // Smooth scroll to keep active lines visible
            setTimeout(() => {
                this.textContainer.scrollTo({
                    top: this.textContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        } else {
            // Push mode - instant scroll
            this.textContainer.scrollTop = this.textContainer.scrollHeight;
        }
    }
    
    updateLanguageDisplay(languageCode) {
        const t = this.getTranslations();
        const languageNames = {
            'en': t.language === 'Language' ? 'English' : (t.language === 'Språk' ? 'Engelsk' : (t.language === 'Sprog' ? 'Engelsk' : 'English')),
            'no': t.language === 'Language' ? 'Norwegian' : (t.language === 'Språk' ? 'Norsk' : (t.language === 'Sprog' ? 'Norsk' : 'Norwegian')),
            'sv': t.language === 'Language' ? 'Swedish' : (t.language === 'Språk' ? 'Svensk' : (t.language === 'Sprog' ? 'Svensk' : 'Swedish')),
            'da': t.language === 'Language' ? 'Danish' : (t.language === 'Språk' ? 'Dansk' : (t.language === 'Sprog' ? 'Dansk' : 'Danish')),
            'de': t.language === 'Language' ? 'German' : (t.language === 'Språk' ? 'Tysk' : (t.language === 'Sprog' ? 'Tysk' : 'German')),
            'fr': t.language === 'Language' ? 'French' : (t.language === 'Språk' ? 'Fransk' : (t.language === 'Sprog' ? 'Fransk' : 'French')),
            'es': t.language === 'Language' ? 'Spanish' : (t.language === 'Språk' ? 'Spansk' : (t.language === 'Sprog' ? 'Spansk' : 'Spanish')),
            'it': t.language === 'Language' ? 'Italian' : (t.language === 'Språk' ? 'Italiensk' : (t.language === 'Sprog' ? 'Italiensk' : 'Italian'))
        };
        
        // Only show detected language if auto-detect is enabled
        // If a language is selected, hide the detected language display (it's shown in dropdown)
        if (!this.settings.languageCode) {
            const displayName = languageNames[languageCode] || languageCode.toUpperCase();
            this.detectedLanguage.textContent = `${t.detected}: ${displayName}`;
            this.detectedLanguage.style.display = 'block';
        } else {
            // Hide detected language display when a specific language is selected
            this.detectedLanguage.style.display = 'none';
        }
    }
    
    clearAllText() {
        this.committedTranscripts = [];
        this.partialTranscript = '';
        this.lineTimestamps = [];
        this.committedTexts.innerHTML = '';
        this.partialText.textContent = '';
        // Note: sessionTranscripts are kept for saving even after clearing display
    }
    
    async saveTranscript() {
        try {
            if (this.sessionTranscripts.length === 0) {
                console.log('No transcripts to save');
                return;
            }
            
            console.log(`Saving ${this.sessionTranscripts.length} transcript entries...`);
            
            const response = await fetch('/api/save-transcript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transcripts: this.sessionTranscripts,
                    languageCode: this.settings.languageCode || ''
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save transcript');
            }
            
            const data = await response.json();
            console.log('✅ Transcript saved:', data.filename);
            
            // Optionally show a notification to user
            // this.showError is used for errors, but we could add a success message
        } catch (error) {
            console.error('Failed to save transcript:', error);
            // Don't show error to user - saving is optional/background operation
        }
    }
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.settings.theme = theme;
        this.saveSettings();
        if (this.themeSelect) {
            this.themeSelect.value = theme;
        }
    }
    
    toggleTheme() {
        // Cycle through themes: dark -> light -> chroma -> dark
        const current = document.body.getAttribute('data-theme');
        let newTheme;
        if (current === 'dark') {
            newTheme = 'light';
        } else if (current === 'light') {
            newTheme = 'chroma';
        } else {
            newTheme = 'dark';
        }
        this.setTheme(newTheme);
    }
    
    setDisplayMode(mode) {
        if (!this.displayModes[mode]) {
            console.error('Invalid display mode:', mode);
            return;
        }
        
        const config = this.displayModes[mode];
        this.settings.displayMode = mode;
        this.settings.layout = config.layout;
        this.saveSettings();
        
        // Apply layout
        document.body.setAttribute('data-layout', config.layout);
        document.body.setAttribute('data-display-mode', mode);
        
        // Update dropdown
        if (this.displayModeSelect) {
            this.displayModeSelect.value = mode;
        }
        
        // Re-render with new mode
        this.renderCommittedTranscripts();
    }
    
    toggleDisplayMode() {
        const modes = ['fullscreen-short', 'fullscreen-long', 'captions-lower'];
        const current = this.settings.displayMode || 'fullscreen-short';
        const currentIndex = modes.indexOf(current);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setDisplayMode(modes[nextIndex]);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.handleFullscreenChange(true);
            }).catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.handleFullscreenChange(false);
            }).catch(err => {
                console.error('Error exiting fullscreen:', err);
            });
        }
    }
    
    handleFullscreenChange(isFullscreen) {
        document.body.classList.toggle('is-fullscreen', isFullscreen);
        
        // Directly hide/show elements
        const statusBar = document.getElementById('statusBar');
        const controlPanel = document.getElementById('controlPanel');
        const hotkeysHelp = document.querySelector('.hotkeys-help');
        
        if (isFullscreen) {
            if (statusBar) statusBar.style.display = 'none';
            if (controlPanel) controlPanel.style.display = 'none';
            if (hotkeysHelp) hotkeysHelp.style.display = 'none';
        } else {
            if (statusBar) statusBar.style.display = '';
            if (controlPanel) controlPanel.style.display = '';
            if (hotkeysHelp) hotkeysHelp.style.display = '';
        }
    }
    
    updateFullscreenButton() {
        const isFullscreen = !!document.fullscreenElement;
        this.handleFullscreenChange(isFullscreen);
        const t = this.getTranslations();
        this.fullscreenToggle.textContent = isFullscreen ? '⛶ ' + t.exitFullscreen : '⛶ ' + t.fullscreenBtn;
    }
    
    toggleControlPanel() {
        this.controlPanel.classList.toggle('collapsed');
    }
    
    handleHotkey(e) {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        switch (e.key.toLowerCase()) {
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'b':
                e.preventDefault();
                this.toggleDisplayMode();
                break;
            case 't':
                e.preventDefault();
                this.toggleTheme();
                break;
            case 'c':
                e.preventDefault();
                this.clearAllText();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMicrophone();
                break;
            case 'h':
                e.preventDefault();
                this.toggleControlPanel();
                break;
            case 'arrowup':
                e.preventDefault();
                this.increaseFontSize();
                break;
            case 'arrowdown':
                e.preventDefault();
                this.decreaseFontSize();
                break;
            case 'escape':
                e.preventDefault();
                if (this.infoModal && !this.infoModal.classList.contains('hidden')) {
                    this.hideInfoModal();
                } else if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    }
    
    increaseFontSize() {
        const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
        const current = this.fontSize.value;
        const index = sizes.indexOf(current);
        if (index < sizes.length - 1) {
            this.fontSize.value = sizes[index + 1];
            this.fontSize.dispatchEvent(new Event('change'));
        }
    }
    
    decreaseFontSize() {
        const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
        const current = this.fontSize.value;
        const index = sizes.indexOf(current);
        if (index > 0) {
            this.fontSize.value = sizes[index - 1];
            this.fontSize.dispatchEvent(new Event('change'));
        }
    }
    
    applyTypography() {
        this.textContainer.style.setProperty('--font-family', this.settings.fontFamily);
        this.textContainer.style.setProperty('--line-height', this.settings.lineHeight);
    }
    
    applySettings() {
        // Theme
        const theme = this.settings.theme || 'dark';
        document.body.setAttribute('data-theme', theme);
        if (this.themeSelect) {
            this.themeSelect.value = theme;
        }
        
        // Layout
        document.body.setAttribute('data-layout', this.settings.layout);
        this.updateLayoutButton();
        
        // Font size
        document.body.setAttribute('data-font-size', this.settings.fontSize);
        this.fontSize.value = this.settings.fontSize;
        
        // Typography
        this.fontFamily.value = this.settings.fontFamily;
        this.lineHeight.value = this.settings.lineHeight;
        this.lineHeightValue.textContent = this.settings.lineHeight;
        this.applyTypography();
        
        // Display mode (applies layout automatically)
        const displayMode = this.settings.displayMode || 'fullscreen-short';
        this.setDisplayMode(displayMode);
        
        // Language selection
        if (this.languageSelect) {
            this.settings.languageCode = this.settings.languageCode || '';
            this.settings.uiLanguage = this.settings.uiLanguage || (this.settings.languageCode || 'en');
            this.languageSelect.value = this.settings.languageCode;
        }
        
        // Update UI with translations
        this.updateUI();
    }
    
    updateConnectionStatus(connected) {
        this.connectionStatus.classList.toggle('connected', connected);
        const t = this.getTranslations();
        this.statusText.textContent = connected ? t.connected : t.notConnected;
    }
    
    showOverlay(message) {
        this.overlayMessage.textContent = message;
        this.overlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        this.overlay.classList.add('hidden');
    }
    
    showError(message) {
        console.error('Error shown to user:', message);
        // Replace \n with actual line breaks for alert
        alert(message.replace(/\\n/g, '\n'));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    initTranslations() {
        return {
            'en': {
                // Status
                notConnected: 'Not connected',
                connected: 'Connected',
                
                // Audio
                audioSource: 'Audio Source',
                selectMicrophone: 'Select microphone...',
                noMicrophones: 'No microphones found',
                startTranscription: 'Start transcription',
                stopTranscription: 'Stop transcription',
                refreshMics: 'Refresh microphone list',
                noMicsHelp: 'No microphones? Click 🔄 to refresh the list.',
                
                // Typography
                typography: 'Typography',
                lineSpacing: 'Line spacing',
                
                // Display
                theme: 'Theme',
                viewingMode: 'Viewing Mode',
                lightTheme: 'Light theme (T)',
                darkTheme: 'Dark theme (T)',
                chromaTheme: 'Chroma key',
                displayMode: 'Display Mode',
                displayModeShort: 'Fullscreen Short',
                displayModeLong: 'Fullscreen Long',
                displayModeCaptions: 'Captions Lower',
                fullscreen: 'Fullscreen (B)',
                exitFullscreen: 'Exit fullscreen (F)',
                bottomStripe: 'Bottom stripe (B)',
                toggleDisplayMode: 'Toggle display mode',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'This application is made with Cursor, Claude and GPT-4.5 by Magnus Sæternes Lian at ReadyMedia.no and can be used freely.',
                infoAPI: 'It is built on ElevenLabs Scribe v2 Realtime API, and you must enter an API key from ElevenLabs as described in the documentation.',
                close: 'Close',
                
                // Text Flow
                textFlow: 'Text Flow',
                scroll: 'Scroll',
                fade: 'Fade',
                
                // Actions
                actions: 'Actions',
                clear: 'Clear (C)',
                fullscreenBtn: 'Fullscreen (F)',
                
                // Language
                language: 'Language',
                autoDetection: 'Auto-detection (default)',
                autoDetectionActive: 'Auto-detection active',
                detected: 'Detected',
                selected: 'Selected',
                
                // Hotkeys
                keyboardShortcuts: 'Keyboard Shortcuts',
                fullscreenToggle: 'Fullscreen on/off',
                toggleTheme: 'Switch theme (light/dark)',
                changeFontSize: 'Change font size',
                clearText: 'Clear text',
                toggleMic: 'Start/stop microphone',
                togglePanel: 'Show/hide control panel',
                closeMenu: 'Close menu/fullscreen',
                
                // Overlay messages
                requestingMic: 'Requesting microphone access...',
                connecting: 'Connecting to transcription service...',
                
                // Errors
                micPermissionDenied: 'Please grant microphone access to continue.\n\nClick the lock icon in the address bar and allow microphone.',
                noMicsFound: 'No microphones found. Check that the microphone is connected, and click 🔄 to try again.',
                couldNotLoadDevices: 'Could not load audio devices'
            },
            'no': {
                notConnected: 'Ikke tilkoblet',
                connected: 'Tilkoblet',
                audioSource: 'Lydkilde',
                selectMicrophone: 'Velg mikrofon...',
                noMicrophones: 'Ingen mikrofoner funnet',
                startTranscription: 'Start transkribering',
                stopTranscription: 'Stopp transkribering',
                refreshMics: 'Oppdater mikrofonliste',
                noMicsHelp: 'Ingen mikrofoner? Klikk på 🔄 for å oppdatere listen.',
                typography: 'Typografi',
                lineSpacing: 'Linjeavstand',
                display: 'Visning',
                lightTheme: 'Lys tema (T)',
                darkTheme: 'Mørk tema (T)',
                chromaTheme: 'Chroma key',
                displayMode: 'Visningsmodus',
                displayModeShort: 'Fullskjerm Kort',
                displayModeLong: 'Fullskjerm Lang',
                displayModeCaptions: 'Undertekster Nederst',
                fullscreen: 'Fullskjerm (B)',
                exitFullscreen: 'Avslutt fullskjerm (F)',
                bottomStripe: 'Bunnstripe (B)',
                textFlow: 'Tekstflyt',
                scroll: 'Rull',
                fade: 'Fade',
                actions: 'Handlinger',
                clear: 'Tøm (C)',
                fullscreenBtn: 'Fullskjerm (F)',
                language: 'Språk',
                autoDetection: 'Auto-deteksjon (standard)',
                autoDetectionActive: 'Auto-deteksjon aktivert',
                detected: 'Detektert',
                selected: 'Valgt',
                keyboardShortcuts: 'Tastatursnarveier',
                fullscreenToggle: 'Fullskjerm av/på',
                toggleDisplayMode: 'Bytt visningsmodus',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'Denne applikasjonen er laget med Cursor, Claude og GPT-4.5 av Magnus Sæternes Lian i ReadyMedia.no og kan fritt brukes.',
                infoAPI: 'Den bygger på ElevenLabs Scribe v2 Realtime API, og man må legge inn API key fra ElevenLabs slik det er beskrevet i dokumentasjonen.',
                close: 'Lukk',
                toggleTheme: 'Bytt tema (lys/mørk)',
                changeFontSize: 'Endre fontstørrelse',
                clearText: 'Tøm tekst',
                toggleMic: 'Start/stopp mikrofon',
                togglePanel: 'Vis/skjul kontrollpanel',
                closeMenu: 'Lukk meny/fullskjerm',
                requestingMic: 'Ber om tilgang til mikrofon...',
                connecting: 'Kobler til transkripsjonstjeneste...',
                micPermissionDenied: 'Vennligst gi tilgang til mikrofon for å fortsette.\n\nKlikk på låsikonet i adressefeltet og tillat mikrofon.',
                noMicsFound: 'Ingen mikrofoner funnet. Sjekk at mikrofonen er tilkoblet, og klikk på 🔄 for å prøve igjen.',
                couldNotLoadDevices: 'Kunne ikke laste lydenheter'
            },
            'sv': {
                notConnected: 'Inte ansluten',
                connected: 'Ansluten',
                audioSource: 'Ljudkälla',
                selectMicrophone: 'Välj mikrofon...',
                noMicrophones: 'Inga mikrofoner hittades',
                startTranscription: 'Starta transkribering',
                stopTranscription: 'Stoppa transkribering',
                refreshMics: 'Uppdatera mikrofonlista',
                noMicsHelp: 'Inga mikrofoner? Klicka på 🔄 för att uppdatera listan.',
                typography: 'Typografi',
                lineSpacing: 'Radavstånd',
                theme: 'Tema',
                viewingMode: 'Visningsläge',
                lightTheme: 'Ljust tema (T)',
                darkTheme: 'Mörkt tema (T)',
                chromaTheme: 'Chroma key',
                displayMode: 'Visningsläge',
                displayModeShort: 'Fullskärm Kort',
                displayModeLong: 'Fullskärm Lång',
                displayModeCaptions: 'Textremsa Nederst',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'Denna applikation är gjord med Cursor, Claude och GPT-4.5 av Magnus Sæternes Lian på ReadyMedia.no och kan användas fritt.',
                infoAPI: 'Den bygger på ElevenLabs Scribe v2 Realtime API, och du måste ange en API-nyckel från ElevenLabs enligt beskrivningen i dokumentationen.',
                close: 'Stäng',
                fullscreen: 'Fullskärm (B)',
                exitFullscreen: 'Avsluta fullskärm (F)',
                bottomStripe: 'Nedersta remsa (B)',
                textFlow: 'Textflöde',
                scroll: 'Rulla',
                fade: 'Fade',
                actions: 'Åtgärder',
                clear: 'Rensa (C)',
                fullscreenBtn: 'Fullskärm (F)',
                language: 'Språk',
                autoDetection: 'Auto-detektering (standard)',
                autoDetectionActive: 'Auto-detektering aktiverad',
                detected: 'Detekterad',
                selected: 'Vald',
                keyboardShortcuts: 'Tangentbordsgenvägar',
                fullscreenToggle: 'Fullskärm av/på',
                toggleDisplayMode: 'Växla visningsläge',
                toggleTheme: 'Växla tema (ljus/mörk)',
                changeFontSize: 'Ändra teckenstorlek',
                clearText: 'Rensa text',
                toggleMic: 'Starta/stoppa mikrofon',
                togglePanel: 'Visa/dölj kontrollpanel',
                closeMenu: 'Stäng meny/fullskärm',
                requestingMic: 'Begär mikrofontillstånd...',
                connecting: 'Ansluter till transkriberingstjänst...',
                micPermissionDenied: 'Vänligen ge mikrofontillstånd för att fortsätta.\n\nKlicka på låsikonen i adressfältet och tillåt mikrofon.',
                noMicsFound: 'Inga mikrofoner hittades. Kontrollera att mikrofonen är ansluten och klicka på 🔄 för att försöka igen.',
                couldNotLoadDevices: 'Kunde inte ladda ljudenheter'
            },
            'de': {
                notConnected: 'Nicht verbunden',
                connected: 'Verbunden',
                audioSource: 'Audioquelle',
                selectMicrophone: 'Mikrofon auswählen...',
                noMicrophones: 'Keine Mikrofone gefunden',
                startTranscription: 'Transkription starten',
                stopTranscription: 'Transkription stoppen',
                refreshMics: 'Mikrofonliste aktualisieren',
                noMicsHelp: 'Keine Mikrofone? Klicken Sie auf 🔄, um die Liste zu aktualisieren.',
                typography: 'Typografie',
                lineSpacing: 'Zeilenabstand',
                theme: 'Thema',
                viewingMode: 'Anzeigemodus',
                lightTheme: 'Helles Thema (T)',
                darkTheme: 'Dunkles Thema (T)',
                chromaTheme: 'Chroma Key',
                displayMode: 'Anzeigemodus',
                displayModeShort: 'Vollbild Kurz',
                displayModeLong: 'Vollbild Lang',
                displayModeCaptions: 'Untertitel Unten',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'Diese Anwendung wurde mit Cursor, Claude und GPT-4.5 von Magnus Sæternes Lian bei ReadyMedia.no erstellt und kann frei verwendet werden.',
                infoAPI: 'Sie basiert auf der ElevenLabs Scribe v2 Realtime API, und Sie müssen einen API-Schlüssel von ElevenLabs eingeben, wie in der Dokumentation beschrieben.',
                close: 'Schließen',
                fullscreen: 'Vollbild (B)',
                exitFullscreen: 'Vollbild beenden (F)',
                bottomStripe: 'Unterer Streifen (B)',
                textFlow: 'Textfluss',
                scroll: 'Scrollen',
                fade: 'Verblassen',
                actions: 'Aktionen',
                clear: 'Löschen (C)',
                fullscreenBtn: 'Vollbild (F)',
                language: 'Sprache',
                autoDetection: 'Auto-Erkennung (Standard)',
                autoDetectionActive: 'Auto-Erkennung aktiviert',
                detected: 'Erkannt',
                selected: 'Ausgewählt',
                keyboardShortcuts: 'Tastenkürzel',
                fullscreenToggle: 'Vollbild ein/aus',
                toggleDisplayMode: 'Anzeigemodus wechseln',
                toggleTheme: 'Thema wechseln (hell/dunkel)',
                changeFontSize: 'Schriftgröße ändern',
                clearText: 'Text löschen',
                toggleMic: 'Mikrofon starten/stoppen',
                togglePanel: 'Bedienfeld anzeigen/ausblenden',
                closeMenu: 'Menü/Vollbild schließen',
                requestingMic: 'Mikrofonzugriff anfordern...',
                connecting: 'Verbindung zum Transkriptionsdienst...',
                micPermissionDenied: 'Bitte gewähren Sie Mikrofonzugriff, um fortzufahren.\n\nKlicken Sie auf das Schloss-Symbol in der Adressleiste und erlauben Sie das Mikrofon.',
                noMicsFound: 'Keine Mikrofone gefunden. Überprüfen Sie, ob das Mikrofon angeschlossen ist, und klicken Sie auf 🔄, um es erneut zu versuchen.',
                couldNotLoadDevices: 'Audio-Geräte konnten nicht geladen werden'
            },
            'fr': {
                notConnected: 'Non connecté',
                connected: 'Connecté',
                audioSource: 'Source audio',
                selectMicrophone: 'Sélectionner un microphone...',
                noMicrophones: 'Aucun microphone trouvé',
                startTranscription: 'Démarrer la transcription',
                stopTranscription: 'Arrêter la transcription',
                refreshMics: 'Actualiser la liste des microphones',
                noMicsHelp: 'Aucun microphone? Cliquez sur 🔄 pour actualiser la liste.',
                typography: 'Typographie',
                lineSpacing: 'Interligne',
                theme: 'Thème',
                viewingMode: 'Mode d\'affichage',
                lightTheme: 'Thème clair (T)',
                darkTheme: 'Thème sombre (T)',
                chromaTheme: 'Chroma key',
                displayMode: 'Mode d\'affichage',
                displayModeShort: 'Plein écran Court',
                displayModeLong: 'Plein écran Long',
                displayModeCaptions: 'Sous-titres Bas',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'Cette application est créée avec Cursor, Claude et GPT-4.5 par Magnus Sæternes Lian chez ReadyMedia.no et peut être utilisée librement.',
                infoAPI: 'Elle est construite sur l\'API ElevenLabs Scribe v2 Realtime, et vous devez entrer une clé API d\'ElevenLabs comme décrit dans la documentation.',
                close: 'Fermer',
                fullscreen: 'Plein écran (B)',
                exitFullscreen: 'Quitter le plein écran (F)',
                bottomStripe: 'Bande inférieure (B)',
                textFlow: 'Flux de texte',
                scroll: 'Défilement',
                fade: 'Fondu',
                actions: 'Actions',
                clear: 'Effacer (C)',
                fullscreenBtn: 'Plein écran (F)',
                language: 'Langue',
                autoDetection: 'Détection automatique (par défaut)',
                autoDetectionActive: 'Détection automatique activée',
                detected: 'Détecté',
                selected: 'Sélectionné',
                keyboardShortcuts: 'Raccourcis clavier',
                fullscreenToggle: 'Plein écran on/off',
                toggleDisplayMode: 'Changer le mode d\'affichage',
                toggleTheme: 'Changer le thème (clair/sombre)',
                changeFontSize: 'Changer la taille de police',
                clearText: 'Effacer le texte',
                toggleMic: 'Démarrer/arrêter le microphone',
                togglePanel: 'Afficher/masquer le panneau de contrôle',
                closeMenu: 'Fermer le menu/plein écran',
                requestingMic: 'Demande d\'accès au microphone...',
                connecting: 'Connexion au service de transcription...',
                micPermissionDenied: 'Veuillez accorder l\'accès au microphone pour continuer.\n\nCliquez sur l\'icône de cadenas dans la barre d\'adresse et autorisez le microphone.',
                noMicsFound: 'Aucun microphone trouvé. Vérifiez que le microphone est connecté et cliquez sur 🔄 pour réessayer.',
                couldNotLoadDevices: 'Impossible de charger les périphériques audio'
            },
            'da': {
                notConnected: 'Ikke tilsluttet',
                connected: 'Tilsluttet',
                audioSource: 'Lydkilde',
                selectMicrophone: 'Vælg mikrofon...',
                noMicrophones: 'Ingen mikrofoner fundet',
                startTranscription: 'Start transskription',
                stopTranscription: 'Stop transskription',
                refreshMics: 'Opdater mikrofonliste',
                noMicsHelp: 'Ingen mikrofoner? Klik på 🔄 for at opdatere listen.',
                typography: 'Typografi',
                lineSpacing: 'Linjeafstand',
                theme: 'Tema',
                viewingMode: 'Visningstilstand',
                lightTheme: 'Lyst tema (T)',
                darkTheme: 'Mørkt tema (T)',
                chromaTheme: 'Chroma key',
                displayMode: 'Visningstilstand',
                displayModeShort: 'Fuldskærm Kort',
                displayModeLong: 'Fuldskærm Lang',
                displayModeCaptions: 'Undertekster Nederst',
                info: 'Info',
                infoTitle: 'Info',
                infoAbout: 'Denne applikation er lavet med Cursor, Claude og GPT-4.5 af Magnus Sæternes Lian hos ReadyMedia.no og kan bruges frit.',
                infoAPI: 'Den bygger på ElevenLabs Scribe v2 Realtime API, og du skal indtaste en API-nøgle fra ElevenLabs som beskrevet i dokumentationen.',
                close: 'Luk',
                fullscreen: 'Fuldskærm (B)',
                exitFullscreen: 'Afslut fuldskærm (F)',
                bottomStripe: 'Bundstribe (B)',
                textFlow: 'Tekstflow',
                scroll: 'Rul',
                fade: 'Fade',
                actions: 'Handlinger',
                clear: 'Ryd (C)',
                fullscreenBtn: 'Fuldskærm (F)',
                language: 'Sprog',
                autoDetection: 'Auto-detektering (standard)',
                autoDetectionActive: 'Auto-detektering aktiveret',
                detected: 'Detekteret',
                selected: 'Valgt',
                keyboardShortcuts: 'Tastaturgenveje',
                fullscreenToggle: 'Fuldskærm til/fra',
                toggleDisplayMode: 'Skift visningstilstand',
                toggleTheme: 'Skift tema (lys/mørk)',
                changeFontSize: 'Ændre skriftstørrelse',
                clearText: 'Ryd tekst',
                toggleMic: 'Start/stop mikrofon',
                togglePanel: 'Vis/skjul kontrolpanel',
                closeMenu: 'Luk menu/fuldskærm',
                requestingMic: 'Anmoder om mikrofontilladelse...',
                connecting: 'Forbinder til transskriptionstjeneste...',
                micPermissionDenied: 'Giv venligst mikrofontilladelse for at fortsætte.\n\nKlik på låseikonet i adresselinjen og tillad mikrofon.',
                noMicsFound: 'Ingen mikrofoner fundet. Tjek at mikrofonen er tilsluttet, og klik på 🔄 for at prøve igen.',
                couldNotLoadDevices: 'Kunne ikke indlæse lydenheder'
            }
        };
    }
    
    loadSettings() {
        const defaults = {
            theme: 'dark',
            displayMode: 'fullscreen-short',
            layout: 'fullscreen',
            fontSize: 'm',
            fontFamily: "'Inter', sans-serif",
            lineHeight: '1.4',
            audioDeviceId: '',
            languageCode: '', // Empty string = auto-detect
            uiLanguage: 'en' // Default UI language is English
        };
        
        try {
            const saved = localStorage.getItem('readymedia-settings');
            const loaded = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
            // Ensure uiLanguage is set (for backward compatibility)
            if (!loaded.uiLanguage) {
                loaded.uiLanguage = loaded.languageCode || 'en';
            }
            return loaded;
        } catch {
            return defaults;
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('readymedia-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    updateUI() {
        const t = this.getTranslations();
        
        // Update HTML lang attribute
        document.documentElement.lang = this.settings.uiLanguage || 'en';
        
        // Status
        if (this.statusText) {
            this.statusText.textContent = this.isConnected ? t.connected : t.notConnected;
        }
        
        // Audio source label
        const audioLabel = document.querySelector('.control-group:has(#audioInput) label');
        if (audioLabel) {
            audioLabel.textContent = '🎤 ' + t.audioSource;
        }
        const audioSelect = document.querySelector('#audioInput option[value=""]');
        if (audioSelect) audioSelect.textContent = t.selectMicrophone;
        if (this.toggleMic) {
            if (this.isRecording) {
                this.toggleMic.textContent = '⏹️ ' + t.stopTranscription;
                this.toggleMic.classList.add('active');
                this.toggleMic.classList.remove('btn-start');
            } else {
                this.toggleMic.textContent = '▶️ ' + t.startTranscription;
                this.toggleMic.classList.remove('active');
                this.toggleMic.classList.add('btn-start');
            }
        }
        if (this.micHelpText) {
            this.micHelpText.textContent = t.noMicsHelp;
        }
        
        // Typography label
        const typoLabel = document.querySelector('.control-group:has(#fontFamily) label');
        if (typoLabel) {
            typoLabel.textContent = '🔤 ' + t.typography;
        }
        const lineSpacingLabel = document.querySelector('.control-group:has(#lineHeight) label');
        if (lineSpacingLabel) {
            lineSpacingLabel.textContent = t.lineSpacing;
        }
        
        // Theme label
        const themeLabel = document.querySelector('.control-group:has(#themeSelect) label');
        if (themeLabel) {
            themeLabel.textContent = '🎨 ' + t.theme;
        }
        if (this.themeSelect) {
            // Update theme select options with translations
            const darkOption = this.themeSelect.querySelector('option[value="dark"]');
            const lightOption = this.themeSelect.querySelector('option[value="light"]');
            const chromaOption = this.themeSelect.querySelector('option[value="chroma"]');
            if (darkOption) darkOption.textContent = '🌙 ' + t.darkTheme.replace(' (T)', '');
            if (lightOption) lightOption.textContent = '☀️ ' + t.lightTheme.replace(' (T)', '');
            if (chromaOption) chromaOption.textContent = '🎬 ' + t.chromaTheme;
        }
        
        // Viewing Mode label
        const viewingModeLabel = document.querySelector('.control-group:has(#displayModeSelect) label');
        if (viewingModeLabel) {
            viewingModeLabel.textContent = '📺 ' + t.viewingMode;
        }
        if (this.displayModeSelect) {
            // Update display mode select options with translations
            const shortOption = this.displayModeSelect.querySelector('option[value="fullscreen-short"]');
            const longOption = this.displayModeSelect.querySelector('option[value="fullscreen-long"]');
            const captionsOption = this.displayModeSelect.querySelector('option[value="captions-lower"]');
            if (shortOption) shortOption.textContent = t.displayModeShort;
            if (longOption) longOption.textContent = t.displayModeLong;
            if (captionsOption) captionsOption.textContent = t.displayModeCaptions;
        }
        
        // Info button
        if (this.infoButton) {
            this.infoButton.textContent = 'ℹ️ ' + t.info;
        }
        
        // Actions label
        const actionsLabel = document.querySelector('.control-group:has(#clearText) label');
        if (actionsLabel) {
            actionsLabel.textContent = '⚡ ' + t.actions;
        }
        if (this.clearText) this.clearText.textContent = '🗑️ ' + t.clear;
        if (this.fullscreenToggle) {
            const isFullscreen = !!document.fullscreenElement;
            this.fullscreenToggle.textContent = isFullscreen ? '⛶ ' + t.exitFullscreen : '⛶ ' + t.fullscreenBtn;
        }
        
        // Language label
        const langLabel = document.querySelector('.control-group:has(#languageSelect) label');
        if (langLabel) {
            langLabel.textContent = '🌍 ' + t.language;
        }
        const autoOption = document.querySelector('#languageSelect option[value=""]');
        if (autoOption) autoOption.textContent = t.autoDetection;
        if (this.detectedLanguage && !this.settings.languageCode) {
            this.detectedLanguage.textContent = t.autoDetectionActive;
        }
        
        // Update language select disabled state
        if (this.languageSelect) {
            this.languageSelect.disabled = this.isRecording;
        }
        
        // Update info modal content
        this.updateInfoModal();
    }
    
    showInfoModal() {
        if (this.infoModal) {
            // Update content before showing
            this.updateInfoModal();
            this.infoModal.classList.remove('hidden');
        }
    }
    
    hideInfoModal() {
        if (this.infoModal) {
            this.infoModal.classList.add('hidden');
        }
    }
    
    updateInfoModal() {
        // Get element fresh in case it wasn't initialized
        if (!this.infoContent) {
            this.infoContent = document.getElementById('infoContent');
        }
        if (!this.infoModal) {
            this.infoModal = document.getElementById('infoModal');
        }
        if (!this.closeInfoModal) {
            this.closeInfoModal = document.getElementById('closeInfoModal');
        }
        
        if (!this.infoContent) {
            console.error('infoContent element not found');
            return;
        }
        
        const t = this.getTranslations();
        
        // Build hotkeys list
        const hotkeysList = `
            <li><kbd>F</kbd> - ${t.fullscreenToggle}</li>
            <li><kbd>B</kbd> - ${t.toggleDisplayMode}</li>
            <li><kbd>T</kbd> - ${t.toggleTheme}</li>
            <li><kbd>↑/↓</kbd> - ${t.changeFontSize}</li>
            <li><kbd>C</kbd> - ${t.clearText}</li>
            <li><kbd>M</kbd> - ${t.toggleMic}</li>
            <li><kbd>H</kbd> - ${t.togglePanel}</li>
            <li><kbd>Esc</kbd> - ${t.closeMenu}</li>
        `;
        
        this.infoContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p>${t.infoAbout}</p>
            </div>
            <div style="margin-bottom: 20px;">
                <p>${t.infoAPI}</p>
            </div>
            <div>
                <h3 style="margin-bottom: 10px;">⌨️ ${t.keyboardShortcuts}</h3>
                <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                    ${hotkeysList}
                </ul>
            </div>
        `;
        
        // Update modal title
        if (this.infoModal) {
            const modalTitle = this.infoModal.querySelector('.modal-header h2');
            if (modalTitle) {
                modalTitle.textContent = 'ℹ️ ' + t.infoTitle;
            }
        }
        
        // Update close button
        if (this.closeInfoModal) {
            this.closeInfoModal.title = t.close;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ReadyMediaRealtime();
    console.log('ReadyMedia Realtime initialized');
});
