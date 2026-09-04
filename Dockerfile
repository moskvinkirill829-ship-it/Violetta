# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm install

COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# только прод-зависимости сервера
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
RUN npm install --omit=dev --workspace server

# собранные артефакты
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
