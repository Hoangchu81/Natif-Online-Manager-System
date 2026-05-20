#!/bin/bash

# GitHub Secrets Setup Helper
# This script helps you add secrets to GitHub using gh CLI

echo "=========================================="
echo "GitHub Secrets Setup Helper"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed."
    echo "Install from: https://cli.github.com"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Not authenticated with GitHub. Run: gh auth login"
    exit 1
fi

# Get current repo
REPO=$(gh repo view --json nameWithOwner -q)
echo "Current repository: $REPO"
echo ""

# VPS Configuration
VPS_HOST="161.33.2.207"
VPS_USER="ubuntu"
VPS_PORT="22"
SSH_KEY_PATH="$1"

echo "Adding secrets to GitHub..."
echo ""

# Add VPS_HOST
echo "→ Adding VPS_HOST secret..."
gh secret set VPS_HOST --body "$VPS_HOST"

# Add VPS_USER
echo "→ Adding VPS_USER secret..."
gh secret set VPS_USER --body "$VPS_USER"

# Add VPS_PORT
echo "→ Adding VPS_PORT secret..."
gh secret set VPS_PORT --body "$VPS_PORT"

# Add SSH key
if [ -z "$SSH_KEY_PATH" ]; then
    echo ""
    echo "SSH Key path not provided."
    echo "Usage: bash setup-github-secrets.sh /path/to/ssh/key"
    echo ""
    echo "Add SSH key manually:"
    echo "1. Go to: https://github.com/$REPO/settings/secrets/actions"
    echo "2. Click 'New repository secret'"
    echo "3. Name: VPS_SSH_KEY"
    echo "4. Value: (paste entire SSH key content)"
    exit 1
fi

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Error: SSH key file not found: $SSH_KEY_PATH"
    exit 1
fi

echo "→ Adding VPS_SSH_KEY secret..."
gh secret set VPS_SSH_KEY --body "$(cat "$SSH_KEY_PATH")"

echo ""
echo "=========================================="
echo "✓ All secrets added successfully!"
echo "=========================================="
echo ""
echo "Secrets created:"
gh secret list
