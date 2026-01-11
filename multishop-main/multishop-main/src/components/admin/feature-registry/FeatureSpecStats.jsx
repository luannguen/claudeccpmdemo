/**
 * FeatureSpecStats - Thống kê Feature Specs
 * UI Layer only
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Zap, Clock, CheckCircle, AlertTriangle, Rocket, Bug, Sparkles, RefreshCw } from 'lucide-react';

export default function FeatureSpecStats({ specs = [] }) {
  // Calculate stats
  const stats = {
    total: specs.length,
    byStatus: {
      idea: specs.filter(s => s.status === 'idea').length,
      spec_ready: specs.filter(s => s.status === 'spec_ready').length,
      planned: specs.filter(s => s.status === 'planned').length,
      in_progress: specs.filter(s => s.status === 'in_progress').length,
      code_review: specs.filter(s => s.status === 'code_review').length,
      testing: specs.filter(s => s.status === 'testing').length,
      staged: specs.filter(s => s.status === 'staged').length,
      released: specs.filter(s => s.status === 'released').length,
      deprecated: specs.filter(s => s.status === 'deprecated').length
    },
    byPriority: {
      P0: specs.filter(s => s.priority === 'P0').length,
      P1: specs.filter(s => s.priority === 'P1').length,
      P2: specs.filter(s => s.priority === 'P2').length,
      P3: specs.filter(s => s.priority === 'P3').length
    },
    byType: {
      new: specs.filter(s => s.type === 'new').length,
      enhancement: specs.filter(s => s.type === 'enhancement').length,
      bugfix: specs.filter(s => s.type === 'bugfix').length,
      refactor: specs.filter(s => s.type === 'refactor').length,
      techdebt: specs.filter(s => s.type === 'techdebt').length
    },
    avgProgress: specs.length > 0 
      ? Math.round(specs.reduce((sum, s) => sum + (s.progress || 0), 0) / specs.length)
      : 0,
    totalTasks: specs.reduce((sum, s) => sum + (s.tasks?.length || 0), 0),
    doneTasks: specs.reduce((sum, s) => sum + (s.tasks?.filter(t => t.status === 'done').length || 0), 0)
  };

  const cards = [
    { 
      label: 'Tổng Feature Specs', 
      value: stats.total, 
      icon: Zap, 
      color: 'bg-violet-500',
      subtext: `${stats.byType.new} mới, ${stats.byType.enhancement} nâng cấp`
    },
    { 
      label: 'Đang thực hiện', 
      value: stats.byStatus.in_progress + stats.byStatus.code_review, 
      icon: Clock, 
      color: 'bg-yellow-500',
      subtext: `${stats.byStatus.code_review} code review`
    },
    { 
      label: 'Đang test', 
      value: stats.byStatus.testing + stats.byStatus.staged, 
      icon: RefreshCw, 
      color: 'bg-cyan-500',
      subtext: `${stats.byStatus.staged} staged`
    },
    { 
      label: 'Đã phát hành', 
      value: stats.byStatus.released, 
      icon: Rocket, 
      color: 'bg-green-500',
      subtext: `${stats.avgProgress}% avg progress`
    }
  ];

  const priorityCards = [
    { label: 'P0 Critical', value: stats.byPriority.P0, color: 'text-red-600 bg-red-50' },
    { label: 'P1 High', value: stats.byPriority.P1, color: 'text-orange-600 bg-orange-50' },
    { label: 'P2 Medium', value: stats.byPriority.P2, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'P3 Low', value: stats.byPriority.P3, color: 'text-gray-600 bg-gray-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
                {card.subtext && (
                  <p className="text-xs text-gray-400">{card.subtext}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Priority Overview */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Theo độ ưu tiên</h3>
        <div className="flex flex-wrap gap-3">
          {priorityCards.map((p) => (
            <div key={p.label} className={`px-4 py-2 rounded-lg ${p.color}`}>
              <span className="font-bold text-lg">{p.value}</span>
              <span className="text-sm ml-2">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type Overview */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Theo loại</h3>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Sparkles className="w-4 h-4 inline mr-1" />
            <span className="font-bold">{stats.byType.new}</span> Mới
          </div>
          <div className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700">
            <Icon.TrendingUp size={16} className="inline mr-1" />
            <span className="font-bold">{stats.byType.enhancement}</span> Nâng cấp
          </div>
          <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700">
            <Bug className="w-4 h-4 inline mr-1" />
            <span className="font-bold">{stats.byType.bugfix}</span> Sửa lỗi
          </div>
          <div className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700">
            <RefreshCw className="w-4 h-4 inline mr-1" />
            <span className="font-bold">{stats.byType.refactor}</span> Refactor
          </div>
          <div className="px-4 py-2 rounded-lg bg-gray-50 text-gray-700">
            <span className="font-bold">{stats.byType.techdebt}</span> Tech Debt
          </div>
        </div>
      </div>

      {/* Tasks Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-3">Tiến độ Tasks</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Tổng tasks</span>
              <span className="font-medium">{stats.doneTasks}/{stats.totalTasks}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: stats.totalTasks > 0 ? `${(stats.doneTasks / stats.totalTasks) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-violet-600">
              {stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500">hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
}