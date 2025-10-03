FROM node:20-alpine

WORKDIR /app

# Instala dependencias necesarias
RUN apk add --no-cache libc6-compat

# Copia archivos de dependencias
COPY frontend/package.json frontend/package-lock.json* ./

# Instala dependencias
RUN npm install --legacy-peer-deps

# Copia el código fuente del frontend
COPY frontend .

# Construye la aplicación
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para producción
CMD ["npm", "start"]