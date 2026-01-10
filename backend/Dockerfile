FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./

# Install ALL dependencies including devDependencies for build
RUN npm ci --include=dev

COPY . .

# Build the application
RUN npm run build

# Verify dist exists
RUN ls -la dist/

EXPOSE 3000
CMD ["node", "dist/main.js"]
