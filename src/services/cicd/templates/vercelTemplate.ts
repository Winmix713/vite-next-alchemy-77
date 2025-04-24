
import { CICDTemplate } from '@/types/cicd';

export const generateVercelConfig = (): CICDTemplate => ({
  platform: 'vercel',
  filename: 'vercel.json',
  description: 'Vercel Platform configuration for Vite project',
  config: JSON.stringify({
    "buildCommand": "vite build",
    "devCommand": "vite",
    "framework": null,
    "installCommand": "npm install",
    "outputDirectory": "dist",
    "routes": [
      { "src": "/(.*\\.[a-z0-9]+$)", "dest": "/$1" },
      { "src": "/(.*)", "dest": "/index.html" }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" }
        ]
      },
      {
        "source": "/assets/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      }
    ]
  }, null, 2)
});
