# Use Node.js 20.13.1 as the base image
FROM node:20.13.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the port the frontend development server runs on
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev"]