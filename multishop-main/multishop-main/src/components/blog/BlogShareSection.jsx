import React from "react";
import { Share2, Facebook, Twitter, Mail } from "lucide-react";

export default function BlogShareSection({ shareUrl, shareTitle }) {
  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Chia sẻ bài viết:</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleShare('facebook')}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            aria-label="Chia sẻ lên Facebook"
          >
            <Facebook className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
            aria-label="Chia sẻ lên Twitter"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('email')}
            className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            aria-label="Chia sẻ qua Email"
          >
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}