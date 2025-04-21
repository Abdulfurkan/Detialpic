# Vercel Deployment Guide for DetailCraft

This guide provides instructions for deploying the DetailCraft product details app to Vercel.

## Prerequisites

- A Vercel account
- Git installed on your machine
- Node.js installed on your machine

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Navigate to your project directory and run:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your deployment:
   - Set up and deploy "~/Documents/productdetials"? `Y`
   - Link to an existing project? `N` (for first deployment)
   - What's your project's name? `detailpic` (or your preferred name)
   - In which directory is your code located? `./` (default)
   - Want to override the settings? `N` (default settings are fine)

5. Wait for the deployment to complete. Vercel will provide you with a URL to your deployed app.

### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/detailpic.git
   git push -u origin main
   ```

2. Log in to your Vercel dashboard: https://vercel.com/dashboard

3. Click "New Project" and select your GitHub repository

4. Configure your project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (leave as default)
   - Output Directory: (leave as default)

5. Click "Deploy" and wait for the deployment to complete

## Environment Variables

If you need to add any environment variables for your project, you can do so in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add any required environment variables

## Troubleshooting

If you encounter issues with the web scraping functionality:

1. Check the Vercel function logs in your dashboard
2. Ensure the serverless function timeout is sufficient (you may need to upgrade your plan for longer timeouts)
3. Consider using a headless browser service like Browserless.io for more complex scraping needs

## Updating Your Deployment

To update your deployment after making changes:

1. Push your changes to GitHub (if using GitHub integration)
2. Or run `vercel` again from your project directory (if using CLI)

Vercel will automatically build and deploy your updated application.
