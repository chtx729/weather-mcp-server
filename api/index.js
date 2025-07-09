// Vercel Serverless Function for Weather MCP Server
// 这个文件是 Vercel 部署的入口点

const path = require('path');
const fs = require('fs');

// 导入天气API和工具
let WeatherAPI, weatherTools;

try {
  // 直接导入天气API和工具模块
  const { WeatherAPI: API } = require('../src/weather-api.js');
  const { registerWeatherTools } = require('../src/tools.js');
  
  WeatherAPI = API;
  
  // 初始化天气工具
  const mockServer = {
    setRequestHandler: () => {},
    connect: () => {},
    close: () => {}
  };
  
  weatherTools = {};
  registerWeatherTools(mockServer, weatherTools);
  
} catch (error) {
  console.error('Failed to load weather modules:', error);
  WeatherAPI = null;
  weatherTools = null;
}

/**
 * Vercel Serverless Function 处理器
 * @param {Object} req - HTTP 请求对象
 * @param {Object} res - HTTP 响应对象
 */
module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 健康检查端点
  if (req.method === 'GET' && req.url === '/') {
    res.status(200).json({
      status: 'ok',
      message: 'Weather MCP Server is running on Vercel',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/',
        mcp: '/mcp'
      },
      tools: [
        'get_current_weather_by_city',
        'get_current_weather_by_coordinates',
        'get_weather_forecast',
        'get_forecast_by_coordinates',
        'search_cities',
        'compare_weather'
      ]
    });
    return;
  }
  
  // 天气API调用处理
  if (req.url.startsWith('/weather') || (req.method === 'POST' && req.url === '/api/weather')) {
    if (!WeatherAPI || !weatherTools) {
      res.status(500).json({
        error: 'Weather API not available',
        message: 'Failed to initialize weather modules'
      });
      return;
    }
    
    try {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
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
              case 'get_forecast_by_coordinates':
                result = await weatherAPI.getForecastByCoordinates(args.latitude, args.longitude, args.days, args.units, args.lang);
                break;
              case 'search_cities':
                result = await weatherAPI.searchCities(args.query);
                break;
              case 'compare_weather':
                result = await weatherAPI.compareWeather(args.cities, args.units, args.lang);
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
      } else if (req.method === 'GET') {
        // 返回可用的天气工具列表
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
            },
            {
              name: 'get_forecast_by_coordinates',
              description: '根据坐标获取天气预报',
              parameters: ['latitude', 'longitude', 'days?', 'units?', 'lang?']
            },
            {
              name: 'search_cities',
              description: '搜索城市',
              parameters: ['query']
            },
            {
              name: 'compare_weather',
              description: '对比多城市天气',
              parameters: ['cities', 'units?', 'lang?']
            }
          ]
        });
      } else {
        res.status(405).json({
          error: 'Method not allowed',
          message: 'Only GET and POST requests are supported for weather endpoints'
        });
      }
    } catch (error) {
      console.error('Weather request error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
    return;
  }
  
  // 404 for other routes
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found',
    availableEndpoints: ['/', '/mcp']
  });
};

// 如果直接运行此文件（非 Vercel 环境）
if (require.main === module) {
  const http = require('http');
  const port = process.env.PORT || 3000;
  
  const server = http.createServer(module.exports);
  
  server.listen(port, () => {
    console.log(`Weather MCP Server HTTP adapter running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/`);
    console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  });
}