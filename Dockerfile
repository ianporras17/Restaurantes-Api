# Imagen base
FROM node:20

# Carpeta de trabajo
WORKDIR /app

# Copiar archivos
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
