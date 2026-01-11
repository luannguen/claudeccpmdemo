/**
 * Gift Context Policies - ECARD-F19
 * Ngữ cảnh quan hệ khi tặng quà
 * Nâng quà tặng thành công cụ giữ quan hệ
 */

/**
 * Gift Context Types - Ngữ cảnh quan hệ
 */
export const GIFT_CONTEXT = {
  FIRST_MEETING: 'first_meeting',      // Tri ân lần gặp đầu
  THANK_ACQUAINTANCE: 'thank_acquaintance', // Cảm ơn người quen
  BIRTHDAY_WISH: 'birthday_wish',       // Chúc mừng sinh nhật
  CARE_CONNECTION: 'care_connection',   // Chăm sóc mối quan hệ
  CONGRATULATION: 'congratulation',     // Chúc mừng thành công
  APOLOGY: 'apology',                   // Xin lỗi / Hối tiếc
  OTHER: 'other'                        // Khác
};

/**
 * Gift Context Configuration
 * Mỗi context có label, emoji, message gợi ý và thông điệp cho người nhận
 */
export const GIFT_CONTEXT_CONFIG = {
  [GIFT_CONTEXT.FIRST_MEETING]: {
    label: 'Tri ân lần gặp đầu',
    emoji: '🤝',
    description: 'Cảm ơn cuộc gặp gỡ',
    defaultMessage: 'Rất vui được gặp bạn! Hy vọng món quà nhỏ này sẽ là khởi đầu cho mối quan hệ tốt đẹp.',
    receiverLabel: 'Quà tri ân lần gặp đầu',
    receiverMessage: 'gửi tặng bạn món quà tri ân sau lần gặp gỡ',
    color: 'emerald',
    priority: 1
  },
  [GIFT_CONTEXT.THANK_ACQUAINTANCE]: {
    label: 'Cảm ơn người quen',
    emoji: '🙏',
    description: 'Tri ân sự giúp đỡ',
    defaultMessage: 'Cảm ơn bạn đã luôn giúp đỡ tôi! Món quà nhỏ này thể hiện lòng biết ơn của tôi.',
    receiverLabel: 'Quà cảm ơn',
    receiverMessage: 'gửi tặng bạn để tri ân sự giúp đỡ',
    color: 'amber',
    priority: 2
  },
  [GIFT_CONTEXT.BIRTHDAY_WISH]: {
    label: 'Chúc mừng sinh nhật',
    emoji: '🎂',
    description: 'Sinh nhật vui vẻ',
    defaultMessage: 'Chúc mừng sinh nhật! Chúc bạn một tuổi mới thật nhiều niềm vui và hạnh phúc.',
    receiverLabel: 'Quà sinh nhật',
    receiverMessage: 'gửi tặng bạn nhân dịp sinh nhật',
    color: 'pink',
    priority: 3
  },
  [GIFT_CONTEXT.CARE_CONNECTION]: {
    label: 'Chăm sóc mối quan hệ',
    emoji: '💚',
    description: 'Giữ kết nối ấm áp',
    defaultMessage: 'Lâu rồi không gặp nhau! Hy vọng bạn khỏe mạnh. Gửi bạn chút quà nhỏ.',
    receiverLabel: 'Quà chăm sóc',
    receiverMessage: 'gửi tặng bạn vì nhớ bạn',
    color: 'green',
    priority: 4
  },
  [GIFT_CONTEXT.CONGRATULATION]: {
    label: 'Chúc mừng thành công',
    emoji: '🎉',
    description: 'Ăn mừng cùng bạn',
    defaultMessage: 'Xin chúc mừng thành công của bạn! Bạn xứng đáng với điều này.',
    receiverLabel: 'Quà chúc mừng',
    receiverMessage: 'gửi tặng bạn để chúc mừng thành công',
    color: 'violet',
    priority: 5
  },
  [GIFT_CONTEXT.APOLOGY]: {
    label: 'Xin lỗi',
    emoji: '💐',
    description: 'Bày tỏ sự hối tiếc',
    defaultMessage: 'Tôi thực sự xin lỗi. Hy vọng món quà nhỏ này thể hiện được tấm lòng của tôi.',
    receiverLabel: 'Quà xin lỗi',
    receiverMessage: 'gửi tặng bạn với lời xin lỗi chân thành',
    color: 'rose',
    priority: 6
  },
  [GIFT_CONTEXT.OTHER]: {
    label: 'Khác',
    emoji: '🎁',
    description: 'Không cần lý do',
    defaultMessage: '',
    receiverLabel: 'Quà tặng',
    receiverMessage: 'gửi tặng bạn',
    color: 'gray',
    priority: 7
  }
};

/**
 * Get context config by key
 */
export const getContextConfig = (contextKey) => {
  return GIFT_CONTEXT_CONFIG[contextKey] || GIFT_CONTEXT_CONFIG[GIFT_CONTEXT.OTHER];
};

/**
 * Get sorted contexts (by priority)
 */
export const getSortedContexts = () => {
  return Object.entries(GIFT_CONTEXT_CONFIG)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .map(([key, config]) => ({ key, ...config }));
};

/**
 * Map old occasion to new gift_context
 */
export const mapOccasionToContext = (occasion) => {
  const mapping = {
    birthday: GIFT_CONTEXT.BIRTHDAY_WISH,
    anniversary: GIFT_CONTEXT.CARE_CONNECTION,
    holiday: GIFT_CONTEXT.CARE_CONNECTION,
    thank_you: GIFT_CONTEXT.THANK_ACQUAINTANCE,
    congratulations: GIFT_CONTEXT.CONGRATULATION,
    other: GIFT_CONTEXT.OTHER
  };
  return mapping[occasion] || GIFT_CONTEXT.OTHER;
};

/**
 * Get receiver display info
 * Hiển thị context ý nghĩa cho người nhận quà
 */
export const getReceiverDisplayInfo = (gift) => {
  // Ưu tiên gift_context, fallback về occasion
  const contextKey = gift.gift_context || mapOccasionToContext(gift.occasion);
  const config = getContextConfig(contextKey);
  
  return {
    contextLabel: config.receiverLabel,
    contextMessage: `${gift.sender_name} ${config.receiverMessage}`,
    emoji: config.emoji,
    color: config.color
  };
};

/**
 * Get context badge color classes
 */
export const getContextColorClasses = (contextKey) => {
  const config = getContextConfig(contextKey);
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colorMap[config.color] || colorMap.gray;
};