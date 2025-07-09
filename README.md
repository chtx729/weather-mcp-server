# 天气预报 MCP Server

一个基于 JavaScript 开发的天气预报 MCP Server，为客户端提供完整的天气查询和预报功能。

## 功能特性

- 🌍 **多种查询方式**: 支持城市名称和地理坐标查询
- 🌡️ **当前天气**: 获取实时天气信息，包括温度、湿度、风速等
- 📅 **天气预报**: 支持1-5天的详细天气预报
- 🔍 **城市搜索**: 智能城市名称搜索和验证
- 📊 **天气对比**: 同时对比多个城市的天气情况
- 🌐 **多语言支持**: 支持中文、英文等多种语言
- 📏 **多单位制**: 支持摄氏度、华氏度、开尔文温度单位
- ⚡ **智能缓存**: 内置缓存机制，提高响应速度
- 🛡️ **错误处理**: 完善的错误处理和用户友好的错误提示

## 快速开始

### 1. 环境准备

确保已安装 Node.js 22.x 或更高版本：

```bash
node --version
npm --version
```

### 2. 获取 API 密钥

1. 访问 [OpenWeatherMap](https://openweathermap.org/api)
2. 注册免费账户
3. 获取 API Key

### 3. 项目配置

1. **安装依赖**:
```bash
npm install
```

2. **配置环境变量**:
```bash
# 复制环境变量示例文件
copy .env.example .env

# 编辑 .env 文件，填入你的 API 密钥
# OPENWEATHER_API_KEY=your_actual_api_key_here
```

3. **构建项目**:
```bash
npm run build
```

### 4. 运行服务器

**开发模式** (包含 MCP Inspector):
```bash
npm run dev
```

**生产模式**:
```bash
npm start
```

## 可用工具

### 1. get_current_weather_by_city
根据城市名称获取当前天气信息

**参数**:
- `city` (string): 城市名称，支持中英文
- `units` (optional): 温度单位 (metric/imperial/kelvin)
- `lang` (optional): 语言代码 (zh_cn/en等)

**示例**:
```json
{
  "city": "北京",
  "units": "metric",
  "lang": "zh_cn"
}
```

### 2. get_current_weather_by_coordinates
根据地理坐标获取当前天气信息

**参数**:
- `latitude` (number): 纬度
- `longitude` (number): 经度
- `units` (optional): 温度单位
- `lang` (optional): 语言代码

### 3. get_weather_forecast
获取指定城市的天气预报

**参数**:
- `city` (string): 城市名称
- `days` (optional): 预报天数 (1-5天)
- `units` (optional): 温度单位
- `lang` (optional): 语言代码

### 4. get_forecast_by_coordinates
根据地理坐标获取天气预报

**参数**:
- `latitude` (number): 纬度
- `longitude` (number): 经度
- `days` (optional): 预报天数 (1-5天)
- `units` (optional): 温度单位
- `lang` (optional): 语言代码

### 5. search_cities
搜索城市名称，获取可用的城市列表

**参数**:
- `query` (string): 搜索关键词

### 6. compare_weather
对比多个城市的当前天气

**参数**:
- `cities` (array): 要对比的城市列表 (2-5个城市)
- `units` (optional): 温度单位
- `lang` (optional): 语言代码

## 项目结构

```
weather-mcp-server/
├── bin/
│   └── index.js          # 可执行文件入口
├── config/
│   └── config.js         # 配置文件
├── dist/
│   └── index.js          # 构建后的文件
├── src/
│   ├── index.js          # 主程序入口
│   ├── weather-api.js    # 天气API封装
│   ├── tools.js          # MCP工具定义
│   └── utils.js          # 工具函数
├── .env.example          # 环境变量示例
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 开发指南

### 添加新的天气数据源

1. 在 `src/weather-api.js` 中添加新的API类
2. 在 `config/config.js` 中添加相应配置
3. 在 `src/tools.js` 中注册新的工具

### 扩展功能

可以考虑添加以下功能：
- 天气预警信息
- 空气质量指数
- 紫外线指数
- 历史天气数据
- 天气图表生成

### 测试

使用 MCP Inspector 进行功能测试：

```bash
npm run dev
```

这将启动服务器并自动打开 MCP Inspector 界面。

## 故障排除

### Vercel 部署问题

#### 常见 Vercel 部署问题

**问题："No Output Directory named 'public' found"**

这是最常见的 Vercel 部署错误。解决方案：

1. **运行修复脚本**（推荐）：
   ```bash
   .\fix-vercel-deployment.ps1
   ```

2. **手动修复**：
   - 确保 `vercel.json` 包含正确配置
   - 检查 `package.json` 构建脚本
   - 创建 `.vercelignore` 文件

#### 快速诊断

```bash
# 检查构建
npm run build

# 检查文件结构
ls api/
ls dist/

# 验证配置文件
cat vercel.json
cat package.json
```

### 常见问题

1. **API密钥错误**
   - 检查 `.env` 文件中的 `OPENWEATHER_API_KEY` 是否正确
   - 确认API密钥是否有效且未过期

2. **网络连接问题**
   - 检查网络连接
   - 确认防火墙设置
   - 验证是否需要代理设置

3. **城市未找到**
   - 尝试使用英文城市名称
   - 检查城市名称拼写
   - 使用地理坐标作为替代方案

4. **构建失败**
   - 确保 Node.js 版本为 22.x 或更高
   - 删除 `node_modules` 并重新安装依赖
   - 检查是否有语法错误

### 调试模式

启用详细日志输出：

```bash
DEBUG=weather-mcp-server npm run dev
```

## 部署指南

### GitHub 部署

1. **初始化 Git 仓库**:
```bash
git init
git add .
git commit -m "Initial commit: Weather MCP Server"
```

2. **创建 GitHub 仓库**:
   - 访问 [GitHub](https://github.com) 创建新仓库
   - 仓库名建议: `weather-mcp-server`
   - 设置为公开仓库以便其他用户使用

3. **推送代码到 GitHub**:
```bash
git remote add origin https://github.com/your-username/weather-mcp-server.git
git branch -M main
git push -u origin main
```

### Vercel 部署

1. **连接 GitHub 仓库**:
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账户登录
   - 点击 "New Project" 导入 GitHub 仓库

2. **配置环境变量**:
   在 Vercel 项目设置中添加:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   NODE_ENV=production
   ```

3. **部署设置**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **获取部署 URL**:
   部署完成后，Vercel 会提供一个公网访问地址，如:
   ```
   https://weather-mcp-server.vercel.app
   ```

## 客户端集成指南

### Cursor 集成

1. **安装 MCP 扩展**:
   在 Cursor 中搜索并安装 MCP 相关扩展

2. **配置 MCP 服务器**:
   在 Cursor 设置中添加:
   ```json
   {
     "mcp": {
       "servers": {
         "weather": {
           "command": "npx",
           "args": ["weather-mcp-server"],
           "env": {
             "OPENWEATHER_API_KEY": "your_api_key_here"
           }
         }
       }
     }
   }
   ```

3. **使用远程服务器**:
   ```json
   {
     "mcp": {
       "servers": {
         "weather": {
           "url": "https://weather-mcp-server.vercel.app",
           "env": {
             "OPENWEATHER_API_KEY": "your_api_key_here"
           }
         }
       }
     }
   }
   ```

### Trae AI 集成

1. **配置 MCP 连接**:
   在 Trae AI 设置中添加 MCP 服务器:
   ```json
   {
     "mcpServers": {
       "weather": {
         "command": "node",
         "args": ["-e", "require('child_process').spawn('npx', ['weather-mcp-server'], {stdio: 'inherit'})"],
         "env": {
           "OPENWEATHER_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

2. **使用部署的服务器**:
   ```json
   {
     "mcpServers": {
       "weather": {
         "url": "https://weather-mcp-server.vercel.app",
         "headers": {
           "Authorization": "Bearer your_api_key_here"
         }
       }
     }
   }
   ```

### Claude Desktop 集成

在 `claude_desktop_config.json` 中添加:
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

### NPM 包安装方式

用户可以通过以下方式安装和使用:

```bash
# 全局安装
npm install -g weather-mcp-server

# 设置环境变量
export OPENWEATHER_API_KEY=your_api_key_here

# 启动服务器
weather-mcp-server
```

## 使用示例

### 基本查询
```javascript
// 查询北京当前天气
{
  "tool": "get_current_weather_by_city",
  "arguments": {
    "city": "北京",
    "units": "metric",
    "lang": "zh_cn"
  }
}

// 获取上海3天天气预报
{
  "tool": "get_weather_forecast",
  "arguments": {
    "city": "上海",
    "days": 3,
    "units": "metric",
    "lang": "zh_cn"
  }
}

// 对比多城市天气
{
  "tool": "compare_weather",
  "arguments": {
    "cities": ["北京", "上海", "广州"],
    "units": "metric",
    "lang": "zh_cn"
  }
}
```

### 高级功能
```javascript
// 根据坐标查询天气
{
  "tool": "get_current_weather_by_coordinates",
  "arguments": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "units": "metric",
    "lang": "zh_cn"
  }
}

// 搜索城市
{
  "tool": "search_cities",
  "arguments": {
    "query": "深圳"
  }
}
```

## 监控和维护

### Vercel 部署监控
- 在 Vercel 控制台查看部署状态
- 监控 API 调用次数和响应时间
- 查看错误日志和性能指标

### 更新部署
```bash
# 更新代码
git add .
git commit -m "Update: feature description"
git push origin main

# Vercel 会自动重新部署
```

### 版本管理
```bash
# 创建新版本
npm version patch  # 或 minor, major
git push origin main --tags

# 发布到 NPM
npm publish
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 相关链接

- [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk)
- [OpenWeatherMap API 文档](https://openweathermap.org/api)
- [Node.js 官网](https://nodejs.org/)
- [Vercel 部署文档](https://vercel.com/docs)
- [GitHub Actions](https://github.com/features/actions)