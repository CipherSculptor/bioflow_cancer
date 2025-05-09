#!/bin/bash

# Ensure the models directory exists
mkdir -p models

# Print working directory and list files for debugging
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Install specific package versions to ensure compatibility
echo "Installing compatible packages..."
pip install werkzeug==2.2.3

# Start the application
echo "Starting the application..."
# Use the PORT environment variable provided by Render
gunicorn --log-level debug --bind 0.0.0.0:$PORT wsgi:app