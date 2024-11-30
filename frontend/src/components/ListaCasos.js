import React, { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Typography,
  Paper
} from '@mui/material';

const colorUrgencia = {
  bajo: 'success',
  medio: 'warning',
  alto: 'error'
};

const ListaCasos = () => {
  const [casos, setCasos] = useState([]);

  useEffect(() => {
    const obtenerCasos = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/casos');
        const data = await response.json();
        setCasos(data);
      } catch (error) {
        console.error('Error al obtener casos:', error);
      }
    };

    obtenerCasos();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Casos Médicos
      </Typography>
      <List>
        {casos.map((caso) => (
          <Paper key={caso._id} sx={{ mb: 2, p: 2 }}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1">
                      Caso #{caso._id.slice(-6)}
                    </Typography>
                    <Chip 
                      label={caso.nivelUrgencia.toUpperCase()}
                      color={colorUrgencia[caso.nivelUrgencia]}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Síntomas: 
                    </Typography>
                    {" " + caso.sintomas}
                    <Box mt={1}>
                      <Typography component="span" variant="body2" color="text.primary">
                        Recomendaciones: 
                      </Typography>
                      {" " + caso.recomendaciones}
                    </Box>
                    <Box mt={1}>
                      <Chip 
                        label={`Estado: ${caso.estado}`}
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="caption" display="block" mt={1}>
                        Fecha: {new Date(caso.fechaCreacion).toLocaleString()}
                      </Typography>
                    </Box>
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ListaCasos; 