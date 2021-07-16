# syntax=docker/dockerfile:1.2
FROM node:16 as build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml .
COPY .yarn .yarn
RUN rm -rf .yarn/install-state.gz .yarn/cache .yarn/unplugged
RUN --mount=type=cache,target=./.yarn/cache
RUN yarn
COPY .git .git
RUN git checkout -- . && \
    ./update-icon.sh && \
    yarn compile && \
    yarn build

FROM node:16 as deployer
RUN apt-get update && apt-get install -y awscli && apt-get clean
WORKDIR /app
COPY --from=build /app/build /app/build
COPY Deployfile Deployfile
ENTRYPOINT ["make", "-f", "Deployfile"]

FROM nginx:latest as server
COPY --from=build /app/build /usr/share/nginx/html