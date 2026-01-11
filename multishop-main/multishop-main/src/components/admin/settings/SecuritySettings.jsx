import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#0F0F0F] mb-4">Cài Đặt Bảo Mật</h3>

        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Thay đổi mật khẩu sẽ đăng xuất tất cả các phiên đăng nhập hiện tại.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật Khẩu Hiện Tại</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật Khẩu Mới</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác Nhận Mật Khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="••••••••"
            />
          </div>

          <button className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Đổi Mật Khẩu
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-bold text-[#0F0F0F] mb-4">Phiên Đăng Nhập</h4>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Đăng nhập hiện tại</p>
              <p className="text-sm text-gray-600">Trình duyệt: Chrome • IP: 123.45.67.89</p>
            </div>
            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              Đăng xuất tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}