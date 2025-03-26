#!/bin/bash

echo "Creating clean Netlify deployment package..."

# Create a clean deployment directory
rm -rf netlify-deploy
mkdir -p netlify-deploy

# Copy only required frontend files
cp *.html netlify-deploy/
cp *.css netlify-deploy/
cp *.js netlify-deploy/
cp netlify.toml netlify-deploy/
cp .netlify.json netlify-deploy/
cp -r assets netlify-deploy/ 2>/dev/null || true

# Explicitly exclude any Python files and dependencies
echo "Removing any Python-related files..."
rm -f netlify-deploy/*.py
rm -f netlify-deploy/requirements.txt
rm -f netlify-deploy/render.yaml
rm -f netlify-deploy/wsgi.py
rm -rf netlify-deploy/__pycache__
rm -rf netlify-deploy/models
rm -f netlify-deploy/*.csv

# Create deployment package
cd netlify-deploy
zip -r ../netlify-clean.zip .
cd ..

echo "====================================="
echo "Clean Netlify package created: netlify-clean.zip"
echo ""
echo "To deploy to Netlify:"
echo "1. Go to app.netlify.com and sign in"
echo "2. Click 'Add new site' > 'Deploy manually'"
echo "3. Drag and drop the 'netlify-clean.zip' file"
echo "4. After deployment, go to 'Site settings' > 'Build & deploy' > 'Environment'"
echo "5. Add environment variable API_URL: https://bioflow.onrender.com"
echo "6. Make sure no Python build plugins are enabled in Netlify settings"
echo "=====================================" 

# Make the script executable
chmod +x netlify-deploy-fix.sh 