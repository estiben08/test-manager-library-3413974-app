FROM node:24-alpine

WORKDIR /app

# We use volumes for code, just providing a default command
CMD sh -c "npm install && npm run dev -- --host 0.0.0.0"
