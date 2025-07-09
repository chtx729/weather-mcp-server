# 天气预报 MCP Server 开发指南

## 项目概述
本指南将详细介绍如何使用 JavaScript 开发一个天气预报的 MCP Server，为客户端提供天气查询、预报和相关功能。

## 功能特性
- 获取当前天气信息
- 查询未来几天的天气预报
- 根据城市名称或坐标查询天气
- 支持多种天气数据源（OpenWeatherMap、WeatherAPI等）

## 开发步骤

### 第一步：环境准备

1. **安装 Node.js**
   - 下载并安装 Node.js 22.x 版本
   - 验证安装：`node --version` 和 `npm --version`

2. **创建项目目录**
```bash
mkdir weather-mcp-server
cd weather-mcp-server
```

### 第二步：项目初始化

1. **创建项目结构**
```
weather-mcp-server/
├── bin/
│   └── index.js          # 可执行文件入口
├── dist/
│   └── index.js          # 构建后的文件
├── src/
│   ├── index.js          # 主程序入口
│   ├── weather-api.js    # 天气API封装
│   ├── tools.js          # MCP工具定义
│   └── utils.js          # 工具函数
├── config/
│   └── config.js         # 配置文件
├── package.json          # 项目配置
└── README.md            # 项目说明
```

2. **初始化 package.json**
```json
{
  "name": "weather-mcp-server",
  "version": "1.0.0",
  "description": "天气预报 MCP Server",
  "type": "module",
  "main": "dist/index.js",
  "files": [
    "bin",
    "dist",
    "config"
  ],
  "bin": {
    "weather-mcp-server": "bin/index.js"
  },
  "scripts": {
    "start": "node dist/index.js",
    "dev": "npm run build && npx -y @modelcontextprotocol/inspector npm run start",
    "build": "esbuild src/index.js --bundle --format=esm --platform=node --target=node22 --outfile=dist/index.js",
    "test": "node src/test.js",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.5.0",
    "axios": "^1.6.0",
    "zod": "^3.24.2",
    "zod-to-json-schema": "^3.24.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "22",
    "esbuild": "^0.25.0"
  },
  "keywords": [
    "mcp",
    "weather",
    "forecast",
    "api"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 第三步：获取天气API密钥

1. **注册 OpenWeatherMap 账户**
   - 访问 https://openweathermap.org/api
   - 注册免费账户
   - 获取 API Key

2. **创建环境配置文件**
```bash
# 在项目根目录创建 .env 文件
OPENWEATHER_API_KEY=your_api_key_here
DEFAULT_UNITS=metric
DEFAULT_LANG=zh_cn
```

### 第四步：核心代码实现

#### 1. 配置文件 (config/config.js)
```javascript
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  // OpenWeatherMap API 配置
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    geoUrl: 'https://api.openweathermap.org/geo/1.0'
  },
  
  // 默认设置
  defaults: {
    units: process.env.DEFAULT_UNITS || 'metric', // metric, imperial, kelvin
    lang: process.env.DEFAULT_LANG || 'zh_cn'
  },
  
  // 缓存设置
  cache: {
    ttl: 10 * 60 * 1000 // 10分钟缓存
  }
};
```

#### 2. 天气API封装 (src/weather-api.js)
```javascript
import axios from 'axios';
import { config } from '../config/config.js';

/**
 * 天气API服务类
 * 封装OpenWeatherMap API调用
 */
export class WeatherAPI {
  constructor() {
    this.apiKey = config.openWeather.apiKey;
    this.baseUrl = config.openWeather.baseUrl;
    this.geoUrl = config.openWeather.geoUrl;
    this.cache = new Map();
  }

  /**
   * 根据城市名称获取地理坐标
   * @param {string} cityName - 城市名称
   * @returns {Promise<Object>} 坐标信息
   */
  async getCoordinates(cityName) {
    const cacheKey = `geo_${cityName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(`${this.geoUrl}/direct`, {
        params: {
          q: cityName,
          limit: 1,
          appid: this.apiKey
        }
      });

      if (response.data.length === 0) {
        throw new Error(`未找到城市: ${cityName}`);
      }

      const result = {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
        name: response.data[0].local_names?.zh || response.data[0].name,
        country: response.data[0].country
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`获取坐标失败: ${error.message}`);
    }
  }

  /**
   * 获取当前天气信息
   * @param {number} lat - 纬度
   * @param {number} lon - 经度
   * @param {string} units - 单位制
   * @param {string} lang - 语言
   * @returns {Promise<Object>} 天气信息
   */
  async getCurrentWeather(lat, lon, units = 'metric', lang = 'zh_cn') {
    const cacheKey = `current_${lat}_${lon}_${units}_${lang}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < config.cache.ttl) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          lang
        }
      });

      const data = this.formatCurrentWeather(response.data);
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      throw new Error(`获取当前天气失败: ${error.message}`);
    }
  }

  /**
   * 获取天气预报
   * @param {number} lat - 纬度
   * @param {number} lon - 经度
   * @param {number} days - 预报天数
   * @param {string} units - 单位制
   * @param {string} lang - 语言
   * @returns {Promise<Object>} 预报信息
   */
  async getForecast(lat, lon, days = 5, units = 'metric', lang = 'zh_cn') {
    const cacheKey = `forecast_${lat}_${lon}_${days}_${units}_${lang}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < config.cache.ttl) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          lang,
          cnt: days * 8 // 每天8个时间点（3小时间隔）
        }
      });

      const data = this.formatForecast(response.data, days);
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      throw new Error(`获取天气预报失败: ${error.message}`);
    }
  }

  /**
   * 格式化当前天气数据
   * @param {Object} data - 原始API数据
   * @returns {Object} 格式化后的数据
   */
  formatCurrentWeather(data) {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      },
      current: {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // 转换为公里
        uvIndex: data.uvi || 0,
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        },
        wind: {
          speed: data.wind.speed,
          direction: data.wind.deg,
          gust: data.wind.gust || 0
        }
      },
      timestamp: new Date(data.dt * 1000).toISOString(),
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString()
    };
  }

  /**
   * 格式化预报数据
   * @param {Object} data - 原始API数据
   * @param {number} days - 预报天数
   * @returns {Object} 格式化后的数据
   */
  formatForecast(data, days) {
    const dailyForecasts = [];
    const groupedByDate = {};

    // 按日期分组
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(item);
    });

    // 处理每一天的数据
    Object.keys(groupedByDate).slice(0, days).forEach(date => {
      const dayData = groupedByDate[date];
      const temps = dayData.map(item => item.main.temp);
      
      dailyForecasts.push({
        date: date,
        temperature: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
          avg: Math.round(temps.reduce((a, b) => a + b) / temps.length)
        },
        weather: {
          main: dayData[0].weather[0].main,
          description: dayData[0].weather[0].description,
          icon: dayData[0].weather[0].icon
        },
        humidity: Math.round(dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length),
        wind: {
          speed: Math.round(dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length),
          direction: dayData[0].wind.deg
        },
        hourly: dayData.map(item => ({
          time: new Date(item.dt * 1000).toISOString(),
          temperature: Math.round(item.main.temp),
          weather: item.weather[0].description,
          icon: item.weather[0].icon
        }))
      });
    });

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon
        }
      },
      forecast: dailyForecasts,
      generatedAt: new Date().toISOString()
    };
  }
}
```

#### 3. MCP工具定义 (src/tools.js)
```javascript
import { z } from 'zod';
import { WeatherAPI } from './weather-api.js';
import { formatWeatherResponse, validateCoordinates } from './utils.js';

/**
 * 注册所有天气相关的MCP工具
 * @param {McpServer} server - MCP服务器实例
 */
export function registerWeatherTools(server) {
  const weatherAPI = new WeatherAPI();

  // 工具1: 根据城市名称获取当前天气
  server.tool(
    'get_current_weather_by_city',
    '根据城市名称获取当前天气信息',
    {
      city: z.string().describe('城市名称，支持中英文'),
      units: z.enum(['metric', 'imperial', 'kelvin']).optional().describe('温度单位：metric(摄氏度), imperial(华氏度), kelvin(开尔文)'),
      lang: z.string().optional().describe('语言代码，如 zh_cn, en 等')
    },
    async ({ city, units = 'metric', lang = 'zh_cn' }) => {
      try {
        // 获取城市坐标
        const coordinates = await weatherAPI.getCoordinates(city);
        
        // 获取天气信息
        const weather = await weatherAPI.getCurrentWeather(
          coordinates.lat,
          coordinates.lon,
          units,
          lang
        );

        return {
          content: [{
            type: 'text',
            text: formatWeatherResponse(weather, 'current')
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `获取天气信息失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // 工具2: 根据坐标获取当前天气
  server.tool(
    'get_current_weather_by_coordinates',
    '根据地理坐标获取当前天气信息',
    {
      latitude: z.number().describe('纬度'),
      longitude: z.number().describe('经度'),
      units: z.enum(['metric', 'imperial', 'kelvin']).optional().describe('温度单位'),
      lang: z.string().optional().describe('语言代码')
    },
    async ({ latitude, longitude, units = 'metric', lang = 'zh_cn' }) => {
      try {
        // 验证坐标
        validateCoordinates(latitude, longitude);
        
        // 获取天气信息
        const weather = await weatherAPI.getCurrentWeather(
          latitude,
          longitude,
          units,
          lang
        );

        return {
          content: [{
            type: 'text',
            text: formatWeatherResponse(weather, 'current')
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `获取天气信息失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // 工具3: 获取天气预报
  server.tool(
    'get_weather_forecast',
    '获取指定城市的天气预报',
    {
      city: z.string().describe('城市名称'),
      days: z.number().min(1).max(5).optional().describe('预报天数，1-5天'),
      units: z.enum(['metric', 'imperial', 'kelvin']).optional().describe('温度单位'),
      lang: z.string().optional().describe('语言代码')
    },
    async ({ city, days = 3, units = 'metric', lang = 'zh_cn' }) => {
      try {
        // 获取城市坐标
        const coordinates = await weatherAPI.getCoordinates(city);
        
        // 获取预报信息
        const forecast = await weatherAPI.getForecast(
          coordinates.lat,
          coordinates.lon,
          days,
          units,
          lang
        );

        return {
          content: [{
            type: 'text',
            text: formatWeatherResponse(forecast, 'forecast')
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `获取天气预报失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  // 工具4: 搜索城市
  server.tool(
    'search_cities',
    '搜索城市名称，获取可用的城市列表',
    {
      query: z.string().describe('搜索关键词')
    },
    async ({ query }) => {
      try {
        // 这里可以实现城市搜索功能
        // 简化版本：直接尝试获取坐标
        const coordinates = await weatherAPI.getCoordinates(query);
        
        return {
          content: [{
            type: 'text',
            text: `找到城市: ${coordinates.name}, ${coordinates.country}\n坐标: ${coordinates.lat}, ${coordinates.lon}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `搜索城市失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}
```

#### 4. 工具函数 (src/utils.js)
```javascript
/**
 * 格式化天气响应数据
 * @param {Object} data - 天气数据
 * @param {string} type - 数据类型 ('current' 或 'forecast')
 * @returns {string} 格式化后的文本
 */
export function formatWeatherResponse(data, type) {
  if (type === 'current') {
    return formatCurrentWeatherText(data);
  } else if (type === 'forecast') {
    return formatForecastText(data);
  }
  return '未知的数据类型';
}

/**
 * 格式化当前天气文本
 * @param {Object} weather - 当前天气数据
 * @returns {string} 格式化文本
 */
function formatCurrentWeatherText(weather) {
  const { location, current, timestamp, sunrise, sunset } = weather;
  
  return `🌍 ${location.name}, ${location.country}
` +
         `📅 ${new Date(timestamp).toLocaleString('zh-CN')}

` +
         `🌡️ 温度: ${current.temperature}°C (体感 ${current.feelsLike}°C)
` +
         `☁️ 天气: ${current.weather.description}
` +
         `💧 湿度: ${current.humidity}%
` +
         `🌬️ 风速: ${current.wind.speed} m/s
` +
         `📊 气压: ${current.pressure} hPa
` +
         `👁️ 能见度: ${current.visibility} km
` +
         `🌅 日出: ${new Date(sunrise).toLocaleTimeString('zh-CN')}
` +
         `🌇 日落: ${new Date(sunset).toLocaleTimeString('zh-CN')}`;
}

/**
 * 格式化预报文本
 * @param {Object} forecast - 预报数据
 * @returns {string} 格式化文本
 */
function formatForecastText(forecast) {
  const { location, forecast: dailyForecasts } = forecast;
  
  let text = `🌍 ${location.name}, ${location.country} - ${dailyForecasts.length}天天气预报\n\n`;
  
  dailyForecasts.forEach((day, index) => {
    const date = new Date(day.date);
    const dayName = index === 0 ? '今天' : 
                   index === 1 ? '明天' : 
                   date.toLocaleDateString('zh-CN', { weekday: 'long' });
    
    text += `📅 ${dayName} (${date.toLocaleDateString('zh-CN')})\n`;
    text += `🌡️ ${day.temperature.min}°C ~ ${day.temperature.max}°C\n`;
    text += `☁️ ${day.weather.description}\n`;
    text += `💧 湿度: ${day.humidity}%\n`;
    text += `🌬️ 风速: ${day.wind.speed} m/s\n\n`;
  });
  
  return text;
}

/**
 * 验证地理坐标
 * @param {number} lat - 纬度
 * @param {number} lon - 经度
 * @throws {Error} 坐标无效时抛出错误
 */
export function validateCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('坐标必须是数字');
  }
  
  if (lat < -90 || lat > 90) {
    throw new Error('纬度必须在 -90 到 90 之间');
  }
  
  if (lon < -180 || lon > 180) {
    throw new Error('经度必须在 -180 到 180 之间');
  }
}

/**
 * 获取风向描述
 * @param {number} degrees - 风向角度
 * @returns {string} 风向描述
 */
export function getWindDirection(degrees) {
  const directions = [
    '北', '东北偏北', '东北', '东北偏东',
    '东', '东南偏东', '东南', '东南偏南',
    '南', '西南偏南', '西南', '西南偏西',
    '西', '西北偏西', '西北', '西北偏北'
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * 根据天气图标获取emoji
 * @param {string} icon - 天气图标代码
 * @returns {string} 对应的emoji
 */
export function getWeatherEmoji(icon) {
  const emojiMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  
  return emojiMap[icon] || '🌤️';
}
```

#### 5. 主程序入口 (src/index.js)
```javascript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerWeatherTools } from './tools.js';
import { config } from '../config/config.js';

/**
 * 天气预报 MCP Server 主程序
 */
async function main() {
  // 检查API密钥
  if (!config.openWeather.apiKey) {
    console.error('错误: 请设置 OPENWEATHER_API_KEY 环境变量');
    process.exit(1);
  }

  // 创建 MCP 服务器实例
  const server = new McpServer({
    name: 'weather-mcp-server',
    version: '1.0.0',
    description: '提供天气查询和预报功能的 MCP Server'
  });

  // 注册天气工具
  registerWeatherTools(server);

  // 错误处理
  server.onerror = (error) => {
    console.error('MCP Server 错误:', error);
  };

  // 创建标准输入输出传输
  const transport = new StdioServerTransport();
  
  // 连接服务器
  try {
    await server.connect(transport);
    console.error('天气预报 MCP Server 已启动');
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
main().catch((error) => {
  console.error('程序异常:', error);
  process.exit(1);
});
```

#### 6. 可执行文件 (bin/index.js)
```javascript
#!/usr/bin/env node

// 导入并运行主程序
import '../dist/index.js';
```

### 第五步：测试和调试

1. **安装依赖**
```bash
npm install
```

2. **设置环境变量**
```bash
# 创建 .env 文件并添加你的API密钥
echo "OPENWEATHER_API_KEY=your_actual_api_key" > .env
```

3. **构建项目**
```bash
npm run build
```

4. **启动开发模式**
```bash
npm run dev
```

5. **使用 MCP Inspector 测试**
   - 开发模式会自动打开 MCP Inspector
   - 测试各个工具的功能
   - 验证参数验证和错误处理

### 第六步：部署和使用

1. **构建生产版本**
```bash
npm run build
```

2. **启动服务器**
```bash
npm start
```

3. **配置客户端连接**
   - 在 MCP 客户端中添加服务器配置
   - 指定可执行文件路径
   - 测试连接和功能

## 功能扩展建议

### 1. 添加更多天气数据源
- WeatherAPI
- AccuWeather
- 中国天气网API

### 2. 增强功能
- 天气预警信息
- 空气质量指数
- 紫外线指数
- 历史天气数据

### 3. 优化性能
- 实现更智能的缓存策略
- 添加数据压缩
- 支持批量查询

### 4. 用户体验
- 支持自然语言查询
- 添加天气图表生成
- 支持多语言响应

## 常见问题解决

### 1. API密钥问题
- 确保API密钥正确设置
- 检查API配额是否用完
- 验证API密钥权限

### 2. 网络连接问题
- 检查网络连接
- 验证防火墙设置
- 考虑添加代理支持

### 3. 数据格式问题
- 验证API响应格式
- 检查数据解析逻辑
- 添加更多错误处理

### 4. 性能问题
- 优化缓存策略
- 减少不必要的API调用
- 考虑使用连接池

## 总结

通过以上步骤，你已经成功创建了一个功能完整的天气预报 MCP Server。这个服务器提供了：

- 🌍 根据城市名称或坐标查询当前天气
- 📅 获取多天天气预报
- 🔍 城市搜索功能
- 🌐 多语言和多单位制支持
- ⚡ 智能缓存机制
- 🛡️ 完善的错误处理

你可以根据实际需求继续扩展功能，添加更多天气数据源或增强用户体验。