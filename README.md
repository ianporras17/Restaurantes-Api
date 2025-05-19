# 🚀 Guía para levantar correctamente el proyecto

Este documento explica paso a paso cómo clonar, configurar, desplegar y probar toda la infraestructura del proyecto **Restaurantes API**, incluyendo Redis, ElasticSearch, MongoDB/PostgreSQL, CI/CD, Nginx, y más.


En caso de no poder clonar el repositorio se cuenta con la carpeta con el código
por lo que puede pasar al paso 3 de una vez.
---

## 🧩 Paso 1: Clonar el repositorio

```bash
git clone https://github.com/ianporras17/Restaurantes-Api.git
cd Restaurantes-Api
```

---

## ⚙️ Paso 2: Configurar archivo `.env`

Antes de levantar cualquier contenedor, configura tus variables de entorno:

```bash
cp .env.example .env
```

Edita la línea:

```env
DB_ENGINE=postgres
```

Y cámbiala por `mongo` si deseas usar MongoDB.

> 📌 **IMPORTANTE:** Solo debe haber una base de datos activa a la vez.

---

## 🛠️ Paso 3: Elegir una opción de despliegue

### Opción 1: Usar imagen desde GitHub Container Registry (recomendado para producción)

1. Asegúrate de estar logueado en GHCR:

```bash
echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

*(Reemplaza `CR_PAT` por tu token personal y `USERNAME` por tu usuario de GitHub)*

2. Ejecuta:

```bash
docker pull ghcr.io/ianporras17/restaurantes-api:latest
docker compose up
```

---

### Opción 2: Levantar todo localmente con Docker Compose (recomendada para desarrollo)

```bash
# (1) Si DB_ENGINE = mongo
docker compose -f mongo-cluster/docker-compose.mongo.yml up -d
# Espera al menos 2 minutos para replicación y sharding

# (2) Levanta el resto del sistema (API, Redis, Elastic, Nginx, etc.)
docker compose up -d
```

---

## 🔎 Paso 4: Probar las rutas en Postman o navegador

Una vez todo está arriba, accede a `http://localhost` y prueba las siguientes rutas:

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PUT /users/:id`
- `DELETE /users/:id`
- `POST /restaurants`
- `GET /restaurants`
- `POST /menus`
- `GET /menus/:id`
- `PUT /menus/:id`
- `DELETE /menus/:id`
- `POST /reservations`
- `DELETE /reservations/:id`
- `POST /orders`
- `GET /orders/:id`

---

## ✅ Paso 5: Verificar ejecución de GitHub Actions

Haz un cambio en tu código y empújalo a `main`:

```bash
git add .
git commit -m "testing actions"
git push origin main
```

Esto activará el pipeline CI/CD y lo podrás ver en la pestaña **"Actions"** de tu repositorio.

---

## 🍃 Paso 6: Verificar replicación y sharding de MongoDB (si usas Mongo)

```bash
# Ver estado del sharding
docker exec -it mongos mongosh --host mongos --eval "sh.status()"

# Ver estado de la replicación
docker exec -it mongo1 mongosh --eval "rs.status()"
```

---

## 🔁 Paso 7: Cambiar entre PostgreSQL y MongoDB

```bash
# 1. Detener contenedores
docker compose down

# 2. Editar el archivo .env
DB_ENGINE=mongo  # o postgres

# 3. Levantar contenedores nuevamente
```

---

## 🔍 Paso 8: Probar microservicio de búsqueda con ElasticSearch

Prueba estas rutas desde Postman o navegador:

- `GET /search/products?q=pizza`
- `GET /search/products/category/Menu`
- `POST /search/reindex`

📌 Accede vía `http://localhost/search/...`

---

## ⚡ Paso 9: Verificar funcionamiento de Redis

Redis se usa automáticamente en:

- `GET /menus/:id`
- `GET /orders/:id`

La primera consulta será más lenta, las siguientes instantáneas.

Para ver las claves en Redis:

```bash
docker exec -it redis redis-cli
```

Dentro del cliente:

```bash
KEYS *
```

Verás claves como `menu:123` o `search:q:pizza` si Redis se usó correctamente.

---

## ⚖️ Paso 10: Verificar el balanceador de carga con Nginx

El archivo `nginx.conf` enruta las peticiones:

| Ruta              | Servicio interno              |
|-------------------|-------------------------------|
| `/search/*`       | `search-service` (puerto 4000)|
| Todo lo demás     | `restaurantes-api` (puerto 3000) |

Nginx escucha en el **puerto 80**, así que puedes acceder a todo el sistema desde `http://localhost/...` sin preocuparte por los puertos internos.

---

## 🧪 Paso 11: Ejecutar todos los tests (Mongo + Postgres)

Con los contenedores de Mongo y Postgres activos:

```bash
npm run test
```

Esto ejecuta:

- `test:pg`: pruebas con PostgreSQL  
- `test:mongo`: pruebas con MongoDB  
- Genera reporte de cobertura automática de código.

---

¡Y listo! Tu sistema está completamente operativo, probado, cacheado, balanceado y listo para escalar 🚀
