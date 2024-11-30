import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Box, 
  CircularProgress, 
  Alert,
  Snackbar,
  Typography,
  IconButton,
  LinearProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import WaveSurfer from 'wavesurfer.js';
import VolumeVisualizer from './VolumeVisualizer';
import ResultadoAnalisis from './ResultadoAnalisis';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (audioBlob && waveformRef.current) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a9eff',
        progressColor: '#1976d2',
        cursorColor: '#1976d2',
        height: 50,
        normalize: true,
      });

      wavesurferRef.current.loadBlob(audioBlob);
      
      wavesurferRef.current.on('finish', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioBlob]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setResultado(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
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
        setAudioStream(null);
      };

      recorder.onerror = (event) => {
        setError('Error en la grabación: ' + event.error);
        stopRecording();
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
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
      } catch (error) {
        console.error('Error al detener la grabación:', error);
        setError('Error al detener la grabación');
      }
    }
  };

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioBlob(null);
    setResultado(null);
  };

  const enviarAudio = async () => {
    if (!audioBlob) return;

    try {
      setIsProcessing(true);
      setError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('http://localhost:3001/api/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Error al enviar el audio:', error);
      setError('Error al procesar el audio: ' + error.message);
    } finally {
      setIsProcessing(false);
      setUploadProgress(100);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', my: 4 }}>
        {isRecording && (
          <Typography variant="h6" color="error" gutterBottom>
            Grabando: {formatTime(recordingTime)}
          </Typography>
        )}

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

        {audioStream && <VolumeVisualizer stream={audioStream} />}

        {audioBlob && !isRecording && (
          <Box sx={{ mt: 3 }}>
            <div ref={waveformRef} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton 
                onClick={togglePlayback}
                color="primary"
              >
                {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
              </IconButton>
              
              <IconButton 
                onClick={handleDelete}
                color="error"
              >
                <DeleteIcon />
              </IconButton>

              <Button
                variant="contained"
                onClick={enviarAudio}
                disabled={isProcessing}
              >
                Analizar Audio
              </Button>
            </Box>
          </Box>
        )}

        {isProcessing && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
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