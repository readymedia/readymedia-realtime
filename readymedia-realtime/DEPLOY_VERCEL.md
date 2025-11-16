# 🚀 Deploy til Vercel - Quick Guide

## Steg-for-steg deployment

### 1. Gå til Vercel Dashboard
- Gå til [vercel.com](https://vercel.com)
- Logg inn med GitHub-kontoen din

### 2. Importer prosjekt
1. Klikk på **"Add New..."** → **"Project"**
2. Klikk **"Import Git Repository"**
3. Velg `readymedia/readymedia-realtime`
4. Klikk **"Import"**

### 3. Konfigurer prosjekt
**Viktig:** Siden prosjektet ligger i en undermappe på GitHub:

1. **Root Directory:**
   - Hvis Vercel viser en undermappe, velg `readymedia-realtime`
   - Eller la stå tom hvis alt ligger i root

2. **Framework Preset:**
   - Velg **"Other"** eller **"None"**

3. **Build Settings:**
   - Build Command: La stå **tom**
   - Output Directory: La stå **tom**
   - Install Command: La stå **tom**

### 4. Miljøvariabler (valgfritt)
Hvis du vil ha en fallback API-nøkkel:

1. Klikk **"Environment Variables"**
2. Legg til:
   - **Key:** `ELEVENLABS_API_KEY`
   - **Value:** Din ElevenLabs API-nøkkel
   - **Environment:** Velg alle (Production, Preview, Development)
3. Klikk **"Save"**

**Merk:** Brukere kan legge inn sin egen API-nøkkel direkte i applikasjonen, så dette er valgfritt.

### 5. Deploy
1. Klikk **"Deploy"**
2. Vent på at deployment fullfører (1-2 minutter)
3. Du får en URL som `https://readymedia-realtime.vercel.app`

### 6. Test
1. Åpne URL-en du fikk
2. Legg inn din ElevenLabs API-nøkkel i popup-modalen
3. Test applikasjonen

## 🔧 Troubleshooting

### Problem: "Cannot find module"
- Sjekk at Root Directory er satt riktig
- Sjekk at `vercel.json` ligger i root-mappen

### Problem: "404 Not Found" på API-endepunkter
- Sjekk at `api/` mappen er inkludert i deployment
- Sjekk Vercel logs for feilmeldinger

### Problem: Frontend vises ikke
- Sjekk at `client/` mappen er inkludert
- Sjekk at `vercel.json` rewrites er korrekt

## 📝 Viktig

- Alle data lagres kun lokalt i nettleseren
- Ingen server-lagring av transcripts eller API-nøkler
- Hver bruker kan bruke sin egen API-nøkkel
