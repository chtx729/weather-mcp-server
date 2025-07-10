import { McpServer, HttpServerTransport, SseServerTransport } from '@mcp/server';
import { registerWeatherTools } from '../src/tools.js';
import { validateConfig } from '../src/utils.js';

/**
 * 创建支持 HTTP 的 MCP 服务器
 */
export default async function createHttpServer(req, res) {
  // 处理健康检查
  if (req.method === 'GET') {
    return res.status(200).json({
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
  }

  // 验证配置
  if (!validateConfig()) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error'
    });
  }

  try {
    // 创建 MCP 服务器实例
    const server = new McpServer({
      name: 'weather-mcp-server',
      version: '1.0.0',
      description: '提供天气查询和预报功能的 MCP Server'
    });

    // 注册天气工具
    registerWeatherTools(server);

    // 检测是否是 SSE 请求
    const isSSE = req.headers.accept && req.headers.accept.includes('text/event-stream');

    if (isSSE) {
      // 设置 SSE 头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 创建 SSE 传输
      const transport = new SseServerTransport({ req, res });
      await server.connect(transport);
    } else {
      // 普通 HTTP 处理
      const transport = new HttpServerTransport({ req, res });
      await server.handleRequest(transport);
    }
  } catch (error) {
    console.error('[HTTP 处理错误]:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
