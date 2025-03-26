# Netlify Deployment Checklist

Use this checklist to ensure your GitHub-to-Netlify deployment works without errors.

## Required Files Check

Make sure these essential files are in your repository:

- [ ] `netlify.toml` - Contains build settings and redirects
- [ ] `netlify-build.js` - Your build script that sets environment variables
- [ ] `netlify-env.js` - File to expose environment variables to the browser
- [ ] All HTML, CSS, and JS files for your frontend
- [ ] `assets/` directory with all images and other static assets
- [ ] `.gitignore` file (to exclude unnecessary files)

## Files to Exclude

Make sure these are either excluded via `.gitignore` or removed from your repository:

- [ ] `*.py` files (Python backend files not needed for frontend)
- [ ] `__pycache__/` directory
- [ ] `models/` directory
- [ ] Any large data files (CSV, etc.)
- [ ] Zip files from previous deployments

## Configuration Check

Verify your `netlify.toml` has these settings:

```toml
[build]
  publish = "./"
  command = "node netlify-build.js"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  API_URL = "https://bioflow.onrender.com"
  PYTHON_USED = "false"
```

## Package.json Check

Ensure your `package.json` includes all required dependencies:

```json
{
  "dependencies": {
    "fs-extra": "^11.1.1",
    "path": "^0.12.7"
  }
}
```

## Pre-Deployment Test

Before connecting to Netlify:

1. Make sure all changes work locally
2. Run `node netlify-build.js` locally to check for any errors
3. Open your HTML files in a browser to ensure they load correctly

## Common Issues and Solutions

1. **API Connection Errors**
   - Ensure `netlify-env.js` is properly configuring `window.netlifyEnv`
   - Make sure CORS is enabled on your backend API

2. **Build Errors**
   - Check Netlify build logs for specific error messages
   - Verify all necessary Node.js dependencies are in package.json

3. **Deployment Issues**
   - Make sure build command and publish directory are set correctly
   - Check that environment variables are properly configured

## Safeguards

To protect against errors:

1. **Keep a backup** of your working deployment files
2. **Enable preview deployments** in Netlify to test changes before they go live
3. **Make incremental changes** rather than large overhauls
4. **Maintain your manual deployment process** as a fallback option

## Manual Override Option

If continuous deployment encounters issues, you can always:

1. Go to Netlify Dashboard
2. Select your site
3. Go to "Deploys" tab
4. Click "Deploy manually"
5. Drag and drop your `netlify-clean.zip` file 