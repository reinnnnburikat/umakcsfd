#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Start Next.js dev server
bunx next dev -p 3000 2>&1 | tee dev.log
