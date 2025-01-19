# Use Node.js 20.13.1 as the base image
FROM node:20.13.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the backend server port
EXPOSE 8081

# Start the backend server
CMD ["npm", "run", "dev"]