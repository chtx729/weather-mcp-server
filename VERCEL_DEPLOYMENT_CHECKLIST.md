# Vercel 部署检查清单

## 🚀 部署前检查

### ✅ 必需文件

- [ ] `vercel.json` - Vercel 配置文件
- [ ] `package.json` - 项目配置和依赖
- [ ] `api/index.js` - Serverless Function 入口
- [ ] `.vercelignore` - 忽略不必要的文件
- [ ] `dist/index.cjs` - 构建输出文件（运行 `npm run build` 生成）

### ✅ 配置验证

#### vercel.json 配置
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/",
      "destination": "/api/index"
    },
    {
      "source": "/weather",
      "destination": "/api/index"
    },
    {
      "source": "/api/weather",
      "destination": "/api/index"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

#### package.json 脚本
```json
{
  "scripts": {
    "build": "esbuild src/index.js --bundle --format=cjs --platform=node --target=node22 --outfile=dist/index.cjs && npm run build:vercel",
    "build:vercel": "node -e \"const fs=require('fs'); const path=require('path'); if(!fs.existsSync('api')) fs.mkdirSync('api', {recursive: true}); if(fs.existsSync('dist/index.cjs')) fs.copyFileSync('dist/index.cjs', 'api/mcp-server.cjs');\"",
    "vercel-build": "npm run build"
  }
}
```

### ✅ 环境变量

- [ ] 在 Vercel 项目设置中配置 `OPENWEATHER_API_KEY`
- [ ] 本地 `.env` 文件包含测试用的 API 密钥

### ✅ 构建测试

```bash
# 1. 安装依赖
npm install

# 2. 运行构建
npm run build

# 3. 检查输出文件
ls dist/index.cjs
ls api/mcp-server.cjs

# 4. 本地测试（可选）
npm start
```

## 🔧 常见问题解决

### 问题 1: "No Output Directory named 'public' found"

**原因**: Vercel 默认期望静态网站项目

**解决方案**:
1. 运行修复脚本: `./fix-vercel-deployment.ps1`
2. 或手动确保 `vercel.json` 包含 `"outputDirectory": "."`

### 问题 2: 构建失败

**检查步骤**:
1. 验证 Node.js 版本 (>=18.0.0)
2. 清理并重新安装依赖: `rm -rf node_modules package-lock.json && npm install`
3. 检查 `package.json` 语法

### 问题 3: Function 超时

**解决方案**:
1. 在 `vercel.json` 中增加 `maxDuration`
2. 优化 API 调用性能
3. 添加错误处理和重试机制

### 问题 4: 环境变量未生效

**检查步骤**:
1. Vercel 项目设置 → Environment Variables
2. 确保变量名正确: `OPENWEATHER_API_KEY`
3. 重新部署项目

## 📋 部署步骤

### 自动部署（推荐）

1. **推送到 GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Vercel 自动部署**:
   - 连接 GitHub 仓库
   - 自动检测配置
   - 开始构建和部署

### 手动部署

1. **安装 Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**:
   ```bash
   vercel login
   vercel --prod
   ```

## 🧪 部署验证

### 健康检查
```bash
curl https://your-project.vercel.app/
```

### API 测试
```bash
# 获取工具列表
curl https://your-project.vercel.app/weather

# 测试天气查询
curl -X POST https://your-project.vercel.app/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_current_weather_by_city",
    "arguments": {
      "city": "北京",
      "units": "metric",
      "lang": "zh_cn"
    }
  }'
```

## 📊 监控和维护

### Vercel 仪表板
- 查看部署状态
- 监控函数调用
- 检查错误日志
- 管理环境变量

### 性能优化
- 监控响应时间
- 优化冷启动
- 缓存策略
- 错误处理

## 🆘 获取帮助

如果遇到问题：

1. **运行诊断脚本**: `./fix-vercel-deployment.ps1`
2. **查看 Vercel 日志**: 在 Vercel 仪表板中查看详细错误信息
3. **检查文档**: 参考 `DEPLOYMENT.md` 获取详细指导
4. **社区支持**: 在 GitHub Issues 中报告问题

---

✅ **部署成功标志**: 所有检查项都通过，API 测试返回正确结果