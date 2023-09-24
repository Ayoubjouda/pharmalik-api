FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies for server and client
RUN npm install

COPY . .

# Build the client and the server
RUN npm run build 



# Expose the desired port for the server
EXPOSE 8001

# Set the command to start both server and client
CMD ["npm", "run", "start:prod"]