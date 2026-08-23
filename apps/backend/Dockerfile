FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci

COPY apps/backend apps/backend
COPY packages/shared-types packages/shared-types
RUN npx prisma generate --schema apps/backend/prisma/schema.prisma
RUN npm run build --workspace=@autobroker/backend

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma && node apps/backend/dist/main.js"]
