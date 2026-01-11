/**
 * Frame4Exit - "Neo giữ & Lối thoát" (80-100% scroll)
 * 
 * Contact info + exit links + navigation
 */

import React from "react";
import { motion, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Icon } from "@/components/ui/AnimatedIcon";
import { ChevronDown } from "lucide-react";

// Default exit links
const DEFAULT_EXIT_LINKS = [
  { text: 'Sản phẩm', link: '/Services', icon: 'ShoppingBag' },
  { text: 'Blog', link: '/Blog', icon: 'FileText' },
  { text: 'Cộng đồng', link: '/Community', icon: 'Users' },
  { text: 'Liên hệ', link: '/Contact', icon: 'Mail' }
];

export default function Frame4Exit({ 
  frame, 
  scrollYProgress,
  currentFrame,
  isMobile 
}) {
  const isActive = currentFrame === 4;
  const opacity = useTransform(scrollYProgress, [0.78, 0.82, 1], [0, 1, 1]);
  
  const contact = frame?.content?.contact || { phone: '098 765 4321', email: 'info@zerofarm.vn' };
  const promo = frame?.content?.promo || { text: 'Giảm 10% đơn đầu', code: 'WELCOME10', show: true };
  const exitLinks = frame?.content?.exit_links || DEFAULT_EXIT_LINKS;
  const title = frame?.title || "Liên hệ với chúng tôi";
  const subtitle = frame?.subtitle || "Chúng tôi luôn sẵn sàng tư vấn";
  
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8"
      style={{ opacity }}
    >
      {/* Section badge */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-[#7CB342] text-sm font-semibold tracking-wider uppercase">
          Kết nối
        </span>
      </motion.div>
      
      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 text-center drop-shadow-2xl">
        {title}
      </h2>
      
      {/* Subtitle */}
      <p className="text-base md:text-lg text-white/90 mb-6 md:mb-8 text-center drop-shadow-lg">
        {subtitle}
      </p>
      
      {/* Contact Info */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        {contact.phone && (
          <a 
            href={`tel:${contact.phone}`}
            className="flex items-center justify-center gap-2 bg-[#7CB342] hover:bg-[#689F38] px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Icon.Phone size={20} className="text-white" />
            <span className="text-white font-semibold">{contact.phone}</span>
          </a>
        )}
        
        {contact.email && (
          <a 
            href={`mailto:${contact.email}`}
            className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/25 hover:bg-white/25 transition-all duration-300"
          >
            <Icon.Mail size={20} className="text-[#7CB342]" />
            <span className="text-white font-medium">{contact.email}</span>
          </a>
        )}
      </motion.div>
      
      {/* Promo Code */}
      {promo.show && promo.text && (
        <motion.div 
          className="bg-gradient-to-r from-[#FF9800]/90 to-[#F57C00]/90 backdrop-blur-md px-6 py-3 rounded-xl mb-6 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white font-semibold">{promo.text}</p>
          {promo.code && (
            <p className="text-white/90 text-sm mt-1">
              Mã: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{promo.code}</span>
            </p>
          )}
        </motion.div>
      )}
      
      {/* Exit Links */}
      <motion.div 
        className={`grid gap-3 w-full max-w-xl ${
          isMobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 0.4 }}
      >
        {exitLinks.map((link, index) => {
          const IconComponent = Icon[link.icon] || Icon.ArrowRight;
          
          return (
            <Link 
              key={index}
              to={createPageUrl(link.link?.replace('/', '') || 'Home')}
            >
              <motion.div
                className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -3 }}
              >
                <IconComponent size={isMobile ? 22 : 26} className="text-[#7CB342]" />
                <span className="text-white text-xs md:text-sm font-medium text-center">
                  {link.text}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
      
      {/* Scroll down hint */}
      <motion.div
        className="mt-8 md:mt-10 flex flex-col items-center text-white/50"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm mb-2">Cuộn xuống để xem thêm</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}