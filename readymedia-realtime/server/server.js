// ReadyMedia Realtime - Backend Server
// Håndterer token-generering for Scribe v2 Realtime

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate single-use token for Scribe Realtime
app.post('/api/scribe-token', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ELEVENLABS_API_KEY is not set in .env file');
      return res.status(500).json({ 
        error: 'API key not configured. Please set ELEVENLABS_API_KEY in your .env file.' 
      });
    }

    console.log('🔑 Generating token with ElevenLabs API...');
    console.log('   API Key starts with:', apiKey.substring(0, 8) + '...');

    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('   Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);
      
      let userMessage = 'Failed to generate token from ElevenLabs';
      if (response.status === 401) {
        userMessage = 'Invalid API key. Please check your ELEVENLABS_API_KEY in .env file.';
      } else if (response.status === 403) {
        userMessage = 'Access forbidden. Please check your ElevenLabs subscription and API permissions.';
      } else if (response.status === 429) {
        userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }
      
      return res.status(response.status).json({ 
        error: userMessage,
        details: errorText 
      });
    }

    const data = await response.json();
    
    if (!data.token) {
      console.error('❌ No token in response:', data);
      return res.status(500).json({ 
        error: 'No token received from ElevenLabs' 
      });
    }
    
    console.log('✅ Token generated successfully');
    console.log('   Token starts with:', data.token.substring(0, 10) + '...');
    
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    res.json({ 
      token: data.token,
      expiresAt: expiresAt
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Save transcript to file
app.post('/api/save-transcript', async (req, res) => {
  try {
    const { transcripts, languageCode } = req.body;
    
    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({ 
        error: 'Invalid transcript data' 
      });
    }
    
    // Create transcripts directory if it doesn't exist
    const transcriptsDir = path.join(__dirname, '../transcripts');
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
      console.log('📁 Created transcripts directory');
    }
    
    // Generate filename with date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    const filename = `readymedia_realtime_${dateStr}_${timeStr}.txt`;
    const filepath = path.join(transcriptsDir, filename);
    
    // Format date and time for header
    const dateTime = now.toLocaleString('no-NO', {
      dateStyle: 'long',
      timeStyle: 'medium'
    });
    
    // Get language name
    const languageNames = {
      'en': 'Engelsk',
      'no': 'Norsk',
      'nb': 'Norsk (Bokmål)',
      'nn': 'Norsk (Nynorsk)',
      'sv': 'Svensk',
      'da': 'Dansk',
      'de': 'Tysk',
      'fr': 'Fransk',
      '': 'Auto-deteksjon'
    };
    const languageName = languageNames[languageCode] || languageCode || 'Auto-deteksjon';
    
    // Combine all transcripts into one text
    const transcriptText = transcripts
      .map(t => t.text)
      .filter(text => text && text.trim())
      .join(' ');
    
    // Create file content with header
    const fileContent = `Dato og tid: ${dateTime}
Språk: ${languageName}

This transcript is made using ReadyMedia Realtime, get more info at http://readymedia.no/realtime

---

${transcriptText}
`;
    
    // Write file
    fs.writeFileSync(filepath, fileContent, 'utf8');
    
    console.log(`✅ Transcript saved: ${filename}`);
    console.log(`   Location: ${filepath}`);
    console.log(`   Lines: ${transcripts.length}`);
    
    res.json({ 
      success: true,
      filename: filename,
      path: filepath
    });
  } catch (error) {
    console.error('❌ Error saving transcript:', error);
    res.status(500).json({ 
      error: 'Failed to save transcript',
      message: error.message 
    });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`🎙️  ReadyMedia Realtime Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});
