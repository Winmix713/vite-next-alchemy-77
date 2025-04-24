
import { ValidationResult, AnalyzerComponent } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';
import { transformCode } from '../codeTransformer';

export async function validateConversionSystem(): Promise<ValidationResult> {
  const components: AnalyzerComponent[] = [
    { name: 'routeConverter', status: 'warning' },
    { name: 'codeTransformer', status: 'warning' },
    { name: 'apiRouteTransformer', status: 'warning' }
  ];
  
  const issues: string[] = [];

  try {
    const routeConverterValid = typeof analyzeNextJsRoutes === 'function';
    if (!routeConverterValid) {
      components[0].status = 'error';
      issues.push('RouteConverter validation error');
    } else {
      components[0].status = 'ok';
    }
    
    const codeTransformerValid = typeof transformCode === 'function';
    if (!codeTransformerValid) {
      components[1].status = 'error';
      issues.push('CodeTransformer validation error');
    } else {
      components[1].status = 'ok';
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
