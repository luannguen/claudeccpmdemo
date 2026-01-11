import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/components/AuthProvider"; // Updated import path

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    // Check if already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await base44.auth.me();
      if (user && ['admin', 'super_admin', 'manager', 'staff', 'accountant'].includes(user.role)) {
        navigate(createPageUrl("AdminDashboard"));
      }
    } catch (error) {
      // Not logged in, stay on login page
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authLogin(email, password);
      navigate(createPageUrl('AdminDashboard'));
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7CB342] via-[#5a9332] to-[#FF9800] flex items-center justify-center p-4">
      <style jsx>{`
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-effect rounded-3xl p-8 md:p-12 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-3 mb-6">
            <Leaf className="w-10 h-10 text-[#7CB342]" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#7CB342]">ZERO FARM</h1>
              <p className="text-xs text-gray-600 tracking-widest">100% ORGANIC</p>
            </div>
          </Link>
          <h2 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
            Quản Trị Viên
          </h2>
          <p className="text-gray-600">Đăng nhập để truy cập hệ thống</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6"> {/* Changed onSubmit to handleLogin */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#7CB342]/20 transition-colors"
              placeholder="admin@zerofarm.vn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Mật Khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#7CB342]/20 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-semibold hover:bg-[#FF9800] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Đăng Nhập
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        {/* Base44 Login */}
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.origin + createPageUrl("AdminDashboard"))}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          Đăng Nhập Bằng Base44
        </button>

        {/* Back to Home */}
        <Link
          to={createPageUrl("Home")}
          className="mt-6 flex items-center justify-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về trang chủ
        </Link>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <p className="text-blue-800 font-medium mb-2">🔐 Thông tin truy cập:</p>
          <p className="text-blue-700">
            Chỉ dành cho quản trị viên của Zero Farm. 
            Liên hệ IT nếu bạn quên mật khẩu.
          </p>
        </div>
      </motion.div>
    </div>
  );
}