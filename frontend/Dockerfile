# Use Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . ./

# Expose the default React dev server port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
