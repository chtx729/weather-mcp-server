import { WeatherAPI } from './weather-api.js';
import { config, validateConfig } from '../config/config.js';
import { formatWeatherResponse } from './utils.js';

/**
 * 天气API测试脚本
 * 用于验证天气API功能是否正常工作
 */

async function testWeatherAPI() {
  console.log('🧪 开始测试天气API功能...');
  
  // 验证配置
  if (!validateConfig()) {
    console.error('❌ 配置验证失败');
    return;
  }
  
  const weatherAPI = new WeatherAPI();
  
  try {
    console.log('\n1️⃣ 测试城市坐标获取...');
    const coordinates = await weatherAPI.getCoordinates('北京');
    console.log('✅ 坐标获取成功:', coordinates);
    
    console.log('\n2️⃣ 测试当前天气获取...');
    const currentWeather = await weatherAPI.getCurrentWeather(
      coordinates.lat, 
      coordinates.lon
    );
    console.log('✅ 当前天气获取成功');
    console.log(formatWeatherResponse(currentWeather, 'current'));
    
    console.log('\n3️⃣ 测试天气预报获取...');
    const forecast = await weatherAPI.getForecast(
      coordinates.lat, 
      coordinates.lon, 
      3
    );
    console.log('✅ 天气预报获取成功');
    console.log(formatWeatherResponse(forecast, 'forecast'));
    
    console.log('\n🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('\n💡 请检查:');
    console.error('   - API密钥是否正确设置');
    console.error('   - 网络连接是否正常');
    console.error('   - .env文件是否存在并配置正确');
  }
}

/**
 * 测试多个城市
 */
async function testMultipleCities() {
  console.log('\n🌍 测试多个城市天气获取...');
  
  const cities = ['北京', '上海', '广州', 'London', 'New York'];
  const weatherAPI = new WeatherAPI();
  
  for (const city of cities) {
    try {
      console.log(`\n📍 正在获取 ${city} 的天气...`);
      const coordinates = await weatherAPI.getCoordinates(city);
      const weather = await weatherAPI.getCurrentWeather(
        coordinates.lat, 
        coordinates.lon
      );
      
      console.log(`✅ ${weather.location.name}: ${weather.current.temperature}°C, ${weather.current.weather.description}`);
      
    } catch (error) {
      console.error(`❌ ${city}: ${error.message}`);
    }
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🌤️ 天气预报 MCP Server 测试工具');
  console.log('=' .repeat(50));
  
  await testWeatherAPI();
  await testMultipleCities();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 测试完成');
}

// 运行测试
main().catch(error => {
  console.error('💥 测试程序异常:', error);
  process.exit(1);
});