
import { transformCode } from './codeTransformer';

export interface ApiRouteTransformOptions {
  targetFramework: 'express' | 'fastify' | 'standalone';
  generateComments: boolean;
  useTypescript: boolean;
}

export interface ApiRouteTransformResult {
  code: string;
  imports: string[];
  warnings: string[];
  handlerName: string;
  method: string | null;
  path: string;
}

/**
 * Extract API route path from file path
 */
function extractRoutePath(filePath: string): string {
  // Handle pages/api/[...param].ts format
  const apiPathMatch = filePath.match(/pages\/api\/(.+)\.(ts|js)$/);
  if (!apiPathMatch) return '/api/unknown';
  
  let path = apiPathMatch[1];
  
  // Handle dynamic route segments
  path = path.replace(/\[\.{3}(\w+)\]/g, '*'); // [...param] -> *
  path = path.replace(/\[(\w+)\]/g, ':$1');    // [param] -> :param
  
  // Handle index routes
  path = path.replace(/\/index$/, '/');
  
  return `/api/${path}`;
}

/**
 * Detect HTTP method from handler code
 */
function detectHttpMethod(code: string): string | null {
  if (code.includes('req.method === "GET"') || code.includes('req.method === \'GET\'')) {
    return 'GET';
  } else if (code.includes('req.method === "POST"') || code.includes('req.method === \'POST\'')) {
    return 'POST';
  } else if (code.includes('req.method === "PUT"') || code.includes('req.method === \'PUT\'')) {
    return 'PUT';
  } else if (code.includes('req.method === "DELETE"') || code.includes('req.method === \'DELETE\'')) {
    return 'DELETE';
  } else if (code.includes('req.method === "PATCH"') || code.includes('req.method === \'PATCH\'')) {
    return 'PATCH';
  } else {
    return null; // Method not detected or handler handles multiple methods
  }
}

/**
 * Transform Next.js API route to Express handler
 */
export function transformToExpress(code: string, filePath: string, options: ApiRouteTransformOptions = { targetFramework: 'express', generateComments: true, useTypescript: true }): ApiRouteTransformResult {
  const path = extractRoutePath(filePath);
  const method = detectHttpMethod(code);
  const handlerName = `handle${method || ''}${path.replace(/\//g, '_').replace(/:/g, '').replace('*', 'all')}`;
  
  // Parse the API handler function
  const handlerMatch = code.match(/export\s+default\s+(async\s+)?function\s+(\w+)?\s*\(\s*req\s*,\s*res\s*\)\s*{([\s\S]*?)}/);
  
  const result: ApiRouteTransformResult = {
    code: code,
    imports: ["import express from 'express';"],
    warnings: [],
    handlerName,
    method,
    path
  };
  
  if (options.useTypescript) {
    result.imports.push("import { Request, Response } from 'express';");
  }
  
  if (handlerMatch) {
    const isAsync = !!handlerMatch[1];
    const handlerBody = handlerMatch[3];
    
    // Transform to Express handler
    const expressHandler = `
/**
 * ${method || 'All methods'} handler for ${path}
 * Converted from Next.js API Route
 */
export ${isAsync ? 'async ' : ''}function ${handlerName}(req: ${options.useTypescript ? 'Request' : 'any'}, res: ${options.useTypescript ? 'Response' : 'any'}) {${handlerBody}}

// Express route registration:
// ${method ? `app.${method.toLowerCase()}('${path}', ${handlerName});` : `app.all('${path}', ${handlerName});`}
`;
    
    result.code = code.replace(handlerMatch[0], expressHandler);
    
    // Add warning for Next.js-specific features
    if (handlerBody.includes('req.query')) {
      result.warnings.push('Express uses req.query but may format query parameters differently than Next.js');
    }
    
    if (handlerBody.includes('req.cookies') || handlerBody.includes('res.cookies')) {
      result.warnings.push('Express requires cookie-parser middleware for req.cookies');
      result.imports.push("import cookieParser from 'cookie-parser';");
    }
  } else {
    result.warnings.push('Could not parse API handler function properly');
  }
  
  return result;
}

/**
 * Transform Next.js API route to Fastify handler
 */
export function transformToFastify(code: string, filePath: string, options: ApiRouteTransformOptions = { targetFramework: 'fastify', generateComments: true, useTypescript: true }): ApiRouteTransformResult {
  const path = extractRoutePath(filePath);
  const method = detectHttpMethod(code);
  const handlerName = `handle${method || ''}${path.replace(/\//g, '_').replace(/:/g, '').replace('*', 'all')}`;
  
  // Parse the API handler function
  const handlerMatch = code.match(/export\s+default\s+(async\s+)?function\s+(\w+)?\s*\(\s*req\s*,\s*res\s*\)\s*{([\s\S]*?)}/);
  
  const result: ApiRouteTransformResult = {
    code: code,
    imports: ["import Fastify from 'fastify';"],
    warnings: [],
    handlerName,
    method,
    path
  };
  
  if (options.useTypescript) {
    result.imports.push("import { FastifyRequest, FastifyReply } from 'fastify';");
  }
  
  if (handlerMatch) {
    const isAsync = !!handlerMatch[1];
    let handlerBody = handlerMatch[3];
    
    // Transform Next.js specific code to Fastify
    handlerBody = handlerBody.replace(/req\.query/g, 'req.query');
    handlerBody = handlerBody.replace(/req\.body/g, 'req.body');
    handlerBody = handlerBody.replace(/res\.status\(([^)]+)\)\.json\(([^)]+)\)/g, 'reply.code($1).send($2)');
    handlerBody = handlerBody.replace(/res\.status/g, 'reply.code');
    handlerBody = handlerBody.replace(/res\.json/g, 'reply.send');
    handlerBody = handlerBody.replace(/res\.end/g, 'reply.send');
    
    // Transform to Fastify handler
    const fastifyHandler = `
/**
 * ${method || 'All methods'} handler for ${path}
 * Converted from Next.js API Route
 */
export ${isAsync ? 'async ' : ''}function ${handlerName}(
  request: ${options.useTypescript ? 'FastifyRequest' : 'any'},
  reply: ${options.useTypescript ? 'FastifyReply' : 'any'}
) {
  // Converted from Next.js API Route
  // Note: 'req' and 'res' variables renamed to 'request' and 'reply'
  const req = request;
  const res = reply;
  ${handlerBody}
}

// Fastify route registration:
// fastify.route({
//   method: ${method ? `'${method}'` : "['GET', 'POST', 'PUT', 'DELETE', 'PATCH']"},
//   url: '${path}',
//   handler: ${handlerName}
// });
`;
    
    result.code = code.replace(handlerMatch[0], fastifyHandler);
    
    // Add warning for Next.js-specific features
    if (code.includes('req.cookies') || code.includes('res.cookies')) {
      result.warnings.push('Fastify requires @fastify/cookie plugin for cookies support');
      result.imports.push("import fastifyCookie from '@fastify/cookie';");
    }
  } else {
    result.warnings.push('Could not parse API handler function properly');
  }
  
  return result;
}

/**
 * Transform Next.js API route to a standalone fetch API handler
 */
export function transformToStandalone(code: string, filePath: string, options: ApiRouteTransformOptions = { targetFramework: 'standalone', generateComments: true, useTypescript: true }): ApiRouteTransformResult {
  const path = extractRoutePath(filePath);
  const method = detectHttpMethod(code);
  const handlerName = `handle${method || ''}${path.replace(/\//g, '_').replace(/:/g, '').replace('*', 'all')}`;
  
  // Parse the API handler function
  const handlerMatch = code.match(/export\s+default\s+(async\s+)?function\s+(\w+)?\s*\(\s*req\s*,\s*res\s*\)\s*{([\s\S]*?)}/);
  
  const result: ApiRouteTransformResult = {
    code: code,
    imports: [],
    warnings: [],
    handlerName,
    method,
    path
  };
  
  if (handlerMatch) {
    const isAsync = !!handlerMatch[1];
    let handlerBody = handlerMatch[3];
    
    // Transform Next.js specific code to Fetch API
    handlerBody = handlerBody.replace(/req\.query/g, 'url.searchParams');
    handlerBody = handlerBody.replace(/req\.body/g, 'await request.json()');
    handlerBody = handlerBody.replace(/res\.status\(([^)]+)\)\.json\(([^)]+)\)/g, 'new Response(JSON.stringify($2), { status: $1, headers: { "Content-Type": "application/json" } })');
    handlerBody = handlerBody.replace(/res\.json\(([^)]+)\)/g, 'new Response(JSON.stringify($1), { headers: { "Content-Type": "application/json" } })');
    handlerBody = handlerBody.replace(/res\.end\(\)/g, 'new Response(null, { status: 204 })');
    
    // Transform to standalone handler
    const standaloneHandler = `
/**
 * ${method || 'All methods'} handler for ${path}
 * Converted from Next.js API Route to Fetch API
 */
export ${isAsync ? 'async ' : ''}function ${handlerName}(request${options.useTypescript ? ': Request' : ''})${options.useTypescript ? ': Promise<Response>' : ''} {
  // Parse URL and extract query parameters
  const url = new URL(request.url);
  
  // Check if the method matches
  ${method ? 
    `if (request.method !== '${method}') {
    return new Response('Method Not Allowed', { status: 405 });
  }` : 
    '// This handler accepts any HTTP method'}
  
  // Converted from Next.js API Route
  // Original code used req and res, now we use request and directly return Response
  ${handlerBody}
}

// Example usage with a fetch event listener:
// addEventListener('fetch', (event) => {
//   event.respondWith(${handlerName}(event.request));
// });
`;
    
    result.code = code.replace(handlerMatch[0], standaloneHandler);
    
    // Add warning for complex conversions
    result.warnings.push('Complex response handling may need manual adjustment');
    
    if (code.includes('req.cookies') || code.includes('res.cookies')) {
      result.warnings.push('Cookie handling must be implemented manually with the Fetch API');
    }
  } else {
    result.warnings.push('Could not parse API handler function properly');
  }
  
  return result;
}

/**
 * Factory function to transform Next.js API routes to various backend targets
 */
export function transformApiRoute(code: string, filePath: string, options: ApiRouteTransformOptions): ApiRouteTransformResult {
  switch (options.targetFramework) {
    case 'express':
      return transformToExpress(code, filePath, options);
    case 'fastify':
      return transformToFastify(code, filePath, options);
    case 'standalone':
      return transformToStandalone(code, filePath, options);
    default:
      return transformToExpress(code, filePath, options);
  }
}
