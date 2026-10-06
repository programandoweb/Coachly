FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

# Valores públicos integrados por Next.js durante `npm run build`.
# Pueden sobrescribirse mediante --build-arg.
ARG NEXT_PUBLIC_LARAVEL_API_URL=https://backend.brianhenao.programandoweb.net/api/v1
ARG NEXT_PUBLIC_APP_URL=https://brianhenao.programandoweb.net
ARG NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME=migo_fit_bearer_token
ARG NEXT_PUBLIC_FIT_DEBUG_API=false

ENV NEXT_PUBLIC_LARAVEL_API_URL=${NEXT_PUBLIC_LARAVEL_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME=${NEXT_PUBLIC_FIT_BROWSER_TOKEN_COOKIE_NAME}
ENV NEXT_PUBLIC_FIT_DEBUG_API=${NEXT_PUBLIC_FIT_DEBUG_API}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

EXPOSE 3000
CMD ["npm", "run", "start"]


#docker system prune -a
#chmod +x start.sh
#npm run build
#sudo docker build -t programandoweb/migo-fit-frontend:frontend .
#sudo docker run -d --name migo-fit-frontend-frontend  -p3055:3000 --restart=always programandoweb/migo-fit-frontend:frontend


#sudo docker push programandoweb/migo-fit-frontend:frontend
#sudo docker pull programandoweb/migo-fit-frontend:frontend


#sudo docker stop migo-fit-frontend
#sudo docker rm migo-fit-frontend