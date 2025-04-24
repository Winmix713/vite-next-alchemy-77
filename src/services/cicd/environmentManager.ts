
export const generateEnvironmentVariables = (platform: string): Record<string, string> => {
  const commonVars = {
    'NODE_ENV': 'production',
    'VITE_APP_VERSION': '1.0.0',
  };
  
  switch (platform) {
    case 'vercel':
      return {
        ...commonVars,
        'VERCEL_PROJECT_ID': 'your-vercel-project-id',
        'VERCEL_ORG_ID': 'your-vercel-org-id'
      };
    case 'netlify':
      return {
        ...commonVars,
        'NETLIFY_AUTH_TOKEN': 'your-netlify-auth-token',
        'NETLIFY_SITE_ID': 'your-netlify-site-id'
      };
    case 'github':
      return {
        ...commonVars,
        'GITHUB_TOKEN': '${{ secrets.GITHUB_TOKEN }}'
      };
    case 'aws':
      return {
        ...commonVars,
        'AWS_ACCESS_KEY_ID': 'your-aws-access-key',
        'AWS_SECRET_ACCESS_KEY': 'your-aws-secret-key',
        'AWS_REGION': 'us-east-1'
      };
    default:
      return commonVars;
  }
};
