/**
 * TesterDetailDrawer - Chi tiết tester với quick actions
 */

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  User, Mail, Clock, CheckCircle2, XCircle, TestTube, TrendingUp,
  Calendar, Monitor, Award, Target, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function TesterDetailDrawer({ isOpen, onClose, tester, onViewResults }) {
  if (!tester) return null;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const passRate = tester.total_tests_completed > 0 
    ? Math.round((tester.total_passed / tester.total_tests_completed) * 100) 
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={tester.avatar_url} />
              <AvatarFallback className="bg-violet-200 text-violet-700">
                {getInitials(tester.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{tester.display_name}</p>
              <p className="text-sm font-normal text-gray-500">{tester.user_email}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                Tổng quan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-violet-50 rounded-lg">
                  <div className="flex items-center gap-2 text-violet-600 mb-1">
                    <TestTube className="w-4 h-4" />
                    <span className="text-xs">Tests</span>
                  </div>
                  <p className="text-2xl font-bold text-violet-700">{tester.total_tests_completed || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs">Passed</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{tester.total_passed || 0}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{tester.total_failed || 0}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Bugs</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{tester.total_bugs_found || 0}</p>
                </div>
              </div>

              {/* Pass Rate */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Pass Rate</span>
                  <span className="font-bold text-violet-600">{passRate}%</span>
                </div>
                <Progress value={passRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm">{tester.user_email}</p>
                </div>
              </div>

              {tester.phone && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Điện thoại</p>
                    <p className="text-sm">{tester.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Môi trường ưu tiên</p>
                  <Badge variant="outline">{tester.preferred_environment || 'staging'}</Badge>
                </div>
              </div>

              {tester.default_browser_info && (
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Browser mặc định</p>
                    <p className="text-sm">{tester.default_browser_info}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Hoạt động cuối</p>
                  <p className="text-sm">
                    {tester.last_active 
                      ? formatDistanceToNow(new Date(tester.last_active), { addSuffix: true, locale: vi })
                      : 'Chưa có hoạt động'}
                  </p>
                </div>
              </div>

              {tester.bio && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Bio</p>
                    <p className="text-sm text-gray-700">{tester.bio}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewResults(tester.user_email)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Xem tất cả kết quả test
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => window.location.href = `mailto:${tester.user_email}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Gửi email
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}