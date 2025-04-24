
import { DependencyAnalysis } from '@/types/analyzer';
import { DependencyChange } from '@/types/conversion';
import { processDependencies, checkVersionCompatibility } from '../dependencyManager';

export function analyzeDependencyChanges(packageJson: any): DependencyAnalysis {
  const dependencies = processDependencies(packageJson);
  const compatibility = checkVersionCompatibility(dependencies);
  
  return {
    dependencies,
    compatibility
  };
}
