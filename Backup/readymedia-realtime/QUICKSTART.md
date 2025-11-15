# 🚀 ReadyMedia Realtime - Quickstart Guide

## 5 minutter til sanntidsteksting

### 1️⃣ Få API-nøkkel
1. Gå til https://elevenlabs.io/app/settings/api-keys
2. Opprett en ny API-nøkkel
3. Kopier nøkkelen (den vises bare én gang!)

### 2️⃣ Installer og konfigurer
```bash
# Gå til server-mappen
cd readymedia-realtime/server

# Installer pakker
npm install

# Opprett .env-fil
cp .env.example .env

# Rediger .env og lim inn din API-nøkkel
# nano .env (eller bruk din favoritt-editor)
```

Din `.env` skal se slik ut:
```env
ELEVENLABS_API_KEY=sk_abc123...din_nøkkel_her
PORT=3000
```

### 3️⃣ Start serveren
```bash
npm start
```

Du skal se:
```
🎙️  ReadyMedia Realtime Server running on port 3000
📡 API available at http://localhost:3000/api
🌐 Frontend available at http://localhost:3000
```

### 4️⃣ Åpne i nettleseren
1. Gå til: **http://localhost:3000**
2. Klikk "Tillat" når nettleseren ber om mikrofon-tilgang
3. Velg mikrofon fra nedtrekksmenyen
4. Klikk **"Start opptak"**
5. Snakk - og se teksten dukke opp! 🎉

## ⌨️ Mest brukte snarveier
- `F` - Fullskjerm
- `T` - Bytt tema (lys/mørk)
- `B` - Bunnstripe/fullskjerm
- `C` - Tøm tekst

## 🎯 Tips for best resultat
- Bruk et godt lydkort (Focusrite anbefales)
- Slå av støyreduksjon i mikrofon-innstillinger
- Snakk tydelig med 20-30 cm avstand til mikrofon
- Bruk lys tema i lyse rom, mørk tema i mørke rom

## ❓ Problemer?
- Sjekk at API-nøkkelen er riktig i `.env`
- Kontroller at port 3000 er ledig
- Åpne konsollen (F12) for feilmeldinger
- Les full dokumentasjon i README.md

## 📞 Trenger du hjelp?
Se full dokumentasjon: [README.md](README.md)
