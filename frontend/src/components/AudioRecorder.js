import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  Snackbar 
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import ResultadoAnalisis from './ResultadoAnalisis';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Verificar si el navegador soporta el formato webm
      const mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error('Formato de audio no soportado en este navegador');
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      const audioChunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        setAudioBlob(audioBlob);
        enviarAudio(audioBlob);
      };

      recorder.onerror = (event) => {
        setError('Error en la grabación: ' + event.error);
        stopRecording();
      };

      // Configurar para obtener datos cada 1 segundo
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      console.log('Grabación iniciada');
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      setError(error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      try {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        console.log('Grabación detenida');
      } catch (error) {
        console.error('Error al detener la grabación:', error);
        setError('Error al detener la grabación');
      }
    }
  };

  const enviarAudio = async (blob) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      console.log('Enviando audio al servidor...');
      const response = await fetch('http://localhost:3001/api/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      setResultado(data);
    } catch (error) {
      console.error('Error al enviar el audio:', error);
      setError('Error al procesar el audio: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  return (
    <>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Button
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <MicIcon />}
          onClick={isRecording ? stopRecording : startRecording}
          color={isRecording ? "secondary" : "primary"}
          disabled={isProcessing}
        >
          {isProcessing ? 'Procesando...' : 
           isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
        </Button>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <ResultadoAnalisis resultado={resultado} />
    </>
  );
};

export default AudioRecorder; 