import React from 'react';

export default function EmailTestGuide() {
  return (
    <>
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
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
    </>
  );
}