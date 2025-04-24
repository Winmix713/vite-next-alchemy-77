
import { DependencyAnalysis } from '@/types/analyzer';
import { analyzeDependencies, checkVersionCompatibility } from '../dependencyManager';

export function analyzeDependencies(packageJson: any): DependencyAnalysis {
  const dependencies = analyzeDependencies(packageJson);
  const compatibility = checkVersionCompatibility(dependencies);
  
  return {
    dependencies,
    compatibility
  };
}
