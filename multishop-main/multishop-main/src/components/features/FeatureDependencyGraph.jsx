/**
 * Feature Dependency Graph
 * UI Component - Visualize feature dependencies
 */

import React, { useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FeatureDependencyGraph({ features, selectedFeatureId }) {
  const selectedFeature = useMemo(() => 
    features.find(f => f.id === selectedFeatureId),
    [features, selectedFeatureId]
  );

  const dependencies = useMemo(() => {
    if (!selectedFeature?.depends_on) return [];
    return selectedFeature.depends_on.map(depId => 
      features.find(f => f.id === depId)
    ).filter(Boolean);
  }, [selectedFeature, features]);

  const dependents = useMemo(() => {
    if (!selectedFeature) return [];
    return features.filter(f => 
      f.depends_on?.includes(selectedFeature.id)
    );
  }, [selectedFeature, features]);

  const breakingRisk = useMemo(() => {
    if (!selectedFeature) return 'none';
    if (dependents.length > 5) return 'high';
    if (dependents.length > 2) return 'medium';
    if (dependents.length > 0) return 'low';
    return 'none';
  }, [dependents]);

  if (!selectedFeature) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Icon.Layers size={48} className="mx-auto mb-3 opacity-30" />
          <p>Chọn một feature để xem dependency graph</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.Layers size={20} className="text-violet-600" />
          Dependency Graph
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Feature */}
        <div className="text-center">
          <div className="inline-block p-4 bg-violet-100 border-2 border-violet-300 rounded-2xl">
            <p className="font-bold text-violet-900">{selectedFeature.name}</p>
            <Badge className="mt-2">{selectedFeature.category}</Badge>
          </div>
        </div>

        {/* Dependencies (Required) */}
        {dependencies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon.ArrowUp size={16} className="text-red-500" />
              <h4 className="font-medium text-gray-700">
                Phụ thuộc vào ({dependencies.length})
              </h4>
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-red-200">
              {dependencies.map(dep => (
                <div key={dep.id} className="flex items-center gap-2">
                  <Icon.CheckCircle 
                    size={16} 
                    className={dep.status === 'completed' ? 'text-green-500' : 'text-yellow-500'} 
                  />
                  <span className="text-sm">{dep.name}</span>
                  <Badge variant="outline" className="text-xs">{dep.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents (Impact) */}
        {dependents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon.ArrowDown size={16} className="text-blue-500" />
              <h4 className="font-medium text-gray-700">
                Ảnh hưởng đến ({dependents.length})
              </h4>
              <Badge 
                className={
                  breakingRisk === 'high' ? 'bg-red-500' :
                  breakingRisk === 'medium' ? 'bg-orange-500' :
                  breakingRisk === 'low' ? 'bg-yellow-500' : 'bg-gray-400'
                }
              >
                {breakingRisk === 'high' ? 'Nguy cơ cao' :
                 breakingRisk === 'medium' ? 'Nguy cơ trung bình' :
                 breakingRisk === 'low' ? 'Nguy cơ thấp' : 'Không ảnh hưởng'}
              </Badge>
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
              {dependents.map(dep => (
                <div key={dep.id} className="flex items-center gap-2">
                  <Icon.AlertCircle size={16} className="text-orange-500" />
                  <span className="text-sm">{dep.name}</span>
                  <Badge variant="outline" className="text-xs">{dep.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Warning */}
        {breakingRisk !== 'none' && (
          <div className={`p-4 rounded-lg ${
            breakingRisk === 'high' ? 'bg-red-50 border border-red-200' :
            breakingRisk === 'medium' ? 'bg-orange-50 border border-orange-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon.AlertTriangle size={18} className={
                breakingRisk === 'high' ? 'text-red-600' :
                breakingRisk === 'medium' ? 'text-orange-600' :
                'text-yellow-600'
              } />
              <p className="font-medium text-sm">Cảnh báo Breaking Change</p>
            </div>
            <p className="text-sm text-gray-700">
              {breakingRisk === 'high' 
                ? 'Feature này có nhiều dependent features. Cần test kỹ trước khi deploy.'
                : breakingRisk === 'medium'
                ? 'Feature này có một số dependent features. Nên chạy regression test.'
                : 'Feature này có ít dependent features. Kiểm tra nhẹ là đủ.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1"
          >
            <Icon.TestTube size={16} className="mr-2" />
            Run Regression Tests
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1"
          >
            <Icon.Download size={16} className="mr-2" />
            Export Graph
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}