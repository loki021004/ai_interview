# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of backend files
COPY . .

# Expose backend port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
