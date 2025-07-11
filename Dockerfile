FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install  --legacy-peer-deps

COPY . .

ENV NODE_ENV=production
ENV NEXTAUTH_SECRET=7caa68c0b037ff7f2c72c97d367bde6214b0cac5f49e919b99d887f0a3b47a56
ENV NEXTAUTH_URL=http://13.61.8.56
ENV API_BASE_URL=http://13.61.8.56

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
