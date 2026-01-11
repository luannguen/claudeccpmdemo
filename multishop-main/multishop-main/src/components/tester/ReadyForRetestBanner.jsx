/**
 * ReadyForRetestBanner - Banner nổi bật hiển thị test case cần test lại
 * Hiện khi dev đã sửa lỗi và đánh dấu sẵn sàng test lại
 */

import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, Clock, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function ReadyForRetestBanner({ testCases = [], onNavigate }) {
  if (!testCases.length) return null;

  // Sort by most recent dev response
  const sortedCases = [...testCases].sort((a, b) => {
    const dateA = a.dev_response?.responded_at ? new Date(a.dev_response.responded_at) : new Date(0);
    const dateB = b.dev_response?.responded_at ? new Date(b.dev_response.responded_at) : new Date(0);
    return dateB - dateA;
  });

  const topCase = sortedCases[0];
  const remainingCount = sortedCases.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">Cần Test Lại!</h3>
                <Badge className="bg-white/20 text-white">
                  {testCases.length} test case
                </Badge>
              </div>

              {/* Top case info */}
              <div className="bg-white/10 rounded-lg p-3 mb-3">
                <p className="font-medium truncate">{topCase.title}</p>
                <p className="text-blue-100 text-sm truncate">{topCase.featureName}</p>
                
                {topCase.dev_response && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      <User className="w-4 h-4" />
                      <span>{topCase.dev_response.responded_by || 'Developer'}</span>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>
                        {topCase.dev_response.responded_at 
                          ? formatDistanceToNow(new Date(topCase.dev_response.responded_at), { addSuffix: true, locale: vi })
                          : 'Vừa xong'}
                      </span>
                    </div>
                    <p className="text-sm text-white mt-1 line-clamp-2">
                      💬 {topCase.dev_response.message}
                    </p>
                    {topCase.dev_response.fixed_in_version && (
                      <Badge className="mt-2 bg-green-500/30 text-white">
                        ✅ Đã sửa trong v{topCase.dev_response.fixed_in_version}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onNavigate(topCase.featureId, topCase.id)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Test Ngay
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                
                {remainingCount > 0 && (
                  <span className="text-blue-100 text-sm">
                    + {remainingCount} test case khác cần test lại
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}