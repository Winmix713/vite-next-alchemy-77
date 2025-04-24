
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

// New interfaces for statistics and reporting
export interface ConversionMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  filesProcessed: number;
  filesConverted: number;
  successRate: number;
  errorCount: number;
  warningCount: number;
}

export interface ConversionReport {
  metrics: ConversionMetrics;
  summary: string;
  details: {
    components: AnalyzerComponent[];
    routing: RoutingAnalysis;
    dependencies: DependencyAnalysis;
    errors: string[];
    warnings: string[];
  };
}

export interface ProjectSnapshot {
  id: string;
  name: string;
  timestamp: number;
  analysis: CodebaseAnalysis;
  metrics?: ConversionMetrics;
}
