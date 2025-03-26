#!/bin/bash

echo "Creating frontend deployment package for Netlify..."

# Create deployment directory
mkdir -p netlify-deploy

# Copy only frontend files
cp *.html netlify-deploy/
cp *.css netlify-deploy/
cp *.js netlify-deploy/ 
cp netlify.toml netlify-deploy/
cp -r assets netlify-deploy/ 2>/dev/null || true

# Exclude Python and backend files explicitly
rm -f netlify-deploy/*.py netlify-deploy/requirements.txt
rm -f netlify-deploy/render.yaml netlify-deploy/wsgi.py
rm -rf netlify-deploy/models

# Create a zip file for easy upload
cd netlify-deploy
zip -r ../netlify-frontend.zip .
cd ..

echo "====================================="
echo "Netlify frontend package created: netlify-frontend.zip"
echo ""
echo "To deploy to Netlify with GitHub:"
echo "1. Push your code to GitHub"
echo "2. Go to app.netlify.com and sign in"
echo "3. Click 'Add new site' > 'Import an existing project'"
echo "4. Select your GitHub repository"
echo "5. Configure build settings:"
echo "   - Build command: node netlify-build.js"
echo "   - Publish directory: ./"
echo "6. Add environment variable API_URL with your backend URL"
echo "7. Click 'Deploy site'"
echo "=====================================" 