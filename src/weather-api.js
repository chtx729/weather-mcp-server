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