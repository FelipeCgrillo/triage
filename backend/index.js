const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3000',
  'https://tu-frontend-en-render.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Aquí irán tus otras rutas...

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
