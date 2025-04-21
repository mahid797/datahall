# Base image
FROM node:23-slim AS base
ENV APP_HOME=/usr/src/app

FROM base AS builder
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR $APP_HOME
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS development
ENV NODE_ENV=development
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR $APP_HOME
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
WORKDIR $APP_HOME
COPY --from=builder $APP_HOME/.next ./.next
COPY --from=builder $APP_HOME/public ./public
COPY --from=builder $APP_HOME/node_modules ./node_modules
COPY --from=builder $APP_HOME/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
