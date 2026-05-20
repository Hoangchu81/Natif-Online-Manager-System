# Natif Online Manager System - Complete Setup Guide

## 📋 Overview

This guide walks you through setting up the Natif Online Manager System with:
- Code synced between MacBook, VPS, and GitHub
- Automatic deployment on each push to `main`
- Frontend (Next.js) + Backend (Express.js) + Database (PostgreSQL)

---

## 🎯 VPS Information

- **IP**: 161.33.2.207
- **Username**: ubuntu
- **SSH Port**: 22
- **SSH Key**: ssh-key-2026-05-03.key

---

## Step 1: Initial VPS Setup (One Time)

### 1.1 Connect to VPS

```bash
ssh -i ~/path/to/ssh-key-2026-05-03.key ubuntu@161.33.2.207
```

### 1.2 Run Setup Script

Upload and run the setup script on VPS:

```bash
# On your MacBook, upload setup script
scp -i ~/path/to/ssh-key-2026-05-03.key setup-vps.sh ubuntu@161.33.2.207:~/

# SSH into VPS
ssh -i ~/path/to/ssh-key-2026-05-03.key ubuntu@161.33.2.207

# Run setup (pass your GitHub repo URL and domain)
sudo bash setup-vps.sh https://github.com/YOUR_USERNAME/Natif-Online-Manager-System.git your-domain.com
```

The script will:
- ✓ Install Node.js 20
- ✓ Install Docker & Docker Compose
- ✓ Install PM2 (process manager)
- ✓ Install Nginx (reverse proxy)
- ✓ Install Certbot (SSL certificates)
- ✓ Clone your GitHub repository
- ✓ Install dependencies
- ✓ Build frontend and backend
- ✓ Start PostgreSQL via Docker
- ✓ Start services with PM2

### 1.3 Configure Nginx

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/natif

# Copy content from: nginx.conf (in your project)

# Enable the config
sudo ln -s /etc/nginx/sites-available/natif /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 1.4 Set Up SSL Certificate (if you have a domain)

```bash
sudo certbot certonly --nginx -d your-domain.com

# Then uncomment SSL section in nginx.conf and reload
sudo systemctl reload nginx
```

### 1.5 Verify Everything Works

```bash
# Check services
pm2 status

# Run health check
bash health-check.sh

# Check logs
pm2 logs natif-backend
pm2 logs natif-frontend
```

---

## Step 2: GitHub Configuration

### 2.1 Add SSH Key to GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/Natif-Online-Manager-System/settings/secrets/actions`

Add these secrets:

| Secret Name | Value |
|------------|-------|
| `VPS_HOST` | `161.33.2.207` |
| `VPS_USER` | `ubuntu` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | (contents of ssh-key-2026-05-03.key) |

### 2.2 Using gh CLI (Optional)

If you have GitHub CLI installed:

```bash
bash setup-github-secrets.sh ~/path/to/ssh-key-2026-05-03.key
```

---

## Step 3: Development Workflow

### 3.1 On Your MacBook

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/Natif-Online-Manager-System.git
cd Natif-Online-Manager-System

# Development - run both services locally
docker-compose up

# Or run separately:
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### 3.2 Make Changes

Edit files in:
- `backend/src/` - backend code
- `frontend/app/` - frontend code

### 3.3 Commit and Push

```bash
git add .
git commit -m "feat: your changes here"
git push origin main
```

### 3.4 Automatic Deployment

The GitHub Actions workflow will automatically:
1. Run CI checks (tests, linting, build)
2. If successful, deploy to VPS:
   - SSH into VPS
   - Pull latest code
   - Install dependencies
   - Build both frontend and backend
   - Restart services via PM2
   - Verify health check

---

## Step 4: Working on VPS

### 4.1 SSH Access

```bash
ssh -i ~/path/to/ssh-key-2026-05-03.key ubuntu@161.33.2.207

# Go to project
cd /opt/natif-online-manager

# Check services
pm2 status
pm2 logs
```

### 4.2 Manual Deployment (if automated fails)

```bash
cd /opt/natif-online-manager
git pull origin main

# Backend
cd backend
npm ci
npm run build
cd ..

# Frontend
cd frontend
npm ci
npm run build
cd ..

# Restart
pm2 restart all
pm2 status
```

### 4.3 Manage Services

```bash
# View logs
pm2 logs natif-backend
pm2 logs natif-frontend

# Restart specific service
pm2 restart natif-backend
pm2 restart natif-frontend

# Stop services
pm2 stop all

# Start services
pm2 start all
```

### 4.4 Database Management

```bash
# Connect to PostgreSQL
docker exec -it natif_postgres psql -U postgres -d natif_online_manager

# Backup database
docker exec natif_postgres pg_dump -U postgres natif_online_manager > backup.sql

# Restore database
docker exec -i natif_postgres psql -U postgres natif_online_manager < backup.sql
```

---

## 🚀 Deployment Flow

```
MacBook (local dev)
        ↓
     git push
        ↓
  GitHub Repository
        ↓
GitHub Actions (CI/CD)
        ↓
   VPS (161.33.2.207)
        ↓
  Nginx → Frontend (3000) & Backend (3001)
        ↓
   PostgreSQL Database
```

---

## 📊 Monitoring & Health Checks

### 4.1 Check Services

```bash
pm2 status
pm2 monit
```

### 4.2 Check Logs

```bash
# Recent logs
pm2 logs natif-backend --lines 50
pm2 logs natif-frontend --lines 50

# Watch logs in real-time
pm2 logs natif-backend --follow
```

### 4.3 Health Check

```bash
# Backend API
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000

# Database
docker exec natif_postgres psql -U postgres -d natif_online_manager -c "SELECT 1"
```

### 4.4 System Resources

```bash
# Disk space
df -h

# Memory
free -h

# CPU
top
```

---

## 🔒 Security Checklist

- [ ] SSH key permissions: `chmod 600 ~/.ssh/ssh-key-2026-05-03.key`
- [ ] Never commit `.env` files to GitHub
- [ ] Use strong database passwords
- [ ] Update system regularly: `sudo apt update && sudo apt upgrade`
- [ ] Enable firewall and allow only needed ports
- [ ] Use SSL/HTTPS certificates
- [ ] Rotate secrets periodically
- [ ] Monitor server logs for suspicious activity

---

## 🆘 Troubleshooting

### Services won't start after deploy

```bash
pm2 logs natif-backend
pm2 logs natif-frontend

# Check if ports are in use
lsof -i :3000
lsof -i :3001

# Check environment variables
cat /opt/natif-online-manager/backend/.env
cat /opt/natif-online-manager/frontend/.env.local
```

### Database connection error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs natif_postgres

# Verify connection string
echo $DATABASE_URL
```

### GitHub Actions deployment fails

Check the workflow logs:
1. Go to: `https://github.com/YOUR_USERNAME/Natif-Online-Manager-System/actions`
2. Click the failed workflow
3. Check the error messages
4. Common issues:
   - SSH key not added to GitHub Secrets
   - VPS_HOST, VPS_USER, VPS_PORT incorrect
   - SSH key permissions issue on VPS

### Port already in use

```bash
# Find what's using the port
sudo lsof -i :3001
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or restart services
pm2 restart all
```

---

## 📞 Quick Reference

```bash
# SSH into VPS
ssh -i ~/path/to/ssh-key-2026-05-03.key ubuntu@161.33.2.207

# View services
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# View database
docker exec -it natif_postgres psql -U postgres -d natif_online_manager

# Restart Nginx
sudo systemctl restart nginx

# Check system resources
df -h && free -h
```

---

## 🎉 You're All Set!

Your deployment is now ready:
- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api`
- **Database**: PostgreSQL (internal)

Push code to GitHub and watch it auto-deploy to your VPS! 🚀
