/**
 * PageFormModal - WYSIWYG Editor cho CMS Pages
 * 
 * Modal tạo/chỉnh sửa trang với rich text editor.
 * ENHANCED: Thêm đầy đủ các trường và sync với client display
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Eye, FileText, Settings, Search as SearchIcon, Image, Loader2, Layout, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Quill modules config
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const quillFormats = [
  'header', 'font',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const templateOptions = [
  { value: 'default', label: 'Mặc định', desc: 'Template cơ bản cho trang nội dung' },
  { value: 'landing', label: 'Landing Page', desc: 'Trang quảng bá sản phẩm/dịch vụ' },
  { value: 'content', label: 'Nội dung', desc: 'Trang bài viết dài' },
  { value: 'contact', label: 'Liên hệ', desc: 'Trang liên hệ với form' },
  { value: 'team', label: 'Đội ngũ', desc: 'Giới thiệu đội ngũ' }
];

const statusOptions = [
  { value: 'draft', label: 'Bản nháp', color: 'bg-gray-500' },
  { value: 'published', label: 'Đã xuất bản', color: 'bg-green-500' },
  { value: 'archived', label: 'Lưu trữ', color: 'bg-orange-500' }
];

// Predefined page sections for templates
const TEMPLATE_SECTIONS = {
  home: ['hero', 'why_choose_us', 'product_specialty', 'what_we_do', 'promotional_banner', 'testimonials', 'categories', 'brand_partners'],
  team: ['team_page', 'team_founder', 'expertise_pillars', 'team_members'],
  contact: ['contact_page', 'contact_info', 'contact_form', 'contact_faq', 'contact_map'],
  default: [],
  landing: ['hero', 'features', 'cta'],
  content: ['header', 'body', 'related']
};

export default function PageFormModal({ 
  isOpen, 
  onClose, 
  page = null, 
  onSave,
  isSaving = false 
}) {
  const isEditing = !!page;

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subtitle: '',
    content: '',
    featured_image_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft',
    template: 'default',
    show_in_menu: false,
    menu_order: 0,
    sections_json: ''
  });

  const [activeTab, setActiveTab] = useState('content');
  const [quillReady, setQuillReady] = useState(false);

  // Delay quill mounting to prevent rendering issues
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setQuillReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setQuillReady(false);
    }
  }, [isOpen]);

  // Reset form when page changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (page) {
        setFormData({
          slug: page.slug || '',
          title: page.title || '',
          subtitle: page.subtitle || '',
          content: page.content || '',
          featured_image_url: page.featured_image_url || '',
          meta_title: page.meta_title || '',
          meta_description: page.meta_description || '',
          meta_keywords: page.meta_keywords || '',
          status: page.status || 'draft',
          template: page.template || 'default',
          show_in_menu: page.show_in_menu ?? false,
          menu_order: page.menu_order || 0,
          sections_json: page.sections_json || ''
        });
      } else {
        setFormData({
          slug: '',
          title: '',
          subtitle: '',
          content: '',
          featured_image_url: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          status: 'draft',
          template: 'default',
          show_in_menu: false,
          menu_order: 0,
          sections_json: ''
        });
      }
      setActiveTab('content');
    }
  }, [isOpen, page]);

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !isEditing && !prev.slug ? generateSlug(title) : prev.slug
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug) {
      return;
    }
    await onSave(formData);
  };

  // Get template sections for display
  const templateSections = TEMPLATE_SECTIONS[formData.template] || TEMPLATE_SECTIONS.default;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7CB342] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Chỉnh Sửa Trang' : 'Tạo Trang Mới'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing ? `Đang chỉnh sửa: ${page.title}` : 'Tạo trang nội dung mới cho website'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {formData.slug && formData.status === 'published' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/${formData.slug}`, '_blank')}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Xem trang
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="content" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Nội dung
                </TabsTrigger>
                <TabsTrigger value="layout" className="gap-2">
                  <Layout className="w-4 h-4" />
                  Giao diện
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-2">
                  <SearchIcon className="w-4 h-4" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Cài đặt
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto">
              {/* Content Tab */}
              <TabsContent value="content" className="p-6 space-y-6 m-0">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề trang *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={handleTitleChange}
                      placeholder="Nhập tiêu đề trang"
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL) *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">/</span>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="duong-dan-trang"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phụ đề / Mô tả ngắn
                  </label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Mô tả ngắn về trang (hiển thị dưới tiêu đề)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung trang
                  </label>
                  <div className="border rounded-xl overflow-hidden quill-container">
                    {quillReady ? (
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        placeholder="Nhập nội dung trang..."
                        className="cms-quill-editor"
                      />
                    ) : (
                      <div className="h-[350px] flex items-center justify-center bg-gray-50">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <style>{`
                    .quill-container .ql-container { min-height: 300px; font-size: 16px; }
                    .quill-container .ql-editor { min-height: 300px; padding: 16px; }
                    .quill-container .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; }
                    .quill-container .ql-toolbar { background: #f9fafb; border-color: #e5e7eb; }
                    .quill-container .ql-container { border-color: #e5e7eb; }
                  `}</style>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-2" />
                    Ảnh đại diện
                  </label>
                  <div className="flex gap-4">
                    <Input
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    {formData.featured_image_url && (
                      <div className="w-24 h-16 rounded-lg overflow-hidden border">
                        <img 
                          src={formData.featured_image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="p-6 space-y-6 m-0">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <Select 
                    value={formData.template} 
                    onValueChange={(value) => setFormData({ ...formData, template: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-xs text-gray-500">{opt.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {templateSections.length > 0 && (
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-700">Sections của template</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {templateSections.map(section => (
                        <Badge key={section} variant="outline" className="capitalize">
                          {section.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Các sections này có thể được chỉnh sửa qua Admin CMS → Quản Lý Sections hoặc Live Edit trên client.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sections JSON (Nâng cao)
                  </label>
                  <Textarea
                    value={formData.sections_json}
                    onChange={(e) => setFormData({ ...formData, sections_json: e.target.value })}
                    placeholder='[{"type": "hero", "order": 1}, {"type": "content", "order": 2}]'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Định nghĩa cấu trúc sections tùy chỉnh (JSON format)
                  </p>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="p-6 space-y-6 m-0">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Tối ưu SEO</h3>
                  <p className="text-sm text-blue-600">
                    Cấu hình meta tags để trang hiển thị tốt hơn trên công cụ tìm kiếm.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder={formData.title || "Tiêu đề hiển thị trên Google"}
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.meta_title || formData.title || '').length}/60 ký tự
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về trang (155-160 ký tự)"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.meta_description || '').length}/160 ký tự
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <Input
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                  />
                </div>

                {/* SEO Preview */}
                <div className="border rounded-xl p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước trên Google</h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-blue-700 text-lg hover:underline cursor-pointer">
                      {formData.meta_title || formData.title || 'Tiêu đề trang'}
                    </p>
                    <p className="text-green-700 text-sm">
                      zerofarm.vn/{formData.slug || 'duong-dan'}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {formData.meta_description || formData.subtitle || 'Mô tả trang sẽ hiển thị ở đây...'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="p-6 space-y-6 m-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Hiển thị trong Menu</h4>
                      <p className="text-sm text-gray-500">Thêm trang vào menu điều hướng chính</p>
                    </div>
                    <Switch
                      checked={formData.show_in_menu}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_menu: checked })}
                    />
                  </div>

                  {formData.show_in_menu && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thứ tự trong menu
                      </label>
                      <Input
                        type="number"
                        value={formData.menu_order}
                        onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) || 0 })}
                        min={0}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                {isEditing && page && (
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-3">Thông tin trang</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <span className="ml-2 font-mono text-gray-700">{page.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Ngày tạo:</span>
                        <span className="ml-2 text-gray-700">
                          {page.created_date ? new Date(page.created_date).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cập nhật:</span>
                        <span className="ml-2 text-gray-700">
                          {page.updated_date ? new Date(page.updated_date).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Xuất bản:</span>
                        <span className="ml-2 text-gray-700">
                          {page.published_date ? new Date(page.published_date).toLocaleDateString('vi-VN') : 'Chưa'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              {formData.status === 'published' ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Trang đang được xuất bản
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Trang chưa được xuất bản
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSaving || !formData.title || !formData.slug}
                className="bg-[#7CB342] hover:bg-[#689F38] gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Cập nhật' : 'Tạo trang'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}