# Setting Up Continuous Deployment from GitHub to Netlify

This guide will help you set up continuous deployment from GitHub to Netlify, so you won't need to manually upload zip files every time you make changes.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "bioflow-frontend")
4. Choose "Public" or "Private" based on your preference
5. Click "Create repository"

## Step 2: Push Your Code to GitHub

If you're starting from your local files:

```bash
# Initialize Git in your project folder
git init

# Add all files to Git
git add .

# Commit your files
git commit -m "Initial commit"

# Add the GitHub repository as remote
git remote add origin https://github.com/yourusername/bioflow-frontend.git

# Push to GitHub
git push -u origin main
```

## Step 3: Connect Netlify to Your GitHub Repository

1. Go to [Netlify](https://app.netlify.com/) and sign in
2. Click "Add new site" > "Import an existing project"
3. Select "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub repositories if prompted
5. Select your bioflow-frontend repository
6. Configure your build settings:
   - Build command: `node netlify-build.js`
   - Publish directory: `./`
7. Click "Deploy site"

## Step 4: Configure Environment Variables

1. Once deployed, go to "Site settings" > "Build & deploy" > "Environment"
2. Add the environment variable:
   - Name: `API_URL`
   - Value: `https://bioflow.onrender.com` (or your backend URL)
3. Click "Save"

## Step 5: Test Your Continuous Deployment

1. Make a change to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Made changes to XYZ"
   git push
   ```
3. Netlify will automatically detect the change and deploy your update

## Benefits of This Approach

- No need to manually create and upload zip files
- Automatic deployments whenever you push changes to GitHub
- Full deployment history and easy rollbacks
- Ability to set up preview deployments for pull requests
- Better collaboration with team members

## Troubleshooting

If your deployment fails:

1. Check the Netlify deploy logs for errors
2. Verify your build command and settings
3. Make sure your environment variables are correctly set
4. Ensure your repository contains all necessary files

## Additional Netlify Features

- **Deploy Previews**: Every pull request gets its own preview URL
- **Branch Deploys**: Deploy different branches to different URLs
- **Form Handling**: Built-in form submission handling
- **Functions**: Serverless functions for backend logic
- **Analytics**: Basic analytics for your site 