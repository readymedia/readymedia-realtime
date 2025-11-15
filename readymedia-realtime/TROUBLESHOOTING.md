# 🔧 Troubleshooting Guide - ReadyMedia Realtime

Vanlige problemer og løsninger.

---

## 🎤 Lydproblemer

### Problem: Ingen mikrofoner vises i nedtrekksmenyen

**Løsninger:**
1. Gi nettleseren tilgang til mikrofon:
   - Chrome: Innstillinger → Personvern og sikkerhet → Nettstedstillatelser → Mikrofon
   - Klikk på låsikonet i adressefeltet → Mikrofon → Tillat

2. Sjekk at mikrofonen er koblet til:
   - Windows: Lydinnstillinger → Inndata → Test mikrofonen
   - macOS: Systeminnstillinger → Lyd → Inndata

3. Prøv å laste siden på nytt (Ctrl+Shift+R)

### Problem: Mikrofon valgt, men intet lydnivå vises

**Løsninger:**
1. Sjekk at mikrofonen ikke er dempet:
   - Windows: Høyreklikk lydikoner i systemstatusfeltet
   - macOS: Systeminnstillinger → Lyd → Sjekk inndatavolum

2. Test mikrofonen i en annen app (Zoom, Discord)

3. Kontroller at riktig enhet er valgt som standard mikrofon

4. For Focusrite/lydkort:
   - Sjekk at drivere er installert
   - Kontroller Phantom power (hvis kondensatormikrofon)
   - Verifiser gain-nivå

### Problem: Lyd fungerer, men ingen tekst vises

**Løsninger:**
1. Sjekk at "Start opptak" er aktivert (grønn status)

2. Åpne konsollen (F12) og sjekk for feilmeldinger

3. Snakk høyere eller tydligere - STT krever klart tale

4. Vent 2-3 sekunder (initial buffering)

---

## 🌐 Tilkoblingsproblemer

### Problem: "Token-generering feilet"

**Løsninger:**
1. Sjekk at serveren kjører:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Verifiser API-nøkkel i `.env`:
   ```bash
   cat server/.env
   ```
   - Sjekk at `ELEVENLABS_API_KEY` er satt
   - Sjekk at nøkkelen er gyldig (logg inn på elevenlabs.io)

3. Kontroller nettverkstilkobling

4. Sjekk ElevenLabs API-status: https://status.elevenlabs.io

### Problem: WebSocket mister forbindelse

**Symptomer:**
- Status blir rød
- Tekst stopper midt i setning
- Konsollen viser "WebSocket closed"

**Løsninger:**
1. Sjekk internettforbindelse

2. Kontroller at firewall ikke blokkerer WebSocket:
   - Tillat utgående trafikk på port 443 (WSS)
   
3. For bedriftsnettverk:
   - Sjekk med IT om proxy/firewall blokkerer WebSocket
   - Prøv fra personlig nett (mobil hotspot)

4. Token kan ha utløpt (15 min):
   - Stopp og start opptak på nytt

### Problem: Høy latency (lang forsinkelse)

**Løsninger:**
1. Sjekk nettverkshastighet:
   ```bash
   ping 8.8.8.8
   ```

2. Lukk unødvendige nettleser-faner

3. Reduser samplingsrate (hvis mulig i fremtidige versjoner)

4. Bruk kabelbasert nett i stedet for WiFi

---

## 🖥️ Visningsproblemer

### Problem: Tekst er for liten/stor

**Løsninger:**
1. Bruk fontstørrelse-knappene i kontrollpanelet
   - Eller bruk piltaster: ↑ ↓

2. For bunnstripe-modus:
   - Bytt til fullskjerm-modus (B-tasten)
   - Juster fontstørrelse
   - Bytt tilbake til bunnstripe

### Problem: Tekst går utenfor skjermen

**Løsninger:**
1. Bruk lavere fontstørrelse

2. Sjekk oppløsning:
   - Anbefalt: 1920×1080
   - Fungerer også på: 1280×720, 2560×1440

3. For projektorer:
   - Juster zoom og fokus på projektor
   - Sjekk at aspect ratio er 16:9

### Problem: Dårlig kontrast (vanskelig å lese)

**Løsninger:**
1. Bytt tema (T-tasten):
   - Mørk tema for mørke rom
   - Lys tema for lyse rom

2. Juster projektorens lysstyrke

3. Slå av bakgrunnsbelysning i rommet

---

## 🔧 Server-problemer

### Problem: Server starter ikke

**Symptomer:**
```
Error: Cannot find module 'express'
ELEVENLABS_API_KEY is not set
Port 3000 is already in use
```

**Løsninger:**

1. **Manglende modules:**
   ```bash
   cd server
   npm install
   ```

2. **Manglende API-nøkkel:**
   ```bash
   cp .env.example .env
   nano .env  # Legg inn API-nøkkel
   ```

3. **Port i bruk:**
   ```bash
   # Finn prosess på port 3000
   lsof -i :3000
   
   # Drep prosess (erstatt PID)
   kill -9 <PID>
   
   # Eller endre port i .env
   PORT=3001
   ```

### Problem: 404 Not Found på /api/scribe-token

**Løsninger:**
1. Sjekk at server er startet korrekt:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Kontroller ruting i server.js

3. Sjekk at du bruker POST-metode, ikke GET

---

## 🎨 UI-problemer

### Problem: Kontrollpanel ikke synlig

**Løsninger:**
1. Trykk H-tasten for å vise/skjule

2. Scroll opp (panelet kan være utenfor synsfelt)

3. Gå ut av fullskjerm-modus (Esc)

### Problem: Tastatursnarveier fungerer ikke

**Løsninger:**
1. Klikk utenfor input-felter først

2. Sjekk at tastaturet er satt til riktig språk

3. Prøv med engelsk tastaturlayout

4. For norsk tastatur:
   - Noen taster kan være annerledes
   - Prøv både norsk og engelsk layout

---

## 📊 Ytelse-problemer

### Problem: Nettleser blir treg/fryser

**Løsninger:**
1. Tøm tekst med C-tasten

2. Lukk andre nettleser-faner

3. Sjekk minnebruk:
   - Chrome: Shift+Esc (Task Manager)
   - Firefox: about:memory

4. Bruk nyere/raskere PC

5. Oppdater nettleser til siste versjon

### Problem: Høyt CPU-bruk

**Løsninger:**
1. Disable animasjoner:
   - Velg "Rull" i stedet for "Fade"

2. Reduser fontstørrelse

3. Bruk bunnstripe i stedet for fullskjerm

---

## 🔒 Sikkerhets-problemer

### Problem: CORS-feil i konsollen

**Symptomer:**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Løsninger:**
1. Sjekk at backend har CORS aktivert (det har den)

2. Bruk samme domene/port for frontend og backend

3. For produksjon: sett opp Nginx som reverse proxy

### Problem: API-nøkkel eksponert i nettleser

**Dette skal IKKE skje!**

Hvis du ser API-nøkkelen i Network-fanen i DevTools:
1. Sjekk at du bruker token-endepunktet, ikke direkte API-kall
2. Nøkkelen skal kun være i backend (server/.env)
3. Frontend skal kun motta tokens

---

## 📱 Kompatibilitetsproblemer

### Problem: Fungerer ikke på Safari

**Safari har begrenset WebRTC-støtte:**
1. Bruk Chrome, Edge eller Firefox i stedet
2. Oppdater Safari til siste versjon
3. Sjekk nettlesertillatelser nøye

### Problem: Fungerer ikke på mobil

**ReadyMedia Realtime er optimalisert for desktop:**
1. Bruk tablet i landscape-modus (minimum 1024px bredde)
2. Mobil-støtte kan komme i fremtidige versjoner

---

## 🆘 Fortsatt problemer?

### Debug-verktøy

1. **Åpne konsollen (F12):**
   - Console-fanen viser feilmeldinger
   - Network-fanen viser API-kall

2. **Test backend direkte:**
   ```bash
   cd server
   node test-server.js
   ```

3. **Sjekk logger:**
   ```bash
   # PM2
   pm2 logs readymedia-realtime
   
   # systemd
   sudo journalctl -u readymedia-realtime -f
   ```

### Rapporter bug

Hvis du fortsatt har problemer:

1. Samle informasjon:
   - Nettleser og versjon
   - Operativsystem
   - Feilmelding fra konsollen
   - Steg for å reprodusere problemet

2. Opprett en issue på GitHub med denne informasjonen

---

## ✅ Sjekkliste før support

Før du ber om hjelp, sjekk:

- [ ] Server kjører (`curl http://localhost:3000/api/health`)
- [ ] API-nøkkel er satt i `.env`
- [ ] Nettleser har mikrofontilgang
- [ ] Mikrofon fungerer i andre apper
- [ ] Internettforbindelse fungerer
- [ ] Firewall tillater utgående WebSocket (port 443)
- [ ] Konsollen sjekket for feilmeldinger (F12)
- [ ] Prøvd å restarte server og nettleser
- [ ] Tømt nettleser-cache (Ctrl+Shift+R)

---

**Lykke til! 🎯**
