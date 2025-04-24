export interface ConversionOptions {
  useReactRouter: boolean;
  convertApiRoutes: boolean;
  transformDataFetching: boolean;
  replaceComponents: boolean;
  updateDependencies: boolean;
  preserveTypeScript: boolean;
  handleMiddleware: boolean;
}

export interface ConversionState {
  isConverting: boolean;
  conversionOptions: ConversionOptions;
  progress: number;
  message: string;
  projectData?: {
    files: File[];
    packageJson?: any;
  };
  originalCode?: string;
  convertedCode?: string;
  conversionResult?: any;
  conversionError?: string;
}

export interface ConversionContextType {
  state: ConversionState;
  dispatch: (action: any) => void;
  toggleOption: (option: keyof ConversionOptions) => void;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
  createdAt: number;
  lastLogin: number;
}

export interface UserPreferences {
  defaultConversionOptions: ConversionOptions;
  defaultTheme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  experimentalFeaturesEnabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  collaborators?: CollaboratorInfo[];
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  stats?: {
    filesCount: number;
    conversionRate: number;
    lastConversion?: ConversionMetrics;
  };
}

export interface CollaboratorInfo {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'viewer' | 'editor' | 'admin';
  addedAt: number;
}

export interface ConversionHistory {
  id: string;
  projectId: string;
  timestamp: number;
  conversionOptions: ConversionOptions;
  metrics: ConversionMetrics;
  userId: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  content: string;
  timestamp: number;
  filePath?: string;
  lineNumber?: number;
  resolved: boolean;
  replies?: Comment[];
}

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

export interface RouteConversionResult {
  path: string;
  isDynamic: boolean;
  transformedCode: string;
  appliedTransformations: string[];
}

export interface CICDIntegration {
  provider: 'github' | 'gitlab' | 'azure' | 'aws' | 'vercel' | 'netlify';
  projectId: string;
  repositoryUrl: string;
  branch: string;
  credentials: {
    type: 'oauth' | 'token' | 'ssh';
    value: string;
  };
  webhookUrl?: string;
  lastSync?: number;
  status: 'connected' | 'disconnected' | 'error';
}

export interface DeploymentConfig {
  provider: 'vercel' | 'netlify' | 'aws' | 'github' | 'custom';
  settings: Record<string, any>;
  environmentVariables: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
}
