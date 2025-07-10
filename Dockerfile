FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

COPY run-migrations.sh .
RUN chmod +x run-migrations.sh

EXPOSE 15550
CMD ["sh", "./run-migrations.sh"]
