FROM node:18-alpine AS base
WORKDIR /usr/src/app
RUN npm i -g npm@8

FROM base as builder
COPY ./src ./src
COPY ./package*.json ./
COPY ./tsconfig.json .
RUN npm pkg delete scripts.prepare
RUN npm ci
RUN npm run build

FROM base AS app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci
USER node
CMD exec node --no-warnings --experimental-specifier-resolution=node .
