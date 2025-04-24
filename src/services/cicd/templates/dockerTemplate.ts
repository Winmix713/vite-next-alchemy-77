
import { CICDTemplate } from '@/types/cicd';

export const generateDockerConfig = (): CICDTemplate[] => {
  return [
    {
      platform: 'docker',
      filename: 'Dockerfile',
      description: 'Docker configuration for Vite application',
      config: `FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`
    },
    {
      platform: 'docker',
      filename: 'docker-compose.yml',
      description: 'Docker Compose configuration for development environment',
      config: `version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped`
    }
  ];
};
