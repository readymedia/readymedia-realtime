# 🎙️ ReadyMedia Realtime v7.1

**Universell sanntidsteksting for undervisningsrom**

En nettbasert løsning for automatisk sanntidsteksting av tale i klasserom, auditorier og møterom. Utviklet for universell utforming (UU) og optimalisert for 1920×1080 projektorer.

## ✨ Funksjoner

- 🎤 **Sanntidstranskripsjon** med under 250ms latency
- 🔑 **Bruker-spesifikk API-nøkkel**: Hver bruker kan bruke sin egen ElevenLabs API-nøkkel
- 📄 **Lokal transcript-lagring**: Alle transcripts lagres lokalt i nettleseren (IndexedDB)
- 🌍 **Språkvalg**: Velg mellom norsk, engelsk, tysk, fransk, svensk, dansk eller auto-deteksjon
- 🎨 **Tema**: Lys, mørk og chroma key modus med høy kontrast
- 📐 **Visningsmoduser**: Fullscreen Short, Fullscreen Long, eller Captions Lower
- 🔤 **Typografi**: Justerbar font, størrelse og linjeavstand
- ⌨️ **Tastatursnarveier** for rask kontroll
- ♿ **Universell utforming**: WCAG 2.1 AA/AAA-kompatibel
- 🔒 **Personvern**: Zero-retention, ingen lagring av lyd eller tekst på serveren
- 💾 **Lokal datalagring**: Alle data lagres kun lokalt i nettleseren

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

3. **Konfigurer miljøvariabler (valgfritt for testing)**

For lokal utvikling kan du sette en standard API-nøkkel i `.env`:

```bash
cp .env.example .env
```

Rediger `.env` og legg inn din ElevenLabs API-nøkkel:

```env
ELEVENLABS_API_KEY=din_api_nøkkel_her
PORT=3000
```

**Merk:** For testing og produksjon kan hver bruker legge inn sin egen API-nøkkel direkte i applikasjonen. Se [API-nøkkel og datalagring](#-api-nøkkel-og-datalagring) nedenfor.

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

6. **Legg inn API-nøkkel (første gang)**

Ved første besøk vil du se en popup hvor du kan legge inn din ElevenLabs API-nøkkel. Denne lagres lokalt i nettleseren din og huskes mellom sesjoner.

## 🎯 Bruksanvisning

### Grunnleggende oppsett

1. **Legg inn API-nøkkel (første gang)**
   - Ved første besøk vises en popup hvor du legger inn din ElevenLabs API-nøkkel
   - API-nøkkelen lagres lokalt i nettleseren din og huskes mellom sesjoner
   - Du kan endre API-nøkkel senere ved å bruke "Clear All Data" og legge inn en ny
   - Se [API-nøkkel og datalagring](#-api-nøkkel-og-datalagring) for mer informasjon

2. **Velg lydkilde**
   - Klikk på "Velg mikrofon" og velg ønsket lydkilde
   - For Focusrite USB-lydkort, velg "Focusrite" fra listen
   - Klikk på 🔄-knappen for å oppdatere mikrofonlisten

3. **Start opptak**
   - Klikk på "Start opptak" eller trykk `M`
   - Status-indikator øverst blir grønn når tilkoblet
   - Tekst vises automatisk når du snakker

4. **Tilpass visningen**
   - Bruk kontrollpanelet til å justere font, tema og layout
   - Alle innstillinger lagres automatisk lokalt i nettleseren

5. **Velg språk**
   - Velg ønsket språk fra "Language"-menyen
   - "Auto-detection" vil automatisk detektere språket som snakkes
   - Se [Språkvalg og API-begrensninger](#-språkvalg-og-api-begrensninger) nedenfor for viktig informasjon

6. **Lagre og laste ned transcripts**
   - Når du stopper opptak, lagres transcriptet automatisk lokalt
   - Klikk på "📄 Transcripts" for å se alle lagrede transcripts
   - Last ned individuelle transcripts eller alle sammen
   - Se [API-nøkkel og datalagring](#-api-nøkkel-og-datalagring) for mer informasjon

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

## 🌍 Språkvalg og API-begrensninger

### Hvordan språkvalg fungerer

ReadyMedia Realtime bruker ElevenLabs Scribe v2 Realtime API for transkribering. Språkvalget fungerer som følger:

#### Auto-deteksjon (anbefalt)
- Når "Auto-detection" er valgt, detekterer APIet automatisk språket som snakkes
- APIet transkriberer i det språket som faktisk snakkes
- Fungerer best når du snakker ett språk konsekvent

#### Spesifikt språk valgt
- Når du velger et spesifikt språk (f.eks. "Norwegian" eller "English"), sendes dette som en hint til APIet
- **Viktig:** `language_code`-parameteren fungerer som en **forventning/hint**, ikke en hard constraint
- APIet kan fortsatt transkribere i språket som faktisk snakkes, selv om et annet språk er valgt
- Dette er en kjent oppførsel i ElevenLabs Scribe v2 Realtime API

### Praktiske anbefalinger

1. **For best resultat:**
   - Bruk "Auto-detection" når du snakker i ett språk
   - APIet vil automatisk detektere og transkribere i riktig språk

2. **Hvis du opplever inkonsistente resultater:**
   - Sjekk konsollen (F12) for å se hvilket språk som sendes til APIet
   - Sjekk hvilket `detected_language` som kommer tilbake fra APIet
   - Dette kan hjelpe med å dokumentere problemet

3. **For dokumentasjon:**
   - Konsollen logger både `expected_language` (det du valgte) og `detected_language` (det APIet faktisk detekterte)
   - Dette kan være nyttig for å forstå APIets oppførsel

### Teknisk bakgrunn

ElevenLabs Scribe v2 Realtime API prioriterer **detektert språk** over **forventet språk** i mange tilfeller. Dette betyr at:

- Hvis du setter "Norwegian" men snakker engelsk, kan APIet transkribere på engelsk
- Hvis du setter "English" men snakker norsk, kan APIet transkribere på norsk
- Dette er ikke en bug i ReadyMedia Realtime, men en begrensning i ElevenLabs API

### Kontakt ElevenLabs

Hvis du opplever problemer med språkvalg, kan du:
- Kontakte ElevenLabs support for å bekrefte om dette er forventet oppførsel
- Rapportere inkonsistente resultater med logging fra konsollen
- Se [ElevenLabs dokumentasjon](https://elevenlabs.io/docs) for mer informasjon

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
- Støtter både bruker-spesifikke og server-spesifikke API-nøkler
- HTTPS/WSS-støtte

**Frontend:**
- Vanilla JavaScript (ingen framework-avhengigheter)
- WebSocket-tilkobling til Scribe API
- Web Audio API for lydfangst
- **localStorage** for innstillinger og API-nøkkel
- **IndexedDB** for lokal lagring av transcripts
- Modal-basert API-nøkkel input

**STT Engine:**
- ElevenLabs Scribe v2 Realtime
- 48 kHz PCM audio
- Manual commit strategy
- ~150-250ms latency

**Datalagring:**
- **localStorage**: API-nøkkel, innstillinger (tema, typografi, språk, etc.)
- **IndexedDB**: Transcripts (lokal database i nettleseren)
- **Ingen server-lagring**: Alle data lagres kun lokalt

## 🔑 API-nøkkel og datalagring

### Hvordan API-nøkkel fungerer

ReadyMedia Realtime støtter to moduser for API-nøkkel:

#### 1. Bruker-spesifikk API-nøkkel (anbefalt for testing)
- Hver bruker legger inn sin egen ElevenLabs API-nøkkel direkte i applikasjonen
- API-nøkkelen lagres **lokalt** i nettleserens `localStorage`
- **Aldri delt med serveren** - kun brukt for å generere tokens
- Huskes mellom sesjoner (reload, lukk/åpne nettleser)
- **Ikke delt mellom nettlesere** - hver nettleser har sin egen lagring
- **Incognito/Private mode**: Har egen isolert lagring som slettes når vinduet lukkes

#### 2. Server-spesifikk API-nøkkel (for produksjon)
- API-nøkkel kan settes i `.env`-filen på serveren
- Brukes som fallback hvis brukeren ikke har lagt inn sin egen nøkkel
- Anbefalt for produksjonsmiljøer hvor alle brukere skal bruke samme API-nøkkel

### Hvordan data lagres

#### Lokal lagring (localStorage)
- **API-nøkkel**: Lagres i `localStorage` som `elevenlabs_api_key`
- **Innstillinger**: Lagres i `localStorage` som `readymedia_realtime_settings`
  - Tema (lys/mørk/chroma)
  - Visningsmodus (Fullscreen Short/Long, Captions Lower)
  - Typografi (font, størrelse, linjeavstand)
  - Språkvalg
  - Lydkilde

#### IndexedDB (lokal database)
- **Transcripts**: Alle lagrede transcripts lagres i IndexedDB
  - Lagres automatisk når opptak stoppes
  - Kun tilgjengelig i samme nettleser
  - Ikke delt med serveren eller andre brukere
  - Kan vises og lastes ned via "📄 Transcripts"-knappen

### Slette data

#### Slette alle data ("Clear All Data")
- Klikk på "🗑️ Clear All Data"-knappen i Actions-menyen
- Sletter:
  - Alle transcripts (IndexedDB)
  - API-nøkkel (localStorage)
  - Alle innstillinger (localStorage)
- Viser API-nøkkel-modal igjen etter sletting
- **Merk:** Dette kan ikke angres!

#### Slette kun transcripts
- Åpne "📄 Transcripts"-modal
- Klikk på "🗑️ Clear All" for å slette alle transcripts
- Dette påvirker ikke API-nøkkel eller innstillinger

### Personvern og sikkerhet

- ✅ **Ingen lagring på serveren**: Alle data lagres kun lokalt i nettleseren
- ✅ **API-nøkkel**: Lagres lokalt, aldri delt med serveren (kun brukt for token-generering)
- ✅ **Transcripts**: Lagres kun lokalt i IndexedDB, ikke på serveren
- ✅ **Zero-retention**: Ingen lyd eller tekst lagres på serveren
- ✅ **HTTPS/WSS-kryptert kommunikasjon**: All kommunikasjon er kryptert
- ✅ **GDPR-kompatibel**: Ingen personopplysninger lagres på serveren
- ✅ **Isolert lagring**: Hver nettleser har sin egen isolerte lagring
- ✅ **Incognito-støtte**: Incognito/Private mode har egen isolert lagring

### Viktig for testing

Når du tester applikasjonen:
1. Hver tester må legge inn sin egen API-nøkkel
2. Transcripts lagres kun lokalt for hver tester
3. Ingen data deles mellom brukere
4. For å "logge ut": Bruk "Clear All Data"-knappen
5. For å teste på nytt: Legg inn API-nøkkel igjen

## 🔒 Personvern og sikkerhet

- ✅ **Ingen lagring på serveren**: Alle data lagres kun lokalt i nettleseren
- ✅ **API-nøkkel**: Lagres lokalt, aldri delt med serveren (kun brukt for token-generering)
- ✅ **Transcripts**: Lagres kun lokalt i IndexedDB, ikke på serveren
- ✅ **HTTPS/WSS-kryptert kommunikasjon**: All kommunikasjon er kryptert
- ✅ **Zero-retention modus**: Ingen lyd eller tekst lagres på serveren
- ✅ **GDPR-kompatibel databehandling**: Ingen personopplysninger lagres på serveren
- ✅ **Isolert lagring**: Hver nettleser har sin egen isolerte lagring

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

## 📄 Transcript-håndtering

> **⚠️ Merk:** Transcript-lagring og nedlasting er under utvikling. Funksjonaliteten er delvis implementert, men kan ha noen problemer. Full funksjonalitet kommer i en senere versjon.

### Planlagt funksjonalitet

Når funksjonaliteten er fullstendig implementert, vil den inkludere:

- **Automatisk lagring**: Når du stopper opptak, lagres transcriptet automatisk lokalt i IndexedDB
- **Vise transcripts**: Alle lagrede transcripts vises i en modal
- **Nedlasting**: Last ned individuelle transcripts eller alle sammen
- **Lokal lagring**: Alle transcripts lagres kun lokalt i nettleseren (ikke på serveren)

### Status

- ✅ UI for transcript-visning er implementert
- ✅ IndexedDB-struktur er på plass
- ⚠️ Lagring og henting av transcripts er under testing
- 🔄 Full funksjonalitet kommer i en senere versjon

## 🔧 Feilsøking

### API-nøkkel-problemer

**Problem: "API key not set"**
- Løsning: Legg inn din ElevenLabs API-nøkkel i popup-modalen som vises ved første besøk
- Sjekk at API-nøkkelen starter med "sk_"
- Hvis modal ikke vises, sjekk konsollen (F12) for feilmeldinger

**Problem: "Invalid API key"**
- Løsning: Sjekk at API-nøkkelen er korrekt kopiert
- Verifiser at API-nøkkelen er aktiv på [ElevenLabs dashboard](https://elevenlabs.io/app/settings/api-keys)
- Prøv å slette og legge inn API-nøkkelen på nytt (bruk "Clear All Data")

**Problem: API-nøkkel huskes ikke etter reload**
- Dette bør ikke skje i normal nettleser
- Sjekk at cookies/localStorage ikke er blokkert
- I incognito/private mode er dette forventet oppførsel

### Transcript-problemer

**Problem: Ingen transcripts vises i listen**
- Sjekk at du har stoppet opptak (transcripts lagres kun når opptak stoppes)
- Sjekk konsollen (F12) for feilmeldinger om IndexedDB
- Prøv å starte og stoppe et nytt opptak

**Problem: Transcripts forsvinner**
- Transcripts lagres kun lokalt i nettleseren
- Hvis du sletter nettleserdata, forsvinner transcripts
- I incognito/private mode slettes transcripts når vinduet lukkes

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
