import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";
import { isStandalonePWA } from "./utils/webviewDetector";
import { base44 } from "@/api/base44Client";

/**
 * Parse invite URL/code to extract slug
 * @param {string} input - URL, invite code, or slug
 * @returns {string} The extracted slug/code
 */
const parseInviteInput = (input) => {
  if (!input) return null;
  
  const trimmed = input.trim();
  
  // Check for code in URL (?code=xxx)
  if (trimmed.includes('code=')) {
    const match = trimmed.match(/[?&]code=([^&]+)/);
    if (match) return match[1];
  }
  
  // Check for slug in URL (?slug=xxx)
  if (trimmed.includes('slug=')) {
    const match = trimmed.match(/[?&]slug=([^&]+)/);
    if (match) return match[1];
  }
  
  // Check if it's a full URL with /i/ path (invite link)
  if (trimmed.includes('/i/')) {
    const match = trimmed.match(/\/i\/([^?&/]+)/);
    if (match) return match[1];
  }
  
  // Check for EcardView URL
  if (trimmed.includes('EcardView')) {
    const match = trimmed.match(/slug=([^&]+)/);
    if (match) return match[1];
  }
  
  // Check for InviteAccept URL  
  if (trimmed.includes('InviteAccept')) {
    const match = trimmed.match(/code=([^&]+)/);
    if (match) return match[1];
  }
  
  // Return as-is (assume it's a slug or code directly)
  return trimmed;
};

export default function QRScannerEnhanced({ onScanned, onClose, onDirectAccept }) {
  const [manualInput, setManualInput] = useState('');
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'manual'
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const qrScannerInstance = useRef(null);
  const hasProcessed = useRef(false);
  
  // Check if running in PWA standalone mode
  const isPWA = isStandalonePWA();

  /**
   * Process scanned/entered QR code
   */
  const processQRCode = useCallback(async (input) => {
    // Prevent double processing
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    
    const parsed = parseInviteInput(input);
    
    if (!parsed) {
      setError('Mã QR không hợp lệ');
      hasProcessed.current = false;
      return;
    }
    
    console.log('QR Scanned - parsed value:', parsed);
    
    // Simple flow: just call onScanned with the parsed value
    // Let the parent component handle navigation/connection
    if (onScanned) {
      onScanned(parsed);
    }
  }, [onScanned]);

  useEffect(() => {
    if (scanMode === 'camera' && !qrScannerInstance.current) {
      // Reset processed flag
      hasProcessed.current = false;
      
      // Initialize QR Scanner
      qrScannerInstance.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      );

      qrScannerInstance.current.render(
        (decodedText) => {
          console.log('QR decoded:', decodedText);
          setIsScanning(true);
          
          // Cleanup scanner first
          if (qrScannerInstance.current) {
            qrScannerInstance.current.clear().catch(() => {});
            qrScannerInstance.current = null;
          }
          
          // Process the scanned result
          processQRCode(decodedText);
        },
        (errorMessage) => {
          // Silent errors (camera not found, permission denied handled by library)
          // Only log actual errors, not "QR code not found" messages
          if (!errorMessage?.includes('No MultiFormat Readers') && 
              !errorMessage?.includes('NotFoundException')) {
            console.log('QR scan error:', errorMessage);
          }
        }
      );
    }

    return () => {
      if (qrScannerInstance.current) {
        qrScannerInstance.current.clear().catch(() => {});
        qrScannerInstance.current = null;
      }
    };
  }, [scanMode, processQRCode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      hasProcessed.current = false;
      processQRCode(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7CB342] to-[#558B2F] p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Quét E-Card</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon.XClose size={24} />
            </button>
          </div>
          <p className="text-white/90">Quét mã QR hoặc nhập link để kết nối</p>
        </div>

        {/* Mode Switcher */}
        <div className="p-4 bg-gray-50 flex gap-2">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              scanMode === 'camera'
                ? 'bg-[#7CB342] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon.Camera size={20} />
            <span>Quét QR</span>
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              scanMode === 'manual'
                ? 'bg-[#7CB342] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon.Edit size={20} />
            <span>Nhập Link</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {scanMode === 'camera' ? (
            <div>
              <div id="qr-reader" className="rounded-xl overflow-hidden"></div>
              
              {/* Processing state */}
              {isProcessing && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon.Spinner size={24} className="text-blue-600" />
                    <span className="text-blue-800 font-medium">{processingStatus}</span>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {error && !isProcessing && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon.AlertCircle size={24} className="text-red-600" />
                    <div>
                      <span className="text-red-800 font-medium block">{error}</span>
                      <span className="text-red-600 text-sm">Đang chuyển hướng...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Success state */}
              {isScanning && !isProcessing && !error && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <Icon.CheckCircle size={24} className="text-green-600" />
                  <span className="text-green-800 font-medium">Đã quét thành công! Đang kết nối...</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex gap-3">
                  <Icon.Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Hướng dẫn:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Giữ camera ổn định và đưa mã QR vào khung hình</li>
                      <li>• Đảm bảo ánh sáng đủ và mã QR rõ ràng</li>
                      <li>• Cho phép quyền truy cập camera khi được hỏi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link E-Card hoặc Slug
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="https://... hoặc username-123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500">
                  Nhập link đầy đủ hoặc chỉ slug của E-Card
                </p>
              </div>

              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full px-4 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Icon.UserPlus size={20} />
                <span>Kết nối ngay</span>
              </button>

              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="flex gap-3">
                  <Icon.Lightbulb size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Gợi ý:</p>
                    <p className="text-amber-700">
                      Sao chép link E-Card từ trình duyệt hoặc nhận từ người gửi
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}