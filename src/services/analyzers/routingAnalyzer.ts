
import { RoutingAnalysis } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';

export function analyzeRouting(files: File[]): RoutingAnalysis {
  const nextRoutes = analyzeNextJsRoutes(files);
  
  return {
    routes: nextRoutes,
    dynamicRoutes: nextRoutes.filter(route => route.isDynamic).length,
    complexRoutes: nextRoutes.filter(route => 
      route.path.includes('[...') || 
      route.path.includes('[[...') || 
      (route.isDynamic && route.path.split('/').filter(part => part.includes('[')).length > 1)
    ).length
  };
}
