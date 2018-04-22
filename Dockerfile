# Aplicacion basada en Node.js Version 8.11.1
FROM node:8.11.1
# Actualiza paquetes
RUN apt-get update && apt-get install -y \
    curl \
    gcc-4.9 \
    libxml2 \ 
    sensible-utils
# Setea el directorio de trabajo a /app
WORKDIR /app
# Copiar el compilado del proyecto a /app
ADD /bundle /app
# Instala los modulos de npm
RUN (cd /app/programs/server && npm install)
# Expone el puerto 8080 para acceder a la aplicacion
EXPOSE 8080
# Variables de Entorno
ENV MONGO_URL=mongodb://leonardoespinosa:Leonardo2503@cl-i4t-tst-shard-00-00-pgydc.mongodb.net:27017,cl-i4t-tst-shard-00-01-pgydc.mongodb.net:27017,cl-i4t-tst-shard-00-02-pgydc.mongodb.net:27017/test?ssl=true&replicaSet=cl-i4t-tst-shard-0&authSource=admin
ENV ROOT_URL=http://app.comeygana.com
ENV MAIL_URL=smtp://postmaster%40sandbox95e176686a5c4d7a9e057c9b830aa52b.mailgun.org:9e00683bdf7a01bc8061e7d28be6afd5@smtp.mailgun.org:587
ENV METEOR_SETTINGS='{"oneSignal": {"apiKey": "ZWE4MTM3ZjMtOTk5Ni00ZmExLWFhZWEtMjAyNThjMjk1YmUw","appId": "d0d0fcd1-ed5a-4f7c-84e2-271fe9a553aa"},"facebook": {"appId": "128565331134597","secret": "4df3e77e25eb20be5cf4554352c520cf"},"public": {"facebook": {"permissions": ["basic_info","user_interests","user_activities","read_friendlists"],"profileFields": ["name","gender","location"]},"filepicker": {"key": "Ap3hOg05TtWuYxXU4E2gJz","security": {"policy": "eyJtaW5TaXplIjoiMSIsIm1heFNpemUiOiIxMDQ4NTc2IiwiY2FsbCI6WyJwaWNrIl19","signature": "2a1fa9ed15d987fd62f2134b481b0307120664e8f2534967e585892858fce95b"}},"custpayinfo": {"al": "pRRXKOl8ikMmt9u","ak": "4Vj8eK4rloUd272L48hsrarnUA","mi": "508029","ai": "512321"}}}'
ENV PORT=8080
# Ejecutar el comando node main.js
CMD node /app/main.js