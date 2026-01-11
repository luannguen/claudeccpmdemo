/**
 * Live Edit Types & Constants
 * 
 * Định nghĩa cấu trúc dữ liệu cho Live Edit system
 */

// ========== SECTION TYPES ==========
export const SECTION_TYPES = {
  HERO: 'hero',
  WHY_CHOOSE_US: 'why_choose_us',
  PRODUCT_SPECIALTY: 'product_specialty',
  WHAT_WE_DO: 'what_we_do',
  PROMOTIONAL_BANNER: 'promotional_banner',
  TESTIMONIALS: 'testimonials',
  CATEGORIES: 'categories',
  BRAND_PARTNERS: 'brand_partners',
  // Team page
  FOUNDER: 'founder',
  EXPERTISE_PILLARS: 'expertise_pillars',
  TEAM_MEMBERS: 'team_members',
  // Contact page
  CONTACT_INFO: 'contact_info',
  FAQ: 'faq',
  // Scroll-driven Homepage Frames
  HOME_FRAME_0: 'home_frame_0',
  HOME_FRAME_1: 'home_frame_1',
  HOME_FRAME_2: 'home_frame_2',
  HOME_FRAME_3: 'home_frame_3',
  HOME_FRAME_4: 'home_frame_4'
};

// ========== DEFAULT SECTION DATA ==========
export const DEFAULT_SECTION_DATA = {
  // Team Page Header
  team_page: {
    badge: "Đội Ngũ Của Chúng Tôi",
    title: "Người Sáng Lập & Chuyên Gia",
    subtitle: "Gặp gỡ đội ngũ chuyên gia tận tâm đằng sau mỗi sản phẩm organic chất lượng cao."
  },
  
  // Team Founder
  team_founder: {
    name: "Ông Trần Thanh Liêm",
    title: "Nhà Sáng Lập & CEO",
    story: "Với hơn 15 năm kinh nghiệm trong ngành nông nghiệp hữu cơ, tôi đã xây dựng Zero Farm với tâm huyết mang đến những sản phẩm sạch, an toàn cho mọi gia đình Việt.",
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=90"
  },

  // Team Expertise Pillars
  expertise_pillars: {
    title: "Triết Lý Của Chúng Tôi",
    pillars: [
      {
        icon: "ShieldCheck",
        title: "Chứng Nhận Quốc Tế",
        description: "Đạt chuẩn VietGAP và GlobalGAP, cam kết chất lượng cao nhất cho mọi sản phẩm."
      },
      {
        icon: "Droplets",
        title: "Công Nghệ Tiên Tiến",
        description: "Hệ thống tưới nhỏ giọt tự động, nhà kính hiện đại theo tiêu chuẩn Nhật Bản."
      },
      {
        icon: "Beaker",
        title: "Kiểm Nghiệm Nghiêm Ngặt",
        description: "Mọi sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao đến khách hàng."
      }
    ]
  },

  // Team Members
  team_members: {
    title: "Đội Ngũ Chuyên Gia",
    members: [
      {
        name: "Kỹ Sư Nguyễn Minh Tuấn",
        title: "Chuyên Gia Canh Tác Hữu Cơ",
        bio: "Với 15 năm kinh nghiệm trong lĩnh vực nông nghiệp hữu cơ.",
        image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90"
      },
      {
        name: "Chị Trần Thị Mai",
        title: "Chuyên Viên Kiểm Nghiệm",
        bio: "Chịu trách nhiệm kiểm tra chất lượng sản phẩm.",
        image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=90"
      },
      {
        name: "Anh Phạm Văn Long",
        title: "Trưởng Phòng Canh Tác",
        bio: "Quản lý đội ngũ nông dân và quy trình canh tác.",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90"
      }
    ]
  },
  
  // Contact Page
  contact_page: {
    badge: "Liên Hệ Với Chúng Tôi",
    title: "Liên Hệ Zero Farm",
    subtitle: "Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn về sản phẩm organic."
  },

  // Hero Section
  hero: {
    slides: [
      {
        id: 1,
        image_url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=2560&q=90",
        headline: "Trang Trại Organic #1 Việt Nam",
        subheading: "Rau Củ Quả Sạch - An Toàn - Không Dư Lượng",
        description: "Trải nghiệm sản phẩm nông nghiệp hữu cơ cao cấp từ Zero Farm.",
        cta_text: "ĐẶT HÀNG NGAY",
      },
      {
        id: 2,
        image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2560&q=90",
        headline: "Canh Tác Theo Tiêu Chuẩn Organic",
        subheading: "Chứng Nhận VietGAP & GlobalGAP",
        description: "Quy trình sản xuất khép kín, kiểm soát chặt chẽ.",
        cta_text: "TÌM HIỂU QUY TRÌNH",
      }
    ],
    trust_indicators: [
      { text: "5000+ Khách Hàng" },
      { text: "Chứng Nhận VietGAP" },
      { text: "3 Trang Trại Đà Lạt" }
    ],
    urgency_title: "ƯU ĐÃI TUẦN ĐẦU",
    urgency_text: "Đặt hàng ngay hôm nay và nhận giảm 20% cho đơn đầu tiên + Miễn phí giao hàng"
  },

  // Why Choose Us Section
  why_choose_us: {
    badge: "TRANG TRẠI ORGANIC HÀNG ĐẦU VIỆT NAM",
    title: "Tại Sao Chọn",
    title_highlight: "Zero Farm?",
    description: "Trang trại organic cao cấp tại Đà Lạt với hơn 10 năm kinh nghiệm.",
    features: [
      {
        icon: "Leaf",
        title: "100% Hữu Cơ Organic",
        subtitle: "KHÔNG HÓA CHẤT",
        description: "Canh tác hoàn toàn tự nhiên, không sử dụng thuốc trừ sâu."
      },
      {
        icon: "ShieldCheck",
        title: "Cam Kết Không Dư Lượng",
        subtitle: "AN TOÀN TUYỆT ĐỐI",
        description: "Mọi sản phẩm đều được kiểm nghiệm kỹ lưỡng."
      },
      {
        icon: "Award",
        title: "Tươi Mới Mỗi Ngày",
        subtitle: "TỪ VƯỜN ĐẾN BÀN",
        description: "Thu hoạch vào buổi sáng sớm và giao hàng trong ngày."
      }
    ],
    cta_text: "Đặt Hàng Ngay"
  },

  // Product Specialty Section
  product_specialty: {
    title: "Quy Trình Sản Xuất",
    title_highlight: "Đạt Chuẩn Quốc Tế",
    description: "Tại Zero Farm, chúng tôi cam kết sử dụng phương pháp canh tác hữu cơ 100%.",
    items: [
      { icon: "Leaf", text: "100% Hữu Cơ" },
      { icon: "FlaskConical", text: "Không Phân Hóa Học" },
      { icon: "ShieldCheck", text: "Chứng Nhận VietGAP" },
      { icon: "Beaker", text: "Kiểm Nghiệm Kỹ" },
      { icon: "Award", text: "Giải Thưởng Quốc Gia" },
      { icon: "Droplets", text: "Tưới Nhỏ Giọt" },
      { icon: "TreeDeciduous", text: "Trồng Xen Canh" }
    ]
  },

  // What We Do Section
  what_we_do: {
    badge: "Phương Pháp Canh Tác Bền Vững",
    title: "Cam Kết Zero Farm",
    title_highlight: "An Toàn Là Trên Hết",
    description: "Chào mừng bạn đến với Zero Farm - trang trại organic cao cấp tại Đà Lạt.",
    left_image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=90",
    right_image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&q=90",
    features: [
      {
        icon: "ShieldCheck",
        title: "Công Nghệ Canh Tác Hiện Đại",
        description: "Hệ thống tưới nhỏ giọt tự động, nhà kính tiêu chuẩn Nhật Bản"
      },
      {
        icon: "Leaf",
        title: "100% Phân Bón Hữu Cơ",
        description: "Sử dụng phân compost tự nhiên, không hóa chất độc hại"
      },
      {
        icon: "Award",
        title: "Chứng Nhận VietGAP & GlobalGAP",
        description: "Đạt tiêu chuẩn nông nghiệp an toàn quốc tế từ năm 2015"
      },
      {
        icon: "Heart",
        title: "Tận Tâm Với Khách Hàng",
        description: "Dịch vụ tư vấn dinh dưỡng và giao hàng tận nhà miễn phí"
      }
    ],
    cta_text: "Đặt Hàng Ngay Hôm Nay"
  },

  // Promotional Banner Section
  promotional_banner: {
    discount_text: "GIẢM 30%",
    subtitle: "Ưu Đãi Đặc Biệt Cho Khách Hàng Mới",
    description: "Đặt hàng ngay hôm nay và nhận gói rau củ tươi ngon + Miễn phí giao hàng",
    cta_text: "NHẬN ƯU ĐÃI NGAY"
  },

  // Testimonials Section
  testimonials: {
    badge: "Phản Hồi Khách Hàng",
    title: "Khách Hàng Nói Gì",
    title_highlight: "Về Zero Farm?",
    description: "Hơn 5000+ khách hàng tin tưởng và lựa chọn sản phẩm organic của chúng tôi",
    stats: [
      { value: "5000+", label: "Khách Hàng" },
      { value: "4.9/5", label: "Đánh Giá" },
      { value: "98%", label: "Hài Lòng" }
    ]
  },

  // Categories Section
  categories: {
    badge: "Sản Phẩm Của Chúng Tôi",
    title: "Danh Mục Sản Phẩm",
    title_highlight: "100% Organic",
    description: "Khám phá bộ sưu tập sản phẩm nông nghiệp hữu cơ cao cấp, cam kết không dư lượng hóa chất độc hại."
  }
};

// ========== FIELD TYPE DEFINITIONS ==========
export const FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  IMAGE: 'image',
  ARRAY: 'array',
  OBJECT: 'object'
};

// ========== SECTION SCHEMA ==========
// Định nghĩa các field có thể edit cho mỗi section
export const SECTION_SCHEMAS = {
  hero: {
    fields: {
      'slides': { type: FIELD_TYPES.ARRAY, label: 'Slides' },
      'urgency_title': { type: FIELD_TYPES.TEXT, label: 'Urgency Title' },
      'urgency_text': { type: FIELD_TYPES.TEXTAREA, label: 'Urgency Text' }
    }
  },
  why_choose_us: {
    fields: {
      'badge': { type: FIELD_TYPES.TEXT, label: 'Badge' },
      'title': { type: FIELD_TYPES.TEXT, label: 'Title' },
      'title_highlight': { type: FIELD_TYPES.TEXT, label: 'Title Highlight' },
      'description': { type: FIELD_TYPES.TEXTAREA, label: 'Description' },
      'features': { type: FIELD_TYPES.ARRAY, label: 'Features' },
      'cta_text': { type: FIELD_TYPES.TEXT, label: 'CTA Text' }
    }
  },
  promotional_banner: {
    fields: {
      'discount_text': { type: FIELD_TYPES.TEXT, label: 'Discount Text' },
      'subtitle': { type: FIELD_TYPES.TEXT, label: 'Subtitle' },
      'description': { type: FIELD_TYPES.TEXT, label: 'Description' },
      'cta_text': { type: FIELD_TYPES.TEXT, label: 'CTA Text' }
    }
  },
  // Team page sections
  team_page: {
    fields: {
      'badge': { type: FIELD_TYPES.TEXT, label: 'Badge' },
      'title': { type: FIELD_TYPES.TEXT, label: 'Title' },
      'subtitle': { type: FIELD_TYPES.TEXTAREA, label: 'Subtitle' }
    }
  },
  team_founder: {
    fields: {
      'name': { type: FIELD_TYPES.TEXT, label: 'Tên Founder' },
      'title': { type: FIELD_TYPES.TEXT, label: 'Chức danh' },
      'story': { type: FIELD_TYPES.TEXTAREA, label: 'Câu chuyện' },
      'image_url': { type: FIELD_TYPES.IMAGE, label: 'Ảnh Founder' }
    }
  },
  expertise_pillars: {
    fields: {
      'title': { type: FIELD_TYPES.TEXT, label: 'Tiêu đề' },
      'pillars': { type: FIELD_TYPES.ARRAY, label: 'Các trụ cột' }
    }
  },
  team_members: {
    fields: {
      'title': { type: FIELD_TYPES.TEXT, label: 'Tiêu đề' },
      'members': { type: FIELD_TYPES.ARRAY, label: 'Thành viên' }
    }
  }
};