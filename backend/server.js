const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { OpenAI } = require('openai');
require('dotenv').config();
const fs = require('fs');
const Caso = require('./models/Caso');
const estadisticasRouter = require('./routes/estadisticas');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/estadisticas', estadisticasRouter);

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB'))
  .catch(err => {
    console.error('Error al conectar con MongoDB:', err);
    process.exit(1);
  });

// Agregar listener para errores de conexión
mongoose.connection.on('error', err => {
  console.error('Error de MongoDB:', err);
});

// Configuración OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Prueba de conexión
openai.models.list()
  .then(() => console.log('Conexión exitosa con OpenAI'))
  .catch(err => {
    console.error('Error al conectar con OpenAI:', err);
    process.exit(1);
  });

// Asegurarnos que el directorio uploads existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para archivos de audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Verificar el tipo de archivo
    if (file.mimetype === 'audio/webm' || file.mimetype === 'audio/wav') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado. Use audio/webm o audio/wav'));
    }
  }
});

// Ruta para procesar audio
app.post('/api/analyze-audio', upload.single('audio'), async (req, res) => {
  try {
    console.log('1. Recibiendo solicitud de audio...');
    
    if (!req.file) {
      console.error('No se recibió archivo de audio');
      return res.status(400).json({ error: 'No se recibió archivo de audio' });
    }

    console.log('2. Archivo recibido:', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Verificar que el archivo existe
    if (!fs.existsSync(req.file.path)) {
      throw new Error('El archivo no se guardó correctamente');
    }

    console.log('3. Iniciando transcripción con OpenAI...');
    const transcripcion = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });

    console.log('4. Transcripción completada:', transcripcion.text);

    console.log('5. Iniciando análisis con GPT...');
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres un asistente médico. Analiza los síntomas y proporciona una respuesta en formato JSON con la siguiente estructura exacta:
          {
            "nivelUrgencia": "bajo|medio|alto",
            "analisis": "descripción detallada del análisis",
            "recomendaciones": "lista de recomendaciones específicas"
          }`
        },
        {
          role: "user",
          content: transcripcion.text
        }
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('6. Respuesta de GPT recibida');

    let analisisGPT;
    try {
      console.log('7. Parseando respuesta:', completion.choices[0].message.content);
      analisisGPT = JSON.parse(completion.choices[0].message.content.trim());
      
      if (!analisisGPT.nivelUrgencia || !analisisGPT.analisis || !analisisGPT.recomendaciones) {
        throw new Error('Respuesta incompleta de GPT');
      }
    } catch (error) {
      console.error('Error al parsear respuesta de GPT:', error);
      throw new Error('Error al procesar la respuesta del análisis');
    }

    console.log('8. Guardando caso en la base de datos...');
    const nuevoCaso = new Caso({
      audioUrl: req.file.path,
      transcripcion: transcripcion.text,
      sintomas: transcripcion.text,
      nivelUrgencia: analisisGPT.nivelUrgencia.toLowerCase(),
      analisis: analisisGPT.analisis,
      recomendaciones: analisisGPT.recomendaciones
    });

    await nuevoCaso.save();
    console.log('9. Caso guardado correctamente');

    // Limpieza del archivo
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error al eliminar archivo temporal:', err);
    });

    console.log('10. Enviando respuesta al cliente');
    res.json({
      id: nuevoCaso._id,
      transcripcion: transcripcion.text,
      analisis: analisisGPT
    });

  } catch (error) {
    console.error('Error detallado:', error);
    console.error('Stack trace:', error.stack);
    
    // Limpiar el archivo si existe
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error al eliminar archivo temporal:', err);
      });
    }
    
    // Enviar un mensaje de error más detallado al cliente
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      stack: error.stack
    });
  }
});

// Agregar ruta para obtener casos
app.get('/api/casos', async (req, res) => {
  try {
    const casos = await Caso.find().sort({ fechaCreacion: -1 });
    res.json(casos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar ruta para actualizar caso
app.put('/api/casos/:id', async (req, res) => {
  try {
    const { estado, descripcion } = req.body;
    const caso = await Caso.findById(req.params.id);
    
    if (!caso) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    caso.estado = estado;
    caso.actualizaciones.push({
      fecha: new Date(),
      descripcion,
      nuevoEstado: estado
    });

    await caso.save();
    res.json(caso);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 