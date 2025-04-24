
export interface CICDTemplate {
  platform: 'vercel' | 'netlify' | 'github' | 'gitlab' | 'azure' | 'aws' | 'docker';
  config: string;
  filename: string;
  description: string;
}

export interface Environment {
  name: string;
  variables: Record<string, string>;
  description?: string;
}

export interface DeploymentOptions {
  platform: string;
  config: Record<string, any>;
  environment: Environment;
}
