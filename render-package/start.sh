#!/bin/bash

# Ensure the models directory exists
mkdir -p models

# Copy CSV file to the expected location (if it's not there)
# Render will copy all files in your project directory to the deployment
echo "Starting the application..."

# Run with gunicorn 
gunicorn wsgi:app 