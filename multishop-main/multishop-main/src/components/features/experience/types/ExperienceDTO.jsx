/**
 * @typedef {Object} ExperienceDTO
 * @property {string} id
 * @property {string} owner_user_id
 * @property {('VIDEO')} type
 * @property {string} code
 * @property {string} video_url
 * @property {string=} poster_url
 * @property {('ECARD'|'SHOP'|'POSTS'|'CUSTOM_URL')} cta_mode
 * @property {string=} cta_custom_url
 * @property {boolean} is_active
 * @property {number} view_count
 * @property {{allow_ar_on_android?: boolean, allow_in_webview?: boolean}=} device_policy
 * @property {{max_bitrate_kbps?: number, preload?: 'none'|'metadata'|'auto'}=} performance_policy
 */

export const __ExperienceDTO = {}; // placeholder export to avoid tree-shake complaints