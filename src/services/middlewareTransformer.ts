
import { transformCode } from './codeTransformer';

interface MiddlewareConfig {
  path: string;
  type: 'api' | 'page' | 'edge';
  dependencies: string[];
}

export const detectMiddlewareType = (code: string): MiddlewareConfig['type'] => {
  if (code.includes('NextResponse') || code.includes('NextRequest')) {
    return 'edge';
  }
  if (code.includes('NextApiRequest') || code.includes('NextApiResponse')) {
    return 'api';
  }
  return 'page';
};

export const transformMiddleware = (code: string, type: MiddlewareConfig['type']): string => {
  switch (type) {
    case 'api':
      return transformApiMiddleware(code);
    case 'edge':
      return transformEdgeMiddleware(code);
    case 'page':
      return transformPageMiddleware(code);
    default:
      return code;
  }
};

const transformApiMiddleware = (code: string): string => {
  return code
    .replace(/NextApiRequest/g, 'Request')
    .replace(/NextApiResponse/g, 'Response')
    .replace(/export\s+function\s+middleware/g, 'export const middleware = (req, res, next)')
    .replace(/return\s+NextResponse/g, 'return res');
};

const transformEdgeMiddleware = (code: string): string => {
  return code
    .replace(/NextResponse/g, 'Response')
    .replace(/NextRequest/g, 'Request')
    .replace(/export\s+const\s+config\s*=\s*{([^}]*)}/g, '// Edge middleware configuration removed')
    .replace(/export\s+function\s+middleware/g, 'export const middleware = async (request)');
};

const transformPageMiddleware = (code: string): string => {
  return `import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

${code.replace(/export\s+function\s+middleware/, 'export const useMiddleware = ')}`;
};

export const generateExpressMiddleware = (middlewareConfig: MiddlewareConfig): string => {
  return `const express = require('express');
const router = express.Router();

${middlewareConfig.dependencies.map(dep => `const ${dep} = require('${dep}');`).join('\n')}

const middleware = (req, res, next) => {
  // Transformed middleware logic here
  next();
};

router.use(middleware);

module.exports = router;`;
};
