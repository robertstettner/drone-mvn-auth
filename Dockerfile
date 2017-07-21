FROM node:6-alpine

WORKDIR /plugin

COPY . /plugin

ENV NODE_ENV production

RUN npm prune && npm install

ENTRYPOINT node /plugin/index.js
