/**
 * DownloadEcardButton - Tải về E-Card dạng PNG/PDF
 * UI Layer - Presentation only
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import html2canvas from "html2canvas";
import { useToast } from "@/components/NotificationToast";

export default function DownloadEcardButton({ profile, previewRef }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { addToast } = useToast();

  const handleDownload = async (format = 'png') => {
    if (!previewRef?.current) {
      addToast('Không thể tải preview', 'error');
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });

      if (format === 'png') {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `ecard-${profile.public_url_slug || 'profile'}.png`;
        link.href = dataUrl;
        link.click();
        addToast('Đã tải E-Card xuống thiết bị', 'success');
      }
    } catch (error) {
      addToast('Không thể tải xuống. Vui lòng thử lại', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={() => handleDownload('png')}
      disabled={isDownloading}
      className="px-4 py-2 bg-white border-2 border-[#7CB342] text-[#7CB342] rounded-xl hover:bg-[#7CB342] hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
    >
      {isDownloading ? (
        <>
          <Icon.Spinner size={18} />
          Đang tải...
        </>
      ) : (
        <>
          <Icon.Download size={18} />
          Tải về
        </>
      )}
    </button>
  );
}