#!/bin/bash

# 一键部署脚本 - 本地执行部署到服务器
# 支持:
# 1. SSH 密钥免密登录
# 2. 安装 sshpass 后通过 SERVER_PASSWORD 免交互部署
# 使用方法: ./deploy.sh

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置信息 - 可通过环境变量覆盖
SERVER_HOST="${SERVER_HOST:-111.231.107.210}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/opt/instant-interview}"

AUTH_MODE=""
SSH_COMMON_OPTS=(
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
  -o ConnectTimeout=10
  -p "$SERVER_PORT"
)
SCP_COMMON_OPTS=(
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
  -P "$SERVER_PORT"
)

check_dependencies() {
  for cmd in ssh scp go npm; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      echo -e "${RED}错误: 未找到依赖命令 $cmd${NC}"
      exit 1
    fi
  done
}

check_config() {
  echo -e "${BLUE}检查部署配置...${NC}"

  if [ "$SERVER_HOST" = "your_server_ip" ]; then
    echo -e "${RED}错误: 请先修改 SERVER_HOST 为你的服务器 IP 地址${NC}"
    exit 1
  fi

  check_dependencies
  echo -e "${GREEN}配置检查通过${NC}"
}

detect_auth_mode() {
  echo -e "${BLUE}检查 SSH 登录方式...${NC}"

  if ssh "${SSH_COMMON_OPTS[@]}" -o BatchMode=yes "$SERVER_USER@$SERVER_HOST" "echo connected" >/dev/null 2>&1; then
    AUTH_MODE="ssh-key"
    echo -e "${GREEN}检测到 SSH 密钥免密登录，使用密钥部署${NC}"
    return
  fi

  if command -v sshpass >/dev/null 2>&1; then
    if [ -z "${SERVER_PASSWORD:-}" ]; then
      echo -e "${YELLOW}未检测到 SSH 密钥登录，将使用 sshpass。${NC}"
      read -r -s -p "请输入服务器密码: " SERVER_PASSWORD
      echo ""
    fi

    export SSHPASS="$SERVER_PASSWORD"
    if sshpass -e ssh "${SSH_COMMON_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "echo connected" >/dev/null 2>&1; then
      AUTH_MODE="sshpass"
      echo -e "${GREEN}检测到 sshpass 可用，使用密码免交互部署${NC}"
      return
    fi

    echo -e "${RED}错误: sshpass 登录失败，请检查 SERVER_PASSWORD 是否正确${NC}"
    exit 1
  fi

  echo -e "${RED}错误: 当前既没有可用的 SSH 密钥登录，也没有安装 sshpass${NC}"
  echo -e "${YELLOW}建议:${NC}"
  echo -e "  1. 配置 SSH 密钥免密登录"
  echo -e "  2. 或安装 sshpass，并设置 SERVER_PASSWORD 环境变量"
  exit 1
}

remote_ssh() {
  if [ "$AUTH_MODE" = "sshpass" ]; then
    sshpass -e ssh "${SSH_COMMON_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "$@"
  else
    ssh "${SSH_COMMON_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "$@"
  fi
}

remote_scp() {
  if [ "$AUTH_MODE" = "sshpass" ]; then
    sshpass -e scp "${SCP_COMMON_OPTS[@]}" "$@"
  else
    scp "${SCP_COMMON_OPTS[@]}" "$@"
  fi
}

run_remote_script() {
  if [ "$AUTH_MODE" = "sshpass" ]; then
    sshpass -e ssh "${SSH_COMMON_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "bash -s -- $*"
  else
    ssh "${SSH_COMMON_OPTS[@]}" "$SERVER_USER@$SERVER_HOST" "bash -s -- $*"
  fi
}

build_project() {
  echo -e "${BLUE}开始构建项目...${NC}"

  echo -e "${YELLOW}设置 Go 代理...${NC}"
  export GOPROXY=https://goproxy.cn,direct
  export GO111MODULE=on

  echo -e "${YELLOW}构建后端 (Go)...${NC}"
  (
    cd backend
    rm -f server

    if [[ "${OSTYPE:-}" == "linux-gnu"* ]]; then
      go build -o server main.go
    else
      echo -e "${YELLOW}检测到非 Linux 系统，使用交叉编译...${NC}"
      GOOS=linux GOARCH=amd64 go build -o server main.go
    fi

    if [ ! -f "server" ]; then
      echo -e "${RED}错误: 后端构建失败，server 二进制文件不存在${NC}"
      exit 1
    fi

    chmod +x server
  )
  echo -e "${GREEN}后端构建完成${NC}"

  echo -e "${YELLOW}构建前端...${NC}"
  (
    cd frontend
    npm install
    npm run build

    if [ ! -d "dist" ]; then
      echo -e "${RED}错误: 前端构建失败，dist 目录不存在${NC}"
      exit 1
    fi
  )

  echo -e "${GREEN}项目构建完成${NC}"
}

prepare_server() {
  echo -e "${BLUE}准备服务器环境...${NC}"

  run_remote_script "$REMOTE_DIR" <<'EOF'
set -e

REMOTE_DIR="$1"

echo "=== 准备服务器环境 ==="
echo "当前时间: $(date)"

mkdir -p "$REMOTE_DIR"
cd "$REMOTE_DIR"

echo "=== 当前进程状态 ==="
ps aux | grep -E "(instant-interview|serve.*frontend-dist|./server)" | grep -v grep || echo "未找到相关进程"

echo "=== 停止现有服务 ==="
if [ -f "backend.pid" ]; then
  BACKEND_PID=$(cat backend.pid)
  echo "发现后端进程 PID: $BACKEND_PID"
  if kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    sleep 2
  fi
  rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
  FRONTEND_PID=$(cat frontend.pid)
  echo "发现前端进程 PID: $FRONTEND_PID"
  if kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f frontend.pid
fi

echo "=== 清理残留进程 ==="
REMAINING_PROCESSES=$(ps aux | grep -E "./server" | grep -v grep | awk '{print $2}')
if [ -n "$REMAINING_PROCESSES" ]; then
  for pid in $REMAINING_PROCESSES; do
    kill "$pid" 2>/dev/null || true
  done
  sleep 2
else
  echo "无残留进程需要清理"
fi

echo "=== 备份旧日志 ==="
if [ -f "backend.log" ]; then
  mv backend.log "backend.log.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi
if [ -f "frontend.log" ]; then
  mv frontend.log "frontend.log.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

echo "=== 服务器环境准备完成 ==="
EOF

  echo -e "${GREEN}服务器环境准备完成${NC}"
}

upload_files() {
  echo -e "${BLUE}上传文件到服务器...${NC}"

  echo -e "${YELLOW}清理服务器上的旧文件...${NC}"
  remote_ssh "cd '$REMOTE_DIR' && rm -f server backend.pid frontend.pid && rm -rf frontend-dist && echo '旧文件清理完成'"

  echo -e "${YELLOW}上传后端文件...${NC}"
  remote_scp "backend/server" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/server"

  echo -e "${YELLOW}上传前端文件...${NC}"
  remote_scp -r "frontend/dist" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/frontend-dist"

  if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}上传环境变量文件...${NC}"
    remote_scp "backend/.env" "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/.env"
  fi

  echo -e "${GREEN}文件上传完成${NC}"
}

start_services() {
  echo -e "${BLUE}启动服务...${NC}"

  run_remote_script "$REMOTE_DIR" <<'EOF'
set -e

REMOTE_DIR="$1"
cd "$REMOTE_DIR"

if [ -f ".env" ]; then
  echo "加载环境变量..."
  set -a
  source .env
  set +a
else
  echo "警告: 未找到 .env，将使用脚本默认配置"
fi

echo "检查上传的文件..."
ls -la

[ -f "server" ] || { echo "错误: server 二进制文件不存在"; exit 1; }
[ -d "frontend-dist" ] || { echo "错误: frontend-dist 目录不存在"; exit 1; }

chmod +x server
which serve >/dev/null 2>&1 || npm install -g serve

echo "启动后端服务..."
export RESUME_DB_HOST="${RESUME_DB_HOST:-localhost}"
export RESUME_DB_PORT="${RESUME_DB_PORT:-13306}"
export RESUME_DB_USER="${RESUME_DB_USER:-root}"
export RESUME_DB_NAME="${RESUME_DB_NAME:-interview}"
export RESUME_DB_PASSWORD="${RESUME_DB_PASSWORD:-interviewSQL}"
export RESUME_PORT="${RESUME_PORT:-8082}"

echo "后端启动配置:"
echo "  RESUME_DB_HOST=$RESUME_DB_HOST"
echo "  RESUME_DB_PORT=$RESUME_DB_PORT"
echo "  RESUME_DB_USER=$RESUME_DB_USER"
echo "  RESUME_DB_NAME=$RESUME_DB_NAME"
echo "  RESUME_PORT=$RESUME_PORT"

nohup ./server > backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > backend.pid
echo "后端服务已启动，PID: $BACKEND_PID"

echo "启动前端服务..."
cd frontend-dist
nohup serve -s . -p 3001 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > ../frontend.pid
echo "前端服务已启动，PID: $FRONTEND_PID"
cd ..

echo "等待服务启动..."
sleep 10

echo "后端健康检查:"
BACKEND_OK=0
for i in {1..10}; do
  if curl -sf http://localhost:8082/health >/dev/null 2>&1; then
    echo "✅ 后端服务正常"
    BACKEND_OK=1
    break
  fi
  echo "⏳ 等待后端服务启动... ($i/10)"
  sleep 3
done

if [ "$BACKEND_OK" -ne 1 ]; then
  echo "❌ 后端服务启动失败，最近日志如下:"
  tail -n 120 backend.log 2>/dev/null || echo "backend.log 不存在"
  exit 1
fi

echo "前端健康检查:"
FRONTEND_OK=0
for i in {1..10}; do
  if curl -sf http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ 前端服务正常"
    FRONTEND_OK=1
    break
  fi
  echo "⏳ 等待前端服务启动... ($i/10)"
  sleep 2
done

if [ "$FRONTEND_OK" -ne 1 ]; then
  echo "❌ 前端服务启动失败，最近日志如下:"
  tail -n 120 frontend.log 2>/dev/null || echo "frontend.log 不存在"
  exit 1
fi

echo "最终进程状态:"
ps aux | grep -E "(server|serve)" | grep -v grep || echo "未找到匹配的进程"

echo "监听端口:"
netstat -tlnp | grep -E ":8082|:3001" || ss -tlnp | grep -E ":8082|:3001" || echo "端口检查不可用"

echo "🎉 部署完成!"
EOF

  echo -e "${GREEN}服务启动完成${NC}"
}

show_info() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}🎉 部署完成!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "${YELLOW}认证方式:${NC} ${BLUE}$AUTH_MODE${NC}"
  echo -e "${YELLOW}访问地址:${NC}"
  echo -e "  前端: ${BLUE}http://$SERVER_HOST:3001${NC}"
  echo -e "  后端API: ${BLUE}http://$SERVER_HOST:8082/api/v1${NC}"
  echo ""
  echo -e "${YELLOW}服务管理:${NC}"
  echo -e "  查看后端日志: ${BLUE}ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'tail -n 500 $REMOTE_DIR/backend.log'${NC}"
  echo -e "  查看前端日志: ${BLUE}ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'tail -n 500 $REMOTE_DIR/frontend.log'${NC}"
  echo -e "  重新部署: ${BLUE}./deploy.sh${NC}"
  echo -e "${GREEN}========================================${NC}"
}

main() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}🚀 开始一键部署到服务器${NC}"
  echo -e "${GREEN}========================================${NC}"

  check_config
  detect_auth_mode
  build_project
  prepare_server
  upload_files
  start_services
  show_info
}

main
