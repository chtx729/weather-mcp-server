# Vercel 部署故障排除指南

## 常见错误及解决方案

### 1. 源文件路径错误

**错误信息：**
```
[构建] ✗ 文件不存在: /vercel/path0/src/index.js
[构建] 构建失败: 源文件不存在: /vercel/path0/src/index.js
Error: 源文件不存在: /vercel/path0/src/index.js
```

**原因：**
- Vercel 使用了缓存的旧构建配置
- 构建脚本没有正确处理 Vercel 环境的特殊路径

**解决方案：**

#### 步骤 1：确认使用正确的构建脚本
检查 `vercel.json` 文件中的 `buildCommand`：
```json
{
  "buildCommand": "node build-vercel.cjs"
}
```

**重要：** 同时检查 `package.json` 中的 `vercel-build` 脚本：
```json
{
  "scripts": {
    "vercel-build": "node build-vercel.cjs"
  }
}
```

注意：`vercel-build` 脚本会覆盖 `vercel.json` 中的 `buildCommand`，确保两者一致。

#### 步骤 2：清除 Vercel 缓存
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 "Settings" 标签
4. 在 "Build & Development Settings" 中找到缓存选项
5. 点击 "Clear Cache" 或 "Reset Build Cache"

#### 步骤 3：强制重新部署
1. 在 Vercel Dashboard 中，点击 "Deployments" 标签
2. 点击最新部署旁边的三个点菜单
3. 选择 "Redeploy"
4. 确保选择 "Use existing Build Cache" 为 **关闭状态**

#### 步骤 4：检查构建脚本
确保 `build-vercel.cjs` 包含 Vercel 特定路径：
```javascript
const possiblePaths = [
  path.join(process.cwd(), 'src', 'index.js'),
  path.join(__dirname, 'src', 'index.js'),
  path.resolve('./src/index.js'),
  path.resolve('src/index.js'),
  // Vercel 特定路径
  '/vercel/path0/src/index.js',
  path.join('/vercel/path0', 'src', 'index.js'),
  // 其他可能的 Vercel 路径
  path.join(process.env.VERCEL_PROJECT_PATH || '', 'src', 'index.js'),
  path.join('/tmp', 'src', 'index.js')
];
```

### 2. 构建命令未更新

**症状：**
- 部署日志显示仍在使用 `npm run build` 而不是 `node build-vercel.cjs`
- 错误信息指向 `build.cjs` 而不是 `build-vercel.cjs`

**解决方案：**
1. 确认 `vercel.json` 配置正确
2. 提交并推送最新的 `vercel.json` 到 GitHub
3. 在 Vercel 中触发新的部署
4. 如果问题持续，删除项目并重新导入

### 3. 环境变量问题

**错误信息：**
```
OpenWeather API key is required
```

**解决方案：**
1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Environment Variables" 标签
3. 添加 `OPENWEATHER_API_KEY` 变量
4. 设置值为你的 OpenWeather API 密钥
5. 确保选择正确的环境（Production, Preview, Development）

### 4. 函数超时

**错误信息：**
```
Function execution timed out
```

**解决方案：**
在 `vercel.json` 中增加超时设置：
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

## 调试技巧

### 1. 查看构建日志
1. 在 Vercel Dashboard 中点击失败的部署
2. 查看 "Build Logs" 部分
3. 寻找具体的错误信息

### 2. 本地测试
在本地运行 Vercel 构建脚本：
```bash
node build-vercel.cjs
```

### 3. 检查文件结构
确保项目结构正确：
```
.
├── src/
│   └── index.js
├── api/
│   └── index.js
├── build-vercel.cjs
├── vercel.json
└── package.json
```

## 紧急恢复步骤

如果所有方法都失败，可以尝试以下步骤：

1. **删除并重新创建 Vercel 项目**
   - 在 Vercel Dashboard 中删除项目
   - 重新从 GitHub 导入项目
   - 重新配置环境变量

2. **使用简化的构建配置**
   临时修改 `vercel.json`：
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "."
   }
   ```

3. **联系支持**
   如果问题持续存在，可以：
   - 查看 [Vercel 文档](https://vercel.com/docs)
   - 在 [Vercel 社区](https://github.com/vercel/vercel/discussions) 寻求帮助
   - 提交支持票据

## 预防措施

1. **定期测试部署**
   - 在本地运行构建脚本
   - 使用 Vercel CLI 进行本地测试

2. **保持依赖更新**
   - 定期更新 npm 包
   - 检查 Node.js 版本兼容性

3. **监控部署状态**
   - 设置 Vercel 部署通知
   - 定期检查部署日志