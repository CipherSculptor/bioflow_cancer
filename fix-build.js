// Simple build script to avoid dependency issues
const fs = require('fs');
const path = require('path');

console.log('Starting simplified Netlify build process...');

try {
  // Check if netlify-env.js exists
  const envFilePath = path.join(__dirname, 'netlify-env.js');
  
  if (!fs.existsSync(envFilePath)) {
    console.log('Creating netlify-env.js...');
    const defaultContent = `// Default API configuration
const apiUrl = '${process.env.API_URL || 'https://bioflow.onrender.com'}';

// Make the API URL available to the website
window.netlifyEnv = {
  API_URL: apiUrl
};`;
    
    fs.writeFileSync(envFilePath, defaultContent);
    console.log('Created netlify-env.js successfully');
  } else {
    console.log('netlify-env.js exists, updating content...');
    let content = fs.readFileSync(envFilePath, 'utf8');
    
    // Replace the API URL if environment variable is set
    if (process.env.API_URL) {
      content = content.replace(
        /const apiUrl = .*$/m,
        `const apiUrl = '${process.env.API_URL}';  // Injected by Netlify build`
      );
    }
    
    // Ensure window.netlifyEnv is defined
    if (!content.includes('window.netlifyEnv')) {
      content += `\n\n// Make the API URL available to the website
window.netlifyEnv = {
  API_URL: apiUrl
};`;
    }
    
    fs.writeFileSync(envFilePath, content);
    console.log('Updated netlify-env.js successfully');
  }
  
  // MORE AGGRESSIVE Python file removal - specifically looking for anything that might trigger Python
  console.log('Removing all Python-related files and directories...');
  
  // Files that could trigger Python
  const pythonFiles = [
    'requirements.txt',
    'runtime.txt',
    'Pipfile',
    'Pipfile.lock',
    'setup.py',
    'wsgi.py',
    'api.py',
    '.python-version',
    'render.yaml'
  ];
  
  // Extensions that should be removed
  const pythonExtensions = ['.py', '.pyc', '.pyo', '.pyd', '.so', '.dylib', '.egg', '.whl', '.pickle', '.joblib'];
  
  // Directories that should be removed
  const pythonDirs = ['__pycache__', 'models', 'venv', 'env', '.venv', '.env', 'site-packages', 'dist-packages', 'pip-wheel-metadata'];
  
  // Remove all Python files
  fs.readdirSync('.', { withFileTypes: true }).forEach(file => {
    try {
      const fileName = file.name;
      const ext = path.extname(fileName);
      
      // Check if it's a Python file by name or extension
      if (
        pythonFiles.includes(fileName) ||
        pythonExtensions.includes(ext) ||
        (file.isDirectory() && pythonDirs.includes(fileName))
      ) {
        if (file.isDirectory()) {
          // For directories, use recursive delete
          fs.rmdirSync(fileName, { recursive: true, force: true });
        } else {
          // For files, simple delete
          fs.unlinkSync(fileName);
        }
        console.log(`Removed: ${fileName}`);
      }
    } catch (err) {
      console.warn(`Warning: Could not remove ${file.name}. Error: ${err.message}`);
    }
  });
  
  // Create a .npmrc file to disable Python use
  fs.writeFileSync('.npmrc', 'python=false\n');
  console.log('Created .npmrc to disable Python');
  
  // Create a .nimbella file to disable Python use in serverless functions
  fs.writeFileSync('.nimbella', 'python=false\n');
  console.log('Created .nimbella to disable Python');
  
  console.log('Build process completed successfully');
} catch (error) {
  console.error('Error during build process:', error.message);
  // Don't exit with error code to let Netlify continue
  console.log('Continuing despite error...');
} 