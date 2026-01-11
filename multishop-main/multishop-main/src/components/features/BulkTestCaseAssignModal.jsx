/**
 * BulkTestCaseAssignModal - Modal gán hàng loạt test case cho tester
 * Cho phép chọn nhiều features và test cases để gán cho 1 tester
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2, Check, Users, Mail, ChevronDown, ChevronRight, Search, Filter, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function BulkTestCaseAssignModal({
  isOpen,
  onClose,
  features = [],
  onBulkAssign,
  isSubmitting
}) {
  const [selectedItems, setSelectedItems] = useState({}); // { featureId: [testCaseId1, testCaseId2] }
  const [testerEmail, setTesterEmail] = useState('');
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [searchFeature, setSearchFeature] = useState('');
  const [errors, setErrors] = useState({});
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all' | 'unassigned' | 'assigned_to_other' | 'assigned_to_me'

  // Fetch tester profiles for quick select
  const { data: testerProfiles = [] } = useQuery({
    queryKey: ['tester-profiles-list'],
    queryFn: async () => {
      return await base44.entities.TesterProfile.list('-last_active', 20);
    },
    enabled: isOpen,
    staleTime: 60000
  });

  // Filter features and test cases based on assignment status
  const filteredFeatures = useMemo(() => {
    let result = features;
    
    // Search filter
    if (searchFeature) {
      result = result.filter(f => 
        f.name?.toLowerCase().includes(searchFeature.toLowerCase()) ||
        f.category?.toLowerCase().includes(searchFeature.toLowerCase())
      );
    }
    
    // Assignment filter - filter test cases within features
    if (assignmentFilter !== 'all' && testerEmail) {
      result = result.map(f => {
        const filteredTcs = (f.test_cases || []).filter(tc => {
          const assignedTo = tc.assigned_tester;
          switch (assignmentFilter) {
            case 'unassigned':
              return !assignedTo;
            case 'assigned_to_other':
              return assignedTo && assignedTo !== testerEmail;
            case 'assigned_to_me':
              return assignedTo === testerEmail;
            default:
              return true;
          }
        });
        return { ...f, test_cases: filteredTcs };
      }).filter(f => (f.test_cases || []).length > 0);
    }
    
    return result;
  }, [features, searchFeature, assignmentFilter, testerEmail]);

  // Count stats for filter badges
  const filterStats = useMemo(() => {
    if (!testerEmail) return { unassigned: 0, assignedToOther: 0, assignedToMe: 0 };
    
    let unassigned = 0, assignedToOther = 0, assignedToMe = 0;
    features.forEach(f => {
      (f.test_cases || []).forEach(tc => {
        const assignedTo = tc.assigned_tester;
        if (!assignedTo) unassigned++;
        else if (assignedTo === testerEmail) assignedToMe++;
        else assignedToOther++;
      });
    });
    return { unassigned, assignedToOther, assignedToMe };
  }, [features, testerEmail]);

  // Calculate total selected
  const totalSelected = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, arr) => sum + arr.length, 0);
  }, [selectedItems]);

  const toggleFeatureExpand = (featureId) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const toggleTestCase = (featureId, tcId) => {
    setSelectedItems(prev => {
      const current = prev[featureId] || [];
      const newSelection = current.includes(tcId)
        ? current.filter(id => id !== tcId)
        : [...current, tcId];
      
      if (newSelection.length === 0) {
        const { [featureId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [featureId]: newSelection };
    });
  };

  const toggleAllTestCases = (featureId, testCases) => {
    const tcIds = testCases.map(tc => tc.id);
    const current = selectedItems[featureId] || [];
    const allSelected = tcIds.every(id => current.includes(id));
    
    if (allSelected) {
      // Deselect all
      const { [featureId]: _, ...rest } = selectedItems;
      setSelectedItems(rest);
    } else {
      // Select all
      setSelectedItems(prev => ({ ...prev, [featureId]: tcIds }));
    }
  };

  const selectTester = (email) => {
    setTesterEmail(email);
    setErrors(prev => ({ ...prev, email: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!testerEmail?.trim()) {
      newErrors.email = 'Vui lòng nhập email tester';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testerEmail)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (totalSelected === 0) {
      newErrors.selection = 'Vui lòng chọn ít nhất 1 test case';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    // Build assignments array
    const assignments = Object.entries(selectedItems).map(([featureId, testCaseIds]) => ({
      featureId,
      testCaseIds,
      testerEmail: testerEmail.trim()
    }));
    
    await onBulkAssign(assignments);
    
    // Reset state
    setSelectedItems({});
    setTesterEmail('');
    setExpandedFeatures({});
  };

  const clearSelection = () => {
    setSelectedItems({});
  };

  // Select all visible test cases
  const selectAllVisible = () => {
    const newSelection = {};
    filteredFeatures.forEach(f => {
      const tcIds = (f.test_cases || []).map(tc => tc.id);
      if (tcIds.length > 0) {
        newSelection[f.id] = tcIds;
      }
    });
    setSelectedItems(newSelection);
  };

  // Check if all visible are selected
  const allVisibleSelected = useMemo(() => {
    const visibleCount = filteredFeatures.reduce((sum, f) => sum + (f.test_cases || []).length, 0);
    if (visibleCount === 0) return false;
    return totalSelected === visibleCount;
  }, [filteredFeatures, totalSelected]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-violet-500 to-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Gán Hàng Loạt Test Cases</h2>
                <p className="text-sm text-violet-100">Chọn nhiều features & test cases</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Tester Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Tester *
              </label>
              <Input
                value={testerEmail}
                onChange={(e) => {
                  setTesterEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="tester@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}

              {/* Quick select testers */}
              {testerProfiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Chọn nhanh:</p>
                  <div className="flex flex-wrap gap-2">
                    {testerProfiles.slice(0, 5).map(profile => (
                      <Badge 
                        key={profile.id}
                        variant={testerEmail === profile.user_email ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          testerEmail === profile.user_email 
                            ? 'bg-violet-600' 
                            : 'hover:bg-violet-50'
                        }`}
                        onClick={() => selectTester(profile.user_email)}
                      >
                        {profile.display_name || profile.user_email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features & Test Cases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 inline mr-1" />
                  Chọn Test Cases ({totalSelected} đã chọn)
                </label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={allVisibleSelected ? clearSelection : selectAllVisible}
                    className="text-violet-600 border-violet-200"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    {allVisibleSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  {totalSelected > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearSelection} className="text-red-500">
                      Xóa
                    </Button>
                  )}
                </div>
              </div>

              {/* Search & Filters */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchFeature}
                    onChange={(e) => setSearchFeature(e.target.value)}
                    placeholder="Tìm kiếm feature..."
                    className="pl-10"
                  />
                </div>
                <Select value={assignmentFilter} onValueChange={setAssignmentFilter} disabled={!testerEmail}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Lọc theo gán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả test cases</SelectItem>
                    <SelectItem value="unassigned">
                      Chưa gán ({filterStats.unassigned})
                    </SelectItem>
                    <SelectItem value="assigned_to_other">
                      Đã gán người khác ({filterStats.assignedToOther})
                    </SelectItem>
                    <SelectItem value="assigned_to_me">
                      Đã gán tester này ({filterStats.assignedToMe})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter hint */}
              {!testerEmail && assignmentFilter !== 'all' && (
                <p className="text-xs text-amber-600 mb-2">⚠️ Nhập email tester để lọc theo trạng thái gán</p>
              )}

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {filteredFeatures.map(feature => {
                    const testCases = feature.test_cases || [];
                    const isExpanded = expandedFeatures[feature.id];
                    const selectedCount = (selectedItems[feature.id] || []).length;
                    const allSelected = testCases.length > 0 && selectedCount === testCases.length;

                    return (
                      <div key={feature.id} className="border rounded-lg overflow-hidden">
                        {/* Feature Header */}
                        <div 
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedCount > 0 ? 'bg-violet-50' : ''
                          }`}
                          onClick={() => toggleFeatureExpand(feature.id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(e) => {
                              e.stopPropagation?.();
                              toggleAllTestCases(feature.id, testCases);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{feature.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{feature.category}</Badge>
                              <span className="text-xs text-gray-500">
                                {testCases.length} test cases
                              </span>
                            </div>
                          </div>
                          
                          {selectedCount > 0 && (
                            <Badge className="bg-violet-600">
                              {selectedCount} đã chọn
                            </Badge>
                          )}
                        </div>

                        {/* Test Cases */}
                        <AnimatePresence>
                          {isExpanded && testCases.length > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden border-t bg-gray-50"
                            >
                              <div className="p-2 space-y-1">
                                {testCases.map((tc, idx) => {
                                  const isSelected = (selectedItems[feature.id] || []).includes(tc.id);
                                  return (
                                    <div
                                      key={tc.id}
                                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                                        isSelected ? 'bg-violet-100' : 'hover:bg-white'
                                      }`}
                                      onClick={() => toggleTestCase(feature.id, tc.id)}
                                    >
                                      <Checkbox checked={isSelected} />
                                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                        {idx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 truncate">{tc.title || 'Untitled'}</p>
                                        {tc.assigned_tester && (
                                          <p className="text-xs text-gray-500">Đã gán: {tc.assigned_tester}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {tc.assigned_tester && tc.assigned_tester === testerEmail && (
                                          <Badge className="text-xs bg-green-100 text-green-700">Đã gán</Badge>
                                        )}
                                        {tc.assigned_tester && tc.assigned_tester !== testerEmail && (
                                          <Badge className="text-xs bg-amber-100 text-amber-700">Gán khác</Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                          {tc.status || 'pending'}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {filteredFeatures.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Không tìm thấy feature nào</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {errors.selection && (
                <p className="text-sm text-red-500 mt-1">{errors.selection}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              {totalSelected > 0 && (
                <>
                  <strong>{totalSelected}</strong> test cases từ{' '}
                  <strong>{Object.keys(selectedItems).length}</strong> features
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Hủy</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || totalSelected === 0}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Gán {totalSelected} Test Cases
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}