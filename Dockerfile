#instrucciones para crear la aplicacion como una imagen

FROM node:22-alpine 

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

EXPOSE 3000