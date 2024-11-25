require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const compression = require('compression');

// Configurar multer para guardar los archivos temporalmente
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Tipo de archivo recibido:', file.mimetype);
        // Acepta cualquier tipo de audio
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('El archivo debe ser un audio'));
        }
    }
});

const app = express();
app.use(cors());
app.use(express.json());

// Habilitar compresión gzip
app.use(compression());

// Servir archivos estáticos con cache
app.use(express.static('build', {
  maxAge: '1y',
  etag: true,
}));

// Asegurarse de que existe el directorio uploads
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configuración de OpenAI usando la variable de entorno
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY.trim(), // Asegurarse de que no hay espacios
});

const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://mi-app-medica.onrender.com', 'https://*.onrender.com']
        : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

app.post('/analyze-audio', upload.single('file'), async (req, res) => {
    try {
        console.log('Procesando archivo de audio...');
        console.log('Archivo recibido:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ningún archivo de audio' });
        }

        // Verificar que el archivo existe
        if (!fs.existsSync(req.file.path)) {
            return res.status(500).json({ error: 'No se pudo acceder al archivo de audio' });
        }

        console.log('Iniciando transcripción...');
        
        try {
            // Transcribir el audio usando OpenAI Whisper (modelo más económico)
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(req.file.path),
                model: "whisper-1",  // Modelo más económico para transcripción
            });
            
            console.log('Transcripción completada:', transcription.text);

            // Analizar el texto con GPT-3.5-turbo (más económico que GPT-4)
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",  // Cambiado de gpt-4 a gpt-3.5-turbo
                messages: [
                    {
                        role: "system",
                        content: "Eres un asistente médico experto. Analiza los síntomas del paciente y proporciona un diagnóstico preliminar, nivel de urgencia y recomendaciones. Estructura tu respuesta en JSON con los campos: diagnosis, urgencyLevel (HIGH/MEDIUM/LOW), y recommendations (array)."
                    },
                    {
                        role: "user",
                        content: `Analiza los siguientes síntomas del paciente: ${transcription.text}`
                    }
                ],
                temperature: 0.7,  // Ajustado para balance entre creatividad y precisión
                max_tokens: 500    // Limitado para reducir costos
            });

            // Parsear la respuesta de GPT-3.5-turbo
            const analysis = JSON.parse(completion.choices[0].message.content);

            // Enviar respuesta
            res.json({
                transcription: transcription.text,
                analysis: analysis
            });

        } catch (openaiError) {
            console.error('Error de OpenAI:', openaiError);
            throw openaiError;
        } finally {
            // Eliminar el archivo temporal
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error al eliminar archivo temporal:', err);
            }
        }

    } catch (error) {
        console.error('Error detallado:', error);
        console.error('Respuesta de error:', error.response?.data);
        res.status(500).json({ 
            error: 'Error al procesar el audio',
            details: error.message,
            openaiError: error.response?.data
        });
    }
});

// Servir archivos estáticos de React
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(path.join(rootDir, 'frontend/build')));

// Manejar todas las rutas que no sean API
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'frontend/build/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    // Muestra la IP local para facilitar el acceso
    const networkInterfaces = require('os').networkInterfaces();
    const ip = Object.values(networkInterfaces)
        .flat()
        .find(details => details.family === 'IPv4' && !details.internal)?.address;
    console.log(`Accede desde otros dispositivos usando: http://${ip}:${PORT}`);
});
