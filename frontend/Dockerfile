FROM node:20 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV VITE_API_URL=http://65.0.31.24:5000

RUN npm run build

# Production stage
FROM node:20

WORKDIR /usr/src/app

RUN npm install -g serve

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
