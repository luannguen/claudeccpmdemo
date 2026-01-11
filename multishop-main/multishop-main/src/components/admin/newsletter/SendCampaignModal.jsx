import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SendCampaignModal({ isOpen, onClose, subscribers }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    
    setIsSending(true);
    setProgress(0);

    try {
      const total = subscribers.length;
      for (let i = 0; i < total; i++) {
        const sub = subscribers[i];
        try {
          await base44.integrations.Core.SendEmail({
            from_name: 'Zero Farm Newsletter',
            to: sub.email,
            subject: subject,
            body: content
          });

          await base44.entities.NewsletterSubscriber.update(sub.id, {
            last_email_sent: new Date().toISOString(),
            emails_sent: (sub.emails_sent || 0) + 1
          });
        } catch (error) {
          console.error(`Failed to send to ${sub.email}:`, error);
        }
        
        setProgress(Math.round(((i + 1) / total) * 100));
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
      }

      alert(`Đã gửi thành công ${total} email!`);
      onClose();
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            Gửi Email Campaign
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <Users className="w-4 h-4 inline mr-2" />
              Sẽ gửi đến <strong>{subscribers.length}</strong> subscribers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề email *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
              placeholder="🌱 Ưu đãi đặc biệt từ Zero Farm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung email *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
              rows={10}
              placeholder="Kính chào quý khách,&#10;&#10;Chúng tôi có tin tuyệt vời..."
            />
          </div>

          {isSending && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Đang gửi...</span>
                <span className="text-sm font-bold text-[#7CB342]">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#7CB342] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!subject.trim() || !content.trim() || isSending}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSending ? `Đang gửi... ${progress}%` : 'Gửi Email Campaign'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}