
import { CICDTemplate } from '@/types/cicd';
import { generateVercelConfig } from './templates/vercelTemplate';
import { generateNetlifyConfig } from './templates/netlifyTemplate';
import { generateGithubWorkflow } from './templates/githubTemplate';
import { generateDockerConfig } from './templates/dockerTemplate';
import { generateEnvironmentVariables } from './environmentManager';

export const generateCICDTemplates = () => {
  const templates: Record<string, CICDTemplate | CICDTemplate[]> = {
    vercel: generateVercelConfig(),
    netlify: generateNetlifyConfig(),
    github: generateGithubWorkflow(),
    docker: generateDockerConfig()
  };
  
  return templates;
};

export { generateEnvironmentVariables };
