import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/NotificationToast';

export default function FeedbackAITriage() {
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: pendingFeedback = [] } = useQuery({
    queryKey: ['pending-feedback-triage'],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-created_date', 100);
      return feedback.filter(f => f.status === 'new' && !f.ai_categorized);
    },
    staleTime: 30 * 1000
  });

  const analyzeFeedback = async (feedback) => {
    try {
      setAnalyzing(true);
      
      // Call AI to analyze
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this feedback and categorize it:
Title: ${feedback.title}
Description: ${feedback.description}

Return JSON with:
- category: bug|feature_request|improvement|ui_ux|performance|other
- priority: low|medium|high|critical
- sentiment: positive|neutral|negative
- suggestedAction: string (what to do)
- isDuplicate: boolean
- relatedFeedbackIds: array (if duplicate detected)`,
        response_json_schema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            priority: { type: 'string' },
            sentiment: { type: 'string' },
            suggestedAction: { type: 'string' },
            isDuplicate: { type: 'boolean' },
            relatedFeedbackIds: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      // Update feedback with AI analysis
      await base44.entities.Feedback.update(feedback.id, {
        category: analysis.category,
        priority: analysis.priority,
        ai_sentiment: analysis.sentiment,
        ai_suggested_action: analysis.suggestedAction,
        ai_categorized: true,
        status: analysis.isDuplicate ? 'duplicate' : 'reviewing'
      });

      queryClient.invalidateQueries({ queryKey: ['pending-feedback-triage'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-list'] });
      
      addToast(`AI đã phân tích feedback: ${analysis.suggestedAction}`, 'success');
    } catch (error) {
      addToast('Lỗi khi phân tích AI', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeAll = async () => {
    setAnalyzing(true);
    for (const feedback of pendingFeedback) {
      await analyzeFeedback(feedback);
    }
    setAnalyzing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon.Sparkles size={24} className="text-purple-500" />
            AI Feedback Triage
          </CardTitle>
          <Badge variant="outline">{pendingFeedback.length} chờ phân tích</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pendingFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon.CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <p>Tất cả feedback đã được phân tích</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Button
                onClick={analyzeAll}
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Icon.Spinner className="mr-2" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    <Icon.Sparkles className="mr-2" />
                    Phân tích tất cả ({pendingFeedback.length})
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {pendingFeedback.slice(0, 5).map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feedback.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {feedback.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => analyzeFeedback(feedback)}
                      disabled={analyzing}
                    >
                      <Icon.Sparkles size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}