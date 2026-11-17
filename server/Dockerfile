FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p uploads && chown -R node:node /app

USER node
ENV NODE_ENV=production

EXPOSE 6131

CMD ["node", "server.js"]
