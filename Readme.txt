Para crear un pipeline en GitHub Actions para el repositorio "calendario", el cual incluye un backend de festivos, otro backend de calendario con tipos, y dos bases de datos (MongoDB y PostgreSQL), sigue estos pasos detallados:

1. Configuración de Docker Hub
Generar un Token de Acceso
Inicia sesión en Docker Hub.
Navega a Account Settings.
En la sección Security, selecciona New Access Token.
Asigna un nombre descriptivo al token y selecciona los permisos necesarios.
Genera el token y cópialo.
2. Configuración de Secretos en GitHub
Añadir Secretos en GitHub
Navega a tu repositorio en GitHub.
Ve a Settings > Secrets and variables > Actions.
Añade los siguientes secretos:
DOCKER_USERNAME: Tu nombre de usuario de Docker Hub.
DOCKER_PASSWORD: El token de acceso generado en Docker Hub.
3. Estructura de Docker
Crear Dockerfiles
Asegúrate de tener Dockerfiles para cada backend.

Dockerfile para el backend de festivos (backend-festivos/Dockerfile):

dockerfile
Copiar código
# Usa una imagen base oficial de Python o Node.js, según el lenguaje usado
FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
Dockerfile para el backend de calendario (backend-calendario/Dockerfile):

dockerfile
Copiar código
# Usa una imagen base oficial de Python o Node.js, según el lenguaje usado
FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]
Crear el Archivo Docker Compose
Archivo docker-compose.yml:

yaml
Copiar código
version: '3.8'

services:
  backend-festivos:
    build:
      context: ./backend-festivos
    ports:
      - "8001:8001"
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://mongo:27017/festivos
    networks:
      - app-network

  backend-calendario:
    build:
      context: ./backend-calendario
    ports:
      - "8002:8002"
    depends_on:
      - postgres
    environment:
      - POSTGRES_URL=postgres://postgres:password@postgres:5432/calendario
    networks:
      - app-network

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    networks:
      - app-network

  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: calendario
    ports:
      - "5432:5432"
    networks:
      - app-network

networks:
  app-network:
4. Configuración del Pipeline en GitHub Actions
Crear el Directorio del Workflow
Crea el directorio .github/workflows/ en el directorio raíz de tu repositorio.

Crear el Archivo de Configuración del Workflow
Archivo .github/workflows/docker-ci.yml:

yaml
Copiar código
name: Docker CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Check out the repo
        uses: actions/checkout@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image for backend-festivos
        uses: docker/build-push-action@v2
        with:
          context: ./backend-festivos
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/backend-festivos:latest

      - name: Build and push Docker image for backend-calendario
        uses: docker/build-push-action@v2
        with:
          context: ./backend-calendario
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/backend-calendario:latest

      - name: Set up Docker Compose
        run: |
          docker-compose up -d
5. Confirmar y Empujar los Cambios
Agregar y confirmar los archivos:

sh
Copiar código
git add .
git commit -m "Setup GitHub Actions with Docker CI/CD pipeline"
Empujar los cambios al repositorio:

sh
Copiar código
git push origin main
6. Verificar la Ejecución del Pipeline
Ir a la pestaña Actions:

Navega a la pestaña Actions en tu repositorio en GitHub.
Verificar el workflow:

Aquí deberías ver tu pipeline ejecutándose cada vez que haces un push a la rama main.
Resumen
Configurar Docker Hub y crear un token.
Añadir secretos en GitHub (DOCKER_USERNAME, DOCKER_PASSWORD).
Crear Dockerfiles para cada backend (backend-festivos y backend-calendario).
Configurar docker-compose.yml para los servicios.
Crear el archivo de workflow de GitHub Actions (.github/workflows/docker-ci.yml).
Confirmar y empujar los cambios al repositorio.
Verificar la ejecución del pipeline en la pestaña Actions.
Siguiendo estos pasos detallados, podrás configurar un pipeline en GitHub Actions para tu proyecto "calendario" con Docker y Docker Compose.