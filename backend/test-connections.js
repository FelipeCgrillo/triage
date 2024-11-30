require('dotenv').config();
const mongoose = require('mongoose');
const { OpenAI } = require('openai');

async function testConnections() {
  try {
    // Test MongoDB
    console.log('Probando conexión a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado correctamente');

    // Test OpenAI
    console.log('Probando conexión a OpenAI...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    await openai.models.list();
    console.log('✅ OpenAI conectado correctamente');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en las conexiones:', error);
    process.exit(1);
  }
}

testConnections(); 