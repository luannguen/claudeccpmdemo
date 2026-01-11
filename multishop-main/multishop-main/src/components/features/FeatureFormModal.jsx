/**
 * FeatureFormModal - Modal tạo/chỉnh sửa tính năng
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Plus, Trash2, Loader2, Zap, TestTube, FileText, Link, Users, Calendar } from "lucide-react";
import TestCaseFormEnhanced from "./TestCaseFormEnhanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FEATURE_STATUS, 
  FEATURE_CATEGORY, 
  FEATURE_PRIORITY,
  statusConfig,
  categoryConfig,
  priorityConfig
} from "@/components/services/featureService";

const generateId = () => `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function FeatureFormModal({ 
  isOpen, 
  onClose, 
  feature = null, 
  onSave,
  isSaving = false 
}) {
  const isEditing = !!feature;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'core',
    status: 'planned',
    priority: 'medium',
    version: '',
    release_date: '',
    test_deadline: '',
    assigned_testers: [],
    acceptance_criteria: [],
    test_cases: [],
    related_pages: [],
    related_components: [],
    jira_link: '',
    figma_link: '',
    documentation_link: '',
    notes: '',
    tags: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newCriteria, setNewCriteria] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newPage, setNewPage] = useState('');
  const [newComponent, setNewComponent] = useState('');

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (feature) {
        setFormData({
          name: feature.name || '',
          description: feature.description || '',
          category: feature.category || 'core',
          status: feature.status || 'planned',
          priority: feature.priority || 'medium',
          version: feature.version || '',
          release_date: feature.release_date || '',
          test_deadline: feature.test_deadline || '',
          assigned_testers: feature.assigned_testers || [],
          acceptance_criteria: feature.acceptance_criteria || [],
          test_cases: feature.test_cases || [],
          related_pages: feature.related_pages || [],
          related_components: feature.related_components || [],
          jira_link: feature.jira_link || '',
          figma_link: feature.figma_link || '',
          documentation_link: feature.documentation_link || '',
          notes: feature.notes || '',
          tags: feature.tags || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          category: 'core',
          status: 'planned',
          priority: 'medium',
          version: '',
          release_date: '',
          test_deadline: '',
          assigned_testers: [],
          acceptance_criteria: [],
          test_cases: [],
          related_pages: [],
          related_components: [],
          jira_link: '',
          figma_link: '',
          documentation_link: '',
          notes: '',
          tags: []
        });
      }
      setActiveTab('basic');
    }
  }, [isOpen, feature]);

  // Add handlers
  const addCriteria = () => {
    if (newCriteria.trim()) {
      setFormData(prev => ({
        ...prev,
        acceptance_criteria: [...prev.acceptance_criteria, newCriteria.trim()]
      }));
      setNewCriteria('');
    }
  };

  const removeCriteria = (index) => {
    setFormData(prev => ({
      ...prev,
      acceptance_criteria: prev.acceptance_criteria.filter((_, i) => i !== index)
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      test_cases: [...prev.test_cases, {
        id: generateId(),
        title: '',
        steps: '',
        expected: '',
        status: 'pending'
      }]
    }));
  };

  const updateTestCase = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  const removeTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addRelatedPage = () => {
    if (newPage.trim() && !formData.related_pages.includes(newPage.trim())) {
      setFormData(prev => ({ ...prev, related_pages: [...prev.related_pages, newPage.trim()] }));
      setNewPage('');
    }
  };

  const addRelatedComponent = () => {
    if (newComponent.trim() && !formData.related_components.includes(newComponent.trim())) {
      setFormData(prev => ({ ...prev, related_components: [...prev.related_components, newComponent.trim()] }));
      setNewComponent('');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Chỉnh Sửa Tính Năng' : 'Thêm Tính Năng Mới'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing ? `ID: ${feature.id}` : 'Tạo tính năng mới cho hệ thống'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="basic" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Cơ bản
                </TabsTrigger>
                <TabsTrigger value="criteria" className="gap-2">
                  ✅ Tiêu chí
                </TabsTrigger>
                <TabsTrigger value="testcases" className="gap-2">
                  <TestTube className="w-4 h-4" />
                  Test Cases
                </TabsTrigger>
                <TabsTrigger value="links" className="gap-2">
                  <Link className="w-4 h-4" />
                  Liên kết
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4 m-0">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên tính năng *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Quản lý đơn hàng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết tính năng..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.icon} {cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phiên bản</label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="VD: 1.0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày release</label>
                    <Input
                      type="date"
                      value={formData.release_date}
                      onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Thêm tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Criteria Tab */}
              <TabsContent value="criteria" className="space-y-4 m-0">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800">Tiêu chí nghiệm thu</h3>
                  <p className="text-sm text-blue-600">Danh sách các tiêu chí để xác nhận tính năng hoàn thành.</p>
                </div>

                <div className="space-y-2">
                  {formData.acceptance_criteria.map((criteria, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-500">✓</span>
                      <span className="flex-1">{criteria}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCriteria(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    placeholder="Thêm tiêu chí mới..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriteria())}
                  />
                  <Button onClick={addCriteria}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm
                  </Button>
                </div>
              </TabsContent>

              {/* Test Cases Tab */}
              <TabsContent value="testcases" className="m-0">
                <TestCaseFormEnhanced 
                  testCases={formData.test_cases}
                  onChange={(testCases) => setFormData(prev => ({ ...prev, test_cases: testCases }))}
                />
              </TabsContent>

              {/* Links Tab */}
              <TabsContent value="links" className="space-y-6 m-0">
                {/* External Links */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jira / Task Link</label>
                    <Input
                      value={formData.jira_link}
                      onChange={(e) => setFormData({ ...formData, jira_link: e.target.value })}
                      placeholder="https://jira.example.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Figma Link</label>
                    <Input
                      value={formData.figma_link}
                      onChange={(e) => setFormData({ ...formData, figma_link: e.target.value })}
                      placeholder="https://figma.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Documentation</label>
                    <Input
                      value={formData.documentation_link}
                      onChange={(e) => setFormData({ ...formData, documentation_link: e.target.value })}
                      placeholder="https://docs.example.com/..."
                    />
                  </div>
                </div>

                {/* Test Assignment */}
                <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg space-y-4">
                  <h4 className="font-medium text-violet-800 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Phân công Test
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-violet-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" /> Deadline Test
                      </label>
                      <Input
                        type="date"
                        value={formData.test_deadline}
                        onChange={(e) => setFormData({ ...formData, test_deadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-violet-700 mb-2">Tester (emails)</label>
                      <Input
                        value={formData.assigned_testers?.join(', ') || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          assigned_testers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="tester1@email.com, tester2@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trang liên quan</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.related_pages.map(page => (
                      <Badge key={page} variant="outline">
                        {page}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => 
                          setFormData(prev => ({ ...prev, related_pages: prev.related_pages.filter(p => p !== page) }))
                        } />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newPage}
                      onChange={(e) => setNewPage(e.target.value)}
                      placeholder="VD: AdminOrders"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedPage())}
                    />
                    <Button type="button" variant="outline" onClick={addRelatedPage}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Component liên quan</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.related_components.map(comp => (
                      <Badge key={comp} variant="outline">
                        {comp}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => 
                          setFormData(prev => ({ ...prev, related_components: prev.related_components.filter(c => c !== comp) }))
                        } />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newComponent}
                      onChange={(e) => setNewComponent(e.target.value)}
                      placeholder="VD: OrderTableView"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedComponent())}
                    />
                    <Button type="button" variant="outline" onClick={addRelatedComponent}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSaving || !formData.name.trim()}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}