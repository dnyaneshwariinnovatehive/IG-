#!/bin/bash
set -e
echo "=== InnovateGuide v2 - Fresh VPS Setup ==="

# -----------------------------------------------
# 1. Install Node.js 20 via nvm
# -----------------------------------------------
echo ""
echo "[1/6] Installing nvm and Node.js 20..."
export NVM_DIR="$HOME/.nvm"

if [ ! -d "$NVM_DIR" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Load nvm into current shell session
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
nvm alias default 20

echo "Node version: $(node -v)"
echo "NPM  version: $(npm -v)"

# -----------------------------------------------
# 2. Install PM2 globally
# -----------------------------------------------
echo ""
echo "[2/6] Installing PM2..."
npm install -g pm2
pm2 startup systemd -u "$USER" --hp "$HOME"
echo "PM2 version: $(pm2 -v)"

# -----------------------------------------------
# 3. Install Nginx
# -----------------------------------------------
echo ""
echo "[3/6] Installing Nginx..."
sudo apt-get update -y
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
echo "Nginx version: $(nginx -v 2>&1)"

# -----------------------------------------------
# 4. Configure UFW firewall
# -----------------------------------------------
echo ""
echo "[4/6] Configuring UFW firewall..."
sudo apt-get install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
sudo ufw status verbose

# -----------------------------------------------
# 5. Create application directories
# -----------------------------------------------
echo ""
echo "[5/6] Creating application directories..."
sudo mkdir -p /var/www/innovateguide
sudo chown -R "$USER":"$USER" /var/www/innovateguide
mkdir -p /var/www/innovateguide/uploads
mkdir -p /var/www/innovateguide/client/dist

# Create logs directory (relative to app root, used by PM2)
mkdir -p "$HOME/innovateguide/logs"

echo "Directory structure created."

# -----------------------------------------------
# 6. Summary and next steps
# -----------------------------------------------
echo ""
echo "[6/6] Setup complete!"
echo ""
echo "========================================================"
echo "  NEXT STEPS (manual configuration required)"
echo "========================================================"
echo ""
echo "1. Clone the repository:"
echo "   git clone <your-repo-url> /var/www/innovateguide"
echo "   cd /var/www/innovateguide"
echo ""
echo "2. Create environment file:"
echo "   cp .env.example .env"
echo "   nano .env   # fill in DB connection, JWT secret, etc."
echo ""
echo "3. Copy Nginx config and enable site:"
echo "   sudo cp nginx/innovateguide.conf /etc/nginx/sites-available/innovateguide"
echo "   sudo ln -s /etc/nginx/sites-available/innovateguide /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "4. Obtain SSL certificate with Certbot:"
echo "   sudo apt-get install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "5. Run the deploy script:"
echo "   bash scripts/deploy.sh"
echo ""
echo "6. Save PM2 process list to survive reboots:"
echo "   pm2 save"
echo ""
echo "========================================================"
