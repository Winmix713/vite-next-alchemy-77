
import { CICDIntegration, DeploymentConfig } from '@/types/conversion';
import { generateCICDTemplates, generateEnvironmentVariables } from './cicdGenerator';

export class CICDIntegrationService {
  private static instance: CICDIntegrationService;
  private integrations: CICDIntegration[] = [];

  private constructor() {
    // Load from local storage in demo version
    try {
      const savedIntegrations = localStorage.getItem('cicdIntegrations');
      if (savedIntegrations) {
        this.integrations = JSON.parse(savedIntegrations);
      }
    } catch (error) {
      console.error('Failed to load CICD integrations:', error);
    }
  }

  public static getInstance(): CICDIntegrationService {
    if (!CICDIntegrationService.instance) {
      CICDIntegrationService.instance = new CICDIntegrationService();
    }
    return CICDIntegrationService.instance;
  }

  private saveData(): void {
    localStorage.setItem('cicdIntegrations', JSON.stringify(this.integrations));
  }

  public async createIntegration(
    projectId: string, 
    provider: 'github' | 'gitlab' | 'azure' | 'aws' | 'vercel' | 'netlify',
    repositoryUrl: string,
    branch: string,
    credentialType: 'oauth' | 'token' | 'ssh',
    credentialValue: string
  ): Promise<CICDIntegration> {
    // Check if integration already exists for this project and provider
    const existingIndex = this.integrations.findIndex(
      i => i.projectId === projectId && i.provider === provider
    );

    const integration: CICDIntegration = {
      provider,
      projectId,
      repositoryUrl,
      branch,
      credentials: {
        type: credentialType,
        value: credentialValue
      },
      status: 'connected',
      lastSync: Date.now()
    };

    if (existingIndex >= 0) {
      this.integrations[existingIndex] = integration;
    } else {
      this.integrations.push(integration);
    }

    this.saveData();
    return integration;
  }

  public async getProjectIntegrations(projectId: string): Promise<CICDIntegration[]> {
    return this.integrations.filter(i => i.projectId === projectId);
  }

  public async deleteIntegration(projectId: string, provider: string): Promise<boolean> {
    const initialLength = this.integrations.length;
    this.integrations = this.integrations.filter(
      i => !(i.projectId === projectId && i.provider === provider)
    );
    this.saveData();
    return this.integrations.length < initialLength;
  }

  public async generateDeploymentFiles(
    provider: 'github' | 'gitlab' | 'azure' | 'aws' | 'vercel' | 'netlify' | 'docker'
  ): Promise<any> {
    // Get the templates for the specified provider
    const templates = generateCICDTemplates();
    const providerTemplate = templates[provider];
    
    // Get environment variables for the provider
    const envVars = generateEnvironmentVariables(provider);
    
    return {
      templates: providerTemplate,
      environmentVariables: envVars
    };
  }

  public async createDeploymentConfig(
    projectId: string,
    provider: 'vercel' | 'netlify' | 'aws' | 'github' | 'custom',
    settings: Record<string, any>,
    environmentVariables: Record<string, string>,
    buildCommand?: string,
    outputDirectory?: string
  ): Promise<DeploymentConfig> {
    const config: DeploymentConfig = {
      provider,
      settings,
      environmentVariables,
      buildCommand,
      outputDirectory
    };
    
    // In a real app, this would be saved to a backend API
    // For demo purposes, we'll just return the config
    
    return config;
  }

  public async triggerDeployment(projectId: string, provider: string): Promise<{
    success: boolean;
    deploymentUrl?: string;
    message: string;
  }> {
    // In a real app, this would trigger a deployment via API
    // For demo purposes, we'll just simulate a deployment
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      deploymentUrl: `https://${projectId}-${Math.floor(Math.random() * 1000)}.example.com`,
      message: `Deployment to ${provider} completed successfully`
    };
  }
}

// React hook for using CICD integrations
import { useState, useEffect } from 'react';

export const useCICDIntegration = (projectId: string) => {
  const cicdService = CICDIntegrationService.getInstance();
  const [integrations, setIntegrations] = useState<CICDIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntegrations = async () => {
      if (projectId) {
        setLoading(true);
        try {
          const projectIntegrations = await cicdService.getProjectIntegrations(projectId);
          setIntegrations(projectIntegrations);
        } catch (error) {
          console.error('Failed to load CICD integrations:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setIntegrations([]);
        setLoading(false);
      }
    };

    loadIntegrations();
  }, [projectId]);

  return {
    integrations,
    loading,
    createIntegration: cicdService.createIntegration.bind(cicdService),
    deleteIntegration: cicdService.deleteIntegration.bind(cicdService),
    generateDeploymentFiles: cicdService.generateDeploymentFiles.bind(cicdService),
    createDeploymentConfig: cicdService.createDeploymentConfig.bind(cicdService),
    triggerDeployment: cicdService.triggerDeployment.bind(cicdService)
  };
};
