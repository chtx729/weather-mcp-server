#!/usr/bin/env node
/**
 * Vercel 专用构建脚本
 * 专门解决 Vercel 环境中的路径和构建问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 日志输出函数
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`创建目录: ${dirPath}`);
  }
}

/**
 * 查找源文件
 * @returns {string|null} 源文件路径
 */
function findSourceFile() {
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'index.js'),
    path.join(__dirname, 'src', 'index.js'),
    path.resolve('./src/index.js'),
    path.resolve('src/index.js')
  ];

  log('开始查找源文件...');
  log(`当前工作目录: ${process.cwd()}`);
  log(`脚本所在目录: ${__dirname}`);

  for (const srcPath of possiblePaths) {
    const resolvedPath = path.resolve(srcPath);
    log(`检查路径: ${resolvedPath}`);

    if (fs.existsSync(resolvedPath)) {
      log(`✓ 找到源文件: ${resolvedPath}`);
      return resolvedPath;
    }
  }

  log('❌ 未找到源文件，尝试列出目录内容:');
  try {
    const files = fs.readdirSync(process.cwd());
    log(`根目录文件: ${files.join(', ')}`);

    if (fs.existsSync(path.join(process.cwd(), 'src'))) {
      const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'));
      log(`src目录文件: ${srcFiles.join(', ')}`);
    } else {
      log('src目录不存在');
    }
  } catch (error) {
    log(`无法列出目录内容: ${error.message}`, 'error');
  }

  return null;
}

/**
 * 主构建函数
 */
async function build() {
  try {
    log('=== Vercel 构建开始 ===');
    
    // 环境信息
    log(`Node.js 版本: ${process.version}`);
    log(`平台: ${process.platform}`);
    log(`架构: ${process.arch}`);
    
    // Vercel 环境检测
    const vercelEnv = {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NOW_REGION: process.env.NOW_REGION,
      VERCEL_REGION: process.env.VERCEL_REGION
    };
    log(`Vercel 环境变量: ${JSON.stringify(vercelEnv)}`);
    
    // 1. 查找源文件
    const srcFile = findSourceFile();
    if (!srcFile) {
      throw new Error('无法找到源文件 src/index.js');
    }
    
    // 2. 创建输出目录
    log('创建输出目录...');
    const distDir = path.join(process.cwd(), 'dist');
    const apiDir = path.join(process.cwd(), 'api');
    ensureDir(distDir);
    ensureDir(apiDir);
    
    // 3. 构建主要的 MCP Server
    log('开始构建 MCP Server...');
    const outputFile = path.join(distDir, 'index.cjs');

    const esbuildCmd = [
      'npx esbuild',
      `"${srcFile}"`,
      '--bundle',
      '--format=cjs',
      '--platform=node',
      '--target=node18',
      `--outfile="${outputFile}"`,
      '--sourcemap',
      '--minify',
      '--log-level=info',
      '--external:@modelcontextprotocol/sdk'
    ].join(' ');

    log(`执行命令: ${esbuildCmd}`);

    try {
      execSync(esbuildCmd, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      // 验证输出
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        log(`✓ MCP Server 构建成功，输出文件: ${outputFile}`);
        log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

        // 复制到 API 目录
        const apiFile = path.join(apiDir, 'mcp-server.cjs');
        fs.copyFileSync(outputFile, apiFile);
        log(`✓ 复制到 API 目录: ${apiFile}`);
      } else {
        log('警告: MCP Server 构建文件不存在，但继续执行', 'warn');
      }
    } catch (buildError) {
      log(`MCP Server 构建失败: ${buildError.message}`, 'error');
      log('继续执行，因为 Vercel 函数不依赖此文件', 'warn');
    }
    
    log('=== 构建完成 ===');
    
  } catch (error) {
    log(`构建失败: ${error.message}`, 'error');
    log(`错误堆栈: ${error.stack}`, 'error');
    process.exit(1);
  }
}

// 运行构建
if (require.main === module) {
  build();
}

module.exports = { build };