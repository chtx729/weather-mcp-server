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
  
  return `🌍 ${location.name}, ${location.country}\n` +
         `📅 ${new Date(timestamp).toLocaleString('zh-CN')}\n\n` +
         `🌡️ 温度: ${current.temperature}°C (体感 ${current.feelsLike}°C)\n` +
         `☁️ 天气: ${current.weather.description}\n` +
         `💧 湿度: ${current.humidity}%\n` +
         `🌬️ 风速: ${current.wind.speed} m/s\n` +
         `📊 气压: ${current.pressure} hPa\n` +
         `👁️ 能见度: ${current.visibility} km\n` +
         `🌅 日出: ${new Date(sunrise).toLocaleTimeString('zh-CN')}\n` +
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

/**
 * 格式化错误消息
 * @param {Error} error - 错误对象
 * @returns {string} 格式化的错误消息
 */
export function formatErrorMessage(error) {
  if (error.response) {
    // API响应错误
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 401:
        return '❌ API密钥无效，请检查配置';
      case 404:
        return '❌ 未找到指定的城市或位置';
      case 429:
        return '❌ API调用次数超限，请稍后重试';
      default:
        return `❌ API错误 (${status}): ${message}`;
    }
  } else if (error.request) {
    // 网络错误
    return '❌ 网络连接失败，请检查网络设置';
  } else {
    // 其他错误
    return `❌ ${error.message}`;
  }
}