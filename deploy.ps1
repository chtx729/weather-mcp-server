# 天气预报 MCP Server 部署脚本
# 用于快速部署到 GitHub 和 Vercel

Write-Host "=== 天气预报 MCP Server 部署脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查必要的工具
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# 检查 Git
if (-not (Test-Command "git")) {
    Write-Host "错误: 未找到 Git，请先安装 Git" -ForegroundColor Red
    exit 1
}

# 检查 Node.js
if (-not (Test-Command "node")) {
    Write-Host "错误: 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查 npm
if (-not (Test-Command "npm")) {
    Write-Host "错误: 未找到 npm，请先安装 npm" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 环境检查通过" -ForegroundColor Green
Write-Host ""

# 检查环境变量
if (-not (Test-Path ".env")) {
    Write-Host "警告: 未找到 .env 文件，请确保已配置 OPENWEATHER_API_KEY" -ForegroundColor Yellow
    Write-Host "可以复制 .env.example 并填入你的 API 密钥" -ForegroundColor Yellow
    Write-Host ""
}

# 安装依赖
Write-Host "正在安装依赖..." -ForegroundColor Blue
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 构建项目
Write-Host "正在构建项目..." -ForegroundColor Blue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 项目构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 项目构建完成" -ForegroundColor Green
Write-Host ""

# 运行测试
Write-Host "正在运行测试..." -ForegroundColor Blue
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 测试失败，请检查配置" -ForegroundColor Yellow
} else {
    Write-Host "✓ 测试通过" -ForegroundColor Green
}
Write-Host ""

# Git 初始化和提交
Write-Host "正在初始化 Git 仓库..." -ForegroundColor Blue

# 检查是否已经是 Git 仓库
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Git 仓库初始化完成" -ForegroundColor Green
} else {
    Write-Host "✓ Git 仓库已存在" -ForegroundColor Green
}

# 添加文件到 Git
git add .
git commit -m "Initial commit: Weather MCP Server ready for deployment"
Write-Host "✓ 代码已提交到本地仓库" -ForegroundColor Green
Write-Host ""

# 提示用户创建 GitHub 仓库
Write-Host "=== 下一步操作指南 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 创建 GitHub 仓库:" -ForegroundColor Yellow
Write-Host "   - 访问 https://github.com/new"
Write-Host "   - 仓库名建议: weather-mcp-server"
Write-Host "   - 设置为公开仓库"
Write-Host "   - 不要初始化 README、.gitignore 或 LICENSE"
Write-Host ""

Write-Host "2. 推送代码到 GitHub:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/weather-mcp-server.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""

Write-Host "3. 部署到 Vercel:" -ForegroundColor Yellow
Write-Host "   - 访问 https://vercel.com"
Write-Host "   - 使用 GitHub 账户登录"
Write-Host "   - 点击 'New Project' 导入你的 GitHub 仓库"
Write-Host "   - 在环境变量中添加: OPENWEATHER_API_KEY"
Write-Host ""

Write-Host "4. 配置 GitHub Secrets (可选，用于自动部署):" -ForegroundColor Yellow
Write-Host "   在 GitHub 仓库设置中添加以下 Secrets:"
Write-Host "   - OPENWEATHER_API_KEY: 你的天气 API 密钥"
Write-Host "   - VERCEL_TOKEN: Vercel 访问令牌"
Write-Host "   - ORG_ID: Vercel 组织 ID"
Write-Host "   - PROJECT_ID: Vercel 项目 ID"
Write-Host "   - NPM_TOKEN: NPM 发布令牌 (如果要发布到 NPM)"
Write-Host ""

Write-Host "5. 客户端集成:" -ForegroundColor Yellow
Write-Host "   部署完成后，用户可以通过以下方式集成:"
Write-Host "   - 直接使用部署的 URL"
Write-Host "   - 通过 NPM 安装包"
Write-Host "   - 在 Cursor、Trae、Claude Desktop 中配置"
Write-Host ""

Write-Host "=== 部署准备完成 ===" -ForegroundColor Green
Write-Host "请按照上述步骤完成 GitHub 和 Vercel 部署" -ForegroundColor Green
Write-Host ""

# 询问是否打开相关网站
$openSites = Read-Host "是否打开 GitHub 和 Vercel 网站? (y/N)"
if ($openSites -eq "y" -or $openSites -eq "Y") {
    Start-Process "https://github.com/new"
    Start-Process "https://vercel.com"
    Write-Host "已打开 GitHub 和 Vercel 网站" -ForegroundColor Green
}

Write-Host ""
Write-Host "部署脚本执行完成！" -ForegroundColor Green