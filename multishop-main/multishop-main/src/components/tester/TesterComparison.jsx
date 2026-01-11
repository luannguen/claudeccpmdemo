/**
 * TesterComparison - So sánh performance với team (UI Layer)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, Users } from 'lucide-react';

export default function TesterComparison({ comparisonData }) {
  if (!comparisonData) return null;

  const { myProfile, teamAvg, comparison, rank, total_testers } = comparisonData;

  const ComparisonItem = ({ label, myValue, avgValue, difference, format = (v) => v }) => {
    const isPositive = difference > 0;
    const Icon = isPositive ? TrendingUp : difference < 0 ? TrendingDown : Minus;
    const color = isPositive ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-500';

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg font-bold text-gray-900">{format(myValue)}</span>
            <div className={`flex items-center gap-1 text-xs ${color}`}>
              <Icon className="w-3 h-3" />
              {Math.abs(difference)} vs avg
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          Avg: {format(avgValue)}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            So Sánh Performance
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700">
            <Award className="w-3 h-3 mr-1" />
            Hạng {rank}/{total_testers}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ComparisonItem
          label="Tests hoàn thành"
          myValue={myProfile.total_tests_completed || 0}
          avgValue={teamAvg.total_tests}
          difference={comparison.tests_vs_avg}
        />
        <ComparisonItem
          label="Bugs tìm thấy"
          myValue={myProfile.total_bugs_found || 0}
          avgValue={teamAvg.total_bugs}
          difference={comparison.bugs_vs_avg}
        />
        <ComparisonItem
          label="Pass Rate"
          myValue={myProfile.total_tests_completed > 0 
            ? Math.round((myProfile.total_passed / myProfile.total_tests_completed) * 100) 
            : 0}
          avgValue={teamAvg.pass_rate}
          difference={comparison.pass_rate_vs_avg}
          format={(v) => `${v}%`}
        />
      </CardContent>
    </Card>
  );
}