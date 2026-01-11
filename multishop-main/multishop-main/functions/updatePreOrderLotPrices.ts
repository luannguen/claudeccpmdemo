import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Deno Function: updatePreOrderLotPrices
 * 
 * Tự động cập nhật giá cho các ProductLot đang active dựa trên price_increase_strategy
 * + Gửi notification FOMO khi giá sắp tăng
 * + Notify khách hàng đã xem/wishlist sản phẩm
 * 
 * Chạy định kỳ: Mỗi giờ một lần (hoặc theo cấu hình)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse query params
    const url = new URL(req.url);
    const sendFomo = url.searchParams.get('fomo') !== 'false';
    const dryRun = url.searchParams.get('dry_run') === 'true';
    
    // Lấy tất cả lot đang active
    const lots = await base44.asServiceRole.entities.ProductLot.filter(
      { status: 'active' },
      'estimated_harvest_date',
      500
    );

    const now = new Date();
    const updates = [];
    const fomoNotifications = [];
    const logs = [];

    for (const lot of lots) {
      try {
        const harvestDate = new Date(lot.estimated_harvest_date);
        
        // Bỏ qua nếu đã quá ngày thu hoạch
        if (harvestDate < now) {
          logs.push(`⏭️ Lot ${lot.lot_name}: Đã quá ngày thu hoạch`);
          continue;
        }

        const strategy = lot.price_increase_strategy;
        if (!strategy || !strategy.type) {
          logs.push(`⚠️ Lot ${lot.lot_name}: Không có chiến lược tăng giá`);
          continue;
        }

        let newPrice = lot.current_price || lot.initial_price;
        let shouldUpdate = false;

        // Tính giá mới dựa trên chiến lược
        if (strategy.type === 'linear') {
          const ratePerDay = strategy.rate_per_day || 0;
          const lastUpdate = lot.last_price_update ? new Date(lot.last_price_update) : new Date(lot.created_date || now);
          const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

          if (daysSinceUpdate >= 1) {
            newPrice = lot.current_price + (ratePerDay * daysSinceUpdate);
            shouldUpdate = true;
          }
        } else if (strategy.type === 'step' && strategy.steps) {
          // Tìm bước giá phù hợp
          const sortedSteps = strategy.steps.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          for (const step of sortedSteps) {
            const stepDate = new Date(step.date);
            if (now >= stepDate && step.price > lot.current_price) {
              newPrice = step.price;
              shouldUpdate = true;
              break;
            }
          }
        } else if (strategy.type === 'exponential') {
          // Tăng lũy thừa: chưa implement chi tiết
          logs.push(`⚠️ Lot ${lot.lot_name}: Exponential chưa được hỗ trợ`);
        }

        // Đảm bảo không vượt giá trần
        if (newPrice > lot.max_price) {
          newPrice = lot.max_price;
        }

        // Cập nhật nếu giá thay đổi
        if (shouldUpdate && newPrice !== lot.current_price) {
          const priceIncrease = newPrice - lot.current_price;
          const percentIncrease = Math.round((priceIncrease / lot.current_price) * 100);

          if (!dryRun) {
            await base44.asServiceRole.entities.ProductLot.update(lot.id, {
              current_price: newPrice,
              last_price_update: now.toISOString()
            });
          }

          updates.push({
            lot_id: lot.id,
            lot_name: lot.lot_name,
            product_name: lot.product_name,
            old_price: lot.current_price,
            new_price: newPrice,
            increase: priceIncrease,
            percent_increase: percentIncrease
          });

          logs.push(`✅ Lot ${lot.lot_name}: ${lot.current_price.toLocaleString('vi-VN')}đ → ${newPrice.toLocaleString('vi-VN')}đ (+${percentIncrease}%)`);

          // Send admin notification about price update
          if (!dryRun) {
            await base44.asServiceRole.entities.AdminNotification.create({
              recipient_email: null,
              type: 'system_alert',
              title: `📈 Giá tăng: ${lot.product_name}`,
              message: `Lot "${lot.lot_name}" đã tăng từ ${lot.current_price.toLocaleString('vi-VN')}đ lên ${newPrice.toLocaleString('vi-VN')}đ (+${percentIncrease}%)`,
              link: '/AdminProductLots',
              priority: 'normal',
              is_read: false,
              related_entity_type: 'ProductLot',
              related_entity_id: lot.id,
              metadata: {
                lot_id: lot.id,
                lot_name: lot.lot_name,
                old_price: lot.current_price,
                new_price: newPrice,
                percent_increase: percentIncrease
              }
            });
          }
        }

        // ========== FOMO NOTIFICATIONS ==========
        // Check if price will increase soon (within 24-48 hours)
        if (sendFomo && strategy) {
          const fomoResult = await checkAndSendFomoNotifications(
            base44, lot, strategy, now, dryRun, logs
          );
          if (fomoResult) {
            fomoNotifications.push(fomoResult);
          }
        }

      } catch (error) {
        logs.push(`❌ Lot ${lot.lot_name}: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      total_lots: lots.length,
      updated_count: updates.length,
      fomo_notifications: fomoNotifications.length,
      updates,
      fomo_sent: fomoNotifications,
      logs,
      dry_run: dryRun
    });

  } catch (error) {
    console.error('Error updating lot prices:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

// ========== FOMO NOTIFICATION LOGIC ==========

async function checkAndSendFomoNotifications(base44, lot, strategy, now, dryRun, logs) {
  try {
    // Calculate next price increase
    let nextIncreaseDate = null;
    let nextPrice = null;
    let hoursUntilIncrease = null;

    if (strategy.type === 'linear' && strategy.rate_per_day > 0) {
      // Linear: Price increases daily at midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      nextIncreaseDate = tomorrow;
      nextPrice = Math.min(lot.current_price + strategy.rate_per_day, lot.max_price);
      hoursUntilIncrease = Math.ceil((tomorrow - now) / (1000 * 60 * 60));
    } 
    else if (strategy.type === 'step' && strategy.steps?.length > 0) {
      // Step: Find next step date
      const sortedSteps = strategy.steps.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      for (const step of sortedSteps) {
        const stepDate = new Date(step.date);
        if (stepDate > now && step.price > lot.current_price) {
          nextIncreaseDate = stepDate;
          nextPrice = Math.min(step.price, lot.max_price);
          hoursUntilIncrease = Math.ceil((stepDate - now) / (1000 * 60 * 60));
          break;
        }
      }
    }

    // Only send FOMO if price increase is within 48 hours
    if (!nextIncreaseDate || !nextPrice || hoursUntilIncrease > 48) {
      return null;
    }

    // Don't send if already at max price
    if (lot.current_price >= lot.max_price) {
      return null;
    }

    const priceIncrease = nextPrice - lot.current_price;
    const percentIncrease = Math.round((priceIncrease / lot.current_price) * 100);

    // Check if we already sent FOMO notification today for this lot
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const existingNotifs = await base44.asServiceRole.entities.Notification.filter(
      { type: 'promo' },
      '-created_date',
      100
    );

    const alreadySentToday = existingNotifs.some(n => {
      const notifDate = new Date(n.created_date);
      notifDate.setHours(0, 0, 0, 0);
      return notifDate.getTime() === today.getTime() && 
             n.metadata?.lot_id === lot.id &&
             n.metadata?.notification_type === 'price_fomo';
    });

    if (alreadySentToday) {
      logs.push(`⏭️ FOMO already sent today for ${lot.lot_name}`);
      return null;
    }

    // Get customers who have ordered this lot before or viewed it
    // For now, we'll create a general FOMO notification for interested customers
    const fomoData = {
      lot_id: lot.id,
      lot_name: lot.lot_name,
      product_name: lot.product_name,
      current_price: lot.current_price,
      next_price: nextPrice,
      hours_until_increase: hoursUntilIncrease,
      percent_increase: percentIncrease
    };

    if (!dryRun) {
      // Send FOMO notification to all users who have interacted with preorder products
      // This could be optimized to target specific users based on their wishlist/cart
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: null, // Broadcast - will be filtered by frontend
        type: 'promo',
        title: `⏰ Giá sắp tăng ${percentIncrease}%!`,
        message: `${lot.product_name} - Chỉ còn ${hoursUntilIncrease}h để mua với giá ${lot.current_price.toLocaleString('vi-VN')}đ. Sau đó sẽ tăng lên ${nextPrice.toLocaleString('vi-VN')}đ!`,
        link: `/PreOrderProductDetail?id=${lot.id}`,
        priority: 'high',
        is_read: false,
        metadata: {
          notification_type: 'price_fomo',
          lot_id: lot.id,
          lot_name: lot.lot_name,
          product_name: lot.product_name,
          current_price: lot.current_price,
          next_price: nextPrice,
          hours_until_increase: hoursUntilIncrease,
          percent_increase: percentIncrease
        }
      });

      // Also send email to subscribed customers (if we have their emails)
      // This would require a subscription list - for now, create admin alert
      await base44.asServiceRole.entities.AdminNotification.create({
        recipient_email: null,
        type: 'system_alert',
        title: `🔔 FOMO Alert: ${lot.product_name}`,
        message: `Giá sẽ tăng ${percentIncrease}% trong ${hoursUntilIncrease}h. Có thể muốn gửi email marketing?`,
        link: '/AdminProductLots',
        priority: 'normal',
        is_read: false,
        related_entity_type: 'ProductLot',
        related_entity_id: lot.id,
        metadata: fomoData
      });

      logs.push(`📢 FOMO sent for ${lot.lot_name}: +${percentIncrease}% in ${hoursUntilIncrease}h`);
    }

    return fomoData;

  } catch (error) {
    logs.push(`❌ FOMO error for ${lot.lot_name}: ${error.message}`);
    return null;
  }
}

// ========== HELPER: Send targeted FOMO emails ==========

async function sendFomoEmailsToInterestedUsers(base44, lot, fomoData) {
  try {
    // Get orders that contain this lot (customers who already bought)
    const orders = await base44.asServiceRole.entities.Order.filter(
      { has_preorder_items: true },
      '-created_date',
      500
    );

    // Find customers who ordered similar products
    const interestedEmails = new Set();
    
    for (const order of orders) {
      if (order.items?.some(item => item.lot_id === lot.id)) {
        // Already bought this lot - skip
        continue;
      }
      // Add to interested list if they've bought preorder items before
      if (order.customer_email) {
        interestedEmails.add(order.customer_email);
      }
    }

    // Limit to avoid spam
    const emailList = Array.from(interestedEmails).slice(0, 50);

    for (const email of emailList) {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `⏰ [FOMO] ${lot.product_name} - Giá sắp tăng ${fomoData.percent_increase}%!`,
        body: generateFomoEmailTemplate(lot, fomoData)
      });
    }

    return emailList.length;
  } catch (error) {
    console.error('Error sending FOMO emails:', error);
    return 0;
  }
}

function generateFomoEmailTemplate(lot, fomoData) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35, #FF9F1C); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">⏰ Giá Sắp Tăng!</h1>
        <p style="color: white; opacity: 0.9; margin: 10px 0 0 0;">Chỉ còn ${fomoData.hours_until_increase} giờ</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${lot.product_image || ''}" alt="${lot.product_name}" style="max-width: 200px; border-radius: 12px;"/>
        </div>
        
        <h2 style="color: #333; text-align: center;">${lot.product_name}</h2>
        <p style="text-align: center; color: #666;">${lot.lot_name}</p>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #999; text-decoration: line-through; font-size: 14px;">
            Giá sau: ${fomoData.next_price.toLocaleString('vi-VN')}đ
          </p>
          <p style="margin: 10px 0; color: #FF6B35; font-size: 28px; font-weight: bold;">
            ${fomoData.current_price.toLocaleString('vi-VN')}đ
          </p>
          <p style="margin: 0; background: #FF6B35; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-size: 14px;">
            Tiết kiệm ${fomoData.percent_increase}%
          </p>
        </div>

        <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #E65100; font-weight: bold;">
            ⏰ Chỉ còn ${fomoData.hours_until_increase} giờ để mua với giá này!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="/PreOrderProductDetail?id=${lot.id}" style="background: linear-gradient(135deg, #FF6B35, #FF9F1C); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
            🛒 Mua Ngay
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
          Đây là email thông báo giá từ Farmer Smart. 
          <a href="#" style="color: #999;">Hủy đăng ký</a>
        </p>
      </div>
    </div>
  `;
}