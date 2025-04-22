
interface CICDTemplate {
  platform: 'vercel' | 'netlify' | 'github' | 'gitlab';
  config: string;
  filename: string;
}

export const generateVercelConfig = (): CICDTemplate => ({
  platform: 'vercel',
  filename: 'vercel.json',
  config: JSON.stringify({
    "buildCommand": "vite build",
    "devCommand": "vite",
    "framework": null,
    "installCommand": "npm install",
    "outputDirectory": "dist"
  }, null, 2)
});

export const generateNetlifyConfig = (): CICDTemplate => ({
  platform: 'netlify',
  filename: 'netlify.toml',
  config: `[build]
  command = "vite build"
  publish = "dist"
  
[dev]
  command = "vite"
  framework = "#custom"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`
});

export const generateGithubWorkflow = (): CICDTemplate => ({
  platform: 'github',
  filename: '.github/workflows/deploy.yml',
  config: `name: Deploy
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Test
      run: npm test
      
    - name: Deploy
      if: github.ref == 'refs/heads/main'
      run: npm run deploy`
});

export const generateCICDTemplates = () => {
  return {
    vercel: generateVercelConfig(),
    netlify: generateNetlifyConfig(),
    github: generateGithubWorkflow()
  };
};
