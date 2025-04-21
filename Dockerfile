# Base image
FROM node:23-slim AS base
ENV APP_HOME=/usr/src/app
WORKDIR $APP_HOME

# Dev and Build Dependencies
FROM base AS deps
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

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

# Development stage
FROM deps AS development
ENV NODE_ENV=development

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

ENV NODE_ENV=production
WORKDIR $APP_HOME

COPY --from=builder $APP_HOME/.next ./.next
COPY --from=builder $APP_HOME/public ./public
COPY --from=deps $APP_HOME/node_modules ./node_modules
COPY --from=deps $APP_HOME/package.json ./package.json
COPY --from=deps $APP_HOME/prisma ./prisma
COPY --from=deps $APP_HOME/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["npm", "start"]
