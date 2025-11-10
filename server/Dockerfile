# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=builder /app/node_modules ./node_modules

# Copiar el resto del código
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
