# Deployment Guide — Bluecoderhub

This document provides instructions for deploying the Bluecoderhub website to various hosting platforms.

## 1. Vercel (Recommended)
The project includes a `vercel.json` file optimized for Single Page Applications (SPA).
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Use the following build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.

## 2. AWS Amplify
1. Navigate to the [AWS Amplify Console](https://console.aws.amazon.com/amplify).
2. Connect your repository.
3. In the build settings, ensure the build command is `npm run build` and the output directory is `dist`.
4. Add a "Rewrite and redirect" rule for SPA routing:
   - Source: `</^[^.]+$|.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|json)$)([^.]+$)/>`
   - Target: `/index.html`
   - Type: `200 (Rewrite)`

## 3. Docker (AWS ECS, DigitalOcean, etc.)
A `Dockerfile` is provided for containerized deployment.
1. Build the image: `docker build -t bluecoderhub:latest .`
2. Run the container: `docker run -p 8080:80 bluecoderhub:latest`
3. Deploy the image to your preferred container registry (ECR, Docker Hub).

## 4. Manual VPS Deployment (Nginx)
1. Run `npm run build` locally or on your server.
2. Upload the contents of the `dist` folder to your web root (e.g., `/var/www/html`).
3. Configure Nginx to handle SPA routing:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
