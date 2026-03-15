# Resume AI 部署脚本

## 环境说明
- 服务器: 111.231.107.210
- 端口: 8082
- 前端构建后部署到服务器静态目录

## 部署步骤

### 1. 前端部署
```bash
# 在本地构建前端
cd frontend
npm install
npm run build

# 将 dist 目录内容上传到服务器
# 可以使用 scp 或者 rsync
scp -r dist/* user@111.231.107.210:/path/to/static/
```

### 2. 后端部署
```bash
# 在服务器上拉取最新代码
cd /path/to/backend
git pull

# 重新编译
go build -o server .

# 重启服务
pm2 restart server
# 或者
systemctl restart resume-ai
```

### 3. 使用部署脚本 (Linux/Mac)
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh
```

### 4. 使用部署脚本 (Windows)
```bash
# 在 PowerShell 中执行
.\deploy.ps1
```
