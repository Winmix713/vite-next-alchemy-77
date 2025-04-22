import { RouteObject } from "react-router-dom";
import { RouteConversionResult } from "@/types/conversion";

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
    
    if (route.isDynamic) {
      route.params?.forEach(param => {
        reactPath = reactPath.replace(`[${param}]`, `:${param}`);
      });
    }

    return {
      path: reactPath,
      element: generateRouteComponent(route)
    };
  });
}

export function generateRouteComponent(route: NextJsRoute): string {
  const result: RouteConversionResult = {
    originalPath: route.path,
    convertedPath: route.path.replace(/\[(\w+)\]/g, ':$1'),
    component: route.component,
    imports: [
      "import React from 'react'",
      "import { useParams } from 'react-router-dom'"
    ],
    code: ''
  };

  if (route.isDynamic) {
    result.code = `
const ${getComponentName(route)} = () => {
  const params = useParams();
  return (
    <div>
      <h1>Dynamic Route: ${route.path}</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
};`;
  } else {
    result.code = `
const ${getComponentName(route)} = () => {
  return (
    <div>
      <h1>Static Route: ${route.path}</h1>
    </div>
  );
};`;
  }

  return result.code;
}

function getComponentName(route: NextJsRoute): string {
  return route.component
    .replace(/^pages\//, '')
    .replace(/\/(index)?$/, '')
    .split('/')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
    .replace(/\W+/g, '')
    .replace(/^\d+/, '') || 'Page';
}
