
import { RouteObject } from "react-router-dom";
import { RouteConversionResult } from "@/types/conversion";

export interface NextJsRoute {
  path: string;
  component: string;
  isDynamic: boolean;
  hasParams: boolean;
  params?: string[];
  layout?: string;
}

// Új típus a layout kezeléshez
interface LayoutMapping {
  nextPath: string;
  viteLayout: string;
}

export function analyzeNextJsRoutes(files: File[]): NextJsRoute[] {
  const routes: NextJsRoute[] = [];
  const layouts = new Map<string, string>();
  
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

      // Layout detektálás
      const layoutFile = file.name.replace(/\/[^/]+$/, '/_layout.tsx');
      if (files.some(f => f.name === layoutFile)) {
        layouts.set(path, layoutFile);
      }

      routes.push({
        path,
        component: file.name,
        isDynamic,
        hasParams: isDynamic,
        params,
        layout: layouts.get(path)
      });
    }
  });

  return routes;
}

export function convertToReactRoutes(nextRoutes: NextJsRoute[]): RouteObject[] {
  const routesByLayout = new Map<string | undefined, NextJsRoute[]>();
  
  // Csoportosítás layout szerint
  nextRoutes.forEach(route => {
    const layoutKey = route.layout || 'default';
    if (!routesByLayout.has(layoutKey)) {
      routesByLayout.set(layoutKey, []);
    }
    routesByLayout.get(layoutKey)?.push(route);
  });

  const convertedRoutes: RouteObject[] = [];

  routesByLayout.forEach((routes, layout) => {
    routes.forEach(route => {
      let reactPath = route.path;
      
      // Dinamikus paraméterek konvertálása
      if (route.isDynamic) {
        route.params?.forEach(param => {
          reactPath = reactPath.replace(`[${param}]`, `:${param}`);
        });
      }

      const newRoute: RouteObject = {
        path: reactPath,
        element: generateRouteComponent(route)
      };

      convertedRoutes.push(newRoute);
    });
  });

  return convertedRoutes;
}

function generateRouteComponent(route: NextJsRoute): string {
  const result: RouteConversionResult = {
    originalPath: route.path,
    convertedPath: route.path.replace(/\[(\w+)\]/g, ':$1'),
    component: route.component,
    imports: [
      "import React from 'react'",
      "import { useParams, useLocation } from 'react-router-dom'"
    ],
    code: ''
  };

  if (route.isDynamic) {
    result.code = `
const ${getComponentName(route)} = () => {
  const params = useParams();
  const location = useLocation();
  
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
