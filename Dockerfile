FROM node:20-alpine AS root-deps
WORKDIR /app
COPY package.json package-lock*.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=root-deps /app/node_modules ./node_modules
COPY --from=frontend-deps /app/frontend/node_modules ./frontend/node_modules
COPY . .
RUN npm --prefix frontend run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=root-deps /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
EXPOSE 8080
CMD ["node", "backend/src/server.js"]
