# Dev образ
FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/

RUN npm install

COPY . .

WORKDIR /app/apps/client
CMD ["npm", "run", "dev"]

# Prod образ
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=development /app .

RUN npm run build --prefix apps/client

ENV NODE_ENV=production

CMD ["npm", "run", "start", "--prefix", "apps/client"]