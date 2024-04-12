FROM node:18-alpine
# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies for server and client
RUN yarn install

COPY . .
ENV NODE_ENV=production

RUN npx prisma generate

# Build the client and the server
RUN yarn build:prod 


ENV PORT=8001

# Expose the desired port for the server
EXPOSE 8001

# Set the command to start both server and client
CMD ["yarn",  "start:migrate:prod"]