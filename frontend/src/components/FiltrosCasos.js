import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const FiltrosCasos = ({ filtros, setFiltros }) => {
  const handleChange = (campo) => (evento) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: evento.target ? evento.target.value : evento
    }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Buscar"
            value={filtros.busqueda}
            onChange={handleChange('busqueda')}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Urgencia</InputLabel>
            <Select
              value={filtros.urgencia}
              onChange={handleChange('urgencia')}
              label="Urgencia"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="bajo">Bajo</MenuItem>
              <MenuItem value="medio">Medio</MenuItem>
              <MenuItem value="alto">Alto</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado}
              onChange={handleChange('estado')}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="en_proceso">En Proceso</MenuItem>
              <MenuItem value="completado">Completado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <DatePicker
            label="Desde"
            value={filtros.fechaDesde}
            onChange={(newValue) => handleChange('fechaDesde')(newValue)}
            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setFiltros({
              busqueda: '',
              urgencia: '',
              estado: '',
              fechaDesde: null
            })}
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FiltrosCasos; 