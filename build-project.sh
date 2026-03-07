#!/bin/bash
# Project Builder Script

echo "Creating project..."
# In this environment, the project is already created.

echo "Installing dependencies..."
npm install

echo "Starting development server..."
npm run dev
