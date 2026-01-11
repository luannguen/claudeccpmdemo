import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      cartItems, 
      customerInfo, 
      paymentMethod, 
      subtotal, 
      shippingFee, 
      discount, 
      total,
      // Deposit fields
      depositAmount = total,
      remainingAmount = 0,
      depositPercentage = 100,
      estimatedHarvestDate = null,
      // Referral
      referralCode = null
    } = await req.json();

    // ✅ Validate user authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Validate preorder lots availability (CRITICAL for race condition prevention)
    for (const item of cartItems) {
      if (item.is_preorder && item.lot_id) {
        const lots = await base44.asServiceRole.entities.ProductLot.filter({ id: item.lot_id }, '-created_date', 1);
        
        if (!lots || lots.length === 0) {
          return Response.json({ 
            error: `Lot "${item.name}" không còn tồn tại!`,
            lot_id: item.lot_id 
          }, { status: 400 });
        }

        const lot = lots[0];

        if (lot.status !== 'active') {
          return Response.json({ 
            error: `Lot "${item.name}" không còn mở bán!`,
            lot_id: item.lot_id 
          }, { status: 400 });
        }

        if (lot.available_quantity < item.quantity) {
          return Response.json({ 
            error: `Lot "${item.name}" chỉ còn ${lot.available_quantity} sản phẩm!`,
            lot_id: item.lot_id,
            available_quantity: lot.available_quantity
          }, { status: 400 });
        }
      }
    }

    // ✅ Generate order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

    // ✅ Determine deposit status
    const hasDeposit = depositPercentage < 100;
    const depositStatus = hasDeposit ? 'pending' : 'none';
    const orderStatus = hasDeposit ? 'pending' : 'pending';
    
    // ✅ Create order with deposit info
    const order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      shipping_address: customerInfo.address,
      shipping_city: customerInfo.city,
      shipping_district: customerInfo.district,
      shipping_ward: customerInfo.ward,
      items: cartItems.map(item => ({
        product_id: item.product_id || item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        is_preorder: item.is_preorder || false,
        lot_id: item.lot_id || null,
        estimated_harvest_date: item.estimated_harvest_date || null,
        moq_applied: item.moq || null,
        deposit_percentage: item.deposit_percentage || 100,
        deposit_amount: item.deposit_amount || (item.price * item.quantity)
      })),
      has_preorder_items: cartItems.some(item => item.is_preorder),
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discount,
      total_amount: total,
      // Deposit fields
      deposit_amount: depositAmount,
      remaining_amount: remainingAmount,
      deposit_status: depositStatus,
      // Payment
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : (hasDeposit ? 'pending' : 'awaiting_confirmation'),
      order_status: orderStatus,
      note: customerInfo.note,
      created_by: user.email,
      // Referral tracking
      referral_code_applied: referralCode || null,
      referral_commission_calculated: false
    });

    // ✅ Update ProductLot quantities atomically (CRITICAL for race condition)
    for (const item of cartItems) {
      if (item.is_preorder && item.lot_id) {
        const lots = await base44.asServiceRole.entities.ProductLot.filter({ id: item.lot_id }, '-created_date', 1);
        
        if (lots && lots[0]) {
          const lot = lots[0];
          const newAvailable = Math.max(0, (lot.available_quantity || 0) - item.quantity);
          const newSold = (lot.sold_quantity || 0) + item.quantity;
          const newStatus = newAvailable === 0 ? 'sold_out' : lot.status;

          await base44.asServiceRole.entities.ProductLot.update(lot.id, {
            sold_quantity: newSold,
            available_quantity: newAvailable,
            total_revenue: (lot.total_revenue || 0) + (item.price * item.quantity),
            status: newStatus
          });

          console.log(`✅ Updated Lot ${lot.id}: sold=${newSold}, available=${newAvailable}, status=${newStatus}`);
        }
      }
    }

    // ✅ Update PreOrderProduct stats
    const preorderIds = [...new Set(cartItems.filter(i => i.is_preorder).map(i => i.lot_id))];
    for (const lotId of preorderIds) {
      if (!lotId) continue;
      
      const lots = await base44.asServiceRole.entities.ProductLot.filter({ id: lotId }, '-created_date', 1);
      if (lots && lots[0]) {
        const lot = lots[0];
        const preorderId = lot.preorder_product_id;
        
        if (preorderId) {
          const allLotsForPreorder = await base44.asServiceRole.entities.ProductLot.filter(
            { preorder_product_id: preorderId },
            '-created_date',
            100
          );
          
          const activeLots = allLotsForPreorder.filter(l => l.status === 'active').length;
          const totalRevenue = allLotsForPreorder.reduce((sum, l) => sum + (l.total_revenue || 0), 0);
          
          await base44.asServiceRole.entities.PreOrderProduct.update(preorderId, {
            active_lots: activeLots,
            total_revenue: totalRevenue
          });
        }
      }
    }

    // ✅ Process referral if code provided OR check existing referrer
    let processedReferrerId = null;
    
    // First check if customer already has a referrer (Manual registration or previous order)
    const existingCustomers = await base44.asServiceRole.entities.Customer.filter({ 
      $or: [
        { email: customerInfo.email },
        { phone: customerInfo.phone }
      ]
    });

    if (existingCustomers.length > 0) {
      const customer = existingCustomers[0];
      
      // Customer already has a locked referrer
      if (customer.referrer_id) {
        processedReferrerId = customer.referrer_id;
        console.log('🔒 Customer has existing referrer:', customer.referrer_id);
      }
    }

    // Apply new referral code if no existing referrer
    if (!processedReferrerId && referralCode) {
      try {
        const referrers = await base44.asServiceRole.entities.ReferralMember.filter({
          referral_code: referralCode.toUpperCase(),
          status: 'active'
        });

        if (referrers.length > 0) {
          const referrer = referrers[0];

          // Check self-referral
          if (customerInfo.email !== referrer.user_email) {
            processedReferrerId = referrer.id;

            // Update or create customer with referral
            if (existingCustomers.length > 0) {
              await base44.asServiceRole.entities.Customer.update(existingCustomers[0].id, {
                referrer_id: referrer.id,
                referral_code_used: referralCode.toUpperCase(),
                referred_date: new Date().toISOString(),
                is_referred_customer: true
              });
            }

            console.log('✅ New referral applied:', referrer.full_name);
          }
        }
      } catch (refErr) {
        console.error('Referral code processing error:', refErr);
      }
    }

    // Calculate commission if we have a referrer
    if (processedReferrerId) {
      try {
        const referrers = await base44.asServiceRole.entities.ReferralMember.filter({ 
          id: processedReferrerId 
        });
        
        if (referrers.length > 0) {
          const referrer = referrers[0];
          const settings = await base44.asServiceRole.entities.ReferralSetting.filter({ 
            setting_key: 'main' 
          });
          const referralSettings = settings[0];

          if (referralSettings) {
            // Get commission tiers
            const tiers = referralSettings.commission_tiers || [];
            const currentMonthRevenue = referrer.current_month_revenue || 0;
            const newTotalRevenue = currentMonthRevenue + order.total_amount;

            // Find tier
            let rate = 1;
            for (const tier of tiers) {
              const maxRevenue = tier.max_revenue || Infinity;
              if (newTotalRevenue >= tier.min_revenue && newTotalRevenue < maxRevenue) {
                rate = tier.rate;
                break;
              }
            }

            // Add rank bonus
            const bonusRate = referrer.seeder_rank_bonus || 0;
            const totalRate = rate + bonusRate;
            const commissionAmount = Math.round(order.total_amount * totalRate / 100);

            // Determine event type
            const customerOrders = await base44.asServiceRole.entities.Order.filter({
              customer_email: customerInfo.email
            });
            const isFirstOrder = customerOrders.length <= 1;

            // Create ReferralEvent
            await base44.asServiceRole.entities.ReferralEvent.create({
              referrer_id: referrer.id,
              referrer_email: referrer.user_email,
              referrer_name: referrer.full_name,
              referred_customer_email: customerInfo.email,
              referred_customer_name: customerInfo.name,
              referred_customer_phone: customerInfo.phone,
              order_id: order.id,
              order_number: orderNumber,
              order_amount: order.total_amount,
              commission_rate: totalRate,
              commission_amount: commissionAmount,
              event_type: isFirstOrder ? 'first_purchase' : 'subsequent_purchase',
              status: 'calculated',
              calculation_date: new Date().toISOString(),
              period_month: new Date().toISOString().slice(0, 7)
            });

            // Update referrer stats
            const updates = {
              total_referral_revenue: (referrer.total_referral_revenue || 0) + order.total_amount,
              current_month_revenue: newTotalRevenue,
              unpaid_commission: (referrer.unpaid_commission || 0) + commissionAmount
            };
            
            // Only increment customer count on first order
            if (isFirstOrder && !existingCustomers[0]?.referrer_id) {
              updates.total_referred_customers = (referrer.total_referred_customers || 0) + 1;
            }

            await base44.asServiceRole.entities.ReferralMember.update(referrer.id, updates);

            // Update order with referrer
            await base44.asServiceRole.entities.Order.update(order.id, {
              referrer_id: referrer.id,
              referral_commission_calculated: true
            });

            // 🔒 Lock customer after first order
            if (existingCustomers.length > 0 && !existingCustomers[0].referral_locked) {
              await base44.asServiceRole.entities.Customer.update(existingCustomers[0].id, {
                referral_locked: true
              });
              console.log('🔒 Customer locked to referrer after first order');
            }

            console.log('✅ Referral commission calculated:', commissionAmount);
          }
        }
      } catch (commErr) {
        console.error('Commission calculation error:', commErr);
      }
    }

    return Response.json({ 
      success: true,
      order: order,
      order_number: orderNumber
    });

  } catch (error) {
    console.error('PreOrder checkout error:', error);
    return Response.json({ 
      error: error.message || 'Có lỗi xảy ra khi tạo đơn hàng'
    }, { status: 500 });
  }
});