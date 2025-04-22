
import { RouteObject } from "react-router-dom";

export interface NextJsRoute {
  path: string;
  component: string;
  isDynamic: boolean;
  hasParams: boolean;
  params?: string[];
}

export function analyzeNextJsRoutes(files: File[]): NextJsRoute[] {
  const routes: NextJsRoute[] = [];
  
  files.forEach(file => {
    // Analyze file path to detect Next.js route patterns
    if (file.name.includes('pages/')) {
      const path = file.name
        .replace(/^pages/, '')
        .replace(/\.(tsx|jsx|js|ts)$/, '')
        .replace(/\/index$/, '/');

      const isDynamic = path.includes('[') && path.includes(']');
      const params = isDynamic 
        ? path.match(/\[(.*?)\]/g)?.map(p => p.replace(/[\[\]]/g, ''))
        : [];

      routes.push({
        path,
        component: file.name,
        isDynamic,
        hasParams: isDynamic,
        params
      });
    }
  });

  return routes;
}

export function convertToReactRoutes(nextRoutes: NextJsRoute[]): RouteObject[] {
  return nextRoutes.map(route => {
    let reactPath = route.path;
    
    // Convert Next.js dynamic routes to React Router format
    if (route.isDynamic) {
      route.params?.forEach(param => {
        reactPath = reactPath.replace(`[${param}]`, `:${param}`);
      });
    }

    return {
      path: reactPath,
      // In a real implementation, this would be the actual component
      // For now, we'll use a placeholder
      element: `<div>Route: ${reactPath}</div>`
    };
  });
}
