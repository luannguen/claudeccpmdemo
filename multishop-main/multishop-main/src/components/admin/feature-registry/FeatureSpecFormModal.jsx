/**
 * FeatureSpecFormModal - Form tạo/sửa Feature Spec
 * UI Layer only
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from './FeatureSpecCard';
import { MODULE_OPTIONS } from './FeatureSpecFilters';

const EMPTY_SPEC = {
  fcode: '',
  name: '',
  module: 'core',
  type: 'new',
  phase: '',
  milestone: '',
  priority: 'P2',
  status: 'idea',
  progress: 0,
  owner_product: '',
  owner_tech: '',
  assignees: [],
  target_start: '',
  target_end: '',
  objective: '',
  problem: '',
  solution_algorithm: '',
  value_user: '',
  value_system: '',
  value_business: '',
  success_metrics: [],
  in_scope: [],
  out_scope: [],
  impacted_areas: {
    user_ui: false,
    admin_ui: false,
    data_db: false,
    api_functions: false,
    auth_permissions: false,
    analytics: false,
    notification_email: false
  },
  short_description: '',
  detail_description: '',
  functional_requirements: [],
  non_functional_requirements: {
    performance: '',
    security: '',
    reliability: '',
    accessibility: ''
  },
  design_mockup_url: '',
  ux_notes: '',
  architecture_notes: '',
  modules_involved: [],
  entities_affected: [],
  api_functions: [],
  hooks_services: [],
  ui_components_used: [],
  ui_components_new: [],
  events_emitted: [],
  backward_compatible: true,
  migration_required: false,
  feature_flag_key: '',
  dependencies: [],
  assumptions: [],
  tasks: [],
  acceptance_criteria: [],
  test_cases: [],
  rollout_strategy: {
    stages: [],
    rollback_condition: '',
    rollback_method: ''
  },
  risks: [],
  version_introduced: '',
  version_released: '',
  changelogs: [],
  pr_commits: [],
  related_fcodes: [],
  documentation_links: [],
  decisions: [],
  notes: '',
  tags: []
};

export default function FeatureSpecFormModal({
  isOpen,
  onClose,
  spec,
  onSave,
  isSaving
}) {
  const [formData, setFormData] = useState(EMPTY_SPEC);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (spec) {
      setFormData({ ...EMPTY_SPEC, ...spec });
    } else {
      setFormData(EMPTY_SPEC);
    }
  }, [spec, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleArrayAdd = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleTaskAdd = () => {
    const newTask = {
      id: `T${Date.now()}`,
      title: '',
      type: 'ui',
      phase: '',
      estimate: '',
      owner: '',
      files: [],
      steps: [],
      dod: [],
      status: 'todo'
    };
    handleChange('tasks', [...(formData.tasks || []), newTask]);
  };

  const handleTaskChange = (index, field, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    handleChange('tasks', newTasks);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {spec ? `Chỉnh sửa: ${spec.fcode}` : 'Tạo Feature Spec mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="scope">Phạm vi</TabsTrigger>
              <TabsTrigger value="technical">Kỹ thuật</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="testcases">Test Cases</TabsTrigger>
              <TabsTrigger value="qa">QA & Rollout</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>FCode *</Label>
                  <Input
                    value={formData.fcode}
                    onChange={(e) => handleChange('fcode', e.target.value.toUpperCase())}
                    placeholder="ECARD-F14"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tên tính năng *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Tên tính năng"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Module</Label>
                  <Select value={formData.module} onValueChange={(v) => handleChange('module', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODULE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Loại</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.icon} {cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ưu tiên</Label>
                  <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phase</Label>
                  <Input
                    value={formData.phase}
                    onChange={(e) => handleChange('phase', e.target.value)}
                    placeholder="Phase 2 - Engagement"
                  />
                </div>
                <div>
                  <Label>Milestone/Version</Label>
                  <Input
                    value={formData.milestone}
                    onChange={(e) => handleChange('milestone', e.target.value)}
                    placeholder="v4.2.0"
                  />
                </div>
              </div>

              <div>
                <Label>Tiến độ: {formData.progress}%</Label>
                <Slider
                  value={[formData.progress]}
                  onValueChange={([v]) => handleChange('progress', v)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Mô tả ngắn</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  placeholder="Mô tả ngắn gọn về tính năng"
                />
              </div>

              <div>
                <Label>Mục tiêu (Objective)</Label>
                <Textarea
                  value={formData.objective}
                  onChange={(e) => handleChange('objective', e.target.value)}
                  placeholder="Tính năng này giải quyết vấn đề gì? Cho ai?"
                  rows={2}
                />
              </div>

              <div>
                <Label>Vấn đề / Pain point</Label>
                <Textarea
                  value={formData.problem}
                  onChange={(e) => handleChange('problem', e.target.value)}
                  placeholder="Nếu không làm thì user/admin gặp vấn đề gì?"
                  rows={2}
                />
              </div>

              <div>
                <Label>💡 Giải pháp / Thuật toán</Label>
                <Textarea
                  value={formData.solution_algorithm}
                  onChange={(e) => handleChange('solution_algorithm', e.target.value)}
                  placeholder="Mô tả step-by-step cách triển khai, flow diagram, thuật toán xử lý..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Giá trị cho User</Label>
                  <Textarea
                    value={formData.value_user}
                    onChange={(e) => handleChange('value_user', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Giá trị cho Hệ thống</Label>
                  <Textarea
                    value={formData.value_system}
                    onChange={(e) => handleChange('value_system', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Giá trị Kinh doanh</Label>
                  <Textarea
                    value={formData.value_business}
                    onChange={(e) => handleChange('value_business', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Owner Product</Label>
                  <Input
                    value={formData.owner_product}
                    onChange={(e) => handleChange('owner_product', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Owner Tech</Label>
                  <Input
                    value={formData.owner_tech}
                    onChange={(e) => handleChange('owner_tech', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày bắt đầu dự kiến</Label>
                  <Input
                    type="date"
                    value={formData.target_start}
                    onChange={(e) => handleChange('target_start', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ngày kết thúc dự kiến</Label>
                  <Input
                    type="date"
                    value={formData.target_end}
                    onChange={(e) => handleChange('target_end', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Scope Tab */}
            <TabsContent value="scope" className="space-y-4 mt-4">
              {/* In Scope */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Trong phạm vi (In Scope)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('in_scope', '')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.in_scope?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('in_scope', i, e.target.value)}
                      placeholder="Mô tả..."
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayRemove('in_scope', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Out of Scope */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Ngoài phạm vi (Out of Scope)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('out_scope', '')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.out_scope?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('out_scope', i, e.target.value)}
                      placeholder="Mô tả..."
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayRemove('out_scope', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Impacted Areas */}
              <div>
                <Label className="mb-3 block">Khu vực ảnh hưởng</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'user_ui', label: 'User UI' },
                    { key: 'admin_ui', label: 'Admin UI' },
                    { key: 'data_db', label: 'Data/DB' },
                    { key: 'api_functions', label: 'API/Functions' },
                    { key: 'auth_permissions', label: 'Auth/Permissions' },
                    { key: 'analytics', label: 'Analytics' },
                    { key: 'notification_email', label: 'Notification/Email' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.impacted_areas?.[item.key] || false}
                        onCheckedChange={(checked) => handleNestedChange('impacted_areas', item.key, checked)}
                      />
                      <Label className="font-normal">{item.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Functional Requirements */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Yêu cầu chức năng (FR)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('functional_requirements', { id: `FR${(formData.functional_requirements?.length || 0) + 1}`, description: '' })}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.functional_requirements?.map((fr, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={fr.id}
                      onChange={(e) => {
                        const newFRs = [...formData.functional_requirements];
                        newFRs[i] = { ...fr, id: e.target.value };
                        handleChange('functional_requirements', newFRs);
                      }}
                      className="w-24"
                      placeholder="FR1"
                    />
                    <Input
                      value={fr.description}
                      onChange={(e) => {
                        const newFRs = [...formData.functional_requirements];
                        newFRs[i] = { ...fr, description: e.target.value };
                        handleChange('functional_requirements', newFRs);
                      }}
                      placeholder="Mô tả yêu cầu..."
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayRemove('functional_requirements', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* NFR */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Performance (NFR)</Label>
                  <Input
                    value={formData.non_functional_requirements?.performance}
                    onChange={(e) => handleNestedChange('non_functional_requirements', 'performance', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Security (NFR)</Label>
                  <Input
                    value={formData.non_functional_requirements?.security}
                    onChange={(e) => handleNestedChange('non_functional_requirements', 'security', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4 mt-4">
              <div>
                <Label>Kiến trúc tổng thể</Label>
                <Textarea
                  value={formData.architecture_notes}
                  onChange={(e) => handleChange('architecture_notes', e.target.value)}
                  rows={3}
                  placeholder="Mô tả kiến trúc..."
                />
              </div>

              <div>
                <Label>Modules liên quan (mỗi dòng 1 module)</Label>
                <Textarea
                  value={formData.modules_involved?.join('\n')}
                  onChange={(e) => handleChange('modules_involved', e.target.value.split('\n').filter(Boolean))}
                  rows={3}
                  placeholder="components/features/ecard"
                />
              </div>

              <div>
                <Label>Entities ảnh hưởng (mỗi dòng 1 entity)</Label>
                <Textarea
                  value={formData.entities_affected?.join('\n')}
                  onChange={(e) => handleChange('entities_affected', e.target.value.split('\n').filter(Boolean))}
                  rows={3}
                  placeholder="EcardProfile"
                />
              </div>

              <div>
                <Label>Hooks/Services (mỗi dòng 1 item)</Label>
                <Textarea
                  value={formData.hooks_services?.join('\n')}
                  onChange={(e) => handleChange('hooks_services', e.target.value.split('\n').filter(Boolean))}
                  rows={3}
                  placeholder="useEcardProfile"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.backward_compatible}
                    onCheckedChange={(v) => handleChange('backward_compatible', v)}
                  />
                  <Label className="font-normal">Backward Compatible</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.migration_required}
                    onCheckedChange={(v) => handleChange('migration_required', v)}
                  />
                  <Label className="font-normal">Cần Migration</Label>
                </div>
              </div>

              <div>
                <Label>Feature Flag Key</Label>
                <Input
                  value={formData.feature_flag_key}
                  onChange={(e) => handleChange('feature_flag_key', e.target.value)}
                  placeholder="FF_ECARD_F14"
                />
              </div>

              <div>
                <Label>Link Figma/Mockup</Label>
                <Input
                  value={formData.design_mockup_url}
                  onChange={(e) => handleChange('design_mockup_url', e.target.value)}
                  placeholder="https://figma.com/..."
                />
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Danh sách Tasks</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleTaskAdd}>
                  <Plus className="w-4 h-4 mr-1" /> Thêm Task
                </Button>
              </div>

              {formData.tasks?.map((task, i) => (
                <Collapsible key={task.id} className="border rounded-lg p-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{task.id}</Badge>
                      <span className="font-medium">{task.title || 'Untitled'}</span>
                      <Badge className={
                        task.status === 'done' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>{task.status}</Badge>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={task.title}
                        onChange={(e) => handleTaskChange(i, 'title', e.target.value)}
                        placeholder="Tiêu đề task"
                      />
                      <Select value={task.type} onValueChange={(v) => handleTaskChange(i, 'type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="domain">Domain</SelectItem>
                          <SelectItem value="hooks">Hooks</SelectItem>
                          <SelectItem value="ui">UI</SelectItem>
                          <SelectItem value="integration">Integration</SelectItem>
                          <SelectItem value="qa">QA</SelectItem>
                          <SelectItem value="release">Release</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={task.status} onValueChange={(v) => handleTaskChange(i, 'status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Todo</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={task.estimate}
                        onChange={(e) => handleTaskChange(i, 'estimate', e.target.value)}
                        placeholder="Estimate (VD: 0.5d)"
                      />
                      <Input
                        value={task.owner}
                        onChange={(e) => handleTaskChange(i, 'owner', e.target.value)}
                        placeholder="Owner"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => handleArrayRemove('tasks', i)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa task
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TabsContent>

            {/* Test Cases Tab */}
            <TabsContent value="testcases" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>Danh sách Test Cases</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleArrayAdd('test_cases', { 
                    id: `TC-${formData.fcode || 'NEW'}-${String((formData.test_cases?.length || 0) + 1).padStart(2, '0')}`, 
                    scenario: '', 
                    steps: '', 
                    expected: '', 
                    status: 'pending' 
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Thêm Test Case
                </Button>
              </div>

              {/* Test Case Stats */}
              {formData.test_cases?.length > 0 && (
                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Passed: {formData.test_cases.filter(tc => tc.status === 'passed').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Failed: {formData.test_cases.filter(tc => tc.status === 'failed').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    Pending: {formData.test_cases.filter(tc => tc.status === 'pending').length}
                  </span>
                </div>
              )}

              {formData.test_cases?.map((tc, i) => (
                <Collapsible key={tc.id || i} className="border rounded-lg p-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{tc.id}</Badge>
                      <span className="font-medium text-sm truncate max-w-[300px]">{tc.scenario || 'Chưa có scenario'}</span>
                      <Badge className={
                        tc.status === 'passed' ? 'bg-green-100 text-green-700' :
                        tc.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>{tc.status}</Badge>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      <Input
                        value={tc.id}
                        onChange={(e) => {
                          const newTCs = [...formData.test_cases];
                          newTCs[i] = { ...tc, id: e.target.value };
                          handleChange('test_cases', newTCs);
                        }}
                        placeholder="TC-ID"
                        className="font-mono text-xs"
                      />
                      <div className="col-span-2">
                        <Input
                          value={tc.scenario}
                          onChange={(e) => {
                            const newTCs = [...formData.test_cases];
                            newTCs[i] = { ...tc, scenario: e.target.value };
                            handleChange('test_cases', newTCs);
                          }}
                          placeholder="Tên scenario (VD: Đăng nhập thành công)"
                        />
                      </div>
                      <Select 
                        value={tc.status} 
                        onValueChange={(v) => {
                          const newTCs = [...formData.test_cases];
                          newTCs[i] = { ...tc, status: v };
                          handleChange('test_cases', newTCs);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">⏳ Pending</SelectItem>
                          <SelectItem value="passed">✅ Passed</SelectItem>
                          <SelectItem value="failed">❌ Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Các bước thực hiện</Label>
                      <Textarea
                        value={tc.steps}
                        onChange={(e) => {
                          const newTCs = [...formData.test_cases];
                          newTCs[i] = { ...tc, steps: e.target.value };
                          handleChange('test_cases', newTCs);
                        }}
                        placeholder="1. Mở trang...\n2. Click vào...\n3. Nhập..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Kết quả mong đợi</Label>
                      <Textarea
                        value={tc.expected}
                        onChange={(e) => {
                          const newTCs = [...formData.test_cases];
                          newTCs[i] = { ...tc, expected: e.target.value };
                          handleChange('test_cases', newTCs);
                        }}
                        placeholder="Hệ thống hiển thị thông báo thành công..."
                        rows={2}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500" 
                      onClick={() => handleArrayRemove('test_cases', i)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa test case
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {(!formData.test_cases || formData.test_cases.length === 0) && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <p className="text-sm">Chưa có test cases</p>
                  <p className="text-xs">Click "Thêm Test Case" để bắt đầu</p>
                </div>
              )}
            </TabsContent>

            {/* QA & Rollout Tab */}
            <TabsContent value="qa" className="space-y-4 mt-4">
              {/* Acceptance Criteria */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Tiêu chí nghiệm thu (AC)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('acceptance_criteria', '')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.acceptance_criteria?.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('acceptance_criteria', i, e.target.value)}
                      placeholder="AC..."
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayRemove('acceptance_criteria', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Risks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Rủi ro</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('risks', { type: 'technical', description: '', impact: 'medium', likelihood: 'medium', mitigation: '' })}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.risks?.map((risk, i) => (
                  <div key={i} className="border rounded-lg p-3 mb-2 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={risk.type} onValueChange={(v) => {
                        const newRisks = [...formData.risks];
                        newRisks[i] = { ...risk, type: v };
                        handleChange('risks', newRisks);
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Kỹ thuật</SelectItem>
                          <SelectItem value="ux">UX</SelectItem>
                          <SelectItem value="operation">Vận hành</SelectItem>
                          <SelectItem value="security">Bảo mật</SelectItem>
                          <SelectItem value="business">Kinh doanh</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={risk.impact} onValueChange={(v) => {
                        const newRisks = [...formData.risks];
                        newRisks[i] = { ...risk, impact: v };
                        handleChange('risks', newRisks);
                      }}>
                        <SelectTrigger><SelectValue placeholder="Impact" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={risk.likelihood} onValueChange={(v) => {
                        const newRisks = [...formData.risks];
                        newRisks[i] = { ...risk, likelihood: v };
                        handleChange('risks', newRisks);
                      }}>
                        <SelectTrigger><SelectValue placeholder="Likelihood" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={risk.description}
                      onChange={(e) => {
                        const newRisks = [...formData.risks];
                        newRisks[i] = { ...risk, description: e.target.value };
                        handleChange('risks', newRisks);
                      }}
                      placeholder="Mô tả rủi ro..."
                    />
                    <Input
                      value={risk.mitigation}
                      onChange={(e) => {
                        const newRisks = [...formData.risks];
                        newRisks[i] = { ...risk, mitigation: e.target.value };
                        handleChange('risks', newRisks);
                      }}
                      placeholder="Biện pháp giảm thiểu..."
                    />
                    <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => handleArrayRemove('risks', i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Changelogs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Changelog</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayAdd('changelogs', { version: '', date: new Date().toISOString().split('T')[0], changes: '' })}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.changelogs?.map((log, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input
                      value={log.version}
                      onChange={(e) => {
                        const newLogs = [...formData.changelogs];
                        newLogs[i] = { ...log, version: e.target.value };
                        handleChange('changelogs', newLogs);
                      }}
                      placeholder="v1.0.0"
                      className="w-24"
                    />
                    <Input
                      type="date"
                      value={log.date}
                      onChange={(e) => {
                        const newLogs = [...formData.changelogs];
                        newLogs[i] = { ...log, date: e.target.value };
                        handleChange('changelogs', newLogs);
                      }}
                      className="w-36"
                    />
                    <Input
                      value={log.changes}
                      onChange={(e) => {
                        const newLogs = [...formData.changelogs];
                        newLogs[i] = { ...log, changes: e.target.value };
                        handleChange('changelogs', newLogs);
                      }}
                      placeholder="Mô tả thay đổi..."
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleArrayRemove('changelogs', i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <Label>Ghi chú chung</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Tags (phân cách bằng dấu phẩy)</Label>
                <Input
                  value={formData.tags?.join(', ')}
                  onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                  placeholder="upgrade, ecard, phase2"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700">
              {isSaving ? 'Đang lưu...' : (spec ? 'Cập nhật' : 'Tạo mới')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}