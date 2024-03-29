# Use official Node.js image as the base image
FROM node:16.0.0-alpine

# Set working directory
WORKDIR /app

# Copy the rest of the application
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 4005

# Command to run the application
CMD ["node", "server.js"]
