FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY packages ./packages
COPY apps ./apps

RUN bun install

WORKDIR /app/apps/gateway

EXPOSE 3000

CMD ["bun", "src/index.ts"]
