/**
 * useQRScanner - Simple & Reliable QR Scanner
 * Approach: Minimal state, direct DOM manipulation, no complex promises
 */

import { useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

export function useQRScanner({ onScanned, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const activeRef = useRef(false);

  // Scan một frame
  const scanFrame = useCallback(() => {
    if (!activeRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code?.data) {
          console.log('[QR] Found:', code.data);
          activeRef.current = false;
          stopCamera();
          onScanned?.(code.data);
          return;
        }
      } catch (e) {
        // Ignore scan errors
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [onScanned]);

  // Stop camera
  const stopCamera = useCallback(() => {
    activeRef.current = false;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera - returns promise với status
  const startCamera = useCallback(async () => {
    stopCamera();

    try {
      console.log('[QR] Requesting camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      console.log('[QR] Got stream');
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('No video element');
      }

      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.muted = true;

      // Wait for video to play
      await video.play();
      console.log('[QR] Video playing');

      // Start scanning
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(scanFrame);

      return { success: true };

    } catch (err) {
      console.error('[QR] Error:', err.name, err.message);
      stopCamera();

      let errorType = 'unknown';
      if (err.name === 'NotAllowedError') {
        errorType = 'denied';
      } else if (err.name === 'NotFoundError') {
        errorType = 'notfound';
      } else if (err.name === 'NotReadableError') {
        errorType = 'inuse';
      }

      onError?.(errorType);
      return { success: false, errorType };
    }
  }, [stopCamera, scanFrame, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera
  };
}