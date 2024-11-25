const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configurar headers de seguridad
app.use(helmet());

// Limitar peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite por IP
});

app.use(limiter); 