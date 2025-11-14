#!/bin/bash

echo "Building Waxy Discord Bot..."

# Build TypeScript
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed! Please check for TypeScript errors."
    exit 1
fi

echo "Build successful! Deploying to AWS..."

# Deploy using Serverless Framework
npm run deploy

echo "Deployment complete!"
chmod +x deploy.sh