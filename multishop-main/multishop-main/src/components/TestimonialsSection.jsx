import React from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2 } from "@/components/cms/EditableSectionV2";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Live Edit
  const { isEditMode } = useLiveEditContext();

  // Fetch top 10 reviews with 5 stars
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['top-reviews'],
    queryFn: async () => {
      const allReviews = await base44.entities.Review.list('-created_date', 50);
      
      // Filter approved + 5 stars, take top 10
      const fiveStarReviews = (allReviews || [])
        .filter(r => {
          const data = r.data || r;
          return data.status === 'approved' && data.rating === 5;
        })
        .slice(0, 10);
      
      return fiveStarReviews;
    },
    staleTime: 5 * 60 * 1000
  });

  const nextTestimonial = () => {
    if (reviews && reviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }
  };

  const prevTestimonial = () => {
    if (reviews && reviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        </div>
      </section>
    );
  }

  const currentReview = reviews[currentIndex];
  const reviewData = currentReview?.data || currentReview;

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#7CB342] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#FF9800] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
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
              sectionKey="testimonials"
              fieldPath="badge"
              defaultValue="Phản Hồi Khách Hàng"
              className="font-sans text-sm text-[#7CB342] font-medium"
              as="span"
              label="Badge"
            />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            <EditableTextV2
              sectionKey="testimonials"
              fieldPath="title"
              defaultValue="Khách Hàng Nói Gì"
              className="text-[#0F0F0F]"
              as="span"
              label="Tiêu đề"
            />
            <br />
            <EditableTextV2
              sectionKey="testimonials"
              fieldPath="title_highlight"
              defaultValue="Về Zero Farm?"
              className="text-[#7CB342]"
              as="span"
              label="Highlight"
            />
          </h2>
          
          <EditableTextV2
            sectionKey="testimonials"
            fieldPath="description"
            defaultValue="Hơn 5000+ khách hàng tin tưởng và lựa chọn sản phẩm organic của chúng tôi"
            className="font-sans text-lg text-gray-600 max-w-2xl mx-auto"
            as="p"
            label="Mô tả"
          />
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-[#F5F9F3] to-white rounded-3xl p-8 md:p-12 shadow-xl relative">
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 text-[#7CB342]/20">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor">
                <path d="M12 28c0-6.627 5.373-12 12-12v8c-2.21 0-4 1.79-4 4h4v12H12V28zm24 0c0-6.627 5.373-12 12-12v8c-2.21 0-4 1.79-4 4h4v12H36V28z"/>
              </svg>
            </div>

            <div className="relative">
              {/* Customer Info */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  key={currentReview.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"
                >
                  {reviewData.customer_name?.charAt(0)?.toUpperCase() || 'K'}
                </motion.div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#0F0F0F]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {reviewData.customer_name}
                  </h3>
                  <p className="font-sans text-sm text-gray-500">Khách Hàng Đã Mua Hàng</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#FF9800] fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Title */}
              {reviewData.title && (
                <h4 className="font-semibold text-lg text-[#0F0F0F] mb-3">
                  {reviewData.title}
                </h4>
              )}

              {/* Review Text */}
              <motion.p
                key={currentReview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-sans text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic"
              >
                "{reviewData.comment}"
              </motion.p>

              {/* Product Tag */}
              <div className="inline-block bg-[#7CB342]/10 text-[#7CB342] px-4 py-2 rounded-full text-sm font-medium">
                {reviewData.product_name}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-[#7CB342] hover:text-white transition-all duration-300 flex items-center justify-center group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index ? 'bg-[#7CB342] w-8' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-[#7CB342] hover:text-white transition-all duration-300 flex items-center justify-center group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-12"
        >
          {[
            { value: "5000+", label: "Khách Hàng" },
            { value: "4.9/5", label: "Đánh Giá" },
            { value: "98%", label: "Hài Lòng" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#7CB342] mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                {stat.value}
              </p>
              <p className="font-sans text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}