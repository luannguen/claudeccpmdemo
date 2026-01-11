/**
 * Inventory Event Handler - Commerce domain
 * 
 * Handles: stock.low, stock.out, stock.restocked
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { InventoryEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle low stock alert
 */
export const handleLowStock = async (payload) => {
  const { product } = payload;

  console.log('⚠️ [InventoryEventHandler] stock.low:', product.name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'low_stock',
    recipients: null,
    payload: {
      title: `⚠️ Sắp Hết Hàng: ${product.name}`,
      message: `Chỉ còn ${product.stock_quantity} ${product.unit}`,
      link: createPageUrl('AdminInventory'),
      priority: 'high',
      requiresAction: true,
      metadata: {
        product_id: product.id,
        product_name: product.name,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold
      }
    },
    routing: {
      related_entity_type: 'Product',
      related_entity_id: product.id
    }
  });
};

/**
 * Handle out of stock
 */
export const handleOutOfStock = async (payload) => {
  const { product } = payload;

  console.log('❌ [InventoryEventHandler] stock.out:', product.name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'out_of_stock',
    recipients: null,
    payload: {
      title: `❌ Hết Hàng: ${product.name}`,
      message: `Sản phẩm ${product.name} đã hết hàng!`,
      link: createPageUrl('AdminInventory'),
      priority: 'urgent',
      requiresAction: true,
      metadata: {
        product_id: product.id,
        product_name: product.name
      }
    },
    routing: {
      related_entity_type: 'Product',
      related_entity_id: product.id
    }
  });
};

/**
 * Handle restocked
 */
export const handleRestocked = async (payload) => {
  const { product, quantity } = payload;

  console.log('✅ [InventoryEventHandler] stock.restocked:', product.name);

  await notificationEngine.create({
    actor: 'admin',
    type: 'inventory_update',
    recipients: null,
    payload: {
      title: `📦 Nhập Kho: ${product.name}`,
      message: `Đã nhập thêm ${quantity} ${product.unit}. Tồn kho mới: ${product.stock_quantity} ${product.unit}`,
      link: createPageUrl('AdminInventory'),
      priority: 'normal',
      metadata: {
        product_id: product.id,
        product_name: product.name,
        added_quantity: quantity,
        new_stock: product.stock_quantity
      }
    },
    routing: {
      related_entity_type: 'Product',
      related_entity_id: product.id
    }
  });
};

/**
 * Register all inventory event handlers
 */
export const registerInventoryHandlers = (registry) => {
  registry.register(InventoryEvents.LOW_STOCK, handleLowStock, { priority: 8 });
  registry.register(InventoryEvents.OUT_OF_STOCK, handleOutOfStock, { priority: 10 });
  registry.register(InventoryEvents.RESTOCKED, handleRestocked, { priority: 5 });
  
  console.log('✅ Inventory event handlers registered');
};

export default {
  handleLowStock,
  handleOutOfStock,
  handleRestocked,
  registerInventoryHandlers
};