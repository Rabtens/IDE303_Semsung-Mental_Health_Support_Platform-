FROM node:20-alpine AS frontend-build
WORKDIR /app/react-app
COPY react-app/package*.json ./
RUN npm ci
COPY react-app/ ./
ARG REACT_APP_SUPABASE_URL=https://example.supabase.co
ARG REACT_APP_SUPABASE_ANON_KEY=ci-placeholder-key
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
RUN npm run build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY app.js server-react.js mindful_chat.html ./
COPY src ./src
COPY --from=frontend-build /app/react-app/build ./react-app/build
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=3000
ENV DATA_DIR=/app/data
EXPOSE 3000
CMD ["node", "server-react.js"]
