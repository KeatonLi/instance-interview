# Resume AI 部署脚本 (Windows PowerShell)
# 服务器: 111.231.107.210

$ErrorActionPreference = "Stop"

# 配置
$ServerUser = "root"
$ServerHost = "111.231.107.210"
$ServerPort = "22"
$ServerPath = "/var/www/resume-ai"
$BackendPath = "/var/www/resume-ai-backend"

Write-Host "========== Resume AI 部署开始 ==========" -ForegroundColor Green

# 1. 构建前端
Write-Host "[1/4] 构建前端..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build
Set-Location ..

# 2. 上传前端
Write-Host "[2/4] 上传前端到服务器..." -ForegroundColor Cyan
$syncCmd = "ssh -p $ServerPort $ServerUser@$ServerHost `"mkdir -p $ServerPath`""
Invoke-Expression $syncCmd

$scpCmd = "scp -r -P $ServerPort dist\* $ServerUser@$ServerHost`:$ServerPath/"
Invoke-Expression $scpCmd

# 3. 上传后端代码
Write-Host "[3/4] 上传后端代码到服务器..." -ForegroundColor Cyan
# 使用 scp 上传后端目录 (排除 node_modules 和 .git)
Get-ChildItem -Path backend -Recurse -Exclude node_modules,.git |
    Where-Object { $_.FullName -notmatch 'node_modules|\.git' } |
    ForEach-Object {
        $relativePath = $_.FullName.Substring($_.FullName.IndexOf("backend") + 8)
        if (-not $_.PSIsContainer) {
            $scpCmd = "scp -P $ServerPort `"$($_.FullName)`" `"$ServerUser@$ServerHost`:$BackendPath/$relativePath`""
            Invoke-Expression $scpCmd
        }
    }

# 4. 在服务器上构建和重启后端
Write-Host "[4/4] 在服务器上构建和重启后端..." -ForegroundColor Cyan
$sshCmd = "ssh -p $ServerPort $ServerUser@$ServerHost"
$remoteCommands = @"
cd $BackendPath
go mod download
go build -o server .
pm2 restart resume-ai || pm2 start server --name resume-ai
"@

Invoke-Expression "$sshCmd `"$remoteCommands`""

Write-Host "========== 部署完成 ==========" -ForegroundColor Green
Write-Host "前端访问: http://111.231.107.210" -ForegroundColor Green
Write-Host "API地址: http://111.231.107.210:8082" -ForegroundColor Green
