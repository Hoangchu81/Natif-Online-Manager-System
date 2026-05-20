# Natif Online Manager System

SaaS Platform cho quản lý trực tuyến.

## Cấu trúc dự án

```
.
├── backend/          # Node.js + Express.js API
├── frontend/         # Next.js + React UI
├── .github/
│   └── workflows/    # GitHub Actions CI/CD
├── docker-compose.yml
└── README.md
```

## Tech Stack
- **Backend:** Node.js + Express.js + PostgreSQL
- **Frontend:** Next.js + React + TypeScript
- **Database:** PostgreSQL
- **Deployment:** Ubuntu 20.04+ VPS với auto-deploy từ GitHub

## Setup

### Yêu cầu
- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose (tùy chọn)

### Phát triển cục bộ

1. **Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

2. **Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Deploy lên VPS
Push code lên GitHub → GitHub Actions tự động deploy lên VPS.

