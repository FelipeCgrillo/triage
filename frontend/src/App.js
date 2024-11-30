import React from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Box
} from '@mui/material';
import AudioRecorder from './components/AudioRecorder';
import ListaCasos from './components/ListaCasos';

const App = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Triage Médico
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Nueva Consulta
          </Button>
          <Button color="inherit" component={Link} to="/casos">
            Ver Casos
          </Button>
        </Toolbar>
      </AppBar>

      <Container>
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<AudioRecorder />} />
            <Route path="/casos" element={<ListaCasos />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
};

export default App; 