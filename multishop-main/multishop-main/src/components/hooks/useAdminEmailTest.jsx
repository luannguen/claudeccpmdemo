import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook fetch current admin user for email test
 */
export function useCurrentUserEmail() {
  return useQuery({
    queryKey: ['current-user-email-test'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook quản lý state email test
 */
export function useEmailTestState(initialEmail = '') {
  const [testEmail, setTestEmail] = useState(initialEmail);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
  };

  return {
    testEmail,
    setTestEmail,
    isSending,
    setIsSending,
    result,
    setResult,
    logs,
    addLog,
    clearLogs
  };
}

/**
 * Build test email HTML body
 */
export function buildTestEmailBody() {
  return `
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
  `;
}

/**
 * Send test email
 */
export async function sendTestEmail(email, addLog) {
  addLog('🚀 Bắt đầu gửi email test...', 'info');
  addLog('📧 Email nhận: ' + email, 'info');

  const emailData = {
    from_name: 'Farmer Smart TEST',
    to: email,
    subject: '🧪 TEST EMAIL - ' + new Date().toLocaleTimeString('vi-VN'),
    body: buildTestEmailBody()
  };

  addLog('📤 Đang gọi base44.integrations.Core.SendEmail...', 'info');
  addLog('📋 Data: ' + JSON.stringify({ to: emailData.to, subject: emailData.subject }), 'info');

  const response = await base44.integrations.Core.SendEmail(emailData);

  addLog('✅ SendEmail response: ' + JSON.stringify(response), 'success');
  addLog('✅ EMAIL ĐÃ GỬI THÀNH CÔNG!', 'success');

  return response;
}

export default useEmailTestState;