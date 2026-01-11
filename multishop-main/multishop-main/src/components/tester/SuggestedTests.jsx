/**
 * SuggestedTests - Gợi ý test cases cần ưu tiên (UI Layer)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Icon, AnimatedIcon } from '@/components/ui/AnimatedIcon.jsx';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SuggestedTests({ suggestions, onNavigate }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AnimatedIcon name="Lightbulb" animation="glowPulse" className="w-5 h-5 text-amber-500" />
          Gợi Ý Test ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {suggestions.map((sug, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                onClick={() => onNavigate(sug.featureId, sug.testCase.id)}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{sug.testCase.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{sug.featureName}</p>
                  <Badge variant="outline" className="mt-1 text-xs bg-white">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {sug.reason}
                  </Badge>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}