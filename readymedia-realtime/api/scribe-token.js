// Generate single-use token for Scribe Realtime
// Vercel serverless function

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body if it's a string (Vercel ESM may not auto-parse)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Failed to parse request body:', e);
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    
    // Accept API key from request body (for user-provided keys) or use environment variable
    const apiKey = body?.apiKey || process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not found');
      console.error('   Request body:', JSON.stringify(body));
      console.error('   Body type:', typeof body);
      console.error('   Environment variable set:', !!process.env.ELEVENLABS_API_KEY);
      return res.status(500).json({ 
        error: 'API key not provided. Please provide an API key in the request or set ELEVENLABS_API_KEY in your Vercel environment variables.' 
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
        userMessage = 'Invalid API key. Please check your ELEVENLABS_API_KEY in Vercel environment variables.';
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
}

