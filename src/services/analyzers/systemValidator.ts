
import { ValidationResult } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';
import { transformCode } from '../codeTransformer';

export async function validateConversionSystem(): Promise<ValidationResult> {
  const components = [
    { name: 'routeConverter', status: 'ok' as const },
    { name: 'codeTransformer', status: 'ok' as const },
    { name: 'apiRouteTransformer', status: 'ok' as const }
  ];
  
  const issues: string[] = [];

  // Check components
  try {
    // RouteConverter check
    const routeConverterValid = typeof analyzeNextJsRoutes === 'function';
    if (!routeConverterValid) {
      components[0].status = 'error' as const;
      issues.push('RouteConverter validation error');
    }
    
    // CodeTransformer check
    const codeTransformerValid = typeof transformCode === 'function';
    if (!codeTransformerValid) {
      components[1].status = 'error' as const;
      issues.push('CodeTransformer validation error');
    }
    
  } catch (error) {
    issues.push(`System validation error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    components
  };
}
