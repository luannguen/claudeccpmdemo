/**
 * TesterPerformanceCard - Card hiển thị performance tester (clickable để filter)
 */

import React from "react";
import { motion } from "framer-motion";
import { User, Award, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function TesterPerformanceCard({ tester, rank, onClick, isSelected }) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const passRate = tester.total_tests_completed > 0
    ? Math.round((tester.total_passed / tester.total_tests_completed) * 100)
    : 0;

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return { icon: '🥇', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 2: return { icon: '🥈', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 3: return { icon: '🥉', color: 'bg-orange-100 text-orange-700 border-orange-300' };
      default: return { icon: `#${rank}`, color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const rankBadge = getRankBadge(rank);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'ring-2 ring-violet-500 bg-violet-50' : 'hover:border-violet-300'
        }`}
        onClick={() => onClick(tester.user_email)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar & Rank */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={tester.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-600 text-white">
                  {getInitials(tester.display_name)}
                </AvatarFallback>
              </Avatar>
              <Badge 
                className={`absolute -bottom-1 -right-1 text-xs px-1.5 py-0 border ${rankBadge.color}`}
              >
                {rankBadge.icon}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {tester.display_name}
              </h4>
              <p className="text-xs text-gray-500 truncate">{tester.user_email}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{tester.total_tests_completed || 0}</p>
                  <p className="text-xs text-gray-500">Tests</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-green-600">{tester.total_passed || 0}</p>
                  <p className="text-xs text-gray-500">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-orange-600">{tester.total_bugs_found || 0}</p>
                  <p className="text-xs text-gray-500">Bugs</p>
                </div>
              </div>

              {/* Pass Rate */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Pass Rate</span>
                  <span className="font-medium text-violet-600">{passRate}%</span>
                </div>
                <Progress value={passRate} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* Click hint */}
          {!isSelected && (
            <p className="text-xs text-violet-600 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Click để xem test results →
            </p>
          )}
          {isSelected && (
            <Badge className="w-full justify-center mt-2 bg-violet-600">
              Đang xem kết quả ✓
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}