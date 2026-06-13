# InnovateGuide v2 Deployment Guide

## Prerequisites

Before you begin, ensure the following are available:

- **Hostinger VPS** running Ubuntu 22.04 LTS or later (KVM2 or higher recommended)
- **Node.js 20+** (installed via nvm — handled by `setup.sh`)
- **PM2** process manager (installed globally by `setup.sh`)
- **Nginx** web server (installed by `setup.sh`)
- **A registered domain name** pointed to your VPS IP (A record for both `@` and `www`)
- **Google Cloud Project** with Sheets API and Drive API enabled
- **Certbot** for SSL (installed during setup)

---

## Quick Start

```bash
# 1. Run the VPS setup script (first time only)
bash scripts/setup.sh

# 2. Clone / upload the project
git clone <your-repo-url> /var/www/innovateguide
cd /var/www/innovateguide

# 3. Configure environment variables
cp .env.example .env
nano .env   # fill in all values (see Environment Setup below)

# 4. Copy and enable Nginx config
sudo cp nginx/innovateguide.conf /etc/nginx/sites-available/innovateguide
sudo ln -s /etc/nginx/sites-available/innovateguide /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. Obtain SSL certificate
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 6. Build and start the application
bash scripts/deploy.sh

# 7. Persist PM2 process list across reboots
pm2 save
```

---

## Environment Setup

The `.env` file must be placed in the project root (`/var/www/innovateguide/.env`). Copy `.env.example` as the starting point.

### Full Variable Reference

```env
# ── Server ─────────────────────────────────────────────────────────────────
PORT=5000
# Port the Express server listens on.
# Default: 5000. Do not expose this port publicly — Nginx proxies to it.

NODE_ENV=production
# Set to "production" for live deployments, "development" locally.

# ── JWT Authentication ──────────────────────────────────────────────────────
JWT_SECRET=a_very_long_random_string_at_least_64_characters
# Secret used to sign and verify JWT tokens.
# Generate a strong value: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_EXPIRES_IN=7d
# Token lifetime. Accepts values like "7d", "24h", "60m".
# Default: 7d.

# ── Admin Credentials ──────────────────────────────────────────────────────
ADMIN_EMAIL=admin@yourdomain.com
# The only admin login email. Used by the /api/v1/auth/login endpoint.

ADMIN_PASSWORD=YourSecurePasswordHere
# Admin login password. Use a strong password (16+ chars, mixed case, symbols).

# ── Google Sheets (database) ────────────────────────────────────────────────
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
# The ID portion of your Google Sheets URL:
# https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit

GOOGLE_SERVICE_ACCOUNT_EMAIL=innovateguide@your-project-id.iam.gserviceaccount.com
# The "client_email" field from your downloaded service account JSON key file.

GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
# The "private_key" field from your service account JSON, all on one line.
# Keep the surrounding double quotes. Newlines must remain as literal \n characters.

# ── Google Drive (file storage) ─────────────────────────────────────────────
GOOGLE_DRIVE_FOLDER_ID=1a2B3c4D5e6F7g8H9i0J
# The ID of the Google Drive folder where project ZIP files are stored.
# Extract from the folder's URL: https://drive.google.com/drive/folders/<FOLDER_ID>

GOOGLE_DRIVE_SCREENSHOTS_FOLDER_ID=9z8Y7x6W5v4U3t2S1r0Q
# The ID of the Google Drive folder where project screenshot images are stored.
# Same URL format as above.

# ── Contact ────────────────────────────────────────────────────────────────
WHATSAPP_NUMBER=919876543210
# WhatsApp contact number (country code + number, no spaces or + prefix).
# Example: India (+91) number 98765 43210 → 919876543210

# ── Frontend ───────────────────────────────────────────────────────────────
FRONTEND_URL=https://yourdomain.com
# The public URL of the frontend. Used by the server CORS policy.
# In development use http://localhost:5173.

# ── Uploads ────────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB=100
# Maximum file upload size in megabytes.
# Must be smaller than client_max_body_size in nginx/innovateguide.conf (currently 110M).
```

---

## Google Sheets Setup (Step by Step)

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for the full illustrated walkthrough. A condensed version follows.

### Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com).
2. Click the project dropdown at the top → **New Project**.
3. Give it a name (e.g., `innovateguide`), then click **Create**.
4. Wait for the project to be created and ensure it is selected.

### Step 2 — Enable Required APIs

1. In the left sidebar go to **APIs & Services > Library**.
2. Search for **Google Sheets API** → click it → click **Enable**.
3. Search for **Google Drive API** → click it → click **Enable**.

### Step 3 — Create a Service Account

1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** → **Service account**.
3. Fill in:
   - **Service account name**: `innovateguide`
   - **Service account ID**: auto-filled (e.g., `innovateguide`)
4. Click **Create and Continue** → skip optional grant steps → click **Done**.

### Step 4 — Download the JSON Key File

1. In the Credentials list, click on the service account you just created.
2. Go to the **Keys** tab → **Add Key** → **Create new key**.
3. Select **JSON** → **Create**. A `.json` file downloads automatically.
4. Store this file securely — it grants access to your Google resources.

### Step 5 — Extract Credentials for .env

Open the downloaded JSON file. Copy these two fields into your `.env`:

| JSON field | .env variable |
|---|---|
| `client_email` | `GOOGLE_SERVICE_ACCOUNT_EMAIL` |
| `private_key` | `GOOGLE_PRIVATE_KEY` |

For `GOOGLE_PRIVATE_KEY`, paste the entire multi-line key as a single line, preserving `\n` escape sequences. Wrap it in double quotes.

### Step 6 — Create the Google Spreadsheet

1. Go to [https://sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **InnovateGuide v2**.
3. Copy the **Spreadsheet ID** from the URL bar:
   `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`
4. Paste this ID as the value of `GOOGLE_SHEETS_SPREADSHEET_ID` in `.env`.

### Step 7 — Share the Spreadsheet with the Service Account

1. In the spreadsheet, click **Share** (top-right).
2. Paste the service account email (`GOOGLE_SERVICE_ACCOUNT_EMAIL`).
3. Set the permission to **Editor**.
4. Uncheck "Notify people" (the service account cannot receive emails).
5. Click **Share**.

### Step 8 — Create Sheet Tabs

The spreadsheet needs six tabs (sheets). By default only one sheet exists. To add tabs:

1. Click the **+** button at the bottom left of the spreadsheet.
2. Create tabs with exactly these names (case-sensitive):

   - `Users`
   - `Projects`
   - `Categories`
   - `CustomRequests`
   - `Analytics`
   - `Settings`

### Step 9 — Add Headers to Each Sheet

Paste the following headers into **row 1** of each respective tab. Each value goes in a separate column (A, B, C, …).

#### Projects tab — Row 1 headers

```
id | title | description | price | domain | difficulty | type | technologies | screenshots | videoUrl | githubUrl | status | createdAt | views | downloads | rating | reviewCount | isTrending | isNew | isFeatured | isTopSelling | tags | creatorId | creatorName | creatorEmail | zipFileId
```

Columns A through Z in order:

| Col | Header |
|-----|--------|
| A | id |
| B | title |
| C | description |
| D | price |
| E | domain |
| F | difficulty |
| G | type |
| H | technologies |
| I | screenshots |
| J | videoUrl |
| K | githubUrl |
| L | status |
| M | createdAt |
| N | views |
| O | downloads |
| P | rating |
| Q | reviewCount |
| R | isTrending |
| S | isNew |
| T | isFeatured |
| U | isTopSelling |
| V | tags |
| W | creatorId |
| X | creatorName |
| Y | creatorEmail |
| Z | zipFileId |

#### CustomRequests tab — Row 1 headers

| Col | Header |
|-----|--------|
| A | id |
| B | name |
| C | email |
| D | phone |
| E | projectType |
| F | budget |
| G | timeline |
| H | technologies |
| I | description |
| J | additionalInfo |
| K | status |
| L | createdAt |

#### Users tab — Row 1 headers (for future use)

```
id | email | name | role | createdAt | lastLogin
```

#### Categories tab — Row 1 headers

```
id | name | slug | description | icon | projectCount | isActive
```

#### Analytics tab — Row 1 headers

```
id | event | projectId | userId | timestamp | metadata
```

#### Settings tab — Row 1 headers

```
key | value | updatedAt
```

---

## Google Drive Setup

### Create the Required Folders

1. Go to [https://drive.google.com](https://drive.google.com).
2. Create a folder named **InnovateGuide — Projects** (for ZIP files).
3. Create a second folder named **InnovateGuide — Screenshots** (for image files).
4. For each folder, right-click → **Share** → add the service account email with **Editor** access.

### Get Folder IDs

The folder ID is the last segment of the folder URL:

```
https://drive.google.com/drive/folders/<FOLDER_ID>
```

Copy the Projects folder ID into `GOOGLE_DRIVE_FOLDER_ID` and the Screenshots folder ID into `GOOGLE_DRIVE_SCREENSHOTS_FOLDER_ID` in your `.env`.

---

## Nginx Configuration

The Nginx config file is located at `nginx/innovateguide.conf` in the repository. It handles:

- HTTP to HTTPS redirect
- SSL/TLS termination (via Let's Encrypt)
- SPA routing (forwards all non-file requests to `index.html`)
- API proxying to `localhost:5000`
- Rate limiting on `/api/v1/auth/` endpoints (10 req/min per IP)
- Static asset caching (1 year for hashed files, no-cache for `index.html`)
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compression

### Placing the Config

```bash
# Copy the config file
sudo cp /var/www/innovateguide/nginx/innovateguide.conf \
        /etc/nginx/sites-available/innovateguide

# Enable the site
sudo ln -s /etc/nginx/sites-available/innovateguide \
           /etc/nginx/sites-enabled/innovateguide

# Remove the default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Replace the placeholder domain with your actual domain
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' \
     /etc/nginx/sites-available/innovateguide

# Test configuration syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Setup

SSL certificates are provisioned automatically by Certbot using the Let's Encrypt CA.

```bash
# Install Certbot (if not already installed)
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate for both root and www subdomain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
#   - Enter your email address for renewal notifications
#   - Agree to the terms of service
#   - Choose whether to share your email with EFF (optional)
#   - Certbot will automatically update the Nginx config with SSL paths
```

Certbot installs a cron job (or systemd timer) that auto-renews certificates before they expire. To test renewal:

```bash
sudo certbot renew --dry-run
```

---

## PM2 Setup

PM2 is the process manager that keeps the Node.js API alive across crashes and reboots. The configuration lives in `ecosystem.config.js` at the project root.

The `ecosystem.config.js` is configured with:
- **Cluster mode** using all available CPU cores (`instances: 'max'`)
- **Memory restart** at 500 MB per instance
- **Log files** written to `./logs/`
- **Restart delay** of 4 seconds between crash restarts, max 10 restarts

```bash
# Start the API in production mode
pm2 start ecosystem.config.js --env production

# Save the process list so PM2 restarts it on reboot
pm2 save

# Register PM2 as a system service (run the command PM2 outputs)
pm2 startup systemd -u $USER --hp $HOME
```

The `startup` command prints a `sudo env ...` command — copy and run it to register the service.

---

## Monitoring

### PM2 Status and Logs

```bash
# View running processes and resource usage
pm2 status

# View logs in real time (all processes)
pm2 logs

# View only API logs
pm2 logs innovateguide-api

# View last 200 lines of error log
pm2 logs innovateguide-api --lines 200 --err

# Monitor CPU and memory live
pm2 monit
```

### Nginx Logs

```bash
# Test Nginx config syntax
sudo nginx -t

# Access log (all requests)
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### Health Check Endpoint

The server exposes a health endpoint at:

```
GET https://yourdomain.com/health
```

Returns:
```json
{ "status": "ok", "timestamp": "...", "version": "2.0.0" }
```

Use this with Hostinger's monitoring or an external uptime checker.

---

## Updating the Application

```bash
# SSH into the VPS and navigate to the project
cd /var/www/innovateguide

# Pull latest code and rebuild
bash scripts/deploy.sh
```

`deploy.sh` performs: `git pull` → `npm install` → frontend build → PM2 restart → Nginx reload.

---

## Troubleshooting

### API returns 502 Bad Gateway

The Nginx proxy cannot reach the Node.js server.

```bash
# Check if PM2 is running
pm2 status

# Check API logs
pm2 logs innovateguide-api --err

# Restart if stopped
pm2 start innovateguide-api
```

### Google Sheets / Drive errors

- Verify the service account email in `.env` matches the one in the JSON key file exactly.
- Confirm the spreadsheet has been shared with that email as **Editor**.
- Confirm the Sheets API and Drive API are **Enabled** in the Google Cloud Console.
- Check that `GOOGLE_PRIVATE_KEY` in `.env` preserves literal `\n` characters (not actual newlines) and is wrapped in double quotes.

### Environment variables not loading

- The `.env` file must be in the project root (`/var/www/innovateguide/.env`), not inside `server/`.
- The server calls `require('dotenv').config()` at startup — check that the file exists and has no syntax errors.
- After editing `.env`, restart the process: `pm2 restart innovateguide-api`.

### Port 5000 is already in use

```bash
# Find the process using port 5000
lsof -i :5000

# Kill it if needed
kill -9 <PID>

# Then restart PM2
pm2 start ecosystem.config.js --env production
```

### SSL certificate errors

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Reload Nginx after renewal
sudo systemctl reload nginx
```

### File uploads failing (413 Request Entity Too Large)

Nginx's `client_max_body_size` is set to `110M` in the config. If you increased `MAX_FILE_SIZE_MB` beyond 100, update the Nginx config to match and reload:

```bash
sudo nano /etc/nginx/sites-available/innovateguide
# Change: client_max_body_size 110M;
sudo nginx -t && sudo systemctl reload nginx
```

### Frontend shows blank page after deploy

The built frontend must be in `/var/www/innovateguide/client/dist`. Verify the build ran:

```bash
ls /var/www/innovateguide/client/dist/index.html
```

If missing, rebuild:

```bash
cd /var/www/innovateguide
npm run build --prefix client
```
