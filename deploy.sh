#!/bin/bash

# 一键部署脚本 - 本地执行部署到服务器
# 使用方法: ./deploy.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置信息 - 请根据你的服务器信息修改
SERVER_HOST="111.231.107.210"          # 服务器IP地址
SERVER_USER="root"                    # SSH用户名
SERVER_PORT="22"                      # SSH端口
REMOTE_DIR="/opt/instant-interview"   # 服务器部署目录

# 服务器密码 - 从环境变量读取，若未设置则提示输入
if [ -z "$SERVER_PASSWORD" ]; then
    echo -e "${YELLOW}请设置环境变量 SERVER_PASSWORD 或直接在下方输入密码:${NC}"
    read -s -p "密码: " SERVER_PASSWORD
    echo ""
fi

# 使用 sshpass 传递密码
export SSHPASS="$SERVER_PASSWORD"

# SSH 选项
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
SCP_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 检查配置
check_config() {
    echo -e "${BLUE}检查部署配置...${NC}"

    if [ "$SERVER_HOST" = "your_server_ip" ]; then
        echo -e "${RED}错误: 请先修改脚本中的 SERVER_HOST 为你的服务器IP地址${NC}"
        exit 1
    fi

    echo -e "${GREEN}配置检查通过${NC}"
}

# 构建项目
build_project() {
    echo -e "${BLUE}开始构建项目...${NC}"

    # 设置 Go 代理（国内网络环境）
    echo -e "${YELLOW}设置 Go 代理...${NC}"
    export GOPROXY=https://goproxy.cn,direct
    export GO111MODULE=on

    # 构建后端
    echo -e "${YELLOW}构建后端 (Go)...${NC}"
    cd backend

    # 清理旧构建
    rm -f server

    # 构建 Linux 可执行文件（如果在 Mac/Windows 上交叉编译）
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
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
    echo -e "${GREEN}后端构建完成${NC}"

    # 构建前端
    echo -e "${YELLOW}构建前端...${NC}"
    cd ../frontend
    npm install
    npm run build

    if [ ! -d "dist" ]; then
        echo -e "${RED}错误: 前端构建失败，dist 目录不存在${NC}"
        exit 1
    fi

    cd ..
    echo -e "${GREEN}项目构建完成${NC}"
}

# 准备服务器环境
prepare_server() {
    echo -e "${BLUE}准备服务器环境...${NC}"

    sshpass -e ssh $SSH_OPTS -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << 'EOF'
set -e

REMOTE_DIR="/opt/instant-interview"

echo "=== 准备服务器环境 ==="
echo "当前时间: $(date)"

# 创建应用目录
mkdir -p $REMOTE_DIR
cd $REMOTE_DIR

# 显示当前进程状态
echo "=== 当前进程状态 ==="
ps aux | grep -E "(instant-interview|serve.*frontend-dist)" | grep -v grep || echo "未找到相关进程"

# 停止现有服务
echo "=== 停止现有服务 ==="

# 停止后端进程
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "发现后端进程 PID: $BACKEND_PID"
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "正在停止后端进程 $BACKEND_PID..."
        kill $BACKEND_PID 2>/dev/null || echo "后端进程已停止"
        sleep 2
    else
        echo "后端进程未运行"
    fi
    rm -f backend.pid
fi

# 停止前端进程
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "发现前端进程 PID: $FRONTEND_PID"
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "正在停止前端进程 $FRONTEND_PID..."
        kill $FRONTEND_PID 2>/dev/null || echo "前端进程已停止"
        sleep 1
    else
        echo "前端进程未运行"
    fi
    rm -f frontend.pid
fi

# 清理残留进程
echo "=== 清理残留进程 ==="
REMAINING_PROCESSES=$(ps aux | grep -E "./server" | grep -v grep | awk '{print $2}')
if [ -n "$REMAINING_PROCESSES" ]; then
    echo "发现残留进程: $REMAINING_PROCESSES"
    for pid in $REMAINING_PROCESSES; do
        if kill -0 $pid 2>/dev/null; then
            echo "停止进程 $pid..."
            kill $pid 2>/dev/null || true
        fi
    done
    sleep 2
else
    echo "无残留进程需要清理"
fi

# 备份旧日志
echo "=== 备份旧日志 ==="
if [ -f "backend.log" ]; then
    mv backend.log "backend.log.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    echo "已备份 backend.log"
fi
if [ -f "frontend.log" ]; then
    mv frontend.log "frontend.log.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    echo "已备份 frontend.log"
fi

echo "=== 服务器环境准备完成 ==="
EOF

    echo -e "${GREEN}服务器环境准备完成${NC}"
}

# 上传文件到服务器
upload_files() {
    echo -e "${BLUE}上传文件到服务器...${NC}"

    # 清理服务器上的旧文件
    echo -e "${YELLOW}清理服务器上的旧文件...${NC}"
    sshpass -e ssh $SSH_OPTS -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_DIR && rm -f server backend.pid frontend.pid && rm -rf frontend-dist && echo '旧文件清理完成'"

    # 上传后端二进制文件
    echo -e "${YELLOW}上传后端文件...${NC}"
    sshpass -e scp $SCP_OPTS -P "$SERVER_PORT" \
        "backend/server" \
        "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/server"

    # 上传前端文件
    echo -e "${YELLOW}上传前端文件...${NC}"
    sshpass -e scp $SCP_OPTS -P "$SERVER_PORT" -r \
        "frontend/dist" \
        "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/frontend-dist"

    # 上传环境变量文件（如果不存在则使用示例文件）
    if [ -f "backend/.env" ]; then
        echo -e "${YELLOW}上传环境变量文件...${NC}"
        sshpass -e scp $SCP_OPTS -P "$SERVER_PORT" \
            "backend/.env" \
            "$SERVER_USER@$SERVER_HOST:$REMOTE_DIR/.env"
    fi

    echo -e "${GREEN}文件上传完成${NC}"
}

# 启动服务
start_services() {
    echo -e "${BLUE}启动服务...${NC}"

    sshpass -e ssh $SSH_OPTS -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" << 'EOF'
set -e
cd /opt/instant-interview

# 加载环境变量文件
if [ -f ".env" ]; then
    echo "加载环境变量..."
    set -a
    source .env
    set +a
fi

# 检查上传的文件
echo "检查上传的文件..."
ls -la

if [ ! -f "server" ]; then
    echo "错误: server 二进制文件不存在!"
    exit 1
fi

if [ ! -d "frontend-dist" ]; then
    echo "错误: frontend-dist 目录不存在!"
    exit 1
fi

# 赋予执行权限
chmod +x server

# 安装 serve (如果没有安装)
which serve || npm install -g serve

# 启动后端服务
echo "启动后端服务..."
# 如果环境变量未设置，使用默认值
export RESUME_DB_HOST=${RESUME_DB_HOST:-localhost}
export RESUME_DB_PORT=${RESUME_DB_PORT:-13306}
export RESUME_DB_USER=${RESUME_DB_USER:-root}
export RESUME_DB_NAME=${RESUME_DB_NAME:-interview}
export RESUME_DB_PASSWORD=${RESUME_DB_PASSWORD:-interviewSQL}
export RESUME_PORT=${RESUME_PORT:-8082}
# 注意: RESUME_DB_PASSWORD 需要提前设置
if [ -z "$RESUME_DB_PASSWORD" ]; then
    echo "警告: RESUME_DB_PASSWORD 未设置，可能导致数据库连接失败"
fi
nohup ./server > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "后端服务已启动，PID: $BACKEND_PID"

# 启动前端服务
echo "启动前端服务..."
cd frontend-dist
nohup serve -s . -p 3001 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo "前端服务已启动，PID: $FRONTEND_PID"
cd ..

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 健康检查
echo "检查服务状态..."

# 检查后端服务
echo "后端健康检查:"
for i in {1..10}; do
    if curl -sf http://localhost:8082/health > /dev/null 2>&1; then
        echo "✅ 后端服务正常"
        break
    else
        echo "⏳ 等待后端服务启动... ($i/10)"
        sleep 3
    fi
done

# 检查前端服务
echo "前端健康检查:"
for i in {1..10}; do
    if curl -sf http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 前端服务正常"
        break
    else
        echo "⏳ 等待前端服务启动... ($i/10)"
        sleep 2
    fi
done

# 显示最终状态
echo "最终进程状态:"
ps aux | grep -E "(server|serve)" | grep -v grep || echo "未找到匹配的进程"

# 显示监听端口
echo "监听端口:"
netstat -tlnp | grep -E ":8082|:3000" || ss -tlnp | grep -E ":8082|:3000" || echo "端口检查不可用"

echo "🎉 部署完成!"
echo "前端访问地址: http://$(curl -s ifconfig.me):3001"
echo "后端API地址: http://$(curl -s ifconfig.me):8082/api/v1"
EOF

    echo -e "${GREEN}服务启动完成${NC}"
}

# 显示部署信息
show_info() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 部署完成!${NC}"
    echo -e "${GREEN}========================================${NC}"
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

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🚀 开始一键部署到服务器${NC}"
    echo -e "${GREEN}========================================${NC}"

    check_config
    build_project
    prepare_server
    upload_files
    start_services
    show_info
}

# 执行主函数
main
