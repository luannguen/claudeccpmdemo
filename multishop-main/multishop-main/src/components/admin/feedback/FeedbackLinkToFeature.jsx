import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/NotificationToast';
import { categoryConfig } from '@/components/services/featureService';

/**
 * FeedbackLinkToFeature - Admin tool to link feedback to features/create feature from feedback
 */
export default function FeedbackLinkToFeature({ feedback, isOpen, onClose }) {
  const [linkMode, setLinkMode] = useState('existing'); // 'existing' | 'create'
  const [selectedFeatureId, setSelectedFeatureId] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState('feedback');
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: features = [] } = useQuery({
    queryKey: ['features-for-link'],
    queryFn: () => base44.entities.Feature.list('-created_date', 500),
    enabled: isOpen
  });

  // Link to existing feature
  const linkMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFeatureId) throw new Error('Chọn feature để link');
      
      const feature = features.find(f => f.id === selectedFeatureId);
      const linkedIds = feature.linked_feedback_ids || [];
      
      if (linkedIds.includes(feedback.id)) {
        throw new Error('Feedback đã được link với feature này');
      }
      
      await base44.entities.Feature.update(selectedFeatureId, {
        linked_feedback_ids: [...linkedIds, feedback.id]
      });
      
      // Update feedback status
      await base44.entities.Feedback.update(feedback.id, {
        status: 'in_progress',
        admin_note: `Đã link với feature: ${feature.name}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features-for-link'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      addToast('Đã link feedback với feature', 'success');
      onClose();
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });

  // Create new feature from feedback
  const createFeatureMutation = useMutation({
    mutationFn: async () => {
      if (!newFeatureName.trim()) throw new Error('Nhập tên feature');
      
      const feature = await base44.entities.Feature.create({
        name: newFeatureName.trim(),
        description: `Từ feedback: ${feedback.title}\n\n${feedback.description}`,
        category: newFeatureCategory,
        status: 'planned',
        priority: feedback.priority === 'critical' ? 'critical' : 'high',
        linked_feedback_ids: [feedback.id],
        tags: [feedback.category, 'from-feedback']
      });
      
      await base44.entities.Feedback.update(feedback.id, {
        status: 'in_progress',
        admin_note: `Đã tạo feature: ${feature.name}`
      });
      
      return feature;
    },
    onSuccess: (feature) => {
      queryClient.invalidateQueries({ queryKey: ['features-for-link'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      addToast(`Đã tạo feature: ${feature.name}`, 'success');
      onClose();
    },
    onError: (error) => {
      addToast(error.message, 'error');
    }
  });

  const handleSubmit = () => {
    if (linkMode === 'existing') {
      linkMutation.mutate();
    } else {
      createFeatureMutation.mutate();
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Feedback với Feature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feedback preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
            <p className="font-medium">{feedback.title}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{feedback.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{feedback.category}</Badge>
              <Badge>{feedback.priority}</Badge>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={linkMode === 'existing' ? 'default' : 'outline'}
              onClick={() => setLinkMode('existing')}
              className="flex-1"
            >
              Link với Feature có sẵn
            </Button>
            <Button
              variant={linkMode === 'create' ? 'default' : 'outline'}
              onClick={() => setLinkMode('create')}
              className="flex-1"
            >
              Tạo Feature mới
            </Button>
          </div>

          {/* Link existing */}
          {linkMode === 'existing' ? (
            <div className="space-y-3">
              <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn feature..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {features.map(f => {
                    const alreadyLinked = (f.linked_feedback_ids || []).includes(feedback.id);
                    return (
                      <SelectItem key={f.id} value={f.id} disabled={alreadyLinked}>
                        <div className="flex items-center gap-2">
                          <span>{f.name}</span>
                          {alreadyLinked && <Badge variant="outline" className="text-xs">Đã link</Badge>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedFeatureId && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                  <Icon.Info size={14} className="inline mr-1 text-blue-600" />
                  <span className="text-blue-700">
                    Feature này sẽ được update với feedback ID
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="Tên feature mới..."
              />
              <Select value={newFeatureCategory} onValueChange={setNewFeatureCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-sm">
                <Icon.Lightbulb size={14} className="inline mr-1 text-amber-600" />
                <span className="text-amber-700">
                  Feature mới sẽ tự động có priority: {feedback.priority}, status: planned
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                linkMutation.isPending || 
                createFeatureMutation.isPending ||
                (linkMode === 'existing' && !selectedFeatureId) ||
                (linkMode === 'create' && !newFeatureName.trim())
              }
              className="bg-[#7CB342] hover:bg-[#5a8f31]"
            >
              {linkMutation.isPending || createFeatureMutation.isPending ? (
                <Icon.Spinner className="mr-2" />
              ) : (
                <Icon.Link size={16} className="mr-2" />
              )}
              {linkMode === 'existing' ? 'Link với Feature' : 'Tạo Feature'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}