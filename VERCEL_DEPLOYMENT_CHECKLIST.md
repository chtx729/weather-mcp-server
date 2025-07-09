# Vercel 部署检查清单

## 🚀 部署前检查

### ✅ 必需文件

- [ ] `vercel.json` - Vercel 配置文件
- [ ] `package.json` - 项目配置和依赖
- [ ] `build.cjs` - 通用构建脚本文件
- [ ] `build-vercel.cjs` - Vercel 专用构建脚本（推荐）
- [ ] `api/index.js` - Serverless Function 入口
- [ ] `.vercelignore` - 忽略不必要的文件
- [ ] `src/index.js` - 源代码入口文件
- [ ] `dist/index.cjs` - 构建输出文件（运行 `npm run build` 生成）

### ✅ 配置验证

#### vercel.json 配置
```json
{
  "version": 2,
  "buildCommand": "node build-vercel.cjs",
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

> **注意**: `buildCommand` 现在使用 `node build-vercel.cjs` 而不是 `npm run build`，这样可以直接使用 Vercel 专用构建脚本，避免 npm 脚本可能带来的路径问题。

#### package.json 脚本
```json
{
  "scripts": {
    "build": "node build.cjs",
    "build:legacy": "esbuild src/index.js --bundle --format=cjs --platform=node --target=node18 --outfile=dist/index.cjs",
    "vercel-build": "node build-vercel.cjs"
  }
}
```

> **重要**: `vercel-build` 脚本现在直接使用 `node build-vercel.cjs`，与 `vercel.json` 中的 `buildCommand` 保持一致，确保构建行为的统一性。

#### 构建脚本

**`build.cjs` - 通用构建脚本**
- 适用于本地开发和一般部署环境
- 包含基本的构建功能和错误处理

**`build-vercel.cjs` - Vercel 专用构建脚本（推荐）**
- 专门针对 Vercel 环境优化
- 包含 Vercel 环境检测和特殊路径处理
- 提供详细的调试信息和环境诊断
- 更好的错误处理和日志输出
- 自动检查源文件的多个可能位置

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

### 问题 2: esbuild 无法解析 "src/index.js"

**错误信息**: `Could not resolve "src/index.js"`

**原因**: 
- 项目使用 ES 模块 (`"type": "module"`)
- 构建脚本路径解析问题
- 缺少构建脚本文件

**解决方案**:
1. 确保 `build.cjs` 文件存在
2. 使用新的构建脚本: `"build": "node build.cjs"`
3. 验证源文件路径正确

### 问题 3: 构建失败

**检查步骤**:
1. 验证 Node.js 版本 (>=18.0.0)
2. 清理并重新安装依赖: `rm -rf node_modules package-lock.json && npm install`
3. 检查 `package.json` 语法
4. 确保 `build.cjs` 构建脚本存在

### 问题 4: Function 超时

**解决方案**:
1. 在 `vercel.json` 中增加 `maxDuration`
2. 优化 API 调用性能
3. 添加错误处理和重试机制

### 问题 5: 环境变量未生效

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

3. **清除 Vercel 缓存（重要）**:
   - 如果之前部署过，需要清除缓存
   - 在 Vercel 项目设置中，找到 "Functions" 或 "Build & Development Settings"
   - 点击 "Clear Cache" 或重新触发部署
   - 确保使用最新的构建配置

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