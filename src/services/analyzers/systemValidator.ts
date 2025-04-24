
import { ValidationResult, AnalyzerComponent } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';
import { transformCode } from '../codeTransformer';

export async function validateConversionSystem(): Promise<ValidationResult> {
  const components: AnalyzerComponent[] = [
    { name: 'routeConverter', status: 'ok' },
    { name: 'codeTransformer', status: 'ok' },
    { name: 'apiRouteTransformer', status: 'ok' }
  ];
  
  const issues: string[] = [];

  try {
    const routeConverterValid = typeof analyzeNextJsRoutes === 'function';
    if (!routeConverterValid) {
      components[0].status = 'warning';
      issues.push('RouteConverter validation error');
    }
    
    const codeTransformerValid = typeof transformCode === 'function';
    if (!codeTransformerValid) {
      components[1].status = 'warning';
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
