// Vercel API 入口点 - ES 模块包装器
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 导入 CommonJS 版本的处理器
const handler = require('./index.cjs');

export default handler;
