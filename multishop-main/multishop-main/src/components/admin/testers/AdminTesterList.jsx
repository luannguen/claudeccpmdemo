/**
 * AdminTesterList - Danh sách testers cho Admin
 */

import React, { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  User, Search, Trash2, Mail, Clock, CheckCircle2, XCircle, 
  TestTube, MoreVertical, RefreshCw, Filter, Eye, ExternalLink,
  BarChart2, TrendingUp, Download
} from "lucide-react";
import TesterDetailDrawer from "./TesterDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/NotificationToast";

export default function AdminTesterList({ testers = [], onDelete, isDeleting, onSelectTester }) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedTester, setSelectedTester] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = (tester) => {
    setSelectedTester(tester);
    setDrawerOpen(true);
  };

  const handleViewResults = (email) => {
    setDrawerOpen(false);
    if (onSelectTester) {
      onSelectTester(email);
    }
  };

  const filteredTesters = useMemo(() => {
    if (!search) return testers;
    const s = search.toLowerCase();
    return testers.filter(t => 
      t.display_name?.toLowerCase().includes(s) ||
      t.user_email?.toLowerCase().includes(s)
    );
  }, [testers, search]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await onDelete(deleteConfirm.id);
      addToast(`Đã xóa tester ${deleteConfirm.display_name}`, 'success');
      setDeleteConfirm(null);
    } catch {
      addToast('Không thể xóa tester', 'error');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Summary stats
  const stats = useMemo(() => {
    return {
      total: testers.length,
      activeToday: testers.filter(t => {
        if (!t.last_active) return false;
        const lastActive = new Date(t.last_active);
        const today = new Date();
        return lastActive.toDateString() === today.toDateString();
      }).length,
      totalTests: testers.reduce((sum, t) => sum + (t.total_tests_completed || 0), 0),
      totalBugs: testers.reduce((sum, t) => sum + (t.total_bugs_found || 0), 0)
    };
  }, [testers]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Tổng Testers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
                <p className="text-sm text-gray-500">Active hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
                <p className="text-sm text-gray-500">Tests thực hiện</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBugs}</p>
                <p className="text-sm text-gray-500">Bugs tìm thấy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tester..."
            className="pl-10"
          />
        </div>
        <span className="text-sm text-gray-500">
          {filteredTesters.length} / {testers.length} testers
        </span>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tester</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Passed</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Bugs</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTesters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có tester nào</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTesters.map(tester => (
                <TableRow 
                  key={tester.id}
                  className="cursor-pointer hover:bg-violet-50 transition-colors"
                  onClick={() => handleRowClick(tester)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={tester.avatar_url} />
                        <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                          {getInitials(tester.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{tester.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{tester.user_email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tester.total_tests_completed || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{tester.total_passed || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600 font-medium">{tester.total_failed || 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive" className="text-xs">
                      {tester.total_bugs_found || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tester.last_active ? (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(tester.last_active), { addSuffix: true, locale: vi })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedTester(tester)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${tester.user_email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Gửi email
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteConfirm(tester)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Tester Detail Drawer */}
      <TesterDetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tester={selectedTester}
        onViewResults={handleViewResults}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa profile của "{deleteConfirm?.display_name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}