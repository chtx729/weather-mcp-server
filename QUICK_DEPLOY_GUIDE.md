# 快速部署指南

## 问题解决

你遇到的错误是因为 Vercel 仍在使用旧的构建配置。现在已经修复了以下问题：

### 1. 更新了 package.json
- 将 `vercel-build` 脚本从 `npm run build` 改为 `node build-vercel.cjs`
- 确保与 `vercel.json` 中的 `buildCommand` 一致

### 2. 优化了 build-vercel.cjs
- 添加了 Vercel 特定路径支持：`/vercel/path0/src/index.js`
- 增强了路径查找逻辑
- 改进了错误处理和日志输出

## 立即部署步骤

### 1. 提交更改
```bash
git add .
git commit -m "修复 Vercel 部署配置和路径问题"
git push origin main
```

### 2. 清除 Vercel 缓存
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Settings" → "Build & Development Settings"
4. 点击 "Clear Cache"

### 3. 重新部署
1. 在 Vercel Dashboard 中点击 "Deployments"
2. 点击最新部署旁的三点菜单
3. 选择 "Redeploy"
4. **确保取消勾选** "Use existing Build Cache"

### 4. 验证配置
确保以下文件配置正确：

**vercel.json:**
```json
{
  "buildCommand": "node build-vercel.cjs"
}
```

**package.json:**
```json
{
  "scripts": {
    "vercel-build": "node build-vercel.cjs"
  }
}
```

## 环境变量

确保在 Vercel 项目设置中配置了：
- `OPENWEATHER_API_KEY`: 你的 OpenWeather API 密钥

## 如果仍有问题

1. **查看构建日志**
   - 在 Vercel Dashboard 中查看详细的构建日志
   - 确认使用的是 `build-vercel.cjs` 而不是 `build.cjs`

2. **本地测试**
   ```bash
   npm run vercel-build
   ```

3. **重新创建项目**
   - 如果缓存问题持续，可以在 Vercel 中删除项目
   - 重新从 GitHub 导入项目

## 预期结果

部署成功后，你应该能够：
- 访问你的 Vercel 域名
- 使用天气 API 功能
- 看到正确的构建日志显示使用了 `build-vercel.cjs`

## 技术说明

修复的核心问题：
1. **构建脚本冲突**：`package.json` 中的 `vercel-build` 会覆盖 `vercel.json` 中的 `buildCommand`
2. **路径解析**：Vercel 环境使用特殊路径 `/vercel/path0/`，需要在构建脚本中明确支持
3. **缓存问题**：旧的构建配置被缓存，需要手动清除

现在所有配置都已同步，应该能够正常部署了。