import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { createHmac } from 'node:crypto';

/**
 * MoMo Payment Gateway Integration
 * 
 * Required Secrets:
 * - MOMO_PARTNER_CODE: Partner Code từ MoMo
 * - MOMO_ACCESS_KEY: Access Key
 * - MOMO_SECRET_KEY: Secret Key
 * - APP_URL: Domain của app
 * 
 * Endpoints:
 * - POST /payment/momo/create - Tạo payment request
 * - POST /payment/momo/ipn - Webhook từ MoMo
 */

const MOMO_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create'; // Sandbox
// Production: https://payment.momo.vn/v2/gateway/api/create

function createMoMoSignature(rawData, secretKey) {
  const hmac = createHmac('sha256', secretKey);
  return hmac.update(rawData).digest('hex');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const path = url.pathname;

  // =====================
  // CREATE PAYMENT
  // =====================
  if (req.method === 'POST' && path.includes('/create')) {
    try {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { orderId, amount, orderInfo, returnUrl, ipnUrl } = await req.json();

      const partnerCode = Deno.env.get('MOMO_PARTNER_CODE');
      const accessKey = Deno.env.get('MOMO_ACCESS_KEY');
      const secretKey = Deno.env.get('MOMO_SECRET_KEY');
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';

      if (!partnerCode || !accessKey || !secretKey) {
        return Response.json({ 
          error: 'MoMo chưa được cấu hình. Vui lòng liên hệ admin.' 
        }, { status: 500 });
      }

      const requestId = `${orderId}_${Date.now()}`;
      const orderIdMoMo = orderId || `ORD${Date.now()}`;
      const redirectUrl = returnUrl || `${appUrl}/payment/momo/callback`;
      const ipnUrlMoMo = ipnUrl || `${appUrl}/api/payment/momo/ipn`;

      // Build signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=&ipnUrl=${ipnUrlMoMo}&orderId=${orderIdMoMo}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
      
      const signature = createMoMoSignature(rawSignature, secretKey);

      const requestBody = {
        partnerCode: partnerCode,
        partnerName: 'Zero Farm',
        storeId: 'ZeroFarmStore',
        requestId: requestId,
        amount: amount,
        orderId: orderIdMoMo,
        orderInfo: orderInfo || 'Thanh toán đơn hàng Zero Farm',
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrlMoMo,
        lang: 'vi',
        requestType: 'captureWallet',
        autoCapture: true,
        extraData: '',
        signature: signature
      };

      // Call MoMo API
      const response = await fetch(MOMO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.resultCode === 0) {
        return Response.json({
          success: true,
          payUrl: result.payUrl,
          qrCodeUrl: result.qrCodeUrl,
          deeplink: result.deeplink,
          deeplinkMiniApp: result.deeplinkMiniApp,
          orderId: orderIdMoMo,
          requestId: requestId
        });
      } else {
        return Response.json({
          success: false,
          error: result.message || 'MoMo API error',
          resultCode: result.resultCode
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
  // IPN HANDLER (Webhook)
  // =====================
  if (req.method === 'POST' && path.includes('/ipn')) {
    try {
      const body = await req.json();
      const secretKey = Deno.env.get('MOMO_SECRET_KEY');

      // Verify signature
      const rawSignature = `accessKey=${body.accessKey}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
      
      const signature = createMoMoSignature(rawSignature, secretKey);

      if (signature !== body.signature) {
        return Response.json({ 
          resultCode: 97, 
          message: 'Invalid signature' 
        });
      }

      // Payment successful
      if (body.resultCode === 0) {
        const orders = await base44.asServiceRole.entities.Order.list('-created_date', 1000);
        const order = orders.find(o => o.order_number === body.orderId);
        
        if (order) {
          await base44.asServiceRole.entities.Order.update(order.id, {
            payment_status: 'paid',
            order_status: 'confirmed',
            payment_method: 'momo',
            internal_note: `MoMo TransID: ${body.transId}`
          });

          // Create activity log
          await base44.asServiceRole.entities.ActivityLog.create({
            user_email: 'system@momo',
            user_name: 'MoMo IPN',
            action_type: 'status_change',
            entity_type: 'order',
            entity_id: order.id,
            entity_name: order.order_number,
            description: 'Đơn hàng tự động xác nhận qua MoMo',
            metadata: {
              transaction_id: body.transId,
              amount: body.amount,
              pay_type: body.payType
            }
          });
        }

        return Response.json({ resultCode: 0, message: 'success' });
      }

      return Response.json({ resultCode: 0, message: 'Confirm received' });

    } catch (error) {
      console.error('MoMo IPN error:', error);
      return Response.json({ 
        resultCode: 99, 
        message: 'System error' 
      });
    }
  }

  // =====================
  // VERIFY CALLBACK
  // =====================
  if (req.method === 'POST' && path.includes('/callback')) {
    try {
      const body = await req.json();
      const secretKey = Deno.env.get('MOMO_SECRET_KEY');

      // Verify signature
      const rawSignature = `accessKey=${body.accessKey}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
      
      const signature = createMoMoSignature(rawSignature, secretKey);

      if (signature !== body.signature) {
        return Response.json({
          success: false,
          message: 'Chữ ký không hợp lệ'
        }, { status: 400 });
      }

      const isSuccess = body.resultCode === 0;

      return Response.json({
        success: true,
        isSuccess,
        message: body.message,
        orderId: body.orderId,
        transId: body.transId,
        amount: body.amount,
        resultCode: body.resultCode
      });

    } catch (error) {
      return Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

  return Response.json({ error: 'Invalid endpoint' }, { status: 404 });
});