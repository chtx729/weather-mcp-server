import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerWeatherTools } from './tools.js';
import { config, validateConfig } from '../config/config.js';

/**
 * 天气预报 MCP Server 主程序
 * 提供天气查询和预报功能
 */
async function main() {
  try {
    // 验证配置
    if (!validateConfig()) {
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
      console.error('[MCP Server 错误]:', error);
    };

    // 创建标准输入输出传输
    const transport = new StdioServerTransport();
    
    // 连接服务器
    await server.connect(transport);
    
    // 输出启动信息到stderr（不影响MCP通信）
    console.error('🌤️ 天气预报 MCP Server 已启动');
    console.error('📡 等待客户端连接...');
    
  } catch (error) {
    console.error('[启动失败]:', error.message);
    process.exit(1);
  }
}

/**
 * 优雅关闭处理
 */
process.on('SIGINT', () => {
  console.error('\n🛑 收到关闭信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n🛑 收到终止信号，正在关闭服务器...');
  process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('[未捕获异常]:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[未处理的Promise拒绝]:', reason);
  process.exit(1);
});

// 启动服务器
main().catch((error) => {
  console.error('[程序异常]:', error);
  process.exit(1);
});