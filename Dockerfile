FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files from verification folder
COPY verification/package*.json ./

# Install dependencies (if any)
RUN npm install --omit=dev

# Copy application code from verification folder
COPY verification/app.js ./

# Copy views from verification folder
COPY verification/views ./views

# Copy static files
COPY verification/public ./public

# Copy .env file if it exists (optional)
COPY verification/.env* ./

# Make app.js executable
RUN chmod +x app.js

# Expose port (optional, for future use)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
  
  