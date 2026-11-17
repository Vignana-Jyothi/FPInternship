FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite reads these from a .env file at build time (not from the shell env),
# so bake the per-environment values passed in as build args into one here.
# This overwrites the dev-default client/.env that ships in the repo.
ARG VITE_BACKEND_PORT
ARG VITE_CLIENT_PORT
ARG VITE_BACKEND_URL
ARG VITE_ADMIN_BASE_URL
ARG VITE_INTERNSHIP_BASE_URL
ARG VITE_AUTH_BASE_URL
ARG VITE_GUEST_BASE_URL
ARG VITE_ORG_BASE_URL
ARG VITE_USER_BASE_URL

RUN printf '%s\n' \
    "VITE_BACKEND_PORT=${VITE_BACKEND_PORT}" \
    "VITE_CLIENT_PORT=${VITE_CLIENT_PORT}" \
    "VITE_BACKEND_URL=${VITE_BACKEND_URL}" \
    "VITE_ADMIN_BASE_URL=${VITE_ADMIN_BASE_URL}" \
    "VITE_INTERNSHIP_BASE_URL=${VITE_INTERNSHIP_BASE_URL}" \
    "VITE_AUTH_BASE_URL=${VITE_AUTH_BASE_URL}" \
    "VITE_GUEST_BASE_URL=${VITE_GUEST_BASE_URL}" \
    "VITE_ORG_BASE_URL=${VITE_ORG_BASE_URL}" \
    "VITE_USER_BASE_URL=${VITE_USER_BASE_URL}" \
    > .env

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
