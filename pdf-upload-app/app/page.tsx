// app/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
} from '@mui/material';
import Header from './components/Header';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setStatus(null);
    setError(null);
    setProcessedFileUrl(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }

    setIsProcessing(true);
    setStatus('Uploading file...');
    setError(null);

    try {
      // Upload the file to the Python server
      const formData = new FormData();
      formData.append('file', file);

      const pythonServerUrl = 'http://localhost:8000/process-pdf'; // Adjust if necessary

      const response = await fetch(pythonServerUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Processing error: ${errorText}`);
        setStatus(null);
        setIsProcessing(false);
        return;
      }

      setStatus('Processing file...');

      // Read the response as a blob
      const blob = await response.blob();

      setStatus('File processed successfully!');
      setIsProcessing(false);

      // Create a URL for the processed file
      const url = URL.createObjectURL(blob);
      setProcessedFileUrl(url);
    } catch (error: any) {
      console.error(error);
      setError('An error occurred during processing.');
      setStatus(null);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Upload PDF
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Button variant="contained" component="label">
              Select PDF File
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                hidden
              />
            </Button>
            {file && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Selected File: {file.name}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={isProcessing}
            >
              Upload and Process
            </Button>
          </Box>
          {isProcessing && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <LinearProgress />
            </Box>
          )}
          {status && (
            <Alert severity="info" sx={{ mt: 3 }}>
              {status}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
          {processedFileUrl && (
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              href={processedFileUrl}
              download={`processed_${file?.name}`}
              startIcon={<CloudDownloadIcon />}
            >
              Download Processed File
            </Button>
          )}
        </Box>
      </Container>
    </>
  );
}
