#!/bin/bash

# VPS Deployment Checklist & Health Check Script
# Run this on your VPS to verify everything is set up correctly

echo "=========================================="
echo "VPS Deployment Health Check"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version
npm --version
echo ""

# Check Docker
echo "✓ Checking Docker..."
docker --version
docker ps
echo ""

# Check PostgreSQL
echo "✓ Checking PostgreSQL..."
docker exec natif_postgres psql -U postgres -d natif_online_manager -c "SELECT 1" 2>/dev/null && echo "Database: Connected" || echo "Database: Failed"
echo ""

# Check PM2
echo "✓ Checking PM2 Services..."
pm2 status
echo ""

# Check backend health
echo "✓ Checking Backend Health..."
curl -s http://localhost:3001/api/health | jq . 2>/dev/null || echo "Backend: Unreachable"
echo ""

# Check frontend health
echo "✓ Checking Frontend Health..."
curl -s http://localhost:3000 | head -20
echo ""

# Check Nginx
echo "✓ Checking Nginx..."
sudo systemctl status nginx --no-pager
echo ""

# Check disk space
echo "✓ Disk Space:"
df -h | grep -E "^/dev|Filesystem"
echo ""

# Check memory
echo "✓ Memory Usage:"
free -h
echo ""

# Check logs
echo "✓ Recent Logs:"
echo "--- Backend ---"
pm2 logs natif-backend --lines 5
echo ""
echo "--- Frontend ---"
pm2 logs natif-frontend --lines 5
echo ""

echo "=========================================="
echo "Health Check Complete"
echo "=========================================="
