# SvelteKit (adapter-node) on Node 24.
#
# Node 24 ships `node:sqlite`, so there is no native module to compile and the runtime
# stage needs no build toolchain — just the built server, production deps and static
# assets.

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV CCA_DB_PATH=/data/cca.db

RUN mkdir -p /data && chown -R node:node /data

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "build"]
