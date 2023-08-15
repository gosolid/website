FROM --platform=linux/amd64 node:lts-alpine AS build

RUN apk add --no-cache git py-pip make g++

WORKDIR /app

COPY package.json /app/package.json
RUN yarn install --frozen-lockfile

COPY . /app/.
RUN yarn build

FROM --platform=$BUILDPLATFORM node:lts-alpine

WORKDIR /www

COPY --from=build /app/build /www

RUN yarn global add serve

CMD ["serve", "-p", "80"]
