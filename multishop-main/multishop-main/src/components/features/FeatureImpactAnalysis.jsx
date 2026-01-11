/**
 * Feature Impact Analysis
 * UI Component - Analyze impact of feature changes
 */

import React, { useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FeatureImpactAnalysis({ feature, allFeatures }) {
  const analysis = useMemo(() => {
    if (!feature) return null;

    // Find dependencies
    const dependencies = (feature.depends_on || []).map(depId =>
      allFeatures.find(f => f.id === depId)
    ).filter(Boolean);

    // Find dependents
    const dependents = allFeatures.filter(f =>
      f.depends_on?.includes(feature.id)
    );

    // Find related features (same pages/components)
    const relatedFeatures = allFeatures.filter(f => {
      if (f.id === feature.id) return false;
      
      const sharedPages = feature.related_pages?.some(page =>
        f.related_pages?.includes(page)
      );
      
      const sharedComponents = feature.related_components?.some(comp =>
        f.related_components?.includes(comp)
      );
      
      return sharedPages || sharedComponents;
    });

    // Calculate risk score
    let riskScore = 0;
    if (dependents.length > 5) riskScore += 30;
    else if (dependents.length > 2) riskScore += 20;
    else if (dependents.length > 0) riskScore += 10;
    
    if (dependencies.some(d => d.status !== 'completed')) riskScore += 20;
    if (feature.priority === 'critical') riskScore += 20;
    if (relatedFeatures.length > 5) riskScore += 15;
    
    const failedTests = (feature.test_cases || []).filter(tc => tc.status === 'failed').length;
    if (failedTests > 0) riskScore += failedTests * 5;

    return {
      dependencies,
      dependents,
      relatedFeatures,
      riskScore,
      riskLevel: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low'
    };
  }, [feature, allFeatures]);

  if (!analysis) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Target size={20} className="text-orange-500" />
            Impact Analysis
          </div>
          <Badge className={
            analysis.riskLevel === 'high' ? 'bg-red-500' :
            analysis.riskLevel === 'medium' ? 'bg-orange-500' :
            'bg-green-500'
          }>
            {analysis.riskLevel === 'high' ? 'Nguy cơ cao' :
             analysis.riskLevel === 'medium' ? 'Nguy cơ trung bình' :
             'Nguy cơ thấp'} ({analysis.riskScore}/100)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Alert */}
        {analysis.riskLevel === 'high' && (
          <Alert className="border-red-200 bg-red-50">
            <Icon.AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">
              Feature này có nguy cơ breaking change cao. Cần test kỹ lưỡng và thông báo team trước khi deploy.
            </AlertDescription>
          </Alert>
        )}

        {/* Dependencies */}
        {analysis.dependencies.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon.ArrowUp size={14} className="text-red-500" />
              Phụ thuộc vào ({analysis.dependencies.length})
            </p>
            <div className="space-y-1 pl-4 border-l-2 border-red-200">
              {analysis.dependencies.map(dep => (
                <div key={dep.id} className="flex items-center gap-2 text-sm">
                  <Icon.CheckCircle 
                    size={14} 
                    className={dep.status === 'completed' ? 'text-green-500' : 'text-yellow-500'} 
                  />
                  <span className="text-gray-700">{dep.name}</span>
                  <Badge variant="outline" className="text-xs">{dep.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents */}
        {analysis.dependents.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon.ArrowDown size={14} className="text-blue-500" />
              Ảnh hưởng đến ({analysis.dependents.length})
            </p>
            <div className="space-y-1 pl-4 border-l-2 border-blue-200">
              {analysis.dependents.map(dep => (
                <div key={dep.id} className="flex items-center gap-2 text-sm">
                  <Icon.AlertCircle size={14} className="text-orange-500" />
                  <span className="text-gray-700">{dep.name}</span>
                  <Badge variant="outline" className="text-xs">{dep.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Features */}
        {analysis.relatedFeatures.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Icon.Link size={14} className="text-purple-500" />
              Features liên quan ({analysis.relatedFeatures.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.relatedFeatures.slice(0, 5).map(f => (
                <Badge key={f.id} variant="outline" className="text-xs">
                  {f.name}
                </Badge>
              ))}
              {analysis.relatedFeatures.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{analysis.relatedFeatures.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 mb-2">💡 Khuyến nghị:</p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            {analysis.riskLevel === 'high' && (
              <>
                <li>Chạy full regression test suite</li>
                <li>Thông báo team trước khi deploy</li>
                <li>Prepare rollback plan</li>
              </>
            )}
            {analysis.dependencies.some(d => d.status !== 'completed') && (
              <li>Đợi các dependency features hoàn thành trước</li>
            )}
            {analysis.dependents.length > 0 && (
              <li>Test tất cả {analysis.dependents.length} dependent features</li>
            )}
            {analysis.relatedFeatures.length > 3 && (
              <li>Kiểm tra integration với {analysis.relatedFeatures.length} related features</li>
            )}
            {(feature.test_cases?.filter(tc => tc.status === 'failed').length || 0) > 0 && (
              <li className="text-red-600 font-medium">Fix failed tests trước khi deploy</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}