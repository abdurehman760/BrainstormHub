# Use official Node.js image with version 20.18.0
FROM node:20.18.0

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy .env file for environment variables
COPY .env ./

# Install dependencies
RUN npm install

# Copy the prisma directory into the container (prisma schema file is inside this directory)
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port that your app will run on (e.g., 3000)
EXPOSE 3000

# Run the app
CMD ["node", "dist/main"]
