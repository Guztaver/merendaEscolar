FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application logic if needed, but for dev we usually just serve
# The host check is important for Docker
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
