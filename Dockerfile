# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build your TypeScript application
RUN npm run build

# The application's port (adjust if your app uses a different port)
EXPOSE 4000

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "dist/index.js" ]