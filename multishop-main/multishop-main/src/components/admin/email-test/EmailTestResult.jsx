import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailTestResult({ result }) {
  if (!result) return null;

  return (
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
  );
}