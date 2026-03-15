#!/bin/bash

# Resume AI 部署脚本
# 服务器: 111.231.107.210

set -e

# 配置
SERVER_USER="root"
SERVER_HOST="111.231.107.210"
SERVER_PORT="22"
SERVER_PATH="/var/www/resume-ai"
BACKEND_PATH="/var/www/resume-ai-backend"

echo "========== Resume AI 部署开始 =========="

# 1. 构建前端
echo "[1/4] 构建前端..."
cd frontend
npm install
npm run build
cd ..

# 2. 上传前端
echo "[2/4] 上传前端到服务器..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"
rsync -avz --delete -e "ssh -p $SERVER_PORT" dist/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

# 3. 上传后端代码
echo "[3/4] 上传后端代码到服务器..."
rsync -avz --exclude "node_modules" --exclude ".git" -e "ssh -p $SERVER_PORT" backend/ $SERVER_USER@$SERVER_HOST:$BACKEND_PATH/

# 4. 在服务器上构建和重启后端
echo "[4/4] 在服务器上构建和重启后端..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'EOF'
  cd /var/www/resume-ai-backend
  go mod download
  go build -o server .
  pm2 restart resume-ai || pm2 start server --name resume-ai
EOF

echo "========== 部署完成 =========="
echo "前端访问: http://111.231.107.210"
echo "API地址: http://111.231.107.210:8082"
