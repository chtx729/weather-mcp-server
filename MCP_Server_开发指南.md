# MCP Server 开发指南

## 项目概述
本文档将指导您完成 MCP Server 的开发过程。MCP Server 是一个轻量级程序，通过标准化的协议向 LLMs 提供特定功能。

## 开发步骤

### 1. 环境准备
- 安装 Node.js (推荐版本 22.x)
- 安装 npm (Node.js 包管理器)

### 2. 项目初始化
1. 创建项目目录结构：
```
mcp-server-demo/
├── bin/
│   └── index.js      # 可执行文件入口
├── dist/
│   └── index.js      # 构建后的文件
├── src/
│   └── index.js      # 项目源代码
└── package.json      # 项目配置文件
```

2. 初始化 package.json：
```json
{
  "name": "mcp-server-demo",
  "version": "1.0.0",
  "type": "module",
  "files": [
    "bin",
    "dist"
  ],
  "bin": {
    "mcp-server-demo": "bin/index.js"
  },
  "scripts": {
    "start": "node dist/index.js",
    "dev": "npm run build && npx -y @modelcontextprotocol/inspector npm run start",
    "build": "esbuild src/index.ts --bundle --loader:.md=text --format=esm --platform=node --target=node22 --outfile=dist/index.js",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.5.0",
    "zod": "^3.24.2",
    "zod-to-json-schema": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "22",
    "esbuild": "^0.25.0",
    "typescript": "^5.7.3"
  }
}
```

### 3. 开发流程
1. 确定功能需求
   - 明确需要提供的工具（tools）
   - 定义每个工具的输入参数和返回值
   - 设计工具的使用场景

2. 实现核心功能
   - 创建 MCP Server 实例
   - 注册工具
   - 实现工具的具体功能

3. 测试和调试
   - 使用 MCP Inspector 进行测试
   - 验证工具的功能
   - 优化性能和用户体验

### 4. 示例代码
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 创建 MCP 服务器
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// 注册工具示例
server.tool(
  "示例工具",
  "这是一个示例工具的描述",
  { 
    param1: z.string(),
    param2: z.number() 
  },
  async ({ param1, param2 }) => {
    // 实现工具的具体功能
    return {
      content: [{ 
        type: "text", 
        text: `处理结果: ${param1}, ${param2}` 
      }]
    };
  }
);

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

## 注意事项
1. 确保所有工具都有清晰的描述和参数定义
2. 使用 zod 进行参数验证
3. 返回格式必须符合 MCP 协议规范
4. 注意错误处理和异常情况

## 调试指南
1. 使用 `npm run dev` 启动开发模式
2. 使用 MCP Inspector 查看工具列表和测试功能
3. 检查控制台输出的错误信息
4. 验证工具的参数验证是否正常工作

## 发布和部署
1. 运行 `npm run build` 构建项目
2. 使用 `npm start` 启动服务器
3. 配置 MCP 客户端连接信息

## 常见问题
1. 工具注册失败
   - 检查参数定义是否正确
   - 确认工具名称是否重复

2. 连接问题
   - 验证端口配置
   - 检查网络连接

3. 性能问题
   - 优化工具实现
   - 检查资源使用情况 