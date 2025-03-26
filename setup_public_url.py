import os
import json
from ngrok import ngrok

# Start ngrok tunnels for both the API and web server
api_tunnel = ngrok.connect(5070, "http")
web_tunnel = ngrok.connect(8000, "http")

print("\n" + "="*80)
print("PUBLIC URLS FOR YOUR APPLICATION:")
print("="*80)
print(f"Web Application URL: {web_tunnel.url()}")
print(f"API Server URL: {api_tunnel.url()}")
print("="*80)

# Update the dashboard.js file to use the public API URL
api_public_url = api_tunnel.url()
dashboard_js_path = 'dashboard.js'

with open(dashboard_js_path, 'r') as file:
    content = file.read()

# Replace localhost URLs with public URL
updated_content = content.replace('http://localhost:5070/test', f'{api_public_url}/test')
updated_content = updated_content.replace('http://localhost:5070/predict', f'{api_public_url}/predict')

with open(dashboard_js_path, 'w') as file:
    file.write(updated_content)

# Update the test_api.html file
test_api_path = 'test_api.html'

with open(test_api_path, 'r') as file:
    content = file.read()

# Replace localhost URL with public URL
updated_content = content.replace('http://localhost:5070/test', f'{api_public_url}/test')

with open(test_api_path, 'w') as file:
    file.write(updated_content)

print("\nYour application files have been updated to use the public URLs.")
print("Share the Web Application URL with your friends to access your application.")
print("\nPress Ctrl+C to stop the tunnels when you're done sharing.")

try:
    # Keep the script running to maintain the tunnels
    input("\nPress Enter to stop sharing and restore local URLs...\n")
except KeyboardInterrupt:
    pass

# Restore local URLs when done
with open(dashboard_js_path, 'r') as file:
    content = file.read()

# Replace public URLs with localhost URLs
restored_content = content.replace(f'{api_public_url}/test', 'http://localhost:5070/test')
restored_content = restored_content.replace(f'{api_public_url}/predict', 'http://localhost:5070/predict')

with open(dashboard_js_path, 'w') as file:
    file.write(restored_content)

# Restore test_api.html
with open(test_api_path, 'r') as file:
    content = file.read()

# Replace public URL with localhost URL
restored_content = content.replace(f'{api_public_url}/test', 'http://localhost:5070/test')

with open(test_api_path, 'w') as file:
    file.write(restored_content)

print("Local URLs have been restored.")
ngrok.disconnect()
print("Tunnels closed.") 