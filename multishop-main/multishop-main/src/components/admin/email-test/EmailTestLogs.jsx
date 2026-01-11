import React from 'react';
import { Mail } from 'lucide-react';

export default function EmailTestLogs({ logs }) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 text-white mb-6">
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
  );
}