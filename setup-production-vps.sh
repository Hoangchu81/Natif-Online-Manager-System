#!/bin/bash
# =============================================================================
# NATIF OMS - Production VPS Setup Script
# VPS: oms.natif.vn (161.33.2.207)
# Run as: ubuntu user with sudo privileges
# Usage: bash setup-production-vps.sh
# =============================================================================
set -e

DEPLOY_PATH="/opt/natif-online-manager"
GITHUB_REPO="https://github.com/Hoangchu81/Natif-Online-Manager-System.git"
DB_NAME="natif_online_manager"
DB_USER="natif_user"
DB_PASSWORD="$(openssl rand -base64 24)"
JWT_SECRET="$(openssl rand -base64 48)"
DOMAIN="oms.natif.vn"
API_PORT=3001
FRONTEND_PORT=3000

echo "=============================="
echo " NATIF OMS Production Setup"
echo "=============================="

# 1. System update
echo "[1/9] Updating system..."
sudo apt-get update -qq

# 2. Node.js 20
if ! node --version 2>/dev/null | grep -q "v20"; then
  echo "[2/9] Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "[2/9] Node.js 20 already installed: $(node --version)"
fi

# 3. PM2
if ! which pm2 > /dev/null 2>&1; then
  echo "[3/9] Installing PM2..."
  sudo npm install -g pm2
else
  echo "[3/9] PM2 already installed"
fi

# 4. PostgreSQL
if ! which psql > /dev/null 2>&1; then
  echo "[4/9] Installing PostgreSQL..."
  sudo apt-get install -y postgresql postgresql-contrib
  sudo systemctl enable postgresql
  sudo systemctl start postgresql
else
  echo "[4/9] PostgreSQL already installed"
fi

# Create DB user and database
echo "[4/9] Configuring PostgreSQL database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# 5. Clone or update repo
echo "[5/9] Deploying code to $DEPLOY_PATH..."
if [ ! -d "$DEPLOY_PATH/.git" ]; then
  sudo mkdir -p "$DEPLOY_PATH"
  sudo chown "$USER:$USER" "$DEPLOY_PATH"
  git clone "$GITHUB_REPO" "$DEPLOY_PATH"
else
  cd "$DEPLOY_PATH"
  git fetch origin main
  git reset --hard origin/main
fi

cd "$DEPLOY_PATH"

# 6. Create backend .env
echo "[6/9] Creating backend .env..."
cat > "$DEPLOY_PATH/backend/.env" << EOF
PORT=$API_PORT
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
API_URL=https://$DOMAIN
FRONTEND_URL=https://$DOMAIN
EOF

# Create frontend .env.local
cat > "$DEPLOY_PATH/frontend/.env.local" << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
EOF

# 7. Install dependencies and build
echo "[7/9] Building backend..."
cd "$DEPLOY_PATH/backend"
npm ci
npm run build

echo "[7/9] Building frontend..."
cd "$DEPLOY_PATH/frontend"
npm ci
npm run build

# 8. Create PM2 ecosystem config
echo "[8/9] Creating PM2 config..."
cat > "$DEPLOY_PATH/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [
    {
      name: 'natif-backend',
      script: 'dist/server.js',
      cwd: '$DEPLOY_PATH/backend',
      env: {
        NODE_ENV: 'production',
      },
      env_file: '$DEPLOY_PATH/backend/.env',
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/natif-backend-error.log',
      out_file: '/var/log/pm2/natif-backend-out.log',
    },
    {
      name: 'natif-frontend',
      script: 'npm',
      args: 'start',
      cwd: '$DEPLOY_PATH/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: '$FRONTEND_PORT',
        NEXT_PUBLIC_API_URL: 'https://$DOMAIN/api',
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/natif-frontend-error.log',
      out_file: '/var/log/pm2/natif-frontend-out.log',
    },
  ],
};
EOF

sudo mkdir -p /var/log/pm2
sudo chown "$USER:$USER" /var/log/pm2

# Start/restart PM2
pm2 start "$DEPLOY_PATH/ecosystem.config.cjs" || pm2 reload "$DEPLOY_PATH/ecosystem.config.cjs"
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup ubuntu -u "$USER" --hp "$HOME"

# 9. nginx config
echo "[9/9] Configuring nginx for $DOMAIN..."
if ! which nginx > /dev/null 2>&1; then
  sudo apt-get install -y nginx
fi

sudo tee /etc/nginx/sites-available/natif-oms << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location /api/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/natif-oms /etc/nginx/sites-enabled/natif-oms
sudo nginx -t && sudo systemctl reload nginx

# SSL with certbot
if which certbot > /dev/null 2>&1; then
  echo "SSL: Installing certificate for $DOMAIN..."
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@natif.vn --redirect
else
  echo "SSL: Install certbot manually: sudo apt-get install certbot python3-certbot-nginx"
fi

echo ""
echo "=============================="
echo " SETUP COMPLETE"
echo "=============================="
echo " Site:     https://$DOMAIN"
echo " Backend:  http://localhost:$API_PORT/api/health"
echo " Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo " DB credentials (SAVE THESE):"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   JWT_SECRET=$JWT_SECRET"
echo ""
echo " PM2 status:"
pm2 status
