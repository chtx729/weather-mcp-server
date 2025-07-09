import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 应用配置
 * 包含API密钥、默认设置和缓存配置
 */
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

/**
 * 验证配置是否完整
 * @returns {boolean} 配置是否有效
 */
export function validateConfig() {
  if (!config.openWeather.apiKey) {
    console.error('错误: 请设置 OPENWEATHER_API_KEY 环境变量');
    return false;
  }
  return true;
}