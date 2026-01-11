/**
 * Auto Regression Test Suite
 * UI Component - Batch regression testing
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/NotificationToast';

export default function AutoRegressionSuite({ features, onRunTests }) {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const { addToast } = useToast();

  const criticalFeatures = features.filter(f => 
    f.priority === 'critical' && f.status === 'completed'
  );

  const toggleFeature = (id) => {
    setSelectedFeatureIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllCritical = () => {
    setSelectedFeatureIds(criticalFeatures.map(f => f.id));
  };

  const runRegressionTests = async () => {
    if (selectedFeatureIds.length === 0) {
      addToast('Vui lòng chọn ít nhất 1 feature', 'warning');
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    // Simulate regression testing
    const totalTests = selectedFeatureIds.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature.test_cases?.length || 0);
    }, 0);

    let completed = 0;
    const testResults = {
      total: totalTests,
      passed: 0,
      failed: 0,
      skipped: 0
    };

    // Simulate testing each feature
    for (const featureId of selectedFeatureIds) {
      const feature = features.find(f => f.id === featureId);
      const testCases = feature.test_cases || [];
      
      for (const tc of testCases) {
        // Simulate test execution (300ms per test)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Count existing test results
        if (tc.status === 'passed') testResults.passed++;
        else if (tc.status === 'failed') testResults.failed++;
        else testResults.skipped++;
        
        completed++;
        setProgress(Math.round((completed / totalTests) * 100));
      }
    }

    setResults(testResults);
    setIsRunning(false);
    addToast(`Hoàn thành: ${testResults.passed}/${testResults.total} tests passed`, 'success');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.RefreshCw size={20} className="text-blue-500" />
          Auto Regression Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={selectAllCritical}
          >
            <Icon.Zap size={16} className="mr-2" />
            Chọn tất cả Critical
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedFeatureIds([])}
          >
            Bỏ chọn tất cả
          </Button>
        </div>

        {/* Feature Selection */}
        <div className="max-h-[300px] overflow-auto space-y-2 border rounded-lg p-3">
          {features.filter(f => f.status === 'completed').map(feature => {
            const testCount = feature.test_cases?.length || 0;
            return (
              <div
                key={feature.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => toggleFeature(feature.id)}
              >
                <Checkbox
                  checked={selectedFeatureIds.includes(feature.id)}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-gray-500">{testCount} test cases</p>
                </div>
                {feature.priority === 'critical' && (
                  <Badge className="bg-red-500 text-white text-xs">Critical</Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Running tests...</span>
              <span className="font-bold text-violet-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{results.passed}</p>
              <p className="text-xs text-gray-500">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{results.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400">{results.skipped}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
          </div>
        )}

        {/* Run Button */}
        <Button
          onClick={runRegressionTests}
          disabled={isRunning || selectedFeatureIds.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <Icon.Spinner className="mr-2" />
              Running Tests... {progress}%
            </>
          ) : (
            <>
              Run Regression Tests ({selectedFeatureIds.length} features)
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Tổng test cases: {selectedFeatureIds.reduce((sum, id) => {
            const f = features.find(f => f.id === id);
            return sum + (f?.test_cases?.length || 0);
          }, 0)}
        </p>
      </CardContent>
    </Card>
  );
}