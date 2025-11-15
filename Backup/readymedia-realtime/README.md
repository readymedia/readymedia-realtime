# 🎙️ ReadyMedia Realtime v5.0.0

**Universell sanntidsteksting for undervisningsrom**

En nettbasert løsning for automatisk sanntidsteksting av tale i klasserom, auditorier og møterom. Utviklet for universell utforming (UU) og optimalisert for 1920×1080 projektorer.

## ✨ Funksjoner

- 🎤 **Sanntidstranskripsjon** med under 250ms latency
- 🌍 **Automatisk språkdeteksjon** (norsk, engelsk, og mange flere)
- 🎨 **Tema**: Lys og mørk modus med høy kontrast
- 📐 **Layout**: Fullskjerm eller bunnstripe (2-4 linjer)
- 🔤 **Typografi**: Justerbar font, størrelse og linjeavstand
- ⌨️ **Tastatursnarveier** for rask kontroll
- ♿ **Universell utforming**: WCAG 2.1 AA/AAA-kompatibel
- 🔒 **Personvern**: Zero-retention, ingen lagring av lyd eller tekst

## 🚀 Rask start

### Forutsetninger

- Node.js 18+ 
- ElevenLabs API-nøkkel ([opprett her](https://elevenlabs.io/app/settings/api-keys))
- Moderne nettleser (Chrome, Edge, Opera)
- Mikrofon eller lydkort (f.eks. Focusrite)

### Installasjon

1. **Klon eller last ned prosjektet**

```bash
cd readymedia-realtime
```

2. **Installer backend-avhengigheter**

```bash
cd server
npm install
```

3. **Konfigurer miljøvariabler**

```bash
cp .env.example .env
```

Rediger `.env` og legg inn din ElevenLabs API-nøkkel:

```env
ELEVENLABS_API_KEY=din_api_nøkkel_her
PORT=3000
```

4. **Start serveren**

```bash
npm start
```

Eller for utvikling med auto-reload:

```bash
npm run dev
```

5. **Åpne i nettleseren**

Naviger til: `http://localhost:3000`

## 🎯 Bruksanvisning

### Grunnleggende oppsett

1. **Velg lydkilde**
   - Klikk på "Velg mikrofon" og velg ønsket lydkilde
   - For Focusrite USB-lydkort, velg "Focusrite" fra listen

2. **Start opptak**
   - Klikk på "Start opptak" eller trykk `M`
   - Status-indikator øverst blir grønn når tilkoblet
   - Tekst vises automatisk når du snakker

3. **Tilpass visningen**
   - Bruk kontrollpanelet til å justere font, tema og layout
   - Alle innstillinger lagres automatisk

### ⌨️ Tastatursnarveier

| Tast | Handling |
|------|----------|
| `F` | Fullskjerm av/på |
| `B` | Bytt mellom fullskjerm og bunnstripe |
| `T` | Bytt mellom lys/mørk tema |
| `↑` / `↓` | Øk / reduser fontstørrelse |
| `C` | Tøm teksten fra skjermen |
| `M` | Start/stopp mikrofon |
| `H` | Vis/skjul kontrollpanel |
| `Esc` | Lukk meny eller gå ut av fullskjerm |

### 🎨 Visningsmoduser

#### Fullskjerm
- Tekst sentrert i midten av skjermen
- Automatisk linjebryting og rulling
- Ideell for store auditorier

#### Bunnstripe (2-4 linjer)
- Tekst nederst på skjermen
- Fast høyde med automatisk paginering
- Perfekt for streaming og hybridundervisning

### 🔤 Typografiinnstillinger

**Tilgjengelige fonter:**
- Inter (standard)
- Roboto
- Source Sans Pro
- Open Sans
- Noto Sans

**Størrelser:**
- XS: 36px (kompakt)
- S: 44px
- M: 52px (standard)
- L: 64px
- XL: 72px
- XXL: 88px (store rom)

**Linjeavstand:** 1.2 - 1.8 (standard: 1.4)

## 🏗️ Arkitektur

```
readymedia-realtime/
├── server/                 # Backend (Node.js/Express)
│   ├── server.js          # Hovedserver
│   ├── package.json       # Dependencies
│   └── .env               # Konfigurasjon
│
└── client/                # Frontend (vanilla HTML/CSS/JS)
    ├── index.html         # Hovedside
    ├── styles.css         # Styling
    └── app.js             # Applikasjonslogikk
```

### Teknisk oversikt

**Backend:**
- Express.js server for token-generering
- Proxy til ElevenLabs Scribe v2 Realtime API
- HTTPS/WSS-støtte

**Frontend:**
- Vanilla JavaScript (ingen framework-avhengigheter)
- WebSocket-tilkobling til Scribe API
- Web Audio API for lydfangst
- Local Storage for innstillinger

**STT Engine:**
- ElevenLabs Scribe v2 Realtime
- 48 kHz PCM audio
- Manual commit strategy
- ~150-250ms latency

## 🔒 Personvern og sikkerhet

- ✅ Ingen lagring av lyd eller tekst som standard
- ✅ API-nøkkel aldri eksponert til klient
- ✅ HTTPS/WSS-kryptert kommunikasjon
- ✅ Zero-retention modus på STT-API
- ✅ GDPR-kompatibel databehandling

## 🎓 Bruksscenarier

- **Forelesningsteksting** - Løpende tekst under undervisning
- **Hybridmøter** - Lokal visning + streaming
- **Tilgjengelighet** - Støtte for hørselshemmede studenter
- **Språkblanding** - Automatisk norsk-engelsk kodeveksling
- **Møter og paneler** - Profesjonell tekstvisning

## 📊 Ytelse

- **Lyd til partial transcript:** ~150-250ms
- **Finaliserte setninger:** +100-250ms
- **Animasjoner:** 60 fps
- **Nettverksbruk:** ~100-200 KB/s (ved 48kHz)

## 🛠️ Produksjonsutrulling

### Nginx-konfigurasjon (anbefalt)

```nginx
server {
    listen 443 ssl http2;
    server_name din-domene.no;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker (valgfritt)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./
COPY client/ ./client/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
```

### Miljøvariabler i produksjon

```bash
ELEVENLABS_API_KEY=din_prod_api_nøkkel
PORT=3000
NODE_ENV=production
```

## 🔧 Feilsøking

### Mikrofon fungerer ikke
- Sjekk nettleserens tillatelser (kamera/mikrofon)
- Kontroller at riktig lydkilde er valgt
- Prøv å starte opptak på nytt

### Ingen tekst vises
- Kontroller internettforbindelse
- Verifiser at API-nøkkelen er korrekt
- Sjekk konsollen for feilmeldinger (F12)

### Høy latency
- Lukk andre nettleser-faner
- Sjekk nettverkshastighet
- Prøv lavere samplingsrate (reduser kvalitet)

### WebSocket mister forbindelse
- Serveren reconnect automatisk
- Sjekk at firewall/proxy tillater WebSocket
- Verifiser at token ikke er utløpt (15 min)

## 📝 Lisens

MIT License - se LICENSE-fil for detaljer.

## 🤝 Bidrag

Bidrag er velkommen! Åpne en issue eller pull request på GitHub.

## 📧 Support

For spørsmål eller support, kontakt [din epost].

## 🔗 Lenker

- [ElevenLabs Scribe Dokumentasjon](https://elevenlabs.io/docs/cookbooks/speech-to-text/streaming)
- [ElevenLabs API Keys](https://elevenlabs.io/app/settings/api-keys)
- [WCAG 2.1 Retningslinjer](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Utviklet for universell utforming i undervisningsrom** 🎓
