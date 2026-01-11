import React from "react";
import { Save } from "lucide-react";

export default function WidgetSettings({ widgetSettings, setWidgetSettings, onSave, isSaving }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl mb-6">
        <h4 className="font-bold text-blue-900 mb-2">📌 Về Review Widget</h4>
        <p className="text-sm text-blue-700">
          Popup hiển thị đánh giá của khách hàng ở góc trang. Giúp tăng uy tín nhưng cần cân bằng để không làm phiền người dùng.
        </p>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-bold text-lg">Bật/Tắt Review Widget</p>
            <p className="text-sm text-gray-600">Hiển thị popup đánh giá khách hàng</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={widgetSettings.enabled}
              onChange={(e) => setWidgetSettings({...widgetSettings, enabled: e.target.checked})}
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7CB342]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#7CB342]"></div>
          </label>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vị Trí Hiển Thị</label>
          <select
            value={widgetSettings.position}
            onChange={(e) => setWidgetSettings({...widgetSettings, position: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="bottom-left">Góc dưới bên trái (Khuyến nghị)</option>
            <option value="bottom-right">Góc dưới bên phải</option>
            <option value="top-left">Góc trên bên trái</option>
            <option value="top-right">Góc trên bên phải</option>
          </select>
        </div>

        {/* Timing Settings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delay Ban Đầu (ms)</label>
            <input
              type="number"
              value={widgetSettings.initial_delay}
              onChange={(e) => setWidgetSettings({...widgetSettings, initial_delay: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Chờ bao lâu trước khi hiện lần đầu</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời Gian Hiển Thị (ms)</label>
            <input
              type="number"
              value={widgetSettings.display_duration}
              onChange={(e) => setWidgetSettings({...widgetSettings, display_duration: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="1000"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Hiện trong bao lâu (nếu auto dismiss)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chu Kỳ Lặp Lại (ms)</label>
            <input
              type="number"
              value={widgetSettings.interval}
              onChange={(e) => setWidgetSettings({...widgetSettings, interval: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="5000"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Hiện lại sau bao lâu</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số Lần Hiển Thị Tối Đa</label>
            <input
              type="number"
              value={widgetSettings.max_views_per_session}
              onChange={(e) => setWidgetSettings({...widgetSettings, max_views_per_session: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500 mt-1">Tối đa bao nhiêu lần/phiên</p>
          </div>
        </div>

        {/* Auto Dismiss */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="font-medium">Tự Động Đóng</p>
            <p className="text-sm text-gray-600">Đóng popup sau thời gian hiển thị</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={widgetSettings.auto_dismiss}
              onChange={(e) => setWidgetSettings({...widgetSettings, auto_dismiss: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7CB342]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CB342]"></div>
          </label>
        </div>

        {/* Preview Info */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-xl">
          <h4 className="font-bold text-green-900 mb-2">📊 Cài Đặt Hiện Tại</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Hiện sau <strong>{widgetSettings.initial_delay / 1000}s</strong> khi vào trang</li>
            <li>• Hiển thị trong <strong>{widgetSettings.display_duration / 1000}s</strong></li>
            <li>• Lặp lại sau mỗi <strong>{widgetSettings.interval / 1000}s</strong></li>
            <li>• Tối đa <strong>{widgetSettings.max_views_per_session} lần</strong> mỗi phiên</li>
            <li>• Vị trí: <strong>{widgetSettings.position}</strong></li>
            <li>• Tự động đóng: <strong>{widgetSettings.auto_dismiss ? 'Có' : 'Không'}</strong></li>
          </ul>
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-[#7CB342] text-white px-6 py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu Cài Đặt Widget
            </>
          )}
        </button>
      </div>
    </div>
  );
}