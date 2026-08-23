FROM node:20-alpine AS build

WORKDIR /app
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci

COPY apps/frontend apps/frontend
COPY packages/shared-types packages/shared-types
RUN npm run build --workspace=@autobroker/frontend

FROM nginx:1.27-alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
