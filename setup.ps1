# 天气预报 MCP Server 快速设置脚本
# 适用于 Windows PowerShell

Write-Host "🌤️ 天气预报 MCP Server 快速设置" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# 检查 Node.js 版本
Write-Host "\n📋 检查环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
    
    $npmVersion = npm --version
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 Node.js，请先安装 Node.js 22.x 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/" -ForegroundColor Blue
    exit 1
}

# 安装依赖
Write-Host "\n📦 安装项目依赖..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

# 检查环境变量文件
Write-Host "\n🔧 检查环境配置..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "📝 创建环境变量文件..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    
    Write-Host "\n⚠️ 重要提示:" -ForegroundColor Red
    Write-Host "请编辑 .env 文件，设置你的 OpenWeatherMap API 密钥" -ForegroundColor Yellow
    Write-Host "1. 访问 https://openweathermap.org/api" -ForegroundColor White
    Write-Host "2. 注册免费账户并获取 API Key" -ForegroundColor White
    Write-Host "3. 在 .env 文件中设置 OPENWEATHER_API_KEY=你的密钥" -ForegroundColor White
    
    # 询问是否现在设置API密钥
    $response = Read-Host "\n是否现在设置API密钥? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        $apiKey = Read-Host "请输入你的 OpenWeatherMap API 密钥"
        if ($apiKey) {
            (Get-Content ".env") -replace "your_api_key_here", $apiKey | Set-Content ".env"
            Write-Host "✅ API密钥已设置" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ 环境变量文件已存在" -ForegroundColor Green
}

# 构建项目
Write-Host "\n🔨 构建项目..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ 项目构建完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 项目构建失败" -ForegroundColor Red
    exit 1
}

# 运行测试
Write-Host "\n🧪 运行功能测试..." -ForegroundColor Yellow
$testChoice = Read-Host "是否运行功能测试? (y/n)"
if ($testChoice -eq "y" -or $testChoice -eq "Y") {
    try {
        npm run test
    } catch {
        Write-Host "⚠️ 测试失败，可能是API密钥未设置或网络问题" -ForegroundColor Yellow
    }
}

Write-Host "\n🎉 设置完成!" -ForegroundColor Green
Write-Host "\n📚 使用说明:" -ForegroundColor Cyan
Write-Host "• 开发模式 (包含调试工具): npm run dev" -ForegroundColor White
Write-Host "• 生产模式: npm start" -ForegroundColor White
Write-Host "• 运行测试: npm run test" -ForegroundColor White
Write-Host "• 重新构建: npm run build" -ForegroundColor White

Write-Host "\n📖 详细文档请查看:" -ForegroundColor Cyan
Write-Host "• README.md - 项目说明" -ForegroundColor White
Write-Host "• 天气预报MCP_Server开发指南.md - 详细开发指南" -ForegroundColor White

Write-Host "\n" + "=" * 50 -ForegroundColor Gray
Write-Host "🚀 准备就绪，开始使用天气预报 MCP Server!" -ForegroundColor Green