import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2 } from "@/components/cms/EditableSectionV2";

const categories = [
  {
    id: 1,
    key: "vegetables",
    title: "Rau Củ Tươi",
    description: "Rau xanh, củ quả tươi ngon được thu hoạch mỗi sáng từ trang trại. Giàu vitamin và khoáng chất tự nhiên.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8C24 8 20 12 20 16C20 20 22 22 24 22C26 22 28 20 28 16C28 12 24 8 24 8Z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M24 22L24 40" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 26C16 26 18 28 20 28C22 28 24 26 24 26" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M24 26C24 26 26 28 28 28C30 28 32 26 32 26" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="20" cy="14" r="1" fill="currentColor"/>
        <circle cx="28" cy="14" r="1" fill="currentColor"/>
      </svg>
    ),
    bgColor: "bg-[#E8F5E9]"
  },
  {
    id: 2,
    key: "fruits",
    title: "Trái Cây Organic",
    description: "Trái cây ngọt tự nhiên, không phun thuốc bảo vệ thực vật. Giàu chất xơ và vitamin thiên nhiên.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="26" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M24 14C24 14 26 10 28 10C30 10 32 12 32 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 22L28 22" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <path d="M18 26L30 26" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <path d="M20 30L28 30" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      </svg>
    ),
    bgColor: "bg-[#FFF3E0]"
  },
  {
    id: 3,
    key: "rice",
    title: "Gạo & Ngũ Cốc",
    description: "Gạo organic đặc sản và các loại ngũ cốc nguyên hạt, không tẩm hóa chất bảo quản.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 12L16 36C16 38 17 40 20 40L28 40C31 40 32 38 32 36L32 12" stroke="currentColor" strokeWidth="2"/>
        <ellipse cx="24" cy="12" rx="8" ry="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 20C16 20 18 22 24 22C30 22 32 20 32 20" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 28C16 28 18 30 24 30C30 30 32 28 32 28" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    bgColor: "bg-white border border-[#7CB342]/20"
  },
  {
    id: 4,
    key: "processed",
    title: "Thực Phẩm Chế Biến",
    description: "Các sản phẩm chế biến từ nguyên liệu organic: mứt, sốt, gia vị không chất bảo quản.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="16" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M16 16L16 12C16 10 17 8 20 8L28 8C31 8 32 10 32 12L32 16" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M18 24L18 28" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M30 24L30 28" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    bgColor: "bg-[#FFF9C4]"
  },
  {
    id: 5,
    key: "combo",
    title: "Combo Gia Đình",
    description: "Gói sản phẩm tiết kiệm cho cả nhà, đa dạng dinh dưỡng với giá ưu đãi.",
    icon: (
      <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="18" width="28" height="22" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M18 18L18 14C18 12 19 10 22 10L26 10C29 10 30 12 30 14L30 18" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 26L24 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 29L28 29" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    bgColor: "bg-[#F3E5F5]"
  }
];

export default function CategoriesSection() {
  const scrollRef = React.useRef(null);
  const { isEditMode } = useLiveEditContext();

  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scrollStep = 1;
    const scrollDelay = 50;

    const autoScroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
        scrollContainer.scrollLeft = 0;
      } else {
        scrollAmount += scrollStep;
        scrollContainer.scrollLeft = scrollAmount;
      }
    };

    const intervalId = setInterval(autoScroll, scrollDelay);

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => {
      const newIntervalId = setInterval(autoScroll, scrollDelay);
      return newIntervalId;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', () => {
      clearInterval(intervalId);
      const newIntervalId = setInterval(autoScroll, scrollDelay);
    });

    return () => {
      clearInterval(intervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 section-editable"
        >
          <div className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#7CB342]" />
            <EditableTextV2
              sectionKey="categories"
              fieldPath="badge"
              defaultValue="Sản Phẩm Của Chúng Tôi"
              className="font-sans text-sm text-[#7CB342] font-medium"
              as="span"
              label="Badge"
            />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            <EditableTextV2
              sectionKey="categories"
              fieldPath="title"
              defaultValue="Danh Mục Sản Phẩm"
              className="text-[#0F0F0F]"
              as="span"
              label="Tiêu đề"
            />
            <br />
            <EditableTextV2
              sectionKey="categories"
              fieldPath="title_highlight"
              defaultValue="100% Organic"
              className="text-[#7CB342]"
              as="span"
              label="Highlight"
            />
          </h2>
          
          <EditableTextV2
            sectionKey="categories"
            fieldPath="description"
            defaultValue="Khám phá bộ sưu tập sản phẩm nông nghiệp hữu cơ cao cấp, cam kết không dư lượng hóa chất độc hại."
            className="font-sans text-lg text-gray-600 max-w-2xl mx-auto"
            as="p"
            label="Mô tả"
            multiline
          />
        </motion.div>

        {/* Auto-Scrolling Categories */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 cursor-pointer"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Duplicate categories for seamless loop */}
            {[...categories, ...categories].map((category, index) => (
              <Link 
                key={`${category.id}-${index}`} 
                to={createPageUrl(`Services?category=${category.key}`)} 
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: (index % categories.length) * 0.1,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <div className={`${category.bgColor} rounded-3xl p-6 h-full flex flex-col hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 min-h-[280px]`}>
                    {/* Icon */}
                    <div className="mb-6 text-[#558B2F] group-hover:text-[#7CB342] transition-colors duration-300">
                      {category.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-semibold text-[#0F0F0F] mb-4 group-hover:text-[#7CB342] transition-colors duration-300 leading-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                      {category.title}
                    </h3>
                    
                    <p className="font-sans text-gray-500 leading-relaxed mb-6 flex-grow">
                      {category.description}
                    </p>
                    
                    {/* Read More Button */}
                    <div className="flex items-center gap-2 font-sans text-sm font-medium text-gray-500 hover:text-[#7CB342] transition-colors duration-300 group mt-auto">
                      XEM SẢN PHẨM
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Manual Navigation Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <p className="font-sans text-sm text-gray-400">
            Di chuột để tạm dừng • Tự động cuộn danh mục
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}