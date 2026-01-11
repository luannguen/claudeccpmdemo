import React, { forwardRef } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";

const TEMPLATE_STYLES = {
  minimal: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: 'text-[#7CB342]',
    border: 'border-gray-200',
    cardBg: 'bg-gray-50'
  },
  nature: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    text: 'text-green-900',
    accent: 'text-green-600',
    border: 'border-green-300',
    cardBg: 'bg-white/80'
  },
  professional: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    text: 'text-indigo-900',
    accent: 'text-blue-600',
    border: 'border-blue-300',
    cardBg: 'bg-white/80'
  },
  creative: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    text: 'text-purple-900',
    accent: 'text-pink-600',
    border: 'border-purple-300',
    cardBg: 'bg-white/80'
  },
  elegant: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    text: 'text-orange-900',
    accent: 'text-amber-600',
    border: 'border-amber-300',
    cardBg: 'bg-white/80'
  }
};

const THEME_OVERRIDES = {
  dark: {
    bg: 'bg-gray-900',
    text: 'text-white',
    accent: 'text-[#7CB342]',
    cardBg: 'bg-gray-800'
  },
  green: {
    bg: 'bg-green-900',
    text: 'text-green-50',
    accent: 'text-green-300',
    cardBg: 'bg-green-800'
  }
};

const EcardPreview = forwardRef(({ profile }, ref) => {
  const templateStyle = TEMPLATE_STYLES[profile.template || 'minimal'];
  const themeOverride = profile.theme !== 'light' ? THEME_OVERRIDES[profile.theme] : null;
  const style = themeOverride || templateStyle;

  return (
    <div 
      ref={ref}
      className={`${style.bg} rounded-2xl shadow-lg p-8 relative overflow-hidden border-4 ${style.border}`}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-6">
        {profile.profile_image_url ? (
          <img
            src={profile.profile_image_url}
            alt={profile.display_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white text-3xl font-bold">
            {profile.display_name?.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold ${style.text} mb-1`}>{profile.display_name}</h3>
        {profile.title_profession && (
          <p className={`${style.accent} mb-1 font-medium`}>{profile.title_profession}</p>
        )}
        {profile.company_name && (
          <p className={`text-sm ${style.text} opacity-70`}>{profile.company_name}</p>
        )}
      </div>

      {profile.bio && (
        <p className={`text-sm ${style.text} opacity-80 text-center mb-6 italic`}>
          "{profile.bio}"
        </p>
      )}

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        {profile.phone && (
          <ContactItem icon="Phone" value={profile.phone} style={style} />
        )}
        {profile.email && (
          <ContactItem icon="Mail" value={profile.email} style={style} />
        )}
        {profile.website && (
          <ContactItem icon="Globe" value={profile.website} style={style} />
        )}
        {profile.address && (
          <ContactItem icon="MapPin" value={profile.address} style={style} />
        )}
      </div>

      {/* Social Links */}
      {profile.social_links && profile.social_links.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {profile.social_links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-2 ${style.cardBg} rounded-lg ${style.accent} font-medium text-sm hover:scale-105 transition-transform`}
            >
              {link.platform}
            </a>
          ))}
        </div>
      )}

      {/* Custom Fields */}
      {profile.custom_fields && profile.custom_fields.length > 0 && (
        <div className="space-y-2 mb-6">
          {profile.custom_fields.map((field, index) => {
            const FieldIcon = Icon[field.icon] || Icon.Info;
            return (
              <div key={index} className={`flex items-center gap-3 p-2 ${style.cardBg} rounded-lg`}>
                <FieldIcon size={16} className={style.accent} />
                <div>
                  <span className={`text-xs ${style.text} opacity-60`}>{field.label}: </span>
                  <span className={`text-sm font-medium ${style.text}`}>{field.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code */}
      {profile.qr_code_url && (
        <div className="text-center">
          <p className={`text-xs ${style.text} opacity-60 mb-2`}>Quét mã để kết nối</p>
          <img
            src={profile.qr_code_url}
            alt="QR Code"
            className={`w-32 h-32 mx-auto rounded-lg border-2 ${style.border}`}
          />
        </div>
      )}
    </div>
  );
});

EcardPreview.displayName = 'EcardPreview';

function ContactItem({ icon, value, style }) {
  const ContactIcon = Icon[icon];
  return (
    <div className="flex items-center gap-3 text-sm">
      <ContactIcon size={16} className={style.accent} />
      <span className={style.text}>{value}</span>
    </div>
  );
}

export default EcardPreview;