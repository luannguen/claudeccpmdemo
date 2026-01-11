import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * VietQR Generator - Tạo mã QR thanh toán chuẩn VietQR
 * 
 * Sử dụng API img.vietqr.io (FREE)
 * Không cần API key, hoàn toàn miễn phí
 * 
 * Hỗ trợ tất cả ngân hàng Việt Nam
 */

const VIETQR_API = 'https://img.vietqr.io/image';

const BANK_CODES = {
  'VCB': 'Vietcombank',
  'TCB': 'Techcombank', 
  'MB': 'MBBank',
  'VIB': 'VIB',
  'ACB': 'ACB',
  'TPB': 'TPBank',
  'BIDV': 'BIDV',
  'VTB': 'VietinBank',
  'SHB': 'SHB',
  'MSB': 'MSB',
  'VP': 'VPBank',
  'ABB': 'ABBANK',
  'SCB': 'SCB',
  'OCB': 'OCB',
  'SEA': 'SeABank',
  'NAB': 'NamABank',
  'PGB': 'PGBank',
  'GPB': 'GPBank',
  'CAKE': 'CAKE',
  'UBANK': 'Ubank',
  'TIMO': 'Timo',
  'VIET': 'VietBank',
  'VCCB': 'VietCapitalBank',
  'WOORI': 'Woori',
  'KLB': 'KienLongBank',
  'KBank': 'Kasikornbank',
  'CIMB': 'CIMB',
  'SGICB': 'SaigonBank',
  'BAB': 'BacABank',
  'PBVN': 'PublicBank',
  'CAKE': 'Cake by VPBank',
  'VIETBANK': 'VietBank',
  'BAOVIET': 'BaoVietBank',
  'SACOM': 'SacomBank',
  'HDBANK': 'HDBank',
  'SHBVN': 'ShinhanBank',
  'EXIMBANK': 'Eximbank',
  'AGRI': 'Agribank',
  'IVB': 'IndovinaBank',
  'VBSP': 'VBSP',
  'VBARD': 'VBARD',
  'COOPBANK': 'Co-opBank',
  'LPB': 'LienVietPostBank',
  'KBank': 'KBank',
  'NCB': 'NCB',
  'OCEAN': 'OceanBank'
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    // Allow both authenticated and public access
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}

    if (req.method === 'POST') {
      const { 
        bankCode, 
        accountNumber, 
        accountName, 
        amount, 
        description, 
        template = 'compact2' 
      } = await req.json();

      if (!bankCode || !accountNumber || !accountName) {
        return Response.json({ 
          error: 'Missing required fields: bankCode, accountNumber, accountName' 
        }, { status: 400 });
      }

      // Build VietQR URL
      // Format: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png
      let qrUrl = `${VIETQR_API}/${bankCode}-${accountNumber}-${template}.png`;
      
      const params = [];
      
      if (amount) {
        params.push(`amount=${amount}`);
      }
      
      if (description) {
        params.push(`addInfo=${encodeURIComponent(description)}`);
      }
      
      params.push(`accountName=${encodeURIComponent(accountName)}`);

      if (params.length > 0) {
        qrUrl += `?${params.join('&')}`;
      }

      return Response.json({
        success: true,
        qrCodeUrl: qrUrl,
        bankInfo: {
          bankCode,
          bankName: BANK_CODES[bankCode] || bankCode,
          accountNumber,
          accountName,
          amount,
          description
        },
        instructions: {
          step1: 'Mở app ngân hàng của bạn',
          step2: 'Quét mã QR',
          step3: 'Kiểm tra thông tin và xác nhận thanh toán',
          step4: 'Chụp màn hình hoá đơn và gửi cho shop để xác nhận'
        }
      });

    } else if (req.method === 'GET') {
      // Return available banks
      return Response.json({
        success: true,
        banks: Object.entries(BANK_CODES).map(([code, name]) => ({
          code,
          name
        }))
      });
    }

    return Response.json({ error: 'Invalid method' }, { status: 405 });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});