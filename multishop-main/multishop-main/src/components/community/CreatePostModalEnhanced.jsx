import React, { useState, useMemo, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, Hash, Loader2, ShoppingBag, Heart, Package, 
  Search, X, Check, Video, Upload, Trash2, Plus, Play, ExternalLink, Eye,
  AlertCircle
} from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import EnhancedModal from '../EnhancedModal';
import { useAutoSaveDraft } from './hooks/useAutoSaveDraft';
import { useToast } from '@/components/NotificationToast';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useEcardCache } from '@/components/features/ecard';

export default function CreatePostModalEnhanced({ isOpen, onClose, currentUser, editingPost }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [hashtags, setHashtags] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageLinks, setImageLinks] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productTab, setProductTab] = useState('purchased');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { onPostCreated } = useEcardCache();

  // Auto-save draft
  const { saveDraft, loadDraft, clearDraft } = useAutoSaveDraft(content, isOpen && !editingPost);

  // Load draft on mount
  useEffect(() => {
    if (isOpen && !editingPost) {
      const draft = loadDraft();
      if (draft && draft.content) {
        addToast('Đã tải nháp đã lưu', 'info');
        setContent(draft.content);
        setLastSavedAt(draft.savedAt);
      }
    }
  }, [isOpen, editingPost]);

  // ✅ Load editing post data
  React.useEffect(() => {
    if (editingPost) {
      const postData = editingPost.data || editingPost;
      setContent(postData.content || '');
      setCategory(postData.category || 'general');
      setHashtags((postData.hashtags || []).join(', '));
      setSelectedProducts(postData.product_links || []);
      setUploadedImages(postData.images || []);
      setVideoUrl(postData.video_url || '');
    } else {
      resetForm();
    }
  }, [editingPost, isOpen]);

  // ✅ Load user's orders (purchased products)
  const { data: userOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['user-orders-posts', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const orders = await base44.entities.Order.list('-created_date', 200);
      return orders.filter(o => o.customer_email === currentUser.email && o.order_status !== 'cancelled');
    },
    enabled: !!currentUser?.email && isOpen,
    staleTime: 5 * 60 * 1000
  });

  // ✅ Load all products (for image/video lookup)
  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-posts'],
    queryFn: async () => {
      return await base44.entities.Product.list('-created_date', 500);
    },
    enabled: isOpen,
    staleTime: 10 * 60 * 1000
  });

  // ✅ Load user's wishlist - REAL-TIME SYNC
  const { data: wishlistProducts = [], isLoading: loadingWishlist, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist-products-posts'],
    queryFn: async () => {
      const wishlistIds = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      if (wishlistIds.length === 0) return [];
      return allProducts.filter(p => wishlistIds.includes(p.id));
    },
    enabled: isOpen && allProducts.length > 0,
    staleTime: 0 // ✅ ALWAYS FRESH
  });

  // ✅ Listen to wishlist updates
  React.useEffect(() => {
    const handleWishlistUpdate = () => {
      console.log('🔄 Wishlist updated - Refetching products...');
      refetchWishlist();
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [refetchWishlist]);

  // ✅ Extract unique purchased products WITH IMAGES
  const purchasedProducts = useMemo(() => {
    const productMap = new Map();
    
    userOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (!productMap.has(item.product_id)) {
          // ✅ FIX: Lookup full product data for images/videos
          const fullProduct = allProducts.find(p => p.id === item.product_id);
          
          productMap.set(item.product_id, {
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.unit_price,
            product_image: fullProduct?.image_url || item.product_image || null,
            product_video: fullProduct?.video_url || null
          });
        }
      });
    });
    
    return Array.from(productMap.values());
  }, [userOrders, allProducts]);

  // ✅ Filter products by search
  const filteredProducts = useMemo(() => {
    const products = productTab === 'purchased' 
      ? purchasedProducts 
      : wishlistProducts.map(p => ({
          product_id: p.id,
          product_name: p.name,
          product_price: p.price,
          product_image: p.image_url,
          product_video: p.video_url
        }));
    
    if (!productSearch) return products;
    
    return products.filter(p => 
      p.product_name?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productTab, purchasedProducts, wishlistProducts, productSearch]);

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const result = await base44.entities.UserPost.create(postData);
      // ✅ Verify post was created with valid ID
      if (!result?.id) {
        throw new Error('Không nhận được ID bài viết từ server');
      }
      return result;
    },
    onSuccess: (newPost) => {
      // ✅ Force refetch to get latest data with correct IDs
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      queryClient.invalidateQueries({ queryKey: ['ecard-cache'] });
      clearDraft();
      resetForm();
      // Optimistic update cache stats
      onPostCreated();
      addToast('Đã đăng bài viết thành công', 'success');
      onClose();
    },
    onError: (error) => {
      console.error('Create post error:', error);
      addToast(error.message || 'Không thể đăng bài. Vui lòng thử lại.', 'error');
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, postData }) => base44.entities.UserPost.update(postId, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      resetForm();
      addToast('Đã cập nhật bài viết', 'success');
      onClose();
    }
  });

  // ✅ Validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return 'Chỉ chấp nhận file JPG, PNG, GIF, WEBP';
    }
    
    if (file.size > maxSize) {
      return 'Kích thước file không được vượt quá 5MB';
    }
    
    return null;
  };

  // ✅ Validate image URL
  const validateImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExt = validExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext));
      
      if (!hasValidExt && !url.includes('unsplash.com') && !url.includes('imgur.com')) {
        return 'URL không hợp lệ. Phải là link ảnh (.jpg, .png, .gif) hoặc từ Unsplash/Imgur';
      }
      
      return null;
    } catch {
      return 'URL không hợp lệ';
    }
  };

  // ✅ Validate video URL
  const validateVideoUrl = (url) => {
    if (!url.trim()) return null;
    
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const facebookRegex = /facebook\.com\/.*\/videos\/|fb\.watch\//;
    const instagramRegex = /instagram\.com\/(p|reel|tv)\//;
    const vimeoRegex = /vimeo\.com\/\d+/;
    
    const isValid = youtubeRegex.test(url) || 
                    facebookRegex.test(url) || 
                    instagramRegex.test(url) ||
                    vimeoRegex.test(url);
    
    if (!isValid) {
      return '❌ Chỉ chấp nhận link từ YouTube, Facebook, Instagram, Vimeo';
    }
    
    return null;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageError('');
    
    // ✅ Validate each file
    for (const file of files) {
      const error = validateImageFile(file);
      if (error) {
        setImageError(error);
        return;
      }
    }

    if (uploadedImages.length + files.length > 10) {
      setImageError('Tối đa 10 ảnh cho mỗi bài viết');
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(r => r.file_url);
      
      setUploadedImages(prev => [...prev, ...imageUrls]);
    } catch (error) {
      setImageError('Lỗi upload ảnh. Vui lòng thử lại.');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ✅ Add images from links
  const handleAddImageLinks = () => {
    if (!imageLinks.trim()) return;
    
    const links = imageLinks
      .split('\n')
      .map(link => link.trim())
      .filter(link => link.length > 0);
    
    setImageError('');
    
    for (const link of links) {
      const error = validateImageUrl(link);
      if (error) {
        setImageError(`${link}: ${error}`);
        return;
      }
    }
    
    if (uploadedImages.length + links.length > 10) {
      setImageError('Tối đa 10 ảnh cho mỗi bài viết');
      return;
    }
    
    setUploadedImages(prev => [...prev, ...links]);
    setImageLinks('');
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!content.trim()) {
      alert('Vui lòng nhập nội dung');
      return;
    }

    // ✅ Validate video URL before submit
    if (videoUrl.trim()) {
      const videoValidationError = validateVideoUrl(videoUrl);
      if (videoValidationError) {
        setVideoError(videoValidationError);
        return;
      }
    }

    const hashtagsArray = hashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const postData = {
      content: content.trim(),
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url,
      category: category,
      hashtags: hashtagsArray,
      product_links: selectedProducts,
      images: uploadedImages,
      video_url: videoUrl.trim() || null,
      status: 'active'
    };

    if (editingPost) {
      updatePostMutation.mutate({ 
        postId: editingPost.id, 
        postData: {
          ...postData,
          is_edited: true,
          edited_date: new Date().toISOString()
        }
      });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const resetForm = () => {
    setContent('');
    setCategory('general');
    setHashtags('');
    setSelectedProducts([]);
    setUploadedImages([]);
    setImageLinks('');
    setVideoUrl('');
    setShowProductPicker(false);
    setProductSearch('');
    setImageError('');
    setVideoError('');
  };

  const toggleProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.product_id === product.product_id);
      if (exists) {
        return prev.filter(p => p.product_id !== product.product_id);
      } else {
        return [...prev, product];
      }
    });
  };

  const categories = [
    { value: 'general', label: '📢 Chung' },
    { value: 'recipe', label: '🍳 Công thức' },
    { value: 'experience', label: '💡 Kinh nghiệm' },
    { value: 'tips', label: '🌟 Mẹo hay' },
    { value: 'qa', label: '❓ Hỏi đáp' },
    { value: 'event', label: '🎉 Sự kiện' }
  ];

  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPost ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
      maxWidth="3xl"
      persistPosition={true}
      positionKey="create-post-modal"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Danh mục</label>
          <select value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors">
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Content Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Nội dung *</label>
            {lastSavedAt && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Icon.CheckCircle size={12} />
                Đã lưu tự động
              </span>
            )}
          </div>
          <textarea value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setLastSavedAt(null);
            }}
            required rows={6}
            placeholder="Chia sẻ suy nghĩ, trải nghiệm hoặc công thức nấu ăn của bạn...&#10;&#10;💡 Mẹo: Dùng #hashtag và @mention để tăng tương tác!"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none transition-colors" />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">{content.length} ký tự</p>
            <button
              type="button"
              onClick={() => {
                saveDraft();
                setLastSavedAt(new Date().toISOString());
                addToast('Đã lưu nháp', 'success');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Lưu nháp ngay
            </button>
          </div>
        </div>

        {/* ✅ IMAGE UPLOAD SECTION - ENHANCED */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#7CB342]" />
            Hình Ảnh ({uploadedImages.length}/10)
          </label>
          
          {/* Error Display */}
          {imageError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{imageError}</span>
            </div>
          )}
          
          {/* Image Grid Preview */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Error';
                      setImageError('Một số ảnh không tải được');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className={`w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#7CB342] hover:bg-[#7CB342]/5 transition-all mb-3 ${
            isUploadingImage || uploadedImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={isUploadingImage || uploadedImages.length >= 10}
              className="hidden"
            />
            {isUploadingImage ? (
              <>
                <Loader2 className="w-6 h-6 text-[#7CB342] animate-spin mb-2" />
                <p className="text-xs text-gray-600">Đang tải lên...</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">📤 Upload Ảnh</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF, WEBP • Max 5MB/ảnh</p>
              </>
            )}
          </label>

          {/* ✅ Image Link Input */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs font-medium text-blue-900 mb-2">🔗 Hoặc thêm link ảnh:</p>
            <textarea
              value={imageLinks}
              onChange={(e) => {
                setImageLinks(e.target.value);
                setImageError('');
              }}
              placeholder="https://unsplash.com/photo/123&#10;https://i.imgur.com/abc.jpg&#10;&#10;Mỗi link một dòng, tối đa 10 ảnh"
              rows={3}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 resize-none mb-2"
            />
            <button
              type="button"
              onClick={handleAddImageLinks}
              disabled={!imageLinks.trim() || uploadedImages.length >= 10}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➕ Thêm Link Ảnh
            </button>
            <p className="text-xs text-blue-700 mt-2">
              ✅ Hỗ trợ: Unsplash, Imgur, hoặc link trực tiếp (.jpg, .png, .gif)
            </p>
          </div>
        </div>

        {/* ✅ VIDEO URL SECTION - ENHANCED VALIDATION */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Video className="w-4 h-4 text-[#7CB342]" />
            Video (YouTube, Facebook, Instagram, Vimeo)
          </label>
          
          {videoError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{videoError}</span>
            </div>
          )}
          
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setVideoError('');
            }}
            onBlur={(e) => {
              const error = validateVideoUrl(e.target.value);
              if (error) setVideoError(error);
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          />
          
          {videoUrl && !videoError && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm">
              <Play className="w-4 h-4 text-green-600" />
              <span className="text-green-700 flex-1 truncate">{videoUrl}</span>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('');
                  setVideoError('');
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Help Text */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-1">✅ Hỗ trợ:</p>
            <ul className="text-xs text-blue-700 space-y-0.5 ml-4 list-disc">
              <li>YouTube: youtube.com/watch?v=...</li>
              <li>Facebook: facebook.com/.../videos/...</li>
              <li>Instagram: instagram.com/p/... hoặc /reel/...</li>
              <li>Vimeo: vimeo.com/123456</li>
            </ul>
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Hashtags
          </label>
          <input type="text" value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="organic, rau-sach, zero-farm (phân cách bằng dấu phẩy)"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors" />
        </div>

        {/* ✅ PRODUCT PICKER SECTION - ENHANCED */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-[#7CB342]" />
              Gắn Sản Phẩm ({selectedProducts.length})
            </label>
            <button
              type="button"
              onClick={() => setShowProductPicker(!showProductPicker)}
              className="text-[#7CB342] hover:text-[#FF9800] text-sm font-medium transition-colors flex items-center gap-1"
            >
              {showProductPicker ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showProductPicker ? 'Đóng' : 'Chọn sản phẩm'}
            </button>
          </div>

          {/* ✅ Selected Products Preview - WITH IMAGES */}
          {selectedProducts.length > 0 && (
            <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedProducts.map(product => (
                <div key={product.product_id} 
                  className="bg-green-50 border-2 border-green-200 rounded-xl p-2 relative group">
                  {product.product_image && (
                    <img src={product.product_image} alt={product.product_name}
                      className="w-full aspect-square object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-xs font-medium truncate">{product.product_name}</p>
                  <p className="text-xs text-gray-600">{product.product_price?.toLocaleString('vi-VN')}đ</p>
                  
                  {/* Video indicator */}
                  {product.product_video && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Product Picker - ENHANCED WITH IMAGES */}
          {showProductPicker && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 max-h-[500px] overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setProductTab('purchased')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    productTab === 'purchased'
                      ? 'bg-[#7CB342] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 inline mr-1" />
                  Đã Mua ({purchasedProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductTab('wishlist')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    productTab === 'wishlist'
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-4 h-4 inline mr-1" />
                  Yêu Thích ({wishlistProducts.length})
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
                />
              </div>

              {/* ✅ Product Grid - WITH IMAGES & VIDEOS */}
              {loadingOrders || loadingWishlist ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-[#7CB342] animate-spin" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-2">
                      {filteredProducts.map(product => {
                        const isSelected = selectedProducts.some(p => p.product_id === product.product_id);
                        return (
                          <button
                            key={product.product_id}
                            type="button"
                            onClick={() => toggleProduct(product)}
                            className={`relative rounded-lg overflow-hidden transition-all ${
                              isSelected 
                                ? 'ring-4 ring-green-500 shadow-lg' 
                                : 'border-2 border-gray-200 hover:border-[#7CB342] hover:shadow-md'
                            }`}
                          >
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 relative">
                              {product.product_image ? (
                                <img 
                                  src={product.product_image} 
                                  alt={product.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-12 h-12 text-gray-300" />
                                </div>
                              )}
                              
                              {/* Video Badge */}
                              {product.product_video && (
                                <div className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Play className="w-4 h-4 text-white fill-current" />
                                </div>
                              )}
                              
                              {/* Selected Badge */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Check className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="p-2 bg-white">
                              <p className="font-medium text-xs truncate">{product.product_name}</p>
                              <p className="text-xs text-[#7CB342] font-bold">
                                {product.product_price?.toLocaleString('vi-VN')}đ
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      {productTab === 'purchased' 
                        ? 'Chưa có sản phẩm đã mua. Hãy mua sắm để chia sẻ!' 
                        : 'Chưa có sản phẩm yêu thích'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ SUBMIT BUTTON */}
        <button type="submit" disabled={!content.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-4 rounded-xl font-medium hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Đang xử lý...</>
          ) : editingPost ? (
            <><Check className="w-5 h-5" />Cập Nhật Bài</>
          ) : (
            <><Send className="w-5 h-5" />Đăng Bài</>
          )}
        </button>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800">
            <strong>💡 Mẹo tạo bài viết hấp dẫn:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
            <li>Thêm ảnh để tăng 3x tương tác</li>
            <li>Gắn sản phẩm đã mua để chia sẻ trải nghiệm</li>
            <li>Dùng #hashtag để dễ tìm kiếm</li>
            <li>Tag video để bài viết sinh động hơn</li>
          </ul>
        </div>
      </form>
    </EnhancedModal>
  );
}