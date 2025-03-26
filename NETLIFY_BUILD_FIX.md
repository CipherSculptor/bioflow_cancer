# Fixing Netlify Build Failures

If you're experiencing "Failed to install dependencies" errors in Netlify, follow these steps to fix it.

## Step 1: Use the Simplified Build Script

We've created a simplified build script (`fix-build.js`) that doesn't rely on external dependencies and should work in any Netlify environment.

## Step 2: Update Your Repository

1. Make sure these files are in your repository with the latest versions:
   - `netlify.toml` - Using the simplified build command
   - `fix-build.js` - The simplified build script
   - `package.json` - With the correct Node.js version

2. Commit these changes to your repository:
   ```bash
   git add netlify.toml fix-build.js package.json
   git commit -m "Fix Netlify build issues with simplified build process"
   git push
   ```

## Step 3: Netlify Settings

1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Build & deploy" > "Environment"
3. Add or verify these environment variables:
   - `API_URL` = `https://bioflow.onrender.com`
   - `NODE_VERSION` = `16`
4. Go to "Build & deploy" > "Continuous Deployment"
5. Verify build settings:
   - Build command: `node fix-build.js`
   - Publish directory: `./`

## Step 4: Trigger a New Build

1. Go to the "Deploys" tab
2. Click "Trigger deploy" > "Clear cache and deploy site"

## Step 5: Review Build Logs

If you still encounter errors:
1. Click on the failing deploy
2. Click "View detailed log"
3. Look for specific error messages to address

## Alternative: Manual Deployment

If the build issues persist, you can always use your manual zip deployment method:

1. Go to your Netlify dashboard
2. Click "Deploy manually" in the Deploys tab
3. Upload your `netlify-clean.zip` file
4. Set environment variables after deployment

## Technical Background

The simplified build script (`fix-build.js`) does the following:
1. Creates or updates the `netlify-env.js` file with the correct API URL
2. Ensures the `window.netlifyEnv` object is correctly defined
3. Removes any Python files that might be causing issues
4. Uses only built-in Node.js modules to avoid dependency problems

This approach is more reliable than trying to install npm dependencies during the build. 