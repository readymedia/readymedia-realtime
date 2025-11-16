# 🚀 Deploy til Vercel

ReadyMedia Realtime kan deployes til Vercel og brukes direkte i nettleseren uten egen server.

## ✅ Hva fungerer på Vercel

- ✅ **Frontend**: Statiske filer (HTML, CSS, JS) serveres perfekt
- ✅ **Token-generering**: Serverless function for ElevenLabs token
- ✅ **WebSocket-tilkobling**: Går direkte fra nettleseren til ElevenLabs (ingen proxy nødvendig)
- ✅ **Transcript download**: Returneres som nedlastbar fil (ikke lagret på server)

## 📋 Forutsetninger

1. **Vercel-konto**: Opprett gratis konto på [vercel.com](https://vercel.com)
2. **ElevenLabs API-nøkkel**: Du trenger en gyldig API-nøkkel

## 🚀 Deployment-steg

### 1. Installer Vercel CLI (valgfritt)

```bash
npm install -g vercel
```

### 2. Deploy fra terminal

```bash
# Naviger til prosjektmappen
cd readymedia-realtime

# Logg inn på Vercel
vercel login

# Deploy
vercel

# For produksjon
vercel --prod
```

### 3. Eller deploy via GitHub

1. Push koden til GitHub
2. Gå til [vercel.com](https://vercel.com)
3. Klikk "New Project"
4. Importer GitHub-repositoryet
5. Vercel vil automatisk oppdage `vercel.json` og konfigurasjonen

### 4. Sett miljøvariabler

I Vercel Dashboard:
1. Gå til ditt prosjekt
2. Settings → Environment Variables
3. Legg til:
   - **Key**: `ELEVENLABS_API_KEY`
   - **Value**: Din ElevenLabs API-nøkkel
   - **Environment**: Production, Preview, Development (alle)

### 5. Deploy på nytt

Etter å ha lagt til miljøvariabler, må du deploye på nytt:
- Via CLI: `vercel --prod`
- Via Dashboard: Klikk "Redeploy" på siste deployment

## 📁 Prosjektstruktur for Vercel

```
readymedia-realtime/
├── api/                    # Serverless functions
│   ├── health.js          # Health check
│   ├── scribe-token.js    # Token-generering
│   └── save-transcript.js # Transcript download
├── client/                 # Frontend (statiske filer)
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── vercel.json            # Vercel-konfigurasjon
```

## 🔧 Hvordan det fungerer

### Token-generering
- Klienten kaller `/api/scribe-token`
- Vercel serverless function genererer token via ElevenLabs API
- Token returneres til klienten
- API-nøkkelen er aldri eksponert til klienten

### WebSocket-tilkobling
- Klienten kobler direkte til `wss://api.elevenlabs.io`
- Ingen proxy nødvendig
- Fungerer perfekt fra nettleseren

### Transcript-lagring
- ⚠️ **Merk:** Transcript-lagring er under utvikling
- Planlagt: Transcripts lagres lokalt i nettleseren (IndexedDB)
- Ingen lagring på server (GDPR-vennlig)

## 🌐 Custom Domain (valgfritt)

1. I Vercel Dashboard → Settings → Domains
2. Legg til ditt domene
3. Følg instruksjonene for DNS-oppsett

## 🔒 Sikkerhet

- ✅ API-nøkkel lagres som miljøvariabel (aldri i kode)
- ✅ HTTPS/WSS automatisk via Vercel
- ✅ CORS håndteres automatisk
- ✅ Zero-retention: Ingen lagring av lyd/tekst på server

## 📊 Monitoring

Vercel gir automatisk:
- Request logs
- Error tracking
- Performance metrics
- Analytics (med Vercel Analytics)

## 🆚 Forskjeller fra lokal server

| Funksjon | Lokal Server | Vercel |
|----------|-------------|--------|
| Transcript lagring | Lagres i `transcripts/` mappe | Lastes ned som fil |
| Server-kostnader | Egen server nødvendig | Gratis tier tilgjengelig |
| Skalering | Manuell | Automatisk |
| HTTPS | Må konfigureres | Automatisk |

## 🐛 Troubleshooting

### "API key not configured"
- Sjekk at `ELEVENLABS_API_KEY` er satt i Vercel Environment Variables
- Sjekk at du har deployet på nytt etter å ha lagt til variabelen

### "Failed to generate token"
- Verifiser at API-nøkkelen er gyldig
- Sjekk ElevenLabs API-status: https://status.elevenlabs.io

### WebSocket-tilkobling feiler
- Dette er vanligvis ikke et Vercel-problem
- Sjekk nettleser-konsollen for feilmeldinger
- Verifiser at token er gyldig

## 💰 Kostnader

**Vercel Free Tier:**
- 100 GB bandwidth/måned
- Serverless functions: 100 GB-hours/måned
- Perfekt for testing og små til medium bruk

**Vercel Pro ($20/måned):**
- Ubegrenset bandwidth
- Bedre ytelse
- Team-funksjoner

## 📚 Mer informasjon

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)

