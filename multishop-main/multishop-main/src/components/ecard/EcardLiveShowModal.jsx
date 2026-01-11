/**
 * EcardLiveShowModal - Hiển thị E-Card fullscreen presentation mode
 * UI Layer - Presentation only
 */

import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATE_STYLES = {
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'text-[#7CB342]',
    border: 'border-gray-200'
  },
  nature: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    text: 'text-green-900',
    accent: 'text-green-600',
    border: 'border-green-300'
  },
  professional: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    text: 'text-indigo-900',
    accent: 'text-blue-600',
    border: 'border-blue-300'
  },
  creative: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    text: 'text-purple-900',
    accent: 'text-pink-600',
    border: 'border-purple-300'
  },
  elegant: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    text: 'text-orange-900',
    accent: 'text-amber-600',
    border: 'border-amber-300'
  }
};

const THEME_STYLES = {
  light: { bg: 'bg-gray-50', card: 'bg-white', text: 'text-gray-900' },
  dark: { bg: 'bg-gray-900', card: 'bg-gray-800', text: 'text-white' },
  green: { bg: 'bg-green-900', card: 'bg-green-800', text: 'text-green-50' }
};

export default function EcardLiveShowModal({ profile, onClose }) {
  const template = TEMPLATE_STYLES[profile.template || 'minimal'];
  const theme = THEME_STYLES[profile.theme || 'light'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${theme.bg} flex items-center justify-center p-4`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`${template.bg} rounded-3xl shadow-2xl p-12 max-w-3xl w-full relative border-4 ${template.border}`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${theme.card} rounded-full p-2 hover:scale-110 transition-transform`}
          >
            <Icon.X size={24} className={template.text} />
          </button>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.display_name}
                className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-2xl"
              />
            ) : (
              <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white text-6xl font-bold shadow-2xl`}>
                {profile.display_name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center mb-10">
            <h1 className={`text-5xl font-bold ${template.text} mb-4`}>
              {profile.display_name}
            </h1>
            {profile.title_profession && (
              <p className={`text-2xl ${template.accent} mb-2`}>
                {profile.title_profession}
              </p>
            )}
            {profile.company_name && (
              <p className={`text-xl ${template.text} opacity-70`}>
                {profile.company_name}
              </p>
            )}
          </div>

          {profile.bio && (
            <p className={`text-center text-lg ${template.text} opacity-80 mb-10 italic max-w-2xl mx-auto`}>
              "{profile.bio}"
            </p>
          )}

          {/* Contact Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {profile.phone && (
              <ContactCard icon="Phone" label="Điện thoại" value={profile.phone} template={template} />
            )}
            {profile.email && (
              <ContactCard icon="Mail" label="Email" value={profile.email} template={template} />
            )}
            {profile.website && (
              <ContactCard icon="Globe" label="Website" value={profile.website} template={template} />
            )}
            {profile.address && (
              <ContactCard icon="MapPin" label="Địa chỉ" value={profile.address} template={template} />
            )}
          </div>

          {/* Social Links */}
          {profile.social_links && profile.social_links.length > 0 && (
            <div className="flex justify-center gap-4 mb-8">
              {profile.social_links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 ${theme.card} rounded-full hover:scale-110 transition-transform shadow-lg`}
                >
                  <Icon.Globe size={24} className={template.accent} />
                </a>
              ))}
            </div>
          )}

          {/* QR Code */}
          {profile.qr_code_url && (
            <div className="text-center">
              <p className={`text-sm ${template.text} opacity-60 mb-4`}>
                Quét mã để kết nối
              </p>
              <img
                src={profile.qr_code_url}
                alt="QR Code"
                className={`w-48 h-48 mx-auto rounded-2xl border-4 ${template.border} shadow-lg`}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ContactCard({ icon, label, value, template }) {
  const CardIcon = Icon[icon];
  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-white shadow-md">
      <CardIcon size={28} className={template.accent} />
      <div>
        <p className={`text-xs ${template.text} opacity-60 mb-1`}>{label}</p>
        <p className={`font-semibold ${template.text}`}>{value}</p>
      </div>
    </div>
  );
}