
import { CICDTemplate } from '@/types/cicd';

export const generateNetlifyConfig = (): CICDTemplate => ({
  platform: 'netlify',
  filename: 'netlify.toml',
  description: 'Netlify configuration file for Vite project',
  config: `[build]
  command = "vite build"
  publish = "dist"
  
[dev]
  command = "vite"
  framework = "#custom"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[functions]
  directory = "netlify/functions"
  
[build.environment]
  NODE_VERSION = "18"
`
});
