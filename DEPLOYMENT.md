# 天气预报 MCP Server 部署指南

本指南将帮助您将天气预报 MCP Server 部署到 GitHub 和 Vercel，供其他用户通过 Cursor、Trae AI 等客户端调用。

## 🚀 快速部署

### 方式一：使用部署脚本（推荐）

```powershell
# 在项目根目录运行
.\deploy.ps1
```

脚本会自动完成：
- 环境检查
- 依赖安装
- 项目构建
- 测试运行
- Git 初始化和提交

### 方式二：手动部署

#### 1. 准备工作

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

#### 2. GitHub 部署

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: Weather MCP Server"

# 创建 GitHub 仓库后推送
git remote add origin https://github.com/YOUR_USERNAME/weather-mcp-server.git
git branch -M main
git push -u origin main
```

#### 3. Vercel 部署

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project" 导入 GitHub 仓库
4. 配置环境变量：
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   NODE_ENV=production
   ```
5. 部署设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 📋 部署清单

### 必需文件
- [x] `package.json` - 项目配置
- [x] `vercel.json` - Vercel 部署配置
- [x] `.gitignore` - Git 忽略文件
- [x] `.github/workflows/deploy.yml` - GitHub Actions 工作流
- [x] `README.md` - 项目文档
- [x] `dist/index.cjs` - 构建后的文件

### 环境变量
- [x] `OPENWEATHER_API_KEY` - OpenWeatherMap API 密钥
- [x] `NODE_ENV=production` - 生产环境标识

### GitHub Secrets（可选，用于自动部署）
- [ ] `OPENWEATHER_API_KEY` - 天气 API 密钥
- [ ] `VERCEL_TOKEN` - Vercel 访问令牌
- [ ] `ORG_ID` - Vercel 组织 ID
- [ ] `PROJECT_ID` - Vercel 项目 ID
- [ ] `NPM_TOKEN` - NPM 发布令牌

## 🔧 客户端集成配置

### Cursor 集成

在 Cursor 设置中添加：

```json
{
  "mcp": {
    "servers": {
      "weather": {
        "url": "https://your-project.vercel.app",
        "env": {
          "OPENWEATHER_API_KEY": "your_api_key_here"
        }
      }
    }
  }
}
```

### Trae AI 集成

```json
{
  "mcpServers": {
    "weather": {
      "url": "https://your-project.vercel.app",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    }
  }
}
```

### Claude Desktop 集成

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["weather-mcp-server"],
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## 📊 部署后验证

### 1. 检查部署状态

访问你的 Vercel 部署 URL，应该看到 MCP 服务器运行信息。

### 2. 测试 API 功能

使用 MCP Inspector 或客户端测试以下工具：

- `get_current_weather_by_city`
- `get_weather_forecast`
- `search_cities`
- `compare_weather`

### 3. 监控部署

在 Vercel 控制台中监控：
- 部署状态
- 错误日志
- 性能指标
- API 调用统计

## 🔄 更新部署

### 自动部署（推荐）

```bash
# 更新代码
git add .
git commit -m "Update: feature description"
git push origin main

# Vercel 会自动重新部署
```

### 手动部署

在 Vercel 控制台中点击 "Redeploy" 按钮。

## 📦 NPM 发布（可选）

如果要将包发布到 NPM 供用户安装：

```bash
# 登录 NPM
npm login

# 发布包
npm publish

# 用户可以通过以下方式安装
npm install -g weather-mcp-server
```

## 🛠️ 故障排除

### 常见问题

1. **Vercel 部署错误："No Output Directory named 'public' found"**
   
   **问题原因**：Vercel 默认期望静态网站项目有 `public` 目录
   
   **解决方案**：
   - 确保 `vercel.json` 包含正确的配置：
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": ".",
     "installCommand": "npm install"
   }
   ```
   - 创建 `.vercelignore` 文件排除不必要的文件
   - 确保 `package.json` 中的 `vercel-build` 脚本正确

2. **构建失败**
   - 检查 Node.js 版本（需要 18.x 或更高）
   - 确保所有依赖已正确安装
   - 检查环境变量配置

3. **部署失败**
   - 验证 `vercel.json` 配置
   - 检查环境变量是否正确设置
   - 查看 Vercel 部署日志

4. **API 调用失败**
   - 验证 `OPENWEATHER_API_KEY` 是否有效
   - 检查网络连接
   - 查看服务器错误日志

5. **Vercel Functions 超时**
   - 检查 `vercel.json` 中的 `maxDuration` 设置
   - 优化 API 调用性能

### 调试技巧

1. **本地测试**
   ```bash
   npm run dev
   ```

2. **查看日志**
   在 Vercel 控制台的 "Functions" 标签页查看详细日志

3. **环境变量检查**
   在 Vercel 项目设置中验证环境变量配置

## 📞 获取帮助

- 查看 [README.md](./README.md) 获取详细文档
- 提交 [GitHub Issues](https://github.com/your-username/weather-mcp-server/issues) 报告问题
- 参考 [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk)

## 🎉 部署完成

恭喜！您的天气预报 MCP Server 现在已经部署到云端，用户可以通过以下方式访问：

- **直接 URL**: `https://your-project.vercel.app`
- **NPM 包**: `npm install -g weather-mcp-server`
- **客户端集成**: 在 Cursor、Trae AI、Claude Desktop 中配置使用

享受您的天气预报 MCP 服务吧！ 🌤️