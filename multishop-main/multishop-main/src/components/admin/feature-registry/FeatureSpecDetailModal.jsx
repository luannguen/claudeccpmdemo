/**
 * FeatureSpecDetailModal - Chi tiết Feature Spec
 * UI Layer only
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Edit, ExternalLink, Copy, Calendar, User, Target, AlertTriangle, 
  CheckCircle, Clock, FileText, Code, Layers, Flag, Zap, RefreshCw, ArrowRight
} from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from './FeatureSpecCard';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

export default function FeatureSpecDetailModal({ isOpen, onClose, spec, onEdit }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { addToast } = useToast();

  if (!spec) return null;

  const status = STATUS_CONFIG[spec.status] || STATUS_CONFIG.idea;
  const priority = PRIORITY_CONFIG[spec.priority] || PRIORITY_CONFIG.P2;
  const type = TYPE_CONFIG[spec.type] || TYPE_CONFIG.new;

  const taskStats = spec.tasks?.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const copyFCode = () => {
    navigator.clipboard.writeText(spec.fcode);
  };

  // Check if can sync (released OR progress=100%)
  const canSync = spec.status === 'released' || spec.progress === 100;

  // Map FeatureSpec.module -> Feature.category
  const mapModuleToCategory = (module) => {
    const mapping = {
      'ecard': 'client',
      'community': 'client',
      'shop': 'client',
      'admin': 'admin',
      'core': 'core',
      'notification': 'notification',
      'referral': 'referral',
      'checkout': 'payment',
      'preorder': 'order',
      'saas': 'integration',
      'gift': 'client',
      'other': 'other'
    };
    return mapping[module] || 'other';
  };

  // Map priority từ P0/P1/P2/P3 sang critical/high/medium/low
  const mapPriority = (priority) => {
    const mapping = {
      'P0': 'critical',
      'P1': 'high',
      'P2': 'medium',
      'P3': 'low'
    };
    return mapping[priority] || 'medium';
  };

  // Sync single feature to Features Registry
  const handleSyncToFeaturesRegistry = async () => {
    try {
      setIsSyncing(true);

      // Check if already exists
      const existingFeatures = await base44.entities.Feature.list();
      const alreadyExists = existingFeatures.some(f => 
        f.tags?.includes(spec.fcode) || f.notes?.includes(spec.fcode)
      );

      if (alreadyExists) {
        addToast(`Feature "${spec.fcode}" đã tồn tại trong Features Registry`, 'info');
        setIsSyncing(false);
        return;
      }

      // Map FeatureSpec -> Feature entity
      const featureData = {
        name: spec.name,
        description: spec.short_description || spec.objective || '',
        category: mapModuleToCategory(spec.module),
        status: spec.status === 'released' ? 'completed' : 'testing',
        priority: mapPriority(spec.priority),
        version: spec.version_released || spec.milestone || '1.0.0',
        acceptance_criteria: spec.acceptance_criteria || [],
        test_cases: (spec.test_cases || []).map(tc => ({
          id: tc.id,
          title: tc.scenario,
          steps: tc.steps,
          expected: tc.expected,
          status: tc.status === 'passed' ? 'passed' : 'pending',
          assigned_tester: null,
          dev_response: null
        })),
        related_pages: spec.modules_involved?.filter(m => m.startsWith('pages/')) || [],
        related_components: spec.modules_involved?.filter(m => m.startsWith('components/')) || [],
        is_public: false,
        public_token: null,
        notes: `Imported from Feature Control Tower (${spec.fcode})\n\nMục tiêu: ${spec.objective || ''}\n\n${spec.notes || ''}`,
        tags: [...new Set([...(spec.tags || []), spec.fcode, spec.module])].filter(Boolean)
      };

      await base44.entities.Feature.create(featureData);
      
      addToast(`✅ Đã đồng bộ "${spec.fcode} - ${spec.name}" sang Features Registry`, 'success');
    } catch (error) {
      addToast('Lỗi khi đồng bộ: ' + error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="font-mono text-sm text-violet-600 bg-violet-50 px-2 py-1 rounded cursor-pointer hover:bg-violet-100"
                  onClick={copyFCode}
                  title="Click để copy"
                >
                  {spec.fcode}
                </span>
                <Badge className={type.color}>{type.label}</Badge>
                <Badge className={status.color}>{status.icon} {status.label}</Badge>
                <Badge className={priority.color}>{priority.label}</Badge>
              </div>
              <DialogTitle className="text-xl">{spec.name}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Sync Button - Chỉ hiện khi progress=100% hoặc released */}
              {canSync && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncToFeaturesRegistry}
                  disabled={isSyncing}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onEdit?.(spec)}>
                <Edit className="w-4 h-4 mr-1" /> Sửa
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="scope">Phạm vi</TabsTrigger>
            <TabsTrigger value="technical">Kỹ thuật</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({spec.tasks?.length || 0})</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases ({spec.test_cases?.length || 0})</TabsTrigger>
            <TabsTrigger value="qa">QA & Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Tiến độ tổng thể</span>
                <span className="text-2xl font-bold text-violet-600">{spec.progress || 0}%</span>
              </div>
              <Progress value={spec.progress || 0} className="h-3" />
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={Layers} label="Module" value={spec.module} />
              <InfoCard icon={Flag} label="Phase" value={spec.phase || '-'} />
              <InfoCard icon={Zap} label="Milestone" value={spec.milestone || '-'} />
              <InfoCard icon={User} label="Owner Tech" value={spec.owner_tech || '-'} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" /> Dự kiến
                </div>
                <p className="font-medium">
                  {spec.target_start || '?'} → {spec.target_end || '?'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" /> Thực tế
                </div>
                <p className="font-medium">
                  {spec.actual_start || '?'} → {spec.actual_end || '?'}
                </p>
              </div>
            </div>

            {/* Objective & Problem */}
            {spec.objective && (
              <Section title="🎯 Mục tiêu">
                <p className="text-gray-700">{spec.objective}</p>
              </Section>
            )}

            {spec.problem && (
              <Section title="⚠️ Vấn đề / Pain point">
                <p className="text-gray-700">{spec.problem}</p>
              </Section>
            )}

            {spec.solution_algorithm && (
              <Section title="💡 Giải pháp / Thuật toán">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-gray-700 whitespace-pre-wrap">{spec.solution_algorithm}</p>
                </div>
              </Section>
            )}

            {/* Values */}
            {(spec.value_user || spec.value_system || spec.value_business) && (
              <Section title="💎 Giá trị mang lại">
                <div className="grid md:grid-cols-3 gap-3">
                  {spec.value_user && (
                    <ValueCard label="Cho User" value={spec.value_user} color="bg-blue-50" />
                  )}
                  {spec.value_system && (
                    <ValueCard label="Cho Hệ thống" value={spec.value_system} color="bg-purple-50" />
                  )}
                  {spec.value_business && (
                    <ValueCard label="Cho Kinh doanh" value={spec.value_business} color="bg-green-50" />
                  )}
                </div>
              </Section>
            )}

            {/* Tags */}
            {spec.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {spec.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">#{tag}</Badge>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Scope Tab */}
          <TabsContent value="scope" className="space-y-6 mt-4">
            {spec.short_description && (
              <Section title="📝 Mô tả ngắn">
                <p className="text-gray-700">{spec.short_description}</p>
              </Section>
            )}

            {spec.detail_description && (
              <Section title="📖 Mô tả chi tiết">
                <p className="text-gray-700 whitespace-pre-wrap">{spec.detail_description}</p>
              </Section>
            )}

            {spec.in_scope?.length > 0 && (
              <Section title="✅ Trong phạm vi (In Scope)">
                <ul className="space-y-1">
                  {spec.in_scope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {spec.out_scope?.length > 0 && (
              <Section title="❌ Ngoài phạm vi (Out of Scope)">
                <ul className="space-y-1">
                  {spec.out_scope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon.X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Impacted Areas */}
            {spec.impacted_areas && (
              <Section title="🎯 Khu vực ảnh hưởng">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(spec.impacted_areas).filter(([_, v]) => v).map(([key]) => (
                    <Badge key={key} variant="secondary">{key.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </Section>
            )}

            {/* Functional Requirements */}
            {spec.functional_requirements?.length > 0 && (
              <Section title="📋 Yêu cầu chức năng (FR)">
                <ul className="space-y-2">
                  {spec.functional_requirements.map((fr, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="shrink-0">{fr.id}</Badge>
                      <span>{fr.description}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6 mt-4">
            {spec.architecture_notes && (
              <Section title="🏗️ Kiến trúc">
                <p className="text-gray-700 whitespace-pre-wrap">{spec.architecture_notes}</p>
              </Section>
            )}

            {spec.modules_involved?.length > 0 && (
              <Section title="📦 Modules liên quan">
                <div className="flex flex-wrap gap-2">
                  {spec.modules_involved.map((m, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs">{m}</Badge>
                  ))}
                </div>
              </Section>
            )}

            {spec.entities_affected?.length > 0 && (
              <Section title="🗄️ Entities ảnh hưởng">
                <div className="flex flex-wrap gap-2">
                  {spec.entities_affected.map((e, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700">{e}</Badge>
                  ))}
                </div>
              </Section>
            )}

            {spec.hooks_services?.length > 0 && (
              <Section title="🪝 Hooks/Services">
                <div className="flex flex-wrap gap-2">
                  {spec.hooks_services.map((h, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs">{h}</Badge>
                  ))}
                </div>
              </Section>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${spec.backward_compatible ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className={spec.backward_compatible ? 'text-green-700' : 'text-red-700'}>
                  {spec.backward_compatible ? '✅' : '⚠️'} Backward Compatible: {spec.backward_compatible ? 'Có' : 'Không'}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${spec.migration_required ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                <span className={spec.migration_required ? 'text-yellow-700' : 'text-gray-600'}>
                  {spec.migration_required ? '⚠️' : '✓'} Migration: {spec.migration_required ? 'Cần' : 'Không cần'}
                </span>
              </div>
            </div>

            {spec.feature_flag_key && (
              <div className="bg-violet-50 p-3 rounded-lg">
                <span className="text-violet-700 font-mono">🚩 {spec.feature_flag_key}</span>
              </div>
            )}

            {spec.design_mockup_url && (
              <a 
                href={spec.design_mockup_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Xem Figma/Mockup
              </a>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4 mt-4">
            {/* Task Stats */}
            <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Done: {taskStats.done || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                In Progress: {taskStats.in_progress || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                Todo: {taskStats.todo || 0}
              </span>
            </div>

            {/* Task List */}
            {spec.tasks?.map((task, i) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{task.id}</Badge>
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{task.type}</Badge>
                    <Badge className={
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }>{task.status}</Badge>
                  </div>
                </div>
                {task.owner && (
                  <p className="text-sm text-gray-500">👤 {task.owner} | ⏱️ {task.estimate}</p>
                )}
                {task.files?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.files.map((f, j) => (
                      <Badge key={j} variant="outline" className="font-mono text-xs">{f}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {(!spec.tasks || spec.tasks.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Chưa có tasks nào
              </div>
            )}
          </TabsContent>

          {/* Test Cases Tab */}
          <TabsContent value="testcases" className="space-y-4 mt-4">
            {/* Test Case Stats */}
            {spec.test_cases?.length > 0 && (
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Passed: {spec.test_cases.filter(tc => tc.status === 'passed').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  Failed: {spec.test_cases.filter(tc => tc.status === 'failed').length}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                  Pending: {spec.test_cases.filter(tc => tc.status === 'pending').length}
                </span>
              </div>
            )}

            {/* Test Case List */}
            {spec.test_cases?.map((tc, i) => (
              <div key={tc.id || i} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{tc.id}</Badge>
                    <span className="font-medium">{tc.scenario}</span>
                  </div>
                  <Badge className={
                    tc.status === 'passed' ? 'bg-green-100 text-green-700' :
                    tc.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {tc.status === 'passed' ? '✓ Passed' : tc.status === 'failed' ? '✗ Failed' : '○ Pending'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">📋 Các bước thực hiện:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{tc.steps}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium mb-1">✅ Kết quả mong đợi:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{tc.expected}</p>
                  </div>
                </div>
              </div>
            ))}

            {(!spec.test_cases || spec.test_cases.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có test cases nào</p>
                <p className="text-sm">Thêm test cases để đảm bảo chất lượng tính năng</p>
              </div>
            )}
          </TabsContent>

          {/* QA & Logs Tab */}
          <TabsContent value="qa" className="space-y-6 mt-4">
            {/* Acceptance Criteria */}
            {spec.acceptance_criteria?.length > 0 && (
              <Section title="✅ Tiêu chí nghiệm thu (AC)">
                <ul className="space-y-1">
                  {spec.acceptance_criteria.map((ac, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Risks */}
            {spec.risks?.length > 0 && (
              <Section title="⚠️ Rủi ro">
                <div className="space-y-3">
                  {spec.risks.map((risk, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{risk.type}</Badge>
                        <Badge className={
                          risk.impact === 'high' ? 'bg-red-100 text-red-700' :
                          risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>Impact: {risk.impact}</Badge>
                      </div>
                      <p className="text-gray-700">{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-sm text-gray-500 mt-1">💡 {risk.mitigation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Changelog */}
            {spec.changelogs?.length > 0 && (
              <Section title="📜 Changelog">
                <div className="space-y-2">
                  {spec.changelogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      <Badge variant="outline">{log.version}</Badge>
                      <span className="text-sm text-gray-500">{log.date}</span>
                      <span className="flex-1">{log.changes}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Decisions */}
            {spec.decisions?.length > 0 && (
              <Section title="📌 Quyết định quan trọng">
                <div className="space-y-2">
                  {spec.decisions.map((d, i) => (
                    <div key={i} className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-500">{d.date}</p>
                      <p className="font-medium">{d.decision}</p>
                      {d.reason && <p className="text-sm text-gray-600">Lý do: {d.reason}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Notes */}
            {spec.notes && (
              <Section title="📝 Ghi chú">
                <p className="text-gray-700 whitespace-pre-wrap">{spec.notes}</p>
              </Section>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function Section({ title, children }) {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function InfoCard({ icon: IconComp, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <IconComp className="w-4 h-4" /> {label}
      </div>
      <p className="font-medium">{value || '-'}</p>
    </div>
  );
}

function ValueCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-lg p-3`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}