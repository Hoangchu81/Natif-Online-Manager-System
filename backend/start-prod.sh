#!/bin/bash
cd /opt/natif-online-manager/backend
PORT=3003 NODE_ENV=production DB_HOST=localhost DB_PORT=5432 DB_NAME=natif_online_manager DB_USER=postgres DB_PASSWORD=NbB4LwqZJvaqM5NY2iwolSQjAEeeI6ut JWT_SECRET=XJBXHof/4gYMzpT5XP1b1TrbFPy8cmvhHfCBrII3HHqTho1YQ5BRYuCznMvgztII FRONTEND_URL=https://oms.natif.vn exec node dist/server.js
