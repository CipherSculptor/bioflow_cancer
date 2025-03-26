## Step 4: Configure Environment Variables

After the initial deployment completes:

1. Go to "Site settings" > "Build & deploy" > "Environment"
2. Add the following environment variable:
   - **API_URL**: The URL where your Flask API is deployed (e.g., `https://bioflow-api.onrender.com`)

This environment variable is crucial as it tells your frontend application where to find your API. Without setting this, your app will try to use the local development server URL (http://localhost:5070) which won't work in production.

## Step 5: Trigger a Rebuild

After setting up the environment variable:

1. Go to the "Deploys" tab
2. Click "Trigger deploy" and select "Clear cache and deploy site"
3. Wait for the deployment to complete 