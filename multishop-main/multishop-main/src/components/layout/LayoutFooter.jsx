import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Leaf, Phone, Mail, Instagram, Facebook, MapPin, Shield, Store, Heart, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSiteSettings } from "@/components/cms/useSiteConfig";

export default function LayoutFooter({ currentUser, isAdmin }) {
  const { siteName, siteTagline, contact, social, footer } = useSiteSettings();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      const existing = await base44.entities.NewsletterSubscriber.list('-created_date', 500);
      const alreadySubscribed = existing.find(s => s.email.toLowerCase() === newsletterEmail.toLowerCase());

      if (alreadySubscribed) {
        setNewsletterStatus('exists');
      } else {
        await base44.entities.NewsletterSubscriber.create({
          email: newsletterEmail.toLowerCase(),
          status: 'active',
          source: 'website_footer',
          subscribed_date: new Date().toISOString()
        });
        setNewsletterStatus('success');
      }
      
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(null), 5000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className="bg-[#0F0F0F] text-white relative overflow-hidden" role="contentinfo">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F]" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(1rem,2vw,2.5rem)] text-center md:text-left">
          {/* Brand Column */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start mb-[1.2em]">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-[#7CB342] sparkle-animation" aria-hidden="true" />
              <div>
                <h2 className="text-2xl font-bold glow-text" style={{ fontFamily: 'var(--font-sans)' }}>{siteName || 'FARMER SMART'}</h2>
                <p className="text-xs text-[#7CB342] tracking-widest">{siteTagline || 'Trang Trại Organic'}</p>
              </div>
            </div>
            <p className="text-sm leading-[1.618] text-gray-300 mb-6">
              Trang trại organic hàng đầu Việt Nam. Sản phẩm 100% hữu cơ,
              không dư lượng hóa chất, cam kết an toàn cho sức khỏe gia đình bạn.
            </p>
            <div className="flex gap-4" role="list" aria-label="Mạng xã hội">
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center hover:bg-[#FF9800] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                  aria-label="Theo dõi trên Instagram"
                  role="listitem"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </a>
              )}
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#7CB342] rounded-full flex items-center justify-center hover:bg-[#FF9800] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                  aria-label="Theo dõi trên Facebook"
                  role="listitem"
                >
                  <Facebook className="w-5 h-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Products Column */}
          <div className="mb-[1.2em]">
            <h3 className="text-lg font-semibold mb-6 text-[#7CB342]" style={{ fontFamily: 'var(--font-sans)' }}>Sản Phẩm Nổi Bật</h3>
            <nav aria-label="Danh mục sản phẩm">
              <ul className="space-y-3 text-sm">
                <li><Link to={createPageUrl("Services")} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">Rau Củ Tươi</Link></li>
                <li><Link to={createPageUrl("Services")} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">Trái Cây Organic</Link></li>
                <li><Link to={createPageUrl("Services")} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">Thực Phẩm Chế Biến</Link></li>
                <li><Link to={createPageUrl("Services")} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">Gạo & Ngũ Cốc</Link></li>
                <li><Link to={createPageUrl("Services")} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">Combo Gia Đình</Link></li>
              </ul>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="mb-[1.2em]">
            <h3 className="text-lg font-semibold mb-6 text-[#7CB342]" style={{ fontFamily: 'var(--font-sans)' }}>Liên Hệ</h3>
            <address className="space-y-4 text-sm flex flex-col items-center md:items-start not-italic">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#7CB342] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-300 leading-[1.618]">
                  {contact?.address || 'Đường Trần Hưng Đạo'}, {contact?.address_detail || 'Phường 10'}, {contact?.city || 'Đà Lạt'}, {contact?.province || 'Lâm Đồng'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#7CB342]" aria-hidden="true" />
                <a href={`tel:${contact?.phone?.replace(/\s/g, '') || '+84987654321'}`} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">
                  {contact?.phone || '098 765 4321'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#7CB342]" aria-hidden="true" />
                <a href={`mailto:${contact?.email || 'info@farmersmart.vn'}`} className="text-gray-300 hover:text-[#7CB342] transition-colors duration-300">
                  {contact?.email || 'info@farmersmart.vn'}
                </a>
              </div>
            </address>
          </div>

          {/* Newsletter Column */}
          <div className="mb-[1.2em]">
            <h3 className="text-lg font-semibold mb-6 text-[#7CB342]" style={{ fontFamily: 'var(--font-sans)' }}>Nhận Tin Khuyến Mãi</h3>
            <p className="text-sm text-gray-300 mb-4 leading-[1.618]">
              Đăng ký để nhận thông tin sản phẩm mới và ưu đãi đặc biệt.
            </p>
            
            {newsletterStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                ✅ Đăng ký thành công! Cảm ơn bạn.
              </div>
            )}
            {newsletterStatus === 'exists' && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
                ⚠️ Email này đã đăng ký rồi.
              </div>
            )}
            {newsletterStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                ❌ Có lỗi xảy ra. Vui lòng thử lại.
              </div>
            )}
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto md:max-w-none" aria-label="Đăng ký nhận tin">
              <label htmlFor="newsletter-email" className="sr-only">Địa chỉ email</label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 bg-white/10 border border-[#7CB342]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
              >
                Đăng Ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            {footer?.copyright_text || `© ${new Date().getFullYear()} ${siteName || 'Farmer Smart'}. Tất cả quyền được bảo lưu.`}
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <nav aria-label="Liên kết pháp lý">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link
                  to={createPageUrl("Sitemap")}
                  className="text-gray-400 hover:text-[#7CB342] transition-colors duration-300"
                >
                  Sitemap
                </Link>
                
                {currentUser && (
                  <>
                    <Link
                      to={createPageUrl("MyWishlist")}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-300 flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4" />
                      Yêu Thích
                    </Link>
                    <Link
                      to={createPageUrl("MyCommunications")}
                      className="text-gray-400 hover:text-[#7CB342] transition-colors duration-300 flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Tin Nhắn
                    </Link>
                  </>
                )}
                
                {!currentUser && (
                  <Link
                    to={createPageUrl("TenantSignup")}
                    className="text-gray-400 hover:text-[#FF9800] transition-colors duration-300 flex items-center gap-1 font-medium"
                  >
                    <Store className="w-4 h-4" />
                    Đăng Ký Shop
                  </Link>
                )}
                
                {(isAdmin || !currentUser) && (
                  <Link
                    to={createPageUrl("AdminLogin")}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-300 flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Quản Trị
                  </Link>
                )}
                
                <a href="#" className="text-gray-400 hover:text-[#7CB342] transition-colors duration-300">Chính Sách</a>
                <a href="#" className="text-gray-400 hover:text-[#7CB342] transition-colors duration-300">Điều Khoản</a>
              </div>
            </nav>

            <div className="text-xs text-gray-500">
              Thiết kế bởi: <span className="text-[#7CB342] hover:text-white transition-colors duration-300">Digital Doctors</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}