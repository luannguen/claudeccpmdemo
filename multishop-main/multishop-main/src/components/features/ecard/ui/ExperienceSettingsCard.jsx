import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useToast } from '@/components/NotificationToast';
import { useExperienceSettings } from '../../ecard/hooks/useExperienceSettings';
import { useExperiencePreview } from '../../ecard/hooks/useExperiencePreview';
import ExperienceTestPlayModal from '@/components/features/ecard/ui/ExperienceTestPlayModal.jsx';

export default function ExperienceSettingsCard({ profile }) {
  const { addToast } = useToast();
  const { saveIntro, saveToggles } = useExperienceSettings(profile);
  const { data: previewData } = useExperiencePreview(profile);
  const [showTest, setShowTest] = useState(false);
  const [enableIntro, setEnableIntro] = useState(profile?.qr_mode === 'INTRO');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [ctaMode, setCtaMode] = useState('ECARD');
  const [customUrl, setCustomUrl] = useState('');
  const [showPosts, setShowPosts] = useState(profile?.show_posts !== false);
  const [showShop, setShowShop] = useState(profile?.show_shop !== false);
  const [showContact, setShowContact] = useState(profile?.show_contact !== false);

  // Load existing experience data into form
  useEffect(() => {
    if (previewData?.experience) {
      const exp = previewData.experience;
      setVideoUrl(exp.video_url || '');
      setPosterUrl(exp.poster_url || '');
      setCtaMode(exp.cta_mode || 'ECARD');
      setCustomUrl(exp.cta_custom_url || '');
    }
  }, [previewData]);

  const onSaveIntro = async () => {
    if (enableIntro && !videoUrl) { addToast('Nhập Video URL', 'warning'); return; }
    await saveIntro.mutateAsync({ enableIntro, video_url: videoUrl, poster_url: posterUrl, cta_mode: ctaMode, cta_custom_url: customUrl || undefined });
    addToast('Đã lưu cấu hình Intro', 'success');
  };

  const onSaveToggles = async () => {
    await saveToggles.mutateAsync({ show_posts: showPosts, show_shop: showShop, show_contact: showContact });
    addToast('Đã lưu quyền hiển thị', 'success');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
        <Icon.MonitorPlay size={18} className="text-[#7CB342]" /> Intro & Quyền hiển thị
      </h3>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={enableIntro} onChange={(e) => setEnableIntro(e.target.checked)} />
          <span className="text-sm">Bật Intro khi quét QR</span>
        </label>
        {enableIntro && (
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} placeholder="Video URL (YouTube/Vimeo/MP4)" className="px-3 py-2 rounded-lg border" />
            <input value={posterUrl} onChange={(e)=>setPosterUrl(e.target.value)} placeholder="Poster URL (tuỳ chọn)" className="px-3 py-2 rounded-lg border" />
            <select value={ctaMode} onChange={(e)=>setCtaMode(e.target.value)} className="px-3 py-2 rounded-lg border">
              <option value="ECARD">Đi tới E‑Card</option>
              <option value="SHOP">Đi tới Shop</option>
              <option value="POSTS">Đi tới Bài viết</option>
              <option value="CUSTOM_URL">URL tuỳ chỉnh</option>
            </select>
            {ctaMode === 'CUSTOM_URL' && (
              <input value={customUrl} onChange={(e)=>setCustomUrl(e.target.value)} placeholder="https://..." className="px-3 py-2 rounded-lg border" />
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onSaveIntro} className="px-3 py-2 rounded-lg bg-[#7CB342] text-white hover:bg-[#689F38] text-sm flex items-center gap-2">
            <Icon.Save size={16} /> Lưu Intro
          </button>
          <button disabled={!enableIntro} onClick={() => setShowTest(true)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm disabled:opacity-50 flex items-center gap-2">
            <Icon.Play size={16} /> Xem thử
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4 space-y-2">
        <div className="text-sm font-medium text-gray-900">Quyền hiển thị</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPosts} onChange={(e)=>setShowPosts(e.target.checked)} /> Hiển thị nút Bài viết</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showShop} onChange={(e)=>setShowShop(e.target.checked)} /> Hiển thị nút Gian hàng</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showContact} onChange={(e)=>setShowContact(e.target.checked)} /> Hiển thị khối Liên hệ</label>
        <button onClick={onSaveToggles} className="mt-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Lưu quyền hiển thị</button>
      </div>
      {showTest && (
        <ExperienceTestPlayModal profile={profile} isOpen={showTest} onClose={() => setShowTest(false)} />
      )}
    </div>
  );
}