import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHmac } from 'node:crypto';

/**
 * VNPay Payment Gateway Integration
 * 
 * Required Secrets:
 * - VNPAY_TMN_CODE: Mã website tại VNPay
 * - VNPAY_HASH_SECRET: Secret key
 * - APP_URL: Domain của app (https://yourdomain.com)
 * 
 * Endpoints:
 * - POST /payment/vnpay/create - Tạo payment URL
 * - POST /payment/vnpay/callback - Xử lý return từ VNPay
 * - POST /payment/vnpay/ipn - Webhook từ VNPay (IPN)
 */

const VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // Production: https://vnpayment.vn/paymentv2/vpcpay.html
const VNP_VERSION = '2.1.0';
const VNP_COMMAND = 'pay';
const VNP_CURR_CODE = 'VND';

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function createSignature(params, secretKey) {
  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = createHmac('sha512', secretKey);
  return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const path = url.pathname;

  // =====================
  // CREATE PAYMENT URL
  // =====================
  if (req.method === 'POST' && path.includes('/create')) {
    try {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { orderId, amount, orderInfo, returnUrl, ipAddr } = await req.json();

      const tmnCode = Deno.env.get('VNPAY_TMN_CODE');
      const hashSecret = Deno.env.get('VNPAY_HASH_SECRET');
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

      if (!tmnCode || !hashSecret) {
        return Response.json({ 
          error: 'VNPay chưa được cấu hình. Vui lòng liên hệ admin.' 
        }, { status: 500 });
      }

      const createDate = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
      const txnRef = orderId || `ORD${Date.now()}`;

      let vnpParams = {
        vnp_Version: VNP_VERSION,
        vnp_Command: VNP_COMMAND,
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: VNP_CURR_CODE,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo || 'Thanh toán đơn hàng',
        vnp_OrderType: 'other',
        vnp_Amount: Math.round(amount * 100), // VNPay requires amount * 100
        vnp_ReturnUrl: returnUrl || `${appUrl}/payment/vnpay/callback`,
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_CreateDate: createDate,
      };

      // Create signature
      const signature = createSignature(vnpParams, hashSecret);
      vnpParams.vnp_SecureHash = signature;

      // Build payment URL
      const paymentUrl = `${VNP_URL}?${new URLSearchParams(vnpParams).toString()}`;

      return Response.json({
        success: true,
        paymentUrl,
        txnRef
      });

    } catch (error) {
      return Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

  // =====================
  // VERIFY CALLBACK (Return URL)
  // =====================
  if (req.method === 'POST' && path.includes('/callback')) {
    try {
      const queryParams = await req.json();
      const hashSecret = Deno.env.get('VNPAY_HASH_SECRET');

      const vnpSecureHash = queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHashType;

      // Verify signature
      const checkSum = createSignature(queryParams, hashSecret);
      
      if (vnpSecureHash === checkSum) {
        const isSuccess = queryParams.vnp_ResponseCode === '00';
        
        if (isSuccess) {
          // Update order in database
          const orderId = queryParams.vnp_TxnRef.replace('ORD-', '');
          
          try {
            const orders = await base44.asServiceRole.entities.Order.list('-created_date', 1000);
            const order = orders.find(o => o.order_number === queryParams.vnp_TxnRef);
            
            if (order) {
              await base44.asServiceRole.entities.Order.update(order.id, {
                payment_status: 'paid',
                order_status: 'confirmed',
                payment_method: 'vnpay',
                internal_note: `VNPay TxnNo: ${queryParams.vnp_TransactionNo || 'N/A'}`
              });
            }
          } catch (dbError) {
            console.error('DB update error:', dbError);
          }
        }

        return Response.json({
          success: true,
          isSuccess,
          message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
          responseCode: queryParams.vnp_ResponseCode,
          transactionNo: queryParams.vnp_TransactionNo,
          txnRef: queryParams.vnp_TxnRef,
          amount: parseInt(queryParams.vnp_Amount) / 100
        });
      } else {
        return Response.json({
          success: false,
          message: 'Chữ ký không hợp lệ'
        }, { status: 400 });
      }

    } catch (error) {
      return Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

  // =====================
  // IPN HANDLER (Webhook from VNPay)
  // =====================
  if (req.method === 'POST' && path.includes('/ipn')) {
    try {
      const queryParams = await req.json();
      const hashSecret = Deno.env.get('VNPAY_HASH_SECRET');

      const vnpSecureHash = queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHash;
      delete queryParams.vnp_SecureHashType;

      // Verify signature
      const checkSum = createSignature(queryParams, hashSecret);
      
      if (vnpSecureHash !== checkSum) {
        return Response.json({ RspCode: '97', Message: 'Invalid signature' });
      }

      const isSuccess = queryParams.vnp_ResponseCode === '00';
      
      if (isSuccess) {
        // Auto-confirm order
        const orders = await base44.asServiceRole.entities.Order.list('-created_date', 1000);
        const order = orders.find(o => o.order_number === queryParams.vnp_TxnRef);
        
        if (order) {
          await base44.asServiceRole.entities.Order.update(order.id, {
            payment_status: 'paid',
            order_status: 'confirmed',
            internal_note: `VNPay IPN - TxnNo: ${queryParams.vnp_TransactionNo || 'N/A'}`
          });

          // Create activity log
          await base44.asServiceRole.entities.ActivityLog.create({
            user_email: 'system@vnpay',
            user_name: 'VNPay IPN',
            action_type: 'status_change',
            entity_type: 'order',
            entity_id: order.id,
            entity_name: order.order_number,
            description: `Đơn hàng tự động xác nhận qua VNPay`,
            metadata: {
              transaction_no: queryParams.vnp_TransactionNo,
              amount: parseInt(queryParams.vnp_Amount) / 100,
              bank_code: queryParams.vnp_BankCode
            }
          });
        }

        return Response.json({ RspCode: '00', Message: 'success' });
      }

      return Response.json({ RspCode: '00', Message: 'Confirm Success' });

    } catch (error) {
      console.error('IPN error:', error);
      return Response.json({ RspCode: '99', Message: 'Unknown error' });
    }
  }

  return Response.json({ error: 'Invalid endpoint' }, { status: 404 });
});