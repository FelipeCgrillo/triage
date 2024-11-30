#!/bin/bash

# Crear estructura del proyecto
mkdir medical-triage-app
cd medical-triage-app
mkdir frontend backend

# Configurar backend
cd backend
npm init -y
npm install express mongoose multer openai cors dotenv recharts @mui/x-date-pickers

# Crear directorios necesarios
mkdir uploads models routes

# Configurar frontend
cd ../frontend
npx create-react-app .
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios react-router-dom recharts @mui/x-date-pickers

# Crear archivo .env
cd ../backend
echo "PORT=3001
MONGODB_URI=mongodb://localhost:27017/medical-triage
OPENAI_API_KEY=tu_api_key_aqui" > .env

# Crear directorio uploads
mkdir uploads

echo "Configuración completada. Por favor:
1. Actualiza OPENAI_API_KEY en backend/.env
2. Inicia MongoDB
3. Ejecuta 'npm start' en frontend y backend"