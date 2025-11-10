# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Argumentos de construcción para variables de entorno
ARG VITE_API_URL=http://localhost:3000/api

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Crear archivo .env para el build
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
