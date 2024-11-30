import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Estadisticas = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/estadisticas');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Estadísticas
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Casos por Nivel de Urgencia
          </Typography>
          <PieChart width={300} height={300}>
            <Pie
              data={stats.porUrgencia}
              dataKey="cantidad"
              nameKey="nivel"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {stats.porUrgencia.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Casos por Estado
          </Typography>
          <BarChart width={300} height={300} data={stats.porEstado}>
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#8884d8" />
          </BarChart>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Estadisticas; 