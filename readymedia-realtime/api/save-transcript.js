// Save transcript endpoint for Vercel
// Since Vercel doesn't support file system writes, we return the transcript as a downloadable file

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcripts, languageCode } = req.body;
    
    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({ 
        error: 'Invalid transcript data' 
      });
    }
    
    // Generate filename with date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    const filename = `readymedia_realtime_${dateStr}_${timeStr}.txt`;
    
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
    
    // Return as downloadable file
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(fileContent);
    
    console.log(`✅ Transcript prepared for download: ${filename}`);
    console.log(`   Lines: ${transcripts.length}`);
  } catch (error) {
    console.error('❌ Error preparing transcript:', error);
    res.status(500).json({ 
      error: 'Failed to prepare transcript',
      message: error.message 
    });
  }
}

