FROM node:10-alpine

WORKDIR /plugin

COPY . /plugin

ENV NODE_ENV production

RUN npm ci

ENTRYPOINT node /plugin/index.js
