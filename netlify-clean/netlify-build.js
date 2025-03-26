const fs = require('fs-extra');
const path = require('path');
const https = require('https');

console.log('Starting Netlify build process...');

// Function to exclude Python files and directories
const excludePythonFiles = () => {
  console.log('Ensuring no Python files are included in the build...');
  const pythonPatterns = ['*.py', '__pycache__', 'requirements.txt', 'models', '*.csv'];
  
  pythonPatterns.forEach(pattern => {
    const files = fs.readdirSync('.').filter(file => 
      file.endsWith('.py') || 
      file === '__pycache__' || 
      file === 'requirements.txt' || 
      file === 'models' || 
      file.endsWith('.csv')
    );
    
    files.forEach(file => {
      try {
        fs.removeSync(file);
        console.log(`Removed: ${file}`);
      } catch (err) {
        console.warn(`Warning: Could not remove ${file}. Error: ${err.message}`);
      }
    });
  });
};

// Function to check if the API is reachable
const checkApiEndpoint = (url) => {
  return new Promise((resolve, reject) => {
    console.log(`Checking API endpoint: ${url}`);
    
    https.get(url, (res) => {
      console.log(`API status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        console.warn(`⚠️ API returned status code ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.warn(`⚠️ API check failed: ${err.message}`);
      resolve(false);
    });
  });
};

// Read the netlify-env.js file
try {
  const envFilePath = path.join(__dirname, 'netlify-env.js');
  let envFileContent = fs.readFileSync(envFilePath, 'utf8');

  // Replace placeholder with actual environment variable
  if (process.env.API_URL) {
    console.log(`Setting API URL to: ${process.env.API_URL}`);
    
    // Try to check if the API is accessible
    checkApiEndpoint(`${process.env.API_URL}/test`).then(isAccessible => {
      if (!isAccessible) {
        console.warn(`⚠️ API at ${process.env.API_URL} seems to be unavailable. Deployment will continue but the app might not work.`);
      } else {
        console.log(`✅ API at ${process.env.API_URL} is accessible.`);
      }
    }).catch(err => {
      console.warn(`⚠️ Error checking API: ${err.message}`);
    });
    
    // Replace the entire line that defines apiUrl
    envFileContent = envFileContent.replace(
      /const apiUrl = .*$/m, 
      `const apiUrl = '${process.env.API_URL}';  // Injected by Netlify build`
    );
    
    // Make sure we're setting the window.netlifyEnv variable
    if (!envFileContent.includes('window.netlifyEnv')) {
      envFileContent += `\n\n// Make the API URL available to the website\nwindow.netlifyEnv = {\n  API_URL: apiUrl\n};`;
    }
  } else {
    console.warn('⚠️ API_URL environment variable is not set. Using default value.');
  }

  // Write back to the file
  fs.writeFileSync(envFilePath, envFileContent);
  console.log('✅ Environment variables injected into netlify-env.js');
  
  // Make sure no Python files are included
  excludePythonFiles();
  
  console.log('✅ Netlify build completed successfully');
} catch (error) {
  console.error('❌ Error during Netlify build:', error.message);
  process.exit(1);
} 