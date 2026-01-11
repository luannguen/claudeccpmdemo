/**
 * TesterLoginPrompt - Prompt đăng nhập cho Tester
 */

import React from "react";
import { motion } from "framer-motion";
import { LogIn, TestTube, Shield, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: TestTube, title: "Quản lý Test Cases", desc: "Xem và submit kết quả test" },
  { icon: Bell, title: "Thông báo tức thì", desc: "Nhận thông báo khi có yêu cầu retest" },
  { icon: BarChart3, title: "Dashboard cá nhân", desc: "Theo dõi tiến độ và thống kê" },
  { icon: Shield, title: "Lưu thông tin", desc: "Tự động điền form với profile của bạn" }
];

export default function TesterLoginPrompt({ onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tester Portal</h1>
              <p className="text-gray-500">Đăng nhập để bắt đầu kiểm thử</p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <f.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Login Button */}
            <Button 
              onClick={onLogin}
              size="lg"
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <LogIn className="w-5 h-5" />
              Đăng nhập để tiếp tục
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Thông tin đăng nhập sẽ được lưu để tự động điền vào form test
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}