# Dev образ
FROM node:22-alpine AS development

WORKDIR /app

# Копируем package.json и lock файлы
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/

# Устанавливаем зависимости
RUN npm install --prefix apps/server

# Копируем весь проект
COPY . .

CMD ["npm", "run", "dev", "--prefix", "apps/server"]

# Prod образ
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY --from=development /app .

RUN npm run build --prefix apps/server

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

CMD ["node", "apps/server/build/server.js"]