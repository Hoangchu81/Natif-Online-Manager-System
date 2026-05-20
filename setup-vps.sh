#!/bin/bash

# Natif Online Manager System - VPS Setup Script
# Run this script on your VPS as root or with sudo

set -e  # Exit on error

echo "=========================================="
echo "Natif Online Manager System - VPS Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/opt/natif-online-manager"
GITHUB_REPO="$1"  # Pass your GitHub repo URL as argument
DB_PASSWORD="$(openssl rand -base64 32)"
JWT_SECRET="$(openssl rand -base64 32)"

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}[2/8] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

echo -e "${YELLOW}[3/8] Installing Docker and Docker Compose...${NC}"
apt-get install -y docker.io docker-compose
usermod -aG docker ubuntu

echo -e "${YELLOW}[4/8] Installing PM2 globally...${NC}"
npm install -g pm2
npm install -g pm2-logrotate
pm2 install pm2-logrotate

echo -e "${YELLOW}[5/8] Installing Nginx...${NC}"
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

echo -e "${YELLOW}[6/8] Installing Certbot for SSL...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${YELLOW}[7/8] Cloning repository...${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}Error: Please provide GitHub repo URL as argument${NC}"
    echo "Usage: sudo bash setup-vps.sh https://github.com/username/repo.git"
    exit 1
fi

git clone $GITHUB_REPO .

echo -e "${YELLOW}[8/8] Setting up environment variables...${NC}"

# Backend .env
cat > backend/.env << EOF
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@localhost:5432/natif_online_manager
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
API_URL=https://${2:-app.example.com}
FRONTEND_URL=https://${2:-app.example.com}
EOF

# Frontend .env.local
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://${2:-app.example.com}/api
EOF

echo -e "${YELLOW}Installing dependencies...${NC}"
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..

echo -e "${YELLOW}Starting PostgreSQL with Docker...${NC}"
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

echo -e "${YELLOW}Starting services with PM2...${NC}"
pm2 start backend/dist/server.js --name "natif-backend" --env production
pm2 start "npm start" --cwd frontend --name "natif-frontend"
pm2 save
pm2 startup

echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!"
echo "=========================================${NC}"
echo ""
echo -e "${GREEN}Services Status:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure Nginx:"
echo "   sudo nano /etc/nginx/sites-available/natif"
echo ""
echo "2. Add SSL certificate (if domain available):"
echo "   sudo certbot certonly --nginx -d your-domain.com"
echo ""
echo "3. Restart Nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo -e "${YELLOW}Database credentials:${NC}"
echo "URL: postgresql://postgres:${DB_PASSWORD}@localhost:5432/natif_online_manager"
echo ""
echo -e "${YELLOW}JWT Secret:${NC}"
echo "${JWT_SECRET}"
echo ""
echo "Save these credentials securely!"
