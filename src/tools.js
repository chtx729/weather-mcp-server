import { z } from 'zod';
import { WeatherAPI } from './weather-api.js';
import { formatWeatherResponse, validateCoordinates, formatErrorMessage } from './utils.js';

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
            text: formatErrorMessage(error)
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
            text: formatErrorMessage(error)
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
            text: formatErrorMessage(error)
          }],
          isError: true
        };
      }
    }
  );

  // 工具4: 根据坐标获取天气预报
  server.tool(
    'get_forecast_by_coordinates',
    '根据地理坐标获取天气预报',
    {
      latitude: z.number().describe('纬度'),
      longitude: z.number().describe('经度'),
      days: z.number().min(1).max(5).optional().describe('预报天数，1-5天'),
      units: z.enum(['metric', 'imperial', 'kelvin']).optional().describe('温度单位'),
      lang: z.string().optional().describe('语言代码')
    },
    async ({ latitude, longitude, days = 3, units = 'metric', lang = 'zh_cn' }) => {
      try {
        // 验证坐标
        validateCoordinates(latitude, longitude);
        
        // 获取预报信息
        const forecast = await weatherAPI.getForecast(
          latitude,
          longitude,
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
            text: formatErrorMessage(error)
          }],
          isError: true
        };
      }
    }
  );

  // 工具5: 搜索城市
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
            text: `🔍 找到城市: ${coordinates.name}, ${coordinates.country}\n📍 坐标: ${coordinates.lat}, ${coordinates.lon}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: formatErrorMessage(error)
          }],
          isError: true
        };
      }
    }
  );

  // 工具6: 获取多个城市的天气对比
  server.tool(
    'compare_weather',
    '对比多个城市的当前天气',
    {
      cities: z.array(z.string()).min(2).max(5).describe('要对比的城市列表（2-5个城市）'),
      units: z.enum(['metric', 'imperial', 'kelvin']).optional().describe('温度单位'),
      lang: z.string().optional().describe('语言代码')
    },
    async ({ cities, units = 'metric', lang = 'zh_cn' }) => {
      try {
        const weatherData = [];
        
        // 并行获取所有城市的天气
        const promises = cities.map(async (city) => {
          const coordinates = await weatherAPI.getCoordinates(city);
          const weather = await weatherAPI.getCurrentWeather(
            coordinates.lat,
            coordinates.lon,
            units,
            lang
          );
          return weather;
        });
        
        const results = await Promise.all(promises);
        
        // 格式化对比结果
        let comparisonText = `🌍 ${cities.length}个城市天气对比\n\n`;
        
        results.forEach((weather, index) => {
          const { location, current } = weather;
          comparisonText += `📍 ${location.name}, ${location.country}\n`;
          comparisonText += `🌡️ ${current.temperature}°C (${current.weather.description})\n`;
          comparisonText += `💧 湿度: ${current.humidity}% | 🌬️ 风速: ${current.wind.speed} m/s\n`;
          if (index < results.length - 1) comparisonText += '\n';
        });
        
        return {
          content: [{
            type: 'text',
            text: comparisonText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: formatErrorMessage(error)
          }],
          isError: true
        };
      }
    }
  );
}