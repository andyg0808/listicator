FROM node:16 as build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml .
COPY .yarn .yarn
RUN rm -rf .yarn/install-state.gz .yarn/cache .yarn/unplugged
RUN yarn
COPY .git .git
RUN git checkout -- . && yarn build

FROM node:16 as deployer
RUN apt-get update && apt-get install -y awscli && apt-get clean
COPY --from=build /app/build /app
WORKDIR /app
ENTRYPOINT make
