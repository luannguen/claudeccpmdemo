import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, ShoppingBag, Send, Hash, BarChart2, Sparkles } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EnhancedModal from '../EnhancedModal';

const POST_CATEGORIES = [
  { value: 'general', label: '💬 Chung', icon: '💬' },
  { value: 'recipe', label: '🍳 Công thức', icon: '🍳' },
  { value: 'experience', label: '✨ Trải nghiệm', icon: '✨' },
  { value: 'tips', label: '💡 Mẹo hay', icon: '💡' },
  { value: 'qa', label: '❓ Hỏi đáp', icon: '❓' },
  { value: 'event', label: '📅 Sự kiện', icon: '📅' }
];

export default function CreatePostModalEnhanced({ isOpen, onClose, currentUser, editingPost }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingPost) {
      const data = editingPost.data || editingPost;
      setContent(data.content || '');
      setCategory(data.category || 'general');
      setSelectedProducts(data.product_links || []);
      setUploadedImages(data.images || []);
    } else {
      setContent('');
      setCategory('general');
      setSelectedProducts([]);
      setUploadedImages([]);
    }
  }, [editingPost, isOpen]);

  const { data: products } = useQuery({
    queryKey: ['products-for-post'],
    queryFn: async () => {
      const allProducts = await base44.entities.Product.list('-created_date', 20);
      return (allProducts || []).filter(p => (p.data || p).status === 'active');
    },
    staleTime: 5 * 60 * 1000
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => base44.entities.UserPost.create(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      onClose();
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      }));
      setUploadedImages(prev => [...prev, ...urls]);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    const postData = {
      content: content.trim(),
      category,
      author_name: currentUser?.full_name || 'Khách',
      images: uploadedImages,
      product_links: selectedProducts,
      status: 'active'
    };

    createPostMutation.mutate(postData);
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPost ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết'}
      maxWidth="2xl"
      persistPosition={true}
      positionKey="create-post-modal"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold">
            {currentUser?.full_name?.[0] || 'K'}
          </div>
          <div>
            <p className="font-semibold">{currentUser?.full_name || 'Khách'}</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1">
              {POST_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì?" rows={6}
          className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none" />

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {uploadedImages.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt={`Upload ${idx}`} className="w-full h-32 object-cover rounded-xl" />
                <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <label className="flex-1 py-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-2 cursor-pointer">
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            <ImageIcon className="w-4 h-4" />
            {isUploading ? 'Đang tải...' : 'Ảnh'}
          </label>
        </div>

        <button onClick={handleSubmit} disabled={!content.trim() || createPostMutation.isPending}
          className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-bold hover:bg-[#FF9800] disabled:opacity-50 flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />
          {editingPost ? 'Cập Nhật' : 'Đăng Bài'}
        </button>
      </div>
    </EnhancedModal>
  );
}