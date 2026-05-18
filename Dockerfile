FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Docker-only fix: change Vite version inside container, not in your real company file
RUN npm pkg set devDependencies.vite="^7.3.3"

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]