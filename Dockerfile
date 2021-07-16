# syntax=docker/dockerfile:1.2
FROM node:16 as build
USER node
WORKDIR /app
COPY --chown=node:node package.json yarn.lock .yarnrc.yml .
COPY --chown=node:node .yarn .yarn
RUN rm -rf .yarn/install-state.gz .yarn/cache .yarn/unplugged
RUN yarn
COPY --chown=node:node .git .git
RUN git checkout -- . && \
    ./update-icon.sh && \
    yarn compile && \
    yarn build

FROM node:16 as deployer
RUN apt-get update && apt-get install -y awscli && apt-get clean
USER node
WORKDIR /app
COPY --from=build /app/build /app/build
COPY Deployfile Deployfile
ENTRYPOINT ["make", "-f", "Deployfile"]

FROM nginx:latest as server
COPY --from=build /app/build /usr/share/nginx/html