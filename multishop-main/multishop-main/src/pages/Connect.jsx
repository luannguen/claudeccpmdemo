import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useEcardSearch, useConnections } from "@/components/ecard";
import QRScannerOptimized from "@/components/ecard/QRScannerOptimized";
import ManualConnectInput from "@/components/ecard/ManualConnectInput";
import SearchResults from "@/components/ecard/SearchResults";

export default function Connect() {
  const [mode, setMode] = useState('qr'); // 'qr' | 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  
  const { data: searchResults = [], isLoading } = useEcardSearch(searchQuery);
  const { connectByQr } = useConnections();

  const handleQrScanned = (slug) => {
    connectByQr(slug);
    setShowQrScanner(false);
  };

  const handleManualSubmit = (slug) => {
    connectByQr(slug);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết nối mới</h1>
          <p className="text-gray-600">Quét QR hoặc tìm kiếm E-Card</p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1 flex gap-1">
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === 'qr'
                ? 'bg-[#7CB342] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon.Camera size={20} />
            <span>Quét QR</span>
          </button>
          <button
            onClick={() => setMode('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === 'search'
                ? 'bg-[#7CB342] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon.Search size={20} />
            <span>Tìm kiếm</span>
          </button>
        </div>

        {/* Content */}
        {mode === 'qr' ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <Icon.Camera size={80} className="text-[#7CB342] mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Quét mã QR để kết nối</h3>
              <p className="text-gray-600">Yêu cầu người gửi hiển thị mã QR trên E-Card của họ</p>
            </div>
            
            <div className="grid gap-3 max-w-md mx-auto">
              <button
                onClick={() => setShowQrScanner(true)}
                className="px-6 py-4 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-3"
              >
                <Icon.Camera size={24} />
                <span>Quét QR Ngay</span>
              </button>

              <button
                onClick={() => setShowManualInput(true)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Icon.Edit size={20} />
                <span>Hoặc nhập link thủ công</span>
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl text-left max-w-md mx-auto">
              <div className="flex gap-3">
                <Icon.Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Mẹo:</p>
                  <ul className="space-y-1 text-blue-700 list-disc list-inside">
                    <li>Camera tự động mở và ưu tiên camera sau</li>
                    <li>Đảm bảo ánh sáng đủ để quét tốt</li>
                    <li>Không có camera? Dùng "Nhập link"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, công ty, email, SĐT..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Icon.Spinner size={32} />
              </div>
            ) : (
              <SearchResults results={searchResults} />
            )}
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQrScanner && (
          <QRScannerOptimized
            onScanned={handleQrScanned}
            onClose={() => setShowQrScanner(false)}
          />
        )}

        {/* Manual Input Modal */}
        <ManualConnectInput
          isOpen={showManualInput}
          onClose={() => setShowManualInput(false)}
          onSubmit={handleManualSubmit}
        />
      </div>
    </div>
  );
}