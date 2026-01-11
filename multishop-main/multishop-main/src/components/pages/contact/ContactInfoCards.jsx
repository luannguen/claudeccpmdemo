/**
 * ContactInfoCards - Cards hiển thị thông tin liên hệ
 */
import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

export default function ContactInfoCards({ contact, hours, social }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-[1.2em]"
    >
      {/* Address */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#7CB342]/10 rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2" data-live-edit="Tên trang trại">Trang Trại Zero Farm</h3>
            <p className="leading-[1.618] text-gray-600" data-live-edit="Địa chỉ">
              {contact.address}<br />
              {contact.address_detail}<br />
              {contact.city}, {contact.province}
            </p>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#7CB342]/10 rounded-2xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2" data-live-edit="Label điện thoại">{contact.phone_label}</h3>
            <p className="leading-[1.618] text-gray-600">
              <a href={`tel:${contact.phone?.replace(/\s/g, '')}`} className="text-[#7CB342] font-semibold hover:underline" data-live-edit="Số điện thoại">
                {contact.phone}
              </a><br />
              <span className="text-sm" data-live-edit="Ghi chú">Phục vụ 24/7 - Giao hàng trong ngày</span>
            </p>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#7CB342]/10 rounded-2xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2" data-live-edit="Label email">{contact.email_label}</h3>
            <p className="leading-[1.618] text-gray-600">
              <a href={`mailto:${contact.email}`} className="text-[#7CB342] hover:underline" data-live-edit="Email">{contact.email}</a><br />
              <span className="text-sm" data-live-edit="Ghi chú email">Phản hồi trong vòng 24 giờ</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#7CB342]/10 rounded-2xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-2" data-live-edit="Tiêu đề giờ làm việc">Giờ Làm Việc</h3>
            <div className="text-gray-600 space-y-1 leading-[1.618]" data-live-edit="Giờ làm việc">
              <p>Thứ Hai - Thứ Sáu: {hours.weekday}</p>
              <p>Thứ Bảy: {hours.saturday}</p>
              <p>Chủ Nhật: {hours.sunday}</p>
              {hours.note && (
                <p className="text-sm text-[#7CB342] font-medium mt-2">{hours.note}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-4">Theo Dõi Chúng Tôi</h3>
        <div className="flex gap-4">
          {social.instagram && (
            <a 
              href={social.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-[#7CB342] rounded-2xl flex items-center justify-center hover:bg-[#FF9800] transition-colors duration-300 text-white"
            >
              <Instagram className="w-6 h-6" />
            </a>
          )}
          {social.facebook && (
            <a 
              href={social.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 bg-[#7CB342] rounded-2xl flex items-center justify-center hover:bg-[#FF9800] transition-colors duration-300 text-white"
            >
              <Facebook className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}