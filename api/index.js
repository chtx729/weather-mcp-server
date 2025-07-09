// Vercel Serverless Function for Weather MCP Server
// 这个文件是 Vercel 部署的入口点

import axios from 'axios';

// 简化的天气API类
class WeatherAPI {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geoUrl = 'https://api.openweathermap.org/geo/1.0';
  }

  async getCurrentWeather(cityName, units = 'metric', lang = 'zh_cn') {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: units,
          lang: lang
        },
        timeout: 10000
      });

      return {
        city: response.data.name,
        country: response.data.sys.country,
        temperature: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        description: response.data.weather[0].description,
        wind_speed: response.data.wind.speed,
        wind_direction: response.data.wind.deg,
        visibility: response.data.visibility,
        units: units,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`城市 "${cityName}" 未找到`);
      }
      throw new Error(`获取天气数据失败: ${error.message}`);
    }
  }

  async getCurrentWeatherByCoordinates(lat, lon, units = 'metric', lang = 'zh_cn') {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: units,
          lang: lang
        },
        timeout: 10000
      });

      return {
        city: response.data.name,
        country: response.data.sys.country,
        coordinates: { lat, lon },
        temperature: response.data.main.temp,
        feels_like: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        description: response.data.weather[0].description,
        wind_speed: response.data.wind.speed,
        wind_direction: response.data.wind.deg,
        visibility: response.data.visibility,
        units: units,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`获取坐标天气数据失败: ${error.message}`);
    }
  }

  async getForecast(cityName, days = 5, units = 'metric', lang = 'zh_cn') {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: units,
          lang: lang,
          cnt: Math.min(days * 8, 40)
        },
        timeout: 10000
      });

      const forecasts = response.data.list.map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        description: item.weather[0].description,
        wind_speed: item.wind.speed,
        wind_direction: item.wind.deg,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0
      }));

      return {
        city: response.data.city.name,
        country: response.data.city.country,
        forecasts: forecasts,
        units: units,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`城市 "${cityName}" 未找到`);
      }
      throw new Error(`获取天气预报失败: ${error.message}`);
    }
  }
}

/**
 * Vercel Serverless Function 处理器
 * @param {Object} req - HTTP 请求对象
 * @param {Object} res - HTTP 响应对象
 */
export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 健康检查端点
  if (req.method === 'GET' && (req.url === '/' || req.url === '/api' || req.url === '/api/')) {
    res.status(200).json({
      status: 'ok',
      message: 'Weather MCP Server is running on Vercel',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/',
        weather: '/api/weather'
      },
      tools: [
        'get_current_weather_by_city',
        'get_current_weather_by_coordinates',
        'get_weather_forecast'
      ]
    });
    return;
  }

  // 天气API调用处理
  if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        let request = null;
        try {
          request = JSON.parse(body);
          const { tool, arguments: args } = request;

          // 初始化天气API实例
          const weatherAPI = new WeatherAPI();

          let result;

          // 根据工具名称调用相应的天气API方法
          switch (tool) {
            case 'get_current_weather_by_city':
              result = await weatherAPI.getCurrentWeather(args.city, args.units, args.lang);
              break;
            case 'get_current_weather_by_coordinates':
              result = await weatherAPI.getCurrentWeatherByCoordinates(args.latitude, args.longitude, args.units, args.lang);
              break;
            case 'get_weather_forecast':
              result = await weatherAPI.getForecast(args.city, args.days, args.units, args.lang);
              break;
            default:
              throw new Error(`Unknown tool: ${tool}`);
          }

          res.status(200).json({
            success: true,
            tool: tool,
            result: result
          });
        } catch (error) {
          console.error('Weather API error:', error);
          res.status(400).json({
            success: false,
            error: error.message,
            tool: request?.tool || 'unknown'
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
    return;
  }

  // GET 请求返回可用工具列表
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Weather API is available',
      tools: [
        {
          name: 'get_current_weather_by_city',
          description: '根据城市名称获取当前天气',
          parameters: ['city', 'units?', 'lang?']
        },
        {
          name: 'get_current_weather_by_coordinates',
          description: '根据地理坐标获取当前天气',
          parameters: ['latitude', 'longitude', 'units?', 'lang?']
        },
        {
          name: 'get_weather_forecast',
          description: '获取天气预报',
          parameters: ['city', 'days?', 'units?', 'lang?']
        }
      ]
    });
    return;
  }

  // 405 for other methods
  res.status(405).json({
    error: 'Method not allowed',
    message: 'Only GET and POST requests are supported'
  });
}