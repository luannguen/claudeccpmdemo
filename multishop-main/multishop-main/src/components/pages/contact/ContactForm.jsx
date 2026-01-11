/**
 * ContactForm - Form liên hệ
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await base44.entities.ContactMessage.create({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        status: 'new',
        priority: 'normal',
        source: 'website',
        ip_address: '',
        user_agent: navigator.userAgent
      });

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20"
    >
      <h2 className="font-serif text-2xl font-bold text-[#0F0F0F] mb-6">Gửi Tin Nhắn</h2>
      
      {submitStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 font-medium">✅ Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">❌ Có lỗi xảy ra. Vui lòng thử lại sau.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Họ *</label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300"
              placeholder="Nguyễn"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300"
              placeholder="Văn A"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Số Điện Thoại *</label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300"
            placeholder="098 765 4321"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Chủ Đề *</label>
          <select
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300"
          >
            <option value="">Chọn chủ đề</option>
            <option value="order">Đặt Hàng</option>
            <option value="product">Hỏi Về Sản Phẩm</option>
            <option value="wholesale">Hợp Tác Bán Sỉ</option>
            <option value="visit">Tham Quan Trang Trại</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Lời Nhắn *</label>
          <textarea
            id="message"
            rows={4}
            required
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors duration-300 resize-none"
            placeholder="Xin chào Zero Farm, tôi muốn hỏi về..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang Gửi...' : 'Gửi Tin Nhắn'}
        </button>
      </form>
    </motion.div>
  );
}