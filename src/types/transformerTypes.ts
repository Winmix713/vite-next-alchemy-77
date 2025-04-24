
export interface TransformationRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  category: 'component' | 'routing' | 'data-fetching' | 'api' | 'config' | 'general';
}

export interface TransformResult {
  transformedCode: string;
  appliedTransformations: string[];
}

// New interfaces for enhanced transformation capabilities
export interface TransformerConfig {
  rules: TransformationRule[];
  customRules?: TransformationRule[];
  options: {
    enableLogging: boolean;
    preserveComments: boolean;
    formatting: 'preserve' | 'prettier' | 'none';
    astTransformEnabled: boolean;
  };
}

export interface FileTransformResult extends TransformResult {
  filePath: string;
  original: string;
  success: boolean;
  errors?: string[];
  warnings?: string[];
  performance?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

export interface TransformerPlugin {
  name: string;
  description: string;
  version: string;
  transformers: Record<string, (code: string, options?: any) => TransformResult>;
  rules: TransformationRule[];
}
