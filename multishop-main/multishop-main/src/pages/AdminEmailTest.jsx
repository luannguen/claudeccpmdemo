import React, { useState, useEffect } from "react";
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

export default function AdminEmailTest() {
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-email-test'],
    queryFn: () => base44.auth.me()
  });

  // Auto-fill current user's email
  useEffect(() => {
    if (currentUser?.email && !testEmail) {
      setTestEmail(currentUser.email);
    }
  }, [currentUser, testEmail]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const handleDirectTest = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setResult(null);
    setLogs([]);

    try {
      addLog('🚀 Bắt đầu gửi email test...', 'info');
      addLog('📧 Email nhận: ' + testEmail, 'info');

      const emailData = {
        from_name: 'Farmer Smart TEST',
        to: testEmail,
        subject: '🧪 TEST EMAIL - ' + new Date().toLocaleTimeString('vi-VN'),
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f5f9f3;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h1 style="color: #7CB342; margin-bottom: 20px;">✅ Email Test Thành Công!</h1>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Xin chào,<br><br>
                Đây là email test từ Farmer Smart Admin Panel.<br>
                Nếu bạn nhận được email này, có nghĩa là hệ thống email đang hoạt động bình thường!
              </p>
              <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 8px;">
                <p style="margin: 0; color: #2e7d32; font-weight: 600;">
                  🎉 Thời gian gửi: ${new Date().toLocaleString('vi-VN')}
                </p>
              </div>
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #666; font-size: 14px;">
                  © 2024 Farmer Smart - Email System Test
                </p>
              </div>
            </div>
          </div>
        `
      };

      addLog('📤 Đang gọi base44.integrations.Core.SendEmail...', 'info');
      addLog('📋 Data: ' + JSON.stringify({ to: emailData.to, subject: emailData.subject }), 'info');

      const response = await base44.integrations.Core.SendEmail(emailData);

      addLog('✅ SendEmail response: ' + JSON.stringify(response), 'success');
      addLog('✅ EMAIL ĐÃ GỬI THÀNH CÔNG!', 'success');
      
      setResult({
        success: true,
        message: 'Email đã được gửi thành công! Kiểm tra hộp thư (và cả spam folder).',
        response
      });

    } catch (error) {
      addLog('❌ LỖI: ' + error.message, 'error');
      addLog('❌ Stack: ' + error.stack, 'error');
      
      setResult({
        success: false,
        message: 'Lỗi gửi email: ' + error.message,
        error: error.toString()
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold mb-2">🧪 Test Email System</h1>
            <p className="text-gray-600">Kiểm tra hệ thống gửi email hoạt động</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <form onSubmit={handleDirectTest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Nhận Test *
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
                  placeholder="your.email@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Nhập email của bạn để nhận email test
                </p>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full px-6 py-4 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang gửi email...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Gửi Email Test
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-6 mb-6 ${
              result.success 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? '✅ Thành Công' : '❌ Thất Bại'}
                  </h3>
                  <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                    {result.message}
                  </p>
                  {!result.success && result.error && (
                    <pre className="mt-3 p-3 bg-red-100 rounded text-xs overflow-auto">
                      {result.error}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Debug Logs
              </h3>
              <div className="space-y-2 max-h-96 overflow-auto font-mono text-xs">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded ${
                      log.type === 'error' ? 'bg-red-900/50 text-red-200' :
                      log.type === 'success' ? 'bg-green-900/50 text-green-200' :
                      'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">📝 Hướng Dẫn Kiểm Tra</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Email mặc định là email admin đang đăng nhập</li>
              <li>2. Hoặc nhập email của user khác có trong hệ thống</li>
              <li>3. Nhấn "Gửi Email Test"</li>
              <li>4. <strong>Kiểm tra hộp thư đến (inbox) và SPAM FOLDER</strong></li>
              <li>5. Xem debug logs để biết chi tiết lỗi (nếu có)</li>
              <li>6. Nếu thành công nhưng không thấy email → chắc chắn vào spam</li>
            </ol>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="font-bold text-green-900 mb-3">✅ Email Flow Tự Động</h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>Sau khi customer đặt hàng, email sẽ tự động gửi khi:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>confirmed:</strong> Xác nhận đơn hàng</li>
                <li><strong>shipping:</strong> Thông báo đang giao</li>
                <li><strong>delivered:</strong> Xác nhận đã giao + yêu cầu review</li>
                <li><strong>paid:</strong> Xác nhận thanh toán</li>
              </ul>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}