FROM node:18

WORKDIR /app

# Install deps
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source files
COPY ./src ./src
COPY ./routes ./routes
COPY ./controllers ./controllers
COPY ./models ./models

# Build TypeScript
RUN npm run build

# Expose your port
EXPOSE 4000

# Run the compiled file
CMD ["node", "dist/src/server.js"]
