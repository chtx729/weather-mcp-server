# 天气预报 API 使用指南

本文档介绍如何通过 HTTP API 调用部署在 Vercel 上的天气预报服务。

## 🌐 API 基础信息

- **基础 URL**: `https://your-project.vercel.app`
- **内容类型**: `application/json`
- **请求方法**: `GET` (获取工具列表) / `POST` (调用天气工具)

## 📋 可用端点

### 1. 健康检查
```http
GET https://your-project.vercel.app/
```

**响应示例**:
```json
{
  "status": "ok",
  "message": "Weather MCP Server is running on Vercel",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "endpoints": {
    "health": "/",
    "weather": "/weather"
  },
  "tools": [
    "get_current_weather_by_city",
    "get_current_weather_by_coordinates",
    "get_weather_forecast",
    "get_forecast_by_coordinates",
    "search_cities",
    "compare_weather"
  ]
}
```

### 2. 获取工具列表
```http
GET https://your-project.vercel.app/weather
```

**响应示例**:
```json
{
  "success": true,
  "message": "Weather API is available",
  "tools": [
    {
      "name": "get_current_weather_by_city",
      "description": "根据城市名称获取当前天气",
      "parameters": ["city", "units?", "lang?"]
    }
    // ... 其他工具
  ]
}
```

### 3. 调用天气工具
```http
POST https://your-project.vercel.app/api/weather
Content-Type: application/json
```

## 🛠️ 天气工具使用示例

### 1. 根据城市获取当前天气

**请求**:
```json
{
  "tool": "get_current_weather_by_city",
  "arguments": {
    "city": "北京",
    "units": "metric",
    "lang": "zh_cn"
  }
}
```

**响应**:
```json
{
  "success": true,
  "tool": "get_current_weather_by_city",
  "result": {
    "location": {
      "name": "北京",
      "country": "CN",
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "current": {
      "temperature": 15,
      "feels_like": 13,
      "humidity": 65,
      "pressure": 1013,
      "visibility": 10,
      "wind_speed": 3.5,
      "wind_direction": 180,
      "weather_code": 800,
      "description": "晴朗",
      "icon": "01d"
    },
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 2. 根据坐标获取当前天气

**请求**:
```json
{
  "tool": "get_current_weather_by_coordinates",
  "arguments": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "units": "metric",
    "lang": "zh_cn"
  }
}
```

### 3. 获取天气预报

**请求**:
```json
{
  "tool": "get_weather_forecast",
  "arguments": {
    "city": "上海",
    "days": 3,
    "units": "metric",
    "lang": "zh_cn"
  }
}
```

**响应**:
```json
{
  "success": true,
  "tool": "get_weather_forecast",
  "result": {
    "location": {
      "name": "上海",
      "country": "CN"
    },
    "forecast": [
      {
        "date": "2024-01-01",
        "temperature": {
          "min": 8,
          "max": 16
        },
        "humidity": 70,
        "wind_speed": 4.2,
        "description": "多云",
        "icon": "02d"
      }
      // ... 更多天数
    ]
  }
}
```

### 4. 搜索城市

**请求**:
```json
{
  "tool": "search_cities",
  "arguments": {
    "query": "深圳"
  }
}
```

**响应**:
```json
{
  "success": true,
  "tool": "search_cities",
  "result": {
    "cities": [
      {
        "name": "深圳",
        "country": "CN",
        "state": "广东",
        "latitude": 22.5431,
        "longitude": 114.0579
      }
    ]
  }
}
```

### 5. 对比多城市天气

**请求**:
```json
{
  "tool": "compare_weather",
  "arguments": {
    "cities": ["北京", "上海", "广州"],
    "units": "metric",
    "lang": "zh_cn"
  }
}
```

**响应**:
```json
{
  "success": true,
  "tool": "compare_weather",
  "result": {
    "comparison": [
      {
        "city": "北京",
        "temperature": 15,
        "description": "晴朗",
        "humidity": 65
      },
      {
        "city": "上海",
        "temperature": 18,
        "description": "多云",
        "humidity": 70
      },
      {
        "city": "广州",
        "temperature": 25,
        "description": "小雨",
        "humidity": 85
      }
    ],
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## 💻 客户端集成示例

### JavaScript/Node.js

```javascript
// 天气API客户端类
class WeatherAPIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://your-project.vercel.app';
  }
  
  async callTool(tool, arguments) {
    const response = await fetch(`${this.baseUrl}/api/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tool, arguments })
    });
    
    return await response.json();
  }
  
  async getCurrentWeather(city, units = 'metric', lang = 'zh_cn') {
    return this.callTool('get_current_weather_by_city', {
      city, units, lang
    });
  }
  
  async getForecast(city, days = 3, units = 'metric', lang = 'zh_cn') {
    return this.callTool('get_weather_forecast', {
      city, days, units, lang
    });
  }
}

// 使用示例
const client = new WeatherAPIClient();

// 获取北京当前天气
client.getCurrentWeather('北京')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### Python

```python
import requests
import json

class WeatherAPIClient:
    def __init__(self, base_url=None):
        self.base_url = base_url or 'https://your-project.vercel.app'
    
    def call_tool(self, tool, arguments):
        response = requests.post(
            f'{self.base_url}/api/weather',
            headers={'Content-Type': 'application/json'},
            json={'tool': tool, 'arguments': arguments}
        )
        return response.json()
    
    def get_current_weather(self, city, units='metric', lang='zh_cn'):
        return self.call_tool('get_current_weather_by_city', {
            'city': city,
            'units': units,
            'lang': lang
        })
    
    def get_forecast(self, city, days=3, units='metric', lang='zh_cn'):
        return self.call_tool('get_weather_forecast', {
            'city': city,
            'days': days,
            'units': units,
            'lang': lang
        })

# 使用示例
client = WeatherAPIClient()

# 获取上海天气预报
result = client.get_forecast('上海', days=5)
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### cURL

```bash
# 获取深圳当前天气
curl -X POST https://your-project.vercel.app/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_current_weather_by_city",
    "arguments": {
      "city": "深圳",
      "units": "metric",
      "lang": "zh_cn"
    }
  }'

# 搜索城市
curl -X POST https://your-project.vercel.app/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_cities",
    "arguments": {
      "query": "杭州"
    }
  }'
```

## 🔧 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述",
  "tool": "调用的工具名称"
}
```

### 常见错误

1. **城市未找到**:
```json
{
  "success": false,
  "error": "City not found: 不存在的城市",
  "tool": "get_current_weather_by_city"
}
```

2. **API密钥错误**:
```json
{
  "success": false,
  "error": "Invalid API key",
  "tool": "get_current_weather_by_city"
}
```

3. **参数错误**:
```json
{
  "success": false,
  "error": "Missing required parameter: city",
  "tool": "get_current_weather_by_city"
}
```

## 📊 参数说明

### 通用参数

- **units** (可选): 温度单位
  - `metric`: 摄氏度 (默认)
  - `imperial`: 华氏度
  - `kelvin`: 开尔文

- **lang** (可选): 语言代码
  - `zh_cn`: 中文 (默认)
  - `en`: 英文
  - `ja`: 日文
  - 等其他语言代码

### 特定参数

- **days**: 预报天数 (1-5天)
- **latitude/longitude**: 地理坐标 (数值)
- **cities**: 城市列表 (数组，2-5个城市)
- **query**: 搜索关键词 (字符串)

## 🚀 部署和配置

确保在 Vercel 环境变量中设置了 `OPENWEATHER_API_KEY`，这是调用 OpenWeatherMap API 所必需的。

## 📞 技术支持

如果遇到问题，请检查：
1. API 密钥是否正确配置
2. 请求格式是否符合规范
3. 网络连接是否正常
4. 查看 Vercel 函数日志获取详细错误信息