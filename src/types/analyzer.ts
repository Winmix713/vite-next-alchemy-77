
export interface AnalyzerComponent {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  components: AnalyzerComponent[];
}

export interface CodebaseAnalysis {
  totalFiles: number;
  jsFiles: number;
  tsFiles: number;
  reactComponents: number;
  hooks: number;
  cssFiles: number;
  apiRoutes: number;
  nextjsFeatureUsage: Record<string, number>;
}

export interface DependencyAnalysis {
  dependencies: any[];
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
}

export interface RoutingAnalysis {
  routes: any[];
  dynamicRoutes: number;
  complexRoutes: number;
}
