/**
 * TesterLeaderboard - Bảng xếp hạng testers (UI Layer)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';

export default function TesterLeaderboard({ leaderboard, currentEmail }) {
  if (!leaderboard || leaderboard.length === 0) return null;

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Icon.Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.Trophy className="w-5 h-5 text-amber-500" />
          Bảng Xếp Hạng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((tester, i) => {
            const rank = i + 1;
            const isMe = tester.user_email === currentEmail;
            const passRate = tester.total_tests_completed > 0
              ? Math.round((tester.total_passed / tester.total_tests_completed) * 100)
              : 0;

            return (
              <div 
                key={tester.user_email}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isMe ? 'bg-violet-50 border border-violet-200' : 'bg-gray-50'
                }`}
              >
                <div className="w-8 text-center font-bold text-gray-600">
                  {getMedalIcon(rank) || `#${rank}`}
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {tester.display_name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {tester.display_name}
                    {isMe && <span className="text-violet-600 ml-2">(Bạn)</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {tester.total_tests_completed} tests
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-green-600">
                      {passRate}% pass
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-red-600">
                      {tester.total_bugs_found} bugs
                    </span>
                  </div>
                </div>
                
                {isMe && (
                  <Badge className="bg-violet-600 text-white">You</Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}