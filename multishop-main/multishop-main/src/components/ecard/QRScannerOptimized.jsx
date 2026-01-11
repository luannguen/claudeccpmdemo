/**
 * QRScannerOptimized - Simple QR Scanner Modal
 * Fix: Auto-start camera khi modal mở, không cần button riêng
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X, Camera, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/NotificationToast";
import jsQR from "jsqr";

export default function QRScannerOptimized({ onScanned, onClose }) {
  const [status, setStatus] = useState('loading'); // loading, ready, error
  const [errorMsg, setErrorMsg] = useState('');
  const { addToast } = useToast();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const mountedRef = useRef(true);

  // Stop everything
  const stopAll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Scan loop
  const scan = useCallback(() => {
    if (!mountedRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code?.data) {
          console.log('[QR] Found:', code.data);
          stopAll();
          
          // Parse the QR data to extract slug/code
          const data = code.data;
          let parsed = data;
          
          // Check for code= in URL
          if (data.includes('code=')) {
            const match = data.match(/[?&]code=([^&]+)/);
            if (match) parsed = match[1];
          }
          // Check for slug= in URL
          else if (data.includes('slug=')) {
            const match = data.match(/[?&]slug=([^&]+)/);
            if (match) parsed = match[1];
          }
          // Check for /i/ path (invite link)
          else if (data.includes('/i/')) {
            const match = data.match(/\/i\/([^?&/]+)/);
            if (match) parsed = match[1];
          }
          
          console.log('[QR] Parsed value:', parsed);
          addToast('Quét thành công!', 'success');
          onScanned(parsed);
          onClose();
          return;
        }
      } catch (e) {}
    }
    
    rafRef.current = requestAnimationFrame(scan);
  }, [stopAll, addToast, onScanned, onClose]);

  // Start camera
  const startCamera = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Trình duyệt không hỗ trợ camera. Vui lòng dùng Chrome/Safari.');
      setStatus('error');
      return;
    }

    try {
      console.log('[QR] Requesting camera...');
      
      // Request permission - this will trigger browser's permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      console.log('[QR] Got stream, tracks:', stream.getTracks().length);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not ready');
      }

      // Attach stream
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.muted = true;

      // Wait for video to have data and play
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video timeout')), 10000);
        
        const checkAndPlay = async () => {
          try {
            await video.play();
            console.log('[QR] Video playing, readyState:', video.readyState);
            
            // Wait for actual video data
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              clearTimeout(timeout);
              resolve();
            } else {
              // Wait for dimensions
              const waitForDimensions = setInterval(() => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  clearInterval(waitForDimensions);
                  clearTimeout(timeout);
                  console.log('[QR] Video dimensions:', video.videoWidth, 'x', video.videoHeight);
                  resolve();
                }
              }, 100);
              
              // Timeout for dimensions check
              setTimeout(() => {
                clearInterval(waitForDimensions);
              }, 5000);
            }
          } catch (playErr) {
            console.log('[QR] Play attempt failed:', playErr);
            // Retry after delay
            setTimeout(checkAndPlay, 200);
          }
        };
        
        // Start checking
        if (video.readyState >= 2) {
          checkAndPlay();
        } else {
          video.onloadeddata = checkAndPlay;
          video.oncanplay = checkAndPlay;
        }
      });

      if (!mountedRef.current) {
        stopAll();
        return;
      }

      console.log('[QR] Camera ready!');
      setStatus('ready');
      
      // Start scanning
      setTimeout(() => {
        if (mountedRef.current) {
          rafRef.current = requestAnimationFrame(scan);
        }
      }, 100);

    } catch (err) {
      console.error('[QR] Camera error:', err.name, err.message);
      
      if (!mountedRef.current) return;
      
      stopAll();
      
      // Determine error message
      let msg = 'Không thể mở camera. Vui lòng thử lại.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Bạn cần cho phép truy cập camera.\n\nCách bật:\n• iOS Safari: Cài đặt → Safari → Camera → Cho phép\n• Chrome: Bấm icon khóa trên thanh địa chỉ → Camera → Cho phép';
      } else if (err.name === 'NotFoundError') {
        msg = 'Không tìm thấy camera trên thiết bị.';
      } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        msg = 'Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.';
      } else if (err.name === 'OverconstrainedError') {
        msg = 'Camera không hỗ trợ. Thử lại với camera khác.';
      } else if (err.name === 'SecurityError') {
        msg = 'Trang web cần HTTPS để sử dụng camera.';
      }
      
      setErrorMsg(msg);
      setStatus('error');
    }
  }, [stopAll, scan]);

  // Auto-start when modal opens
  useEffect(() => {
    mountedRef.current = true;
    
    // Small delay to ensure video element is mounted
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        startCamera();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      stopAll();
    };
  }, [startCamera, stopAll]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#7CB342] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={24} />
            <span className="font-semibold">Quét mã QR</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Video container - always rendered */}
          <div className={`relative rounded-xl overflow-hidden bg-black ${status !== 'ready' ? 'hidden' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full block"
              style={{ minHeight: '280px', maxHeight: '350px', objectFit: 'cover' }}
            />
            
            {/* Scan frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#7CB342] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#7CB342] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#7CB342] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#7CB342] rounded-br-lg" />
                
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-[#7CB342]"
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </div>

          {status === 'ready' && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Đưa mã QR vào khung để quét
            </p>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <div className="py-16 text-center">
              <Loader2 size={40} className="text-[#7CB342] animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Đang mở camera...</p>
              <p className="text-sm text-gray-500 mt-2">
                Nếu trình duyệt hỏi, hãy bấm <strong>"Cho phép"</strong>
              </p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="py-8 text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 whitespace-pre-line text-sm mb-6 px-4">
                {errorMsg}
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#689F38] transition inline-flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Thử lại
              </button>
            </div>
          )}

          {/* Hidden canvas for QR scanning */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </motion.div>
    </div>
  );
}