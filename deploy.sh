#!/bin/bash

# Verificar el entorno
if [ "$NODE_ENV" = "production" ]; then
    echo "Ejecutando en modo producción..."
    npm run render-build
    npm start
else
    echo "Ejecutando en modo desarrollo..."
    # Obtener la IP local
    IP=$(ipconfig getifaddr en0 || hostname -I | awk '{print $1}')

    # Actualizar .env.production con la IP local
    echo "REACT_APP_API_URL=http://$IP:4000" > frontend/.env.production
    echo "REACT_APP_VERSION=1.0.0" >> frontend/.env.production

    # Construir el frontend
    echo "Construyendo el frontend..."
    cd frontend
    npm install
    npm run build

    # Mover al backend
    echo "Preparando el backend..."
    cd ../backend
    npm install

    # Mostrar información de acceso
    echo "==================================="
    echo "Aplicación desplegada!"
    echo "Accede localmente en: http://localhost:4000"
    echo "Accede desde otros dispositivos en: http://$IP:4000"
    echo "==================================="

    # Iniciar el servidor
    npm start
fi 