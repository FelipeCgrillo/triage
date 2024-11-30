import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip,
  Divider,
  CircularProgress 
} from '@mui/material';

const colorUrgencia = {
  bajo: 'success',
  medio: 'warning',
  alto: 'error'
};

const ResultadoAnalisis = ({ resultado }) => {
  if (!resultado) return null;

  // Verificar si el análisis está presente y tiene el formato correcto
  if (!resultado.analisis || typeof resultado.analisis !== 'object') {
    return (
      <Paper sx={{ p: 3, mt: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography color="error">
          Error al procesar el análisis. Por favor, intente nuevamente.
        </Typography>
      </Paper>
    );
  }

  const { nivelUrgencia, analisis, recomendaciones } = resultado.analisis;

  if (!nivelUrgencia || !analisis || !recomendaciones) {
    return (
      <Paper sx={{ p: 3, mt: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography color="error">
          El formato de la respuesta no es válido. Por favor, intente nuevamente.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Resultado del Análisis
      </Typography>
      
      <Box my={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Transcripción:
        </Typography>
        <Typography variant="body1">
          {resultado.transcripcion}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box my={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Nivel de Urgencia:
        </Typography>
        <Chip 
          label={nivelUrgencia.toUpperCase()}
          color={colorUrgencia[nivelUrgencia.toLowerCase()]}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box my={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Análisis:
        </Typography>
        <Typography variant="body1">
          {analisis}
        </Typography>
      </Box>

      <Box my={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Recomendaciones:
        </Typography>
        <Typography variant="body1">
          {recomendaciones}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ResultadoAnalisis; 