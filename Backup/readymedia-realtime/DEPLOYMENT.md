# 🚀 Deployment Guide - ReadyMedia Realtime

Guide for produksjonsutrulling av ReadyMedia Realtime.

## 📋 Oversikt

- **Miljø**: Linux-server (Ubuntu/Debian anbefalt)
- **Node.js**: v18+ 
- **Webserver**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt/Certbot
- **Process Manager**: PM2 eller systemd

---

## 🔧 Server-forberedelser

### 1. Installer Node.js

```bash
# NodeSource repository (Node 18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifiser
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 2. Installer Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 3. Installer Certbot (SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## 📦 Applikasjonsinstallasjon

### 1. Opprett applikasjonsmappe

```bash
sudo mkdir -p /var/www/readymedia-realtime
sudo chown $USER:$USER /var/www/readymedia-realtime
cd /var/www/readymedia-realtime
```

### 2. Last opp filer

```bash
# Via git
git clone https://github.com/din-bruker/readymedia-realtime.git .

# Eller via scp/rsync fra lokal maskin
rsync -avz readymedia-realtime/ bruker@server:/var/www/readymedia-realtime/
```

### 3. Installer dependencies

```bash
cd server
npm ci --only=production
```

### 4. Konfigurer miljøvariabler

```bash
cp .env.example .env
nano .env
```

Sett produksjonsverdier:
```env
ELEVENLABS_API_KEY=din_prod_api_nøkkel
PORT=3000
NODE_ENV=production
```

---

## 🔄 Process Management

### Alternativ A: PM2 (anbefalt)

```bash
# Installer PM2 globalt
sudo npm install -g pm2

# Start applikasjon
cd /var/www/readymedia-realtime/server
pm2 start server.js --name readymedia-realtime

# Auto-restart ved server reboot
pm2 startup systemd
pm2 save

# Nyttige kommandoer
pm2 status
pm2 logs readymedia-realtime
pm2 restart readymedia-realtime
pm2 stop readymedia-realtime
```

### Alternativ B: systemd service

Opprett service-fil:

```bash
sudo nano /etc/systemd/system/readymedia-realtime.service
```

Innhold:
```ini
[Unit]
Description=ReadyMedia Realtime Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/readymedia-realtime/server
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=readymedia-realtime
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aktiver og start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable readymedia-realtime
sudo systemctl start readymedia-realtime
sudo systemctl status readymedia-realtime
```

---

## 🌐 Nginx-konfigurasjon

### 1. Opprett Nginx site config

```bash
sudo nano /etc/nginx/sites-available/readymedia-realtime
```

Konfigurasjon:
```nginx
# Upstream til Node.js app
upstream readymedia_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name din-domene.no www.din-domene.no;
    
    # Redirect til HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name din-domene.no www.din-domene.no;
    
    # SSL-sertifikater (settes opp av Certbot)
    ssl_certificate /etc/letsencrypt/live/din-domene.no/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/din-domene.no/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/readymedia-access.log;
    error_log /var/log/nginx/readymedia-error.log;
    
    # Max upload size
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;
    
    location / {
        proxy_pass http://readymedia_backend;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Standard proxy headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://readymedia_backend;
        access_log off;
    }
}
```

### 2. Aktiver site og test

```bash
# Symlink til sites-enabled
sudo ln -s /etc/nginx/sites-available/readymedia-realtime /etc/nginx/sites-enabled/

# Test konfigurasjon
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 SSL-sertifikat (Let's Encrypt)

```bash
# Få sertifikat
sudo certbot --nginx -d din-domene.no -d www.din-domene.no

# Certbot oppdaterer automatisk Nginx-config med SSL
# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔥 Firewall-konfigurasjon

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Verifiser
sudo ufw status
```

---

## 📊 Monitorering og logging

### Logs

```bash
# PM2 logs
pm2 logs readymedia-realtime

# systemd logs
sudo journalctl -u readymedia-realtime -f

# Nginx logs
sudo tail -f /var/log/nginx/readymedia-access.log
sudo tail -f /var/log/nginx/readymedia-error.log
```

### Health check

```bash
# Test backend direkte
curl http://localhost:3000/api/health

# Test via Nginx
curl https://din-domene.no/api/health
```

### Monitoring med Uptime Kuma (valgfritt)

```bash
docker run -d --restart=always -p 3001:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma louislam/uptime-kuma:1
```

Åpne http://server-ip:3001 og sett opp monitor for:
- `https://din-domene.no/api/health`
- Interval: 60 sekunder

---

## 🔄 Oppdatering av applikasjonen

```bash
cd /var/www/readymedia-realtime

# Pull endringer
git pull origin main

# Oppdater dependencies (hvis nødvendig)
cd server
npm ci --only=production

# Restart med PM2
pm2 restart readymedia-realtime

# Eller med systemd
sudo systemctl restart readymedia-realtime
```

---

## 🐳 Docker-deployment (alternativ)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Kopier package files
COPY server/package*.json ./

# Installer production dependencies
RUN npm ci --only=production

# Kopier app files
COPY server/ ./
COPY client/ ./client/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start app
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  readymedia:
    build: .
    container_name: readymedia-realtime
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
    volumes:
      - ./server/.env:/app/.env:ro
    networks:
      - readymedia-net
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  readymedia-net:
    driver: bridge
```

### Deploy med Docker

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## ✅ Deployment Checklist

- [ ] Server opprettet og sikret
- [ ] Node.js installert (v18+)
- [ ] Applikasjon lastet opp
- [ ] `.env` konfigurert med produksjonsverdier
- [ ] Dependencies installert (`npm ci --only=production`)
- [ ] Process manager konfigurert (PM2/systemd)
- [ ] Nginx installert og konfigurert
- [ ] SSL-sertifikat generert (Let's Encrypt)
- [ ] Firewall konfigurert (UFW)
- [ ] Health check fungerer
- [ ] Logging verifisert
- [ ] Backup-rutine etablert
- [ ] Monitoring satt opp (valgfritt)

---

## 🆘 Troubleshooting

### App starter ikke

```bash
# Sjekk logs
pm2 logs readymedia-realtime --lines 50

# Verifiser .env
cat /var/www/readymedia-realtime/server/.env

# Test manuelt
cd /var/www/readymedia-realtime/server
node server.js
```

### Nginx-feil

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Sjekk error log
sudo tail -50 /var/log/nginx/readymedia-error.log
```

### SSL-problemer

```bash
# Fornye sertifikat manuelt
sudo certbot renew

# Test config
sudo certbot certificates
```

---

**God deployment! 🚀**
