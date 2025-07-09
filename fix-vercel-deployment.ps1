#!/usr/bin/env powershell
# 修复 Vercel 部署问题的快速脚本
# Fix Vercel Deployment Issues Script

Write-Host "=== Vercel 部署问题修复脚本 ===" -ForegroundColor Green
Write-Host "正在检查和修复常见的 Vercel 部署问题..." -ForegroundColor Yellow

# 1. 检查必要文件
Write-Host "\n1. 检查必要文件..." -ForegroundColor Cyan

$requiredFiles = @(
    "vercel.json",
    "package.json",
    "api/index.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "✗ $file 缺失" -ForegroundColor Red
        exit 1
    }
}

# 2. 检查 package.json 语法
Write-Host "\n2. 验证 package.json 语法..." -ForegroundColor Cyan
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "✓ package.json 语法正确" -ForegroundColor Green
} catch {
    Write-Host "✗ package.json 语法错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. 检查 vercel.json 配置
Write-Host "\n3. 检查 vercel.json 配置..." -ForegroundColor Cyan
try {
    $vercelJson = Get-Content "vercel.json" -Raw | ConvertFrom-Json
    
    # 检查必要的配置项
    if ($vercelJson.outputDirectory) {
        Write-Host "✓ outputDirectory 已配置: $($vercelJson.outputDirectory)" -ForegroundColor Green
    } else {
        Write-Host "✗ 缺少 outputDirectory 配置" -ForegroundColor Red
    }
    
    if ($vercelJson.buildCommand) {
        Write-Host "✓ buildCommand 已配置: $($vercelJson.buildCommand)" -ForegroundColor Green
    } else {
        Write-Host "✗ 缺少 buildCommand 配置" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ vercel.json 语法错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. 检查构建脚本
Write-Host "\n4. 检查构建脚本..." -ForegroundColor Cyan
if ($packageJson.scripts.build) {
    Write-Host "✓ build 脚本存在: $($packageJson.scripts.build)" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少 build 脚本" -ForegroundColor Red
}

if ($packageJson.scripts.'vercel-build') {
    Write-Host "✓ vercel-build 脚本存在" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少 vercel-build 脚本" -ForegroundColor Red
}

# 5. 创建 .vercelignore 文件（如果不存在）
Write-Host "\n5. 检查 .vercelignore 文件..." -ForegroundColor Cyan
if (-not (Test-Path ".vercelignore")) {
    Write-Host "创建 .vercelignore 文件..." -ForegroundColor Yellow
    
    $vercelIgnoreContent = @"
# Dependencies
node_modules
npm-debug.log*

# Environment variables
.env
.env.local

# Build outputs (keep only what's needed)
src/

# IDE files
.vscode/
.idea/

# Documentation
*.md
!README.md

# Scripts
*.ps1

# Git
.git/
.gitignore
"@
    
    $vercelIgnoreContent | Out-File -FilePath ".vercelignore" -Encoding UTF8
    Write-Host "✓ .vercelignore 文件已创建" -ForegroundColor Green
} else {
    Write-Host "✓ .vercelignore 文件已存在" -ForegroundColor Green
}

# 6. 测试构建
Write-Host "\n6. 测试构建过程..." -ForegroundColor Cyan
Write-Host "运行 npm install..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ 依赖安装成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host "运行 npm run build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✓ 构建成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 构建失败" -ForegroundColor Red
    Write-Host "请检查构建错误信息" -ForegroundColor Yellow
    exit 1
}

# 7. 检查构建输出
Write-Host "\n7. 检查构建输出..." -ForegroundColor Cyan
if (Test-Path "dist/index.cjs") {
    Write-Host "✓ dist/index.cjs 已生成" -ForegroundColor Green
} else {
    Write-Host "✗ dist/index.cjs 未生成" -ForegroundColor Red
}

if (Test-Path "api/mcp-server.cjs") {
    Write-Host "✓ api/mcp-server.cjs 已生成" -ForegroundColor Green
} else {
    Write-Host "✗ api/mcp-server.cjs 未生成" -ForegroundColor Red
}

# 8. 环境变量检查
Write-Host "\n8. 环境变量检查..." -ForegroundColor Cyan
if (Test-Path ".env") {
    Write-Host "✓ .env 文件存在" -ForegroundColor Green
    $envContent = Get-Content ".env"
    if ($envContent -match "OPENWEATHER_API_KEY") {
        Write-Host "✓ OPENWEATHER_API_KEY 已配置" -ForegroundColor Green
    } else {
        Write-Host "⚠ OPENWEATHER_API_KEY 未在 .env 中找到" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ .env 文件不存在" -ForegroundColor Yellow
}

Write-Host "\n=== 修复完成 ===" -ForegroundColor Green
Write-Host "\n下一步操作：" -ForegroundColor Cyan
Write-Host "1. 确保在 Vercel 项目设置中配置了 OPENWEATHER_API_KEY 环境变量" -ForegroundColor White
Write-Host "2. 提交并推送代码到 GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Fix: Vercel deployment configuration'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host "3. Vercel 将自动重新部署" -ForegroundColor White
Write-Host "\n如果仍有问题，请检查 Vercel 部署日志获取详细错误信息。" -ForegroundColor Yellow