import React, { useState, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import './App.css';

const Consulta = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [consultHistory, setConsultHistory] = useState([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingInterval, setRecordingInterval] = useState(null);

    const { status, startRecording: startMediaRecording, stopRecording: stopMediaRecording, mediaBlobUrl } = useReactMediaRecorder({
        audio: true,
        onStop: (blobUrl, blob) => {
            console.log('Duración de la grabación:', recordingDuration, 'segundos');
            if (recordingDuration > 120) {
                alert('La grabación no puede durar más de 2 minutos');
                return;
            }
            setAudioBlob(blob);
        }
    });

    const startRecording = () => {
        setRecordingDuration(0);
        const interval = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
        setRecordingInterval(interval);
        startMediaRecording();
    };

    const stopRecording = () => {
        clearInterval(recordingInterval);
        stopMediaRecording();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (recordingDuration < 5) {
            alert('La grabación debe durar al menos 5 segundos');
            return;
        }

        if (audioBlob) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');

            try {
                console.log('Enviando audio para análisis...');
                const res = await axios.post('http://localhost:4000/analyze-audio', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log('Respuesta recibida:', res.data);
                
                const consultaConFecha = {
                    ...res.data,
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                };
                
                setResponse(consultaConFecha);
                setConsultHistory(prev => [consultaConFecha, ...prev]);
                
                // Guardar en localStorage
                const updatedHistory = [consultaConFecha, ...consultHistory];
                localStorage.setItem('consultHistory', JSON.stringify(updatedHistory));
                
            } catch (error) {
                console.error("Error al analizar el audio:", error);
                alert(`Error: ${error.response?.data?.details || error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const savedHistory = localStorage.getItem('consultHistory');
        if (savedHistory) {
            setConsultHistory(JSON.parse(savedHistory));
        }
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="app-container">
            <h1>Teletriage App</h1>
            
            <div className="recording-section">
                <div className="audio-visualizer">
                    {status === "recording" ? (
                        <div className="recording-indicator">
                            Grabando... {recordingDuration}s
                            {recordingDuration > 120 && " (Tiempo máximo excedido)"}
                        </div>
                    ) : mediaBlobUrl ? (
                        <audio src={mediaBlobUrl} controls className="audio-player" />
                    ) : (
                        <div className="recording-prompt">Presiona Grabar para comenzar</div>
                    )}
                </div>
                
                <div className="controls">
                    <button 
                        onClick={startRecording} 
                        disabled={status === "recording"}
                        className={`button ${status === "recording" ? 'disabled' : 'primary'}`}>
                        Grabar
                    </button>
                    <button 
                        onClick={stopRecording} 
                        disabled={status !== "recording"}
                        className={`button ${status !== "recording" ? 'disabled' : 'danger'}`}>
                        Detener
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!audioBlob || isLoading}
                        className={`button ${(!audioBlob || isLoading) ? 'disabled' : 'success'}`}>
                        {isLoading ? 'Procesando...' : 'Analizar Audio'}
                    </button>
                </div>
            </div>

            {response && (
                <div className="analysis-card">
                    <h2>Análisis Actual</h2>
                    <div className="timestamp">
                        Realizado el: {formatDate(response.timestamp)}
                    </div>
                    
                    <div className="transcription-section">
                        <h3>Transcripción:</h3>
                        <p>{response.transcription}</p>
                    </div>

                    <div className="diagnosis-section">
                        <h3>Diagnóstico Preliminar:</h3>
                        <p>{response.analysis.diagnosis}</p>
                        
                        <h3>Nivel de Urgencia:</h3>
                        <p className={`urgency-level ${response.analysis.urgencyLevel.toLowerCase()}`}>
                            {response.analysis.urgencyLevel}
                        </p>
                        
                        <h3>Recomendaciones:</h3>
                        <ul>
                            {response.analysis.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {consultHistory.length > 0 && (
                <div className="history-section">
                    <h2>Historial de Consultas</h2>
                    {consultHistory.map((consult) => (
                        <div key={consult.id} className="history-card">
                            <div className="timestamp">
                                {formatDate(consult.timestamp)}
                            </div>
                            <div className="history-content">
                                <h4>Síntomas Reportados:</h4>
                                <p>{consult.transcription}</p>
                                <h4>Diagnóstico:</h4>
                                <p>{consult.analysis.diagnosis}</p>
                                <p className={`urgency-level ${consult.analysis.urgencyLevel.toLowerCase()}`}>
                                    Nivel de Urgencia: {consult.analysis.urgencyLevel}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Consulta; 