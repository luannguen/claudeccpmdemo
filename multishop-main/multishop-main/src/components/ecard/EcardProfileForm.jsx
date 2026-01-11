import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import ProfileImageUploader from './ProfileImageUploader';
import SocialLinksEditor from './SocialLinksEditor';
import CustomFieldsEditor from './CustomFieldsEditor';

export default function EcardProfileForm({ profile, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    title_profession: profile?.title_profession || '',
    company_name: profile?.company_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
    profile_image_url: profile?.profile_image_url || '',
    social_links: profile?.social_links || [],
    custom_fields: profile?.custom_fields || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.display_name?.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const saving = isSaving || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <ProfileImageUploader
        currentImageUrl={formData.profile_image_url}
        onImageUploaded={(url) => setFormData({ ...formData, profile_image_url: url })}
      />

      <div className="border-t border-gray-200 pt-4" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên hiển thị *
        </label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chức danh
        </label>
        <input
          type="text"
          value={formData.title_profession}
          onChange={(e) => setFormData({ ...formData, title_profession: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Công ty
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Điện thoại
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giới thiệu
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342]"
        />
      </div>

      <div className="border-t border-gray-200 pt-4" />

      {/* Social Links */}
      <SocialLinksEditor
        socialLinks={formData.social_links}
        onChange={(links) => setFormData({ ...formData, social_links: links })}
      />

      <div className="border-t border-gray-200 pt-4" />

      {/* Custom Fields */}
      <CustomFieldsEditor
        customFields={formData.custom_fields}
        onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
      />

      <div className="border-t border-gray-200 pt-4" />

      <button
        type="submit"
        disabled={saving || !formData.display_name?.trim()}
        className="w-full px-4 py-3 bg-[#7CB342] text-white rounded-lg hover:bg-[#689F38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Icon.Spinner size={20} />
            Đang lưu...
          </>
        ) : (
          <>
            <Icon.Save size={20} />
            Lưu thay đổi
          </>
        )}
      </button>
    </form>
  );
}