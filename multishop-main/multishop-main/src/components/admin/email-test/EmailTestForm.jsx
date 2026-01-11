import React from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function EmailTestForm({ testEmail, setTestEmail, isSending, onSubmit }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <form onSubmit={onSubmit} className="space-y-6">
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
  );
}