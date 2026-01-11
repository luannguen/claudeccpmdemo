import React from "react";
import { Download, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function InvoiceGenerator({ invoice, tenant, onDownload, onSendEmail }) {
  const [isSending, setIsSending] = React.useState(false);

  const generateInvoiceHTML = () => {
    const taxAmount = (invoice.subtotal * (invoice.tax_rate || 10)) / 100;
    const total = invoice.subtotal + taxAmount - (invoice.discount_amount || 0);
    
    const lineItems = invoice.line_items || [{
      description: `Gói ${invoice.plan_name || 'STARTER'} - ${invoice.billing_cycle === 'yearly' ? 'Năm' : 'Tháng'}`,
      quantity: 1,
      unit_price: invoice.subtotal,
      amount: invoice.subtotal
    }];

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa Đơn #${invoice.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 60px; }
    .header { border-bottom: 3px solid #7CB342; padding-bottom: 30px; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; color: #7CB342; }
    table { width: 100%; border-collapse: collapse; margin: 40px 0; }
    th { background: #7CB342; color: white; padding: 15px; text-align: left; }
    td { padding: 15px; border-bottom: 1px solid #eee; }
    .total { font-size: 24px; color: #7CB342; font-weight: bold; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">ZERO FARM</div>
      <p>Hóa đơn #${invoice.invoice_number}</p>
      <p>Ngày: ${new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}</p>
    </div>
    <h3>Khách hàng: ${tenant?.organization_name}</h3>
    <p>Email: ${tenant?.owner_email}</p>
    <table>
      <tr><th>Dịch vụ</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
      ${lineItems.map(item => `<tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${(item.unit_price || 0).toLocaleString('vi-VN')}đ</td>
        <td>${(item.amount || 0).toLocaleString('vi-VN')}đ</td>
      </tr>`).join('')}
    </table>
    <p class="total">Tổng: ${total.toLocaleString('vi-VN')}đ</p>
  </div>
</body>
</html>`;
  };

  const handleDownload = () => {
    const html = generateInvoiceHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.invoice_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (onDownload) onDownload();
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const html = generateInvoiceHTML();
      const recipientEmail = invoice.billing_address?.email || tenant?.owner_email;

      await base44.integrations.Core.SendEmail({
        from_name: 'Zero Farm Billing',
        to: recipientEmail,
        subject: `Hóa đơn #${invoice.invoice_number}`,
        body: html
      });

      alert('✅ Đã gửi hóa đơn!');
      if (onSendEmail) onSendEmail();
    } catch (error) {
      alert('Có lỗi khi gửi email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Download className="w-4 h-4" />
        Tải HTML
      </button>
      <button
        onClick={handleSendEmail}
        disabled={isSending}
        className="flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {isSending ? 'Đang gửi...' : 'Gửi Email'}
      </button>
    </div>
  );
}

export function InvoicePreview({ invoice, tenant }) {
  if (!invoice) return null;

  const taxAmount = (invoice.subtotal * (invoice.tax_rate || 10)) / 100;
  const total = invoice.subtotal + taxAmount - (invoice.discount_amount || 0);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="border-b-4 border-[#7CB342] pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#7CB342]">ZERO FARM</h1>
            <p className="text-gray-600 text-sm">Nền Tảng SaaS</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {invoice.status === 'paid' ? 'ĐÃ TT' : invoice.status === 'overdue' ? 'QUÁ HẠN' : 'CHỜ TT'}
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">HÓA ĐƠN DỊCH VỤ</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">Số HĐ</p>
          <p className="font-bold">{invoice.invoice_number}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ngày</p>
          <p className="font-bold">{new Date(invoice.invoice_date).toLocaleDateString('vi-VN')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hạn TT</p>
          <p className="font-bold">{new Date(invoice.due_date).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="font-bold mb-2">Khách Hàng</h3>
        <p className="font-bold">{tenant?.organization_name}</p>
        <p className="text-sm text-gray-600">{tenant?.address}</p>
        <p className="text-sm text-gray-600">{tenant?.owner_email}</p>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-[#7CB342] text-white">
            <th className="text-left p-4">Dịch Vụ</th>
            <th className="text-center p-4">SL</th>
            <th className="text-right p-4">Đơn Giá</th>
            <th className="text-right p-4">Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.line_items || [{
            description: `Gói ${invoice.plan_name || 'STARTER'}`,
            quantity: 1,
            unit_price: invoice.subtotal,
            amount: invoice.subtotal
          }]).map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-4">{item.description}</td>
              <td className="p-4 text-center">{item.quantity}</td>
              <td className="p-4 text-right">{(item.unit_price || 0).toLocaleString('vi-VN')}đ</td>
              <td className="p-4 text-right">{(item.amount || 0).toLocaleString('vi-VN')}đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-2">
        <p>Tổng: {invoice.subtotal.toLocaleString('vi-VN')}đ</p>
        <p>VAT ({invoice.tax_rate || 10}%): {taxAmount.toLocaleString('vi-VN')}đ</p>
        <p className="text-2xl font-bold text-[#7CB342] border-t-2 border-[#7CB342] pt-2">
          TỔNG: {total.toLocaleString('vi-VN')}đ
        </p>
      </div>
    </div>
  );
}