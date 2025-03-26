# Netlify Deployment Guide

## Fixing pkgutil AttributeError During Deployment

If you're encountering the error `AttributeError` related to the `pkgutil` module stating that it does not have an attribute 'ImpImporter', suggesting 'zipimporter' instead, follow these steps to fix it:

## Solution

The error occurs because Netlify's build system is trying to process Python files, which are not needed for the frontend deployment. We need to create a clean deployment without Python dependencies.

### Step 1: Use the Clean Deployment Package

We've created a clean deployment package without Python files named `netlify-clean.zip`. This package contains only the frontend files needed for deployment.

### Step 2: Manual Deployment to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in
2. Click "Add new site" > "Deploy manually"
3. Drag and drop the `netlify-clean.zip` file
4. Wait for the deployment to complete

### Step 3: Configure Environment Variables

1. After deployment, go to "Site settings" > "Build & deploy" > "Environment"
2. Add the environment variable:
   - Name: `API_URL`
   - Value: `https://bioflow.onrender.com` (or your backend URL)
3. Click "Save"

### Step 4: Disable Python Build Plugins (if enabled)

1. Go to "Site settings" > "Build & deploy" > "Build settings"
2. Make sure no Python-related build plugins are enabled
3. If there are any, disable them

### Step 5: Trigger a New Deployment

1. Go to the "Deploys" tab
2. Click "Trigger deploy" > "Clear cache and deploy site"

## For Future Deployments

To avoid this issue in future deployments, always use the provided `netlify-deploy-fix.sh` script to create clean deployment packages:

```bash
./netlify-deploy-fix.sh
```

This script will:
1. Create a clean deployment directory
2. Copy only required frontend files
3. Exclude all Python files and dependencies
4. Create a zip file ready for deployment

## GitHub Continuous Deployment

If you're using GitHub for continuous deployment with Netlify:

1. Ensure your `.netlify.json` file is in the repository
2. Configure your Netlify site settings to use the `netlify-build.js` script
3. Set the environment variables as described above
4. Make sure the `netlify.toml` file is properly configured to exclude Python files

## Technical Details

The error occurs because Netlify's build system is detecting Python files and trying to install pip dependencies, but there's an incompatibility with the `pkgutil` module. By completely removing Python files from the deployment, we avoid this issue entirely.

Our solution focuses on creating a pure frontend deployment with only JavaScript, HTML, and CSS files needed for the web application. 