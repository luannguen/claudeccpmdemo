import React, { useState, useRef } from "react";
import { Bell, Save, Info, Upload, X, Music } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function NotificationSettings({ soundSettings, setSoundSettings, onSave, isSaving }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
      alert('❌ Chỉ hỗ trợ file âm thanh: MP3, WAV, OGG, WEBM');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File quá lớn. Tối đa 5MB');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSoundSettings({ ...soundSettings, sound_url: file_url });
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Không thể upload file: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#0F0F0F] mb-4">Cài Đặt Thông Báo</h3>

      {/* Notification Sound Config */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-8 h-8 text-purple-600" />
          <div>
            <h4 className="text-lg font-bold text-purple-900">Âm Thanh Thông Báo</h4>
            <p className="text-sm text-purple-700">Cấu hình âm thanh khi có thông báo mới</p>
          </div>
        </div>

        {/* Enable/Disable Sound */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-4">
          <div>
            <p className="font-medium">Bật Âm Thanh</p>
            <p className="text-sm text-gray-600">Phát âm thanh khi có thông báo mới</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={soundSettings.enabled}
              onChange={(e) => setSoundSettings({...soundSettings, enabled: e.target.checked})}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Custom Sound Upload & URL */}
        {soundSettings.enabled && (
          <div className="mb-4 space-y-4">
            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải Lên Tệp Âm Thanh
              </label>
              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.ogg,.webm,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-purple-600 font-medium">Đang tải lên...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-600 font-medium">Chọn File Âm Thanh</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Hỗ trợ: MP3, WAV, OGG, WEBM • Tối đa 5MB
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập URL Âm Thanh
              </label>
              <input
                type="url"
                value={soundSettings.sound_url || ''}
                onChange={(e) => setSoundSettings({...soundSettings, sound_url: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                placeholder="https://example.com/notification.mp3"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Để trống để dùng âm thanh mặc định nhẹ nhàng.
              </p>
            </div>

            {/* Current Sound Preview */}
            {soundSettings.sound_url && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <Music className="w-5 h-5 text-purple-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-900 truncate">
                    {soundSettings.sound_url.split('/').pop() || 'Âm thanh tùy chỉnh'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const audio = new Audio(soundSettings.sound_url);
                    audio.play().catch(err => alert('❌ Không thể phát: ' + err.message));
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Bell className="w-4 h-4" />
                  Thử
                </button>
                <button
                  onClick={() => setSoundSettings({...soundSettings, sound_url: ''})}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl mb-4">
          <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Gợi Ý Âm Thanh Miễn Phí
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <a href="https://notificationsounds.com" target="_blank" className="underline hover:text-blue-900">NotificationSounds.com</a></li>
            <li>• <a href="https://mixkit.co/free-sound-effects/notification" target="_blank" className="underline hover:text-blue-900">Mixkit Notification Sounds</a></li>
            <li>• <a href="https://freesound.org" target="_blank" className="underline hover:text-blue-900">FreeSound.org</a></li>
          </ul>
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu Cài Đặt Âm Thanh
            </>
          )}
        </button>
      </div>

      {/* Other Notification Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Đơn Hàng Mới</p>
            <p className="text-sm text-gray-600">Nhận thông báo khi có đơn hàng mới</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7CB342]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CB342]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Sản Phẩm Sắp Hết</p>
            <p className="text-sm text-gray-600">Cảnh báo khi sản phẩm sắp hết hàng</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7CB342]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CB342]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Email Marketing</p>
            <p className="text-sm text-gray-600">Nhận bản tin và ưu đãi đặc biệt</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7CB342]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CB342]"></div>
          </label>
        </div>
      </div>
    </div>
  );
}