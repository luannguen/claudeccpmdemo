/**
 * Release Notes Generator
 * UI Component - Generate release notes from features
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/NotificationToast';
import ReactMarkdown from 'react-markdown';

export default function ReleaseNotesGenerator({ isOpen, onClose, features }) {
  const [version, setVersion] = useState('');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const { addToast } = useToast();

  const selectedFeatures = useMemo(() => 
    features.filter(f => selectedFeatureIds.includes(f.id)),
    [features, selectedFeatureIds]
  );

  const markdownNotes = useMemo(() => {
    if (!version || selectedFeatures.length === 0) return '';

    const groupedByCategory = selectedFeatures.reduce((acc, f) => {
      const cat = f.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(f);
      return acc;
    }, {});

    let markdown = `# Release Notes v${version}\n\n`;
    markdown += `📅 **Release Date:** ${new Date().toLocaleDateString('vi-VN')}\n\n`;
    markdown += `---\n\n`;

    Object.entries(groupedByCategory).forEach(([category, features]) => {
      const categoryLabels = {
        core: '⚙️ Core System',
        admin: '🔧 Admin',
        client: '👥 Client Features',
        payment: '💳 Payment',
        referral: '🎁 Referral',
        product: '📦 Products',
        order: '🛒 Orders',
        other: '📌 Other'
      };

      markdown += `## ${categoryLabels[category] || category}\n\n`;
      
      features.forEach(f => {
        const emoji = f.priority === 'critical' ? '🔴' : 
                      f.priority === 'high' ? '🟠' : 
                      f.priority === 'medium' ? '🟡' : '⚪';
        markdown += `### ${emoji} ${f.name}\n\n`;
        
        if (f.description) {
          markdown += `${f.description}\n\n`;
        }

        if (f.acceptance_criteria?.length) {
          markdown += `**Changes:**\n`;
          f.acceptance_criteria.forEach(ac => {
            markdown += `- ✅ ${ac}\n`;
          });
          markdown += `\n`;
        }

        const testStats = (f.test_cases || []).reduce((acc, tc) => {
          acc[tc.status] = (acc[tc.status] || 0) + 1;
          return acc;
        }, {});

        if (f.test_cases?.length) {
          markdown += `**Testing:** ${testStats.passed || 0} passed, ${testStats.failed || 0} failed, ${testStats.pending || 0} pending\n\n`;
        }
      });
      
      markdown += `---\n\n`;
    });

    markdown += `## 📊 Summary\n\n`;
    markdown += `- **Total Features:** ${selectedFeatures.length}\n`;
    markdown += `- **Critical:** ${selectedFeatures.filter(f => f.priority === 'critical').length}\n`;
    markdown += `- **High Priority:** ${selectedFeatures.filter(f => f.priority === 'high').length}\n`;
    
    const allTestCases = selectedFeatures.flatMap(f => f.test_cases || []);
    const passedTests = allTestCases.filter(tc => tc.status === 'passed').length;
    markdown += `- **Test Coverage:** ${allTestCases.length > 0 ? Math.round((passedTests / allTestCases.length) * 100) : 0}%\n\n`;

    return markdown;
  }, [version, selectedFeatures]);

  const toggleFeature = (id) => {
    setSelectedFeatureIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownNotes);
    addToast('Đã copy release notes', 'success');
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdownNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release-notes-v${version}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Đã tải xuống release notes', 'success');
  };

  const completedFeatures = useMemo(() => 
    features.filter(f => f.status === 'completed'),
    [features]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.FileText size={24} className="text-violet-600" />
            Release Notes Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Left: Feature Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Version Number</label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.2.0"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-3">
                Chọn Features ({selectedFeatureIds.length} / {completedFeatures.length})
              </p>
              <div className="space-y-2 max-h-[50vh] overflow-auto">
                {completedFeatures.map(feature => (
                  <div
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedFeatureIds.includes(feature.id)
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon.CheckCircle 
                        size={18} 
                        className={selectedFeatureIds.includes(feature.id) ? 'text-violet-600' : 'text-gray-400'} 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-gray-500">{feature.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preview</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Icon.Copy size={16} className="mr-1" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  onClick={downloadMarkdown}
                  disabled={!version || selectedFeatureIds.length === 0}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Icon.Download size={16} className="mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="max-h-[60vh] overflow-auto">
                <div className="prose prose-sm max-w-none p-4 bg-white rounded-lg border">
                  <ReactMarkdown>{markdownNotes}</ReactMarkdown>
                </div>
              </TabsContent>
              
              <TabsContent value="markdown" className="max-h-[60vh] overflow-auto">
                <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
                  {markdownNotes}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}