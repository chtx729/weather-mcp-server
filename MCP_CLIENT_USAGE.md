# 🌤️ 天气预报 MCP Server 客户端使用指南

## 📋 概述

你的天气预报 MCP Server 现在已经部署到 Vercel，可以通过多种方式在客户端中使用。

## 🔧 配置方式

### 1. Claude Desktop 配置

**配置文件位置**：
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**配置内容**：
```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["path/to/your/dist/index.cjs"],
      "env": {
        "OPENWEATHER_API_KEY": "你的OpenWeatherMap API密钥",
        "DEFAULT_UNITS": "metric",
        "DEFAULT_LANG": "zh_cn"
      }
    }
  }
}
```

### 2. Cursor 配置

在 Cursor 的设置中添加 MCP Server：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["d:/mcp-server-demo/dist/index.cjs"],
      "env": {
        "OPENWEATHER_API_KEY": "你的OpenWeatherMap API密钥"
      }
    }
  }
}
```

## 🌐 HTTP API 调用方式

你也可以直接通过 HTTP 调用 Vercel 部署的版本：

### 健康检查
```bash
curl https://your-project.vercel.app/
```

### 获取天气信息
```bash
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

## 🛠️ 可用工具

配置完成后，在客户端中可以使用以下工具：

### 1. get_current_weather_by_city
**功能**：根据城市名称获取当前天气
**参数**：
- `city` (必需): 城市名称，支持中英文
- `units` (可选): 温度单位 (metric/imperial/kelvin)
- `lang` (可选): 语言代码 (zh_cn/en)

**示例使用**：
```
请帮我查询北京的当前天气
```

### 2. get_current_weather_by_coordinates
**功能**：根据地理坐标获取当前天气
**参数**：
- `latitude` (必需): 纬度
- `longitude` (必需): 经度
- `units` (可选): 温度单位
- `lang` (可选): 语言代码

**示例使用**：
```
请查询坐标 39.9042, 116.4074 的天气情况
```

### 3. get_weather_forecast
**功能**：获取天气预报
**参数**：
- `city` (必需): 城市名称
- `days` (可选): 预报天数 (1-5天)
- `units` (可选): 温度单位
- `lang` (可选): 语言代码

**示例使用**：
```
请给我上海未来3天的天气预报
```

## 💬 在客户端中的使用示例

配置完成后，你可以在 Claude Desktop 或 Cursor 中直接使用自然语言：

### 基础查询
- "北京现在的天气怎么样？"
- "上海今天的温度是多少？"
- "深圳的湿度和风速如何？"

### 坐标查询
- "请查询坐标 31.2304, 121.4737 的天气"
- "纬度39.9042，经度116.4074的天气情况"

### 天气预报
- "给我北京未来5天的天气预报"
- "上海这周的天气趋势如何？"
- "深圳明天会下雨吗？"

### 多城市对比
- "对比北京和上海的天气"
- "哪个城市今天更适合出行，北京还是深圳？"

## 🔍 故障排除

### 1. 配置文件问题
- 确保 JSON 格式正确
- 检查文件路径是否存在
- 验证环境变量设置

### 2. API 密钥问题
- 确保 OpenWeatherMap API 密钥有效
- 检查 API 配额是否充足
- 验证密钥权限设置

### 3. 网络连接问题
- 检查防火墙设置
- 确保能访问 api.openweathermap.org
- 验证代理设置（如果有）

### 4. 客户端重启
配置更改后，需要重启客户端：
- Claude Desktop: 完全退出后重新启动
- Cursor: 重新加载窗口或重启应用

## 📝 配置验证

配置完成后，你可以通过以下方式验证：

1. **检查工具列表**：在客户端中应该能看到天气相关的工具
2. **测试简单查询**：尝试查询一个城市的天气
3. **查看响应格式**：确认返回的数据格式正确

## 🎯 最佳实践

1. **使用中文城市名**：支持"北京"、"上海"等中文名称
2. **指定单位**：明确温度单位偏好
3. **合理使用**：避免频繁查询同一城市
4. **错误处理**：注意处理网络错误和API限制

现在你就可以在 Claude Desktop 或 Cursor 中愉快地使用天气查询功能了！🌤️
