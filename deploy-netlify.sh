#!/bin/bash

echo "Creating frontend deployment package for Netlify..."

# Create deployment directory
mkdir -p netlify-deploy

# Copy all necessary frontend files
cp *.html netlify-deploy/
cp *.css netlify-deploy/
cp *.js netlify-deploy/
cp netlify.toml netlify-deploy/
cp -r assets netlify-deploy/ 2>/dev/null || true

# Create a zip file for easy upload
cd netlify-deploy
zip -r ../netlify-package.zip .
cd ..

echo "====================================="
echo "Netlify deployment package created: netlify-package.zip"
echo ""
echo "To deploy to Netlify:"
echo "1. Go to app.netlify.com and sign in"
echo "2. Click 'Add new site' > 'Deploy manually'"
echo "3. Drag and drop the 'netlify-package.zip' file"
echo "4. After deployment, go to 'Site settings' > 'Build & deploy' > 'Environment'"
echo "5. Add environment variable API_URL: https://bioflow.onrender.com"
echo "6. Trigger a rebuild: 'Deploys' tab > 'Trigger deploy' > 'Clear cache and deploy site'"
echo "=====================================" 