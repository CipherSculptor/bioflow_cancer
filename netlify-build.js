const fs = require('fs');
const path = require('path');

// Read the netlify-env.js file
const envFilePath = path.join(__dirname, 'netlify-env.js');
let envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Replace placeholder with actual environment variable
if (process.env.API_URL) {
  console.log(`Setting API URL to: ${process.env.API_URL}`);
  // Replace the entire line that defines apiUrl
  envFileContent = envFileContent.replace(
    /const apiUrl = .*$/m, 
    `const apiUrl = '${process.env.API_URL}';  // Injected by Netlify build`
  );
} else {
  console.warn('⚠️ API_URL environment variable is not set. Using default value.');
}

// Write back to the file
fs.writeFileSync(envFilePath, envFileContent);

console.log('✅ Environment variables injected into netlify-env.js'); 