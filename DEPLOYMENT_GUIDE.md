# GitHub Actions Deployment Setup

## Step 1: Add GitHub Secrets

Go to your GitHub repository → **Settings → Secrets and variables → Actions** and add these secrets:

### Required Secrets:

1. **VPS_HOST**
   - Value: `161.33.2.207`

2. **VPS_USER**
   - Value: `ubuntu`

3. **VPS_SSH_KEY**
   - Value: (copy the entire contents of your SSH private key file)
   - File: `ssh-key-2026-05-03.key`
   - Include everything from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----`

4. **VPS_PORT** (optional, defaults to 22)
   - Value: `22`

## Step 2: How to Add Secrets in GitHub UI

1. Go to: `https://github.com/YOUR_USERNAME/Natif-Online-Manager-System/settings/secrets/actions`
2. Click "New repository secret"
3. For each secret:
   - Name: (e.g., `VPS_HOST`)
   - Value: (paste the value)
   - Click "Add secret"

## Step 3: SSH Key Setup

The SSH key will be used in `.github/workflows/deploy.yml` to:
1. Connect to your VPS
2. Pull latest code from GitHub
3. Install dependencies
4. Build the application
5. Restart services via PM2

### Important Notes:

- **Never commit SSH keys to GitHub** ✗
- Always use GitHub Secrets for sensitive data ✓
- The deploy key should have sufficient permissions on VPS
- Ensure VPS user (`ubuntu`) can run Docker and PM2 commands

## Step 4: Test Deployment

Once secrets are added:

1. Make a test commit:
```bash
git add .
git commit -m "test: trigger deployment"
git push origin main
```

2. Go to **Actions** tab in GitHub to watch the workflow
3. Check VPS:
```bash
ssh -i ssh-key-2026-05-03.key ubuntu@161.33.2.207
pm2 status
```

## Step 5: Manual Deployment (if needed)

SSH into VPS and manually pull/deploy:

```bash
ssh -i ssh-key-2026-05-03.key ubuntu@161.33.2.207

cd /opt/natif-online-manager
git pull origin main
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..

pm2 restart all
pm2 status
```

## Troubleshooting

### Workflow fails with "Permission denied"
- Check SSH key permissions: `chmod 600 ~/.ssh/ssh-key-2026-05-03.key`
- Verify key is added to VPS `~/.ssh/authorized_keys`

### Services won't start
```bash
pm2 logs natif-backend
pm2 logs natif-frontend
```

### Database connection error
```bash
docker ps  # Check if postgres is running
docker logs natif_postgres
```

### Port already in use
```bash
sudo lsof -i :3001  # Check what's using port 3001
sudo kill -9 <PID>
```

## GitHub Actions Workflow File

The workflow is defined in: `.github/workflows/deploy.yml`

Key steps:
1. ✓ Install SSH key
2. ✓ Deploy code via git pull
3. ✓ Install dependencies
4. ✓ Build frontend & backend
5. ✓ Restart services with PM2
6. ✓ Verify health check

Each push to `main` branch automatically triggers deployment.
