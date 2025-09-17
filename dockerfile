# Use official Node.js LTS
FROM node:20

# Create app directory
WORKDIR /opt/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy build output
COPY build/ ./

# Copy logs folder
COPY logs/ ./logs/

# Expose app port
EXPOSE 4000

# Start app
CMD ["node", "build.js"]
