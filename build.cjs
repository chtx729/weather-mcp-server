#!/usr/bin/env node
/**
 * 构建脚本 - 用于 Vercel 部署
 * 解决 esbuild 在不同环境中的路径解析问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 日志输出函数
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型 (info, error, success)
 */
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // 青色
    error: '\x1b[31m',   // 红色
    success: '\x1b[32m', // 绿色
    warning: '\x1b[33m'  // 黄色
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}[构建] ${message}${reset}`);
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`创建目录: ${dirPath}`, 'success');
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 文件是否存在
 */
function checkFile(filePath) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ 文件存在: ${filePath}`, 'success');
  } else {
    log(`✗ 文件不存在: ${filePath}`, 'error');
  }
  return exists;
}

/**
 * 主构建函数
 */
async function build() {
  try {
    log('开始构建天气预报 MCP Server...', 'info');
    
    // 1. 检查源文件
    log('检查源文件...', 'info');
    const srcFile = path.join(process.cwd(), 'src', 'index.js');
    if (!checkFile(srcFile)) {
      throw new Error(`源文件不存在: ${srcFile}`);
    }
    
    // 2. 创建输出目录
    log('创建输出目录...', 'info');
    const distDir = path.join(process.cwd(), 'dist');
    const apiDir = path.join(process.cwd(), 'api');
    ensureDir(distDir);
    ensureDir(apiDir);
    
    // 3. 运行 esbuild
    log('运行 esbuild 打包...', 'info');
    const outputFile = path.join(distDir, 'index.cjs');
    
    const esbuildCmd = [
      'esbuild',
      `"${srcFile}"`,
      '--bundle',
      '--format=cjs',
      '--platform=node',
      '--target=node18',
      `--outfile="${outputFile}"`,
      '--sourcemap',
      '--minify'
    ].join(' ');
    
    log(`执行命令: ${esbuildCmd}`, 'info');
    execSync(esbuildCmd, { stdio: 'inherit' });
    
    // 4. 验证构建输出
    if (!checkFile(outputFile)) {
      throw new Error('构建失败：输出文件未生成');
    }
    
    // 5. 复制到 API 目录
    log('复制文件到 API 目录...', 'info');
    const apiFile = path.join(apiDir, 'mcp-server.cjs');
    fs.copyFileSync(outputFile, apiFile);
    
    if (!checkFile(apiFile)) {
      throw new Error('API 文件复制失败');
    }
    
    // 6. 显示构建结果
    const stats = fs.statSync(outputFile);
    log(`构建成功！`, 'success');
    log(`输出文件: ${outputFile}`, 'info');
    log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`, 'info');
    log(`API 文件: ${apiFile}`, 'info');
    
  } catch (error) {
    log(`构建失败: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// 运行构建
if (require.main === module) {
  build();
}

module.exports = { build };