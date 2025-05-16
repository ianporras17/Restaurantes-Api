# Restaurantes-Api
API REST para la gestión de reservas en restaurantes, implementando autenticación con JWT, contenedorización con Docker y pruebas unitarias.


# 🍽️ Reserva Inteligente de Restaurantes

[![CI/CD](https://github.com/ianporras17/Restaurantes-Api/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ianporras17/Restaurantes-Api/actions)
[![Docker Image](https://img.shields.io/badge/ghcr.io-restaurantes--api-blue?logo=docker)](https://github.com/ianporras17/Restaurantes-Api/pkgs/container/restaurantes-api)



## ⚙️ Tecnologías utilizadas

- Node.js + Express  
- PostgreSQL  
- Sequelize ORM  
- JWT para autenticación  
- Docker / Docker Compose  
- GitHub Actions (CI/CD)  
- Jest + Supertest (Testing)  

---

## 🚀 Cómo levantar el proyecto

### 🔸 Opción: Con Docker (⚡ Recomendado)

> **No necesitas instalar Node ni PostgreSQL**. Solo tener Docker y Docker Compose.

#### 🔧 Paso 1: Clonar el repositorio

```bash
git clone https://github.com/ianporras17/Restaurantes-Api.git
cd Restaurantes-Api
```

#### 🧾 Paso 2: (opcional) Crear archivo `.env`

Este paso es opcional. La imagen ya incluye configuración por defecto.  
Pero si deseas personalizar el entorno:

```bash
cp .env.example .env
```

#### 🐳 Paso 3: Ejecutar el sistema

```bash
docker compose pull        # Descarga la imagen del backend desde GHCR
docker compose up          # Levanta la API y la base de datos
```

## 🧪 Ejecutar pruebas

Este proyecto incluye pruebas unitarias y de integración con Jest y Supertest.

### ▶️ Ejecutar pruebas con cobertura

```bash
npm test
```
---

## 🐳 Imagen Docker pública (GHCR)

La imagen se publica automáticamente en:

```
ghcr.io/ianporras17/restaurantes-api:latest
```

Puedes usarla directamente con:

```bash
docker pull ghcr.io/ianporras17/restaurantes-api:latest
```

🔗 Ver en GitHub Container Registry:  
[https://github.com/ianporras17/Restaurantes-Api/pkgs/container/restaurantes-api](https://github.com/ianporras17/Restaurantes-Api/pkgs/container/restaurantes-api)


Puedes ver los resultados en:  
👉 [https://github.com/ianporras17/Restaurantes-Api/actions](https://github.com/ianporras17/Restaurantes-Api/actions)


