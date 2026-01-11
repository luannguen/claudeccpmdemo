/**
 * Gift DTOs
 * Data Transfer Objects for Gift module
 */

/**
 * @typedef {Object} GiftOrderCreateDTO
 * @property {string} buyer_user_id
 * @property {Array<{product_id: string, product_name: string, product_image: string, price: number, quantity: number}>} items
 * @property {number} total_amount
 */

/**
 * @typedef {Object} GiftConfigDTO
 * @property {string} receiver_user_id
 * @property {string} receiver_name
 * @property {string} receiver_email
 * @property {string} connection_id
 * @property {string} delivery_mode - instant | scheduled | redeem_required
 * @property {string} [scheduled_delivery_date] - ISO date string
 * @property {string} [occasion] - birthday | anniversary | thank_you | etc
 * @property {string} [message]
 * @property {boolean} [can_swap]
 */

/**
 * @typedef {Object} RedeemShippingDTO
 * @property {string} phone
 * @property {string} address
 * @property {string} [city]
 * @property {string} [district]
 * @property {string} [ward]
 * @property {string} [delivery_date] - ISO date string
 * @property {string} [delivery_time]
 */

/**
 * @typedef {Object} SwapGiftDTO
 * @property {string} original_gift_id
 * @property {string} new_product_id
 */

export const GiftDTO = {};