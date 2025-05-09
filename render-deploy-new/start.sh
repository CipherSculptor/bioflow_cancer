#!/bin/bash

# Ensure the models directory exists
mkdir -p models

# Print working directory and list files for debugging
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Start the application
echo "Starting the application..."
python -m gunicorn api:app --log-level debug
