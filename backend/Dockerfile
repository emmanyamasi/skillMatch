# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only package.json and lockfile first (to leverage Docker cache)
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the app
COPY . .

# Expose your port
EXPOSE 5000

# Start your app
CMD ["pnpm", "start:dev"]
