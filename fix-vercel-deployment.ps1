# Vercel 部署问题修复脚本
# Fix Vercel Deployment Issues Script

Write-Host "=== Vercel 部署问题修复脚本 ===" -ForegroundColor Green
Write-Host "正在检查和修复常见的 Vercel 部署问题..." -ForegroundColor Yellow

$hasIssues = $false

# 1. 检查必要文件
Write-Host "`n1. 检查必要文件..." -ForegroundColor Cyan

$requiredFiles = @("vercel.json", "package.json", "api/index.js")

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "✗ $file 缺失" -ForegroundColor Red
        $hasIssues = $true
    }
}

# 2. 检查构建脚本
Write-Host "`n2. 检查构建脚本..." -ForegroundColor Cyan

if (Test-Path "build.cjs") {
    Write-Host "✓ build.cjs 构建脚本存在" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少 build.cjs 构建脚本" -ForegroundColor Red
    $hasIssues = $true
}

if (Test-Path "build-vercel.cjs") {
    Write-Host "✓ build-vercel.cjs Vercel专用构建脚本存在" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少 build-vercel.cjs Vercel专用构建脚本" -ForegroundColor Red
    $hasIssues = $true
}

# 3. 检查源文件
Write-Host "`n3. 检查源文件..." -ForegroundColor Cyan

if (Test-Path "src/index.js") {
    Write-Host "✓ src/index.js 源文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ 缺少 src/index.js 源文件" -ForegroundColor Red
    $hasIssues = $true
}

# 4. 检查 package.json
Write-Host "`n4. 检查 package.json..." -ForegroundColor Cyan

if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -match '"build"') {
        Write-Host "✓ package.json 包含 build 脚本" -ForegroundColor Green
    } else {
        Write-Host "✗ package.json 缺少 build 脚本" -ForegroundColor Red
        $hasIssues = $true
    }
}

# 5. 检查 vercel.json
Write-Host "`n5. 检查 vercel.json..." -ForegroundColor Cyan

if (Test-Path "vercel.json") {
    $vercelContent = Get-Content "vercel.json" -Raw
    if ($vercelContent -match 'buildCommand') {
        Write-Host "✓ vercel.json 包含 buildCommand" -ForegroundColor Green
    } else {
        Write-Host "✗ vercel.json 缺少 buildCommand" -ForegroundColor Red
        $hasIssues = $true
    }
}

# 6. 创建 .vercelignore 文件
Write-Host "`n6. 检查 .vercelignore 文件..." -ForegroundColor Cyan

if (-not (Test-Path ".vercelignore")) {
    Write-Host "创建 .vercelignore 文件..." -ForegroundColor Yellow
    
    $ignoreContent = @"
node_modules
npm-debug.log*
.env
.env.local
src/
.vscode/
.idea/
*.md
!README.md
*.ps1
.git/
.gitignore
"@
    
    Set-Content -Path ".vercelignore" -Value $ignoreContent -Encoding UTF8
    Write-Host "✓ .vercelignore 文件已创建" -ForegroundColor Green
} else {
    Write-Host "✓ .vercelignore 文件已存在" -ForegroundColor Green
}

# 7. 测试构建
Write-Host "`n7. 测试构建..." -ForegroundColor Cyan

Write-Host "运行 npm install..." -ForegroundColor Yellow
$installResult = & npm install 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "✗ 依赖安装失败" -ForegroundColor Red
    $hasIssues = $true
}

Write-Host "运行 npm run build..." -ForegroundColor Yellow
$buildResult = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 构建成功" -ForegroundColor Green
} else {
    Write-Host "✗ 构建失败" -ForegroundColor Red
    Write-Host "常见问题:" -ForegroundColor Yellow
    Write-Host "1. esbuild 无法解析 src/index.js" -ForegroundColor Gray
    Write-Host "2. ES 模块语法错误" -ForegroundColor Gray
    Write-Host "3. 依赖缺失" -ForegroundColor Gray
    $hasIssues = $true
}

# 8. 检查构建输出
Write-Host "`n8. 检查构建输出..." -ForegroundColor Cyan

if (Test-Path "dist/index.cjs") {
    Write-Host "✓ dist/index.cjs 已生成" -ForegroundColor Green
} else {
    Write-Host "✗ dist/index.cjs 未生成" -ForegroundColor Red
    $hasIssues = $true
}

if (Test-Path "api/mcp-server.cjs") {
    Write-Host "✓ api/mcp-server.cjs 已生成" -ForegroundColor Green
} else {
    Write-Host "✗ api/mcp-server.cjs 未生成" -ForegroundColor Red
    $hasIssues = $true
}

# 9. 环境变量检查
Write-Host "`n9. 环境变量检查..." -ForegroundColor Cyan

if (Test-Path ".env") {
    Write-Host "✓ .env 文件存在" -ForegroundColor Green
    $envContent = Get-Content ".env"
    if ($envContent -match "OPENWEATHER_API_KEY") {
        Write-Host "✓ OPENWEATHER_API_KEY 已配置" -ForegroundColor Green
    } else {
        Write-Host "⚠ OPENWEATHER_API_KEY 未找到" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ .env 文件不存在" -ForegroundColor Yellow
}

# 总结
Write-Host "`n=== 检查完成 ===" -ForegroundColor Green

if ($hasIssues) {
    Write-Host "发现问题，请根据上述提示进行修复" -ForegroundColor Red
} else {
    Write-Host "所有检查通过！" -ForegroundColor Green
}

Write-Host "`n下一步操作:" -ForegroundColor Cyan
Write-Host "1. 在 Vercel 项目设置中配置 OPENWEATHER_API_KEY 环境变量" -ForegroundColor White
Write-Host "2. 提交并推送代码到 GitHub" -ForegroundColor White
Write-Host "3. Vercel 将自动重新部署" -ForegroundColor White
Write-Host "`n如果仍有问题，请检查 Vercel 部署日志。" -ForegroundColor Yellow