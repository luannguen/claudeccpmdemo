/**
 * AdminTesters - Trang quản lý Testers và kết quả test
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, ArrowLeft, TestTube
} from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Components
import AdminTesterList from "@/components/admin/testers/AdminTesterList";
import AdminTestResultsOverview from "@/components/admin/testers/AdminTestResultsOverview";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import { useAdminTesters } from "@/components/hooks/useAdminTesters";

function AdminTestersContent() {
  const { testers, testResults, isLoading, isDeleting, deleteTester } = useAdminTesters();
  const [activeTab, setActiveTab] = useState('testers');
  const [selectedTesterEmail, setSelectedTesterEmail] = useState(null);

  // Handle selecting tester from list to view results
  const handleSelectTesterForResults = (email) => {
    setSelectedTesterEmail(email);
    setActiveTab('results');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon.Spinner className="w-8 h-8 text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("Features")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Quản Lý Testers</h1>
                  <p className="text-sm text-gray-500">Theo dõi testers và kết quả test</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to={createPageUrl("TesterPortal")}>
                <Button variant="outline" size="sm">
                  <TestTube className="w-4 h-4 mr-2" /> Trang Tester
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="testers" className="gap-2">
              <Users className="w-4 h-4" />
              Testers ({testers.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <TestTube className="w-4 h-4" />
              Kết Quả Test ({testResults?.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="testers" className="mt-0">
            <AdminTesterList 
              testers={testers}
              onDelete={deleteTester}
              isDeleting={isDeleting}
              onSelectTester={handleSelectTesterForResults}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <AdminTestResultsOverview 
              testResults={testResults} 
              initialTesterFilter={selectedTesterEmail}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminTestersPage() {
  return (
    <AdminGuard>
      <AdminTestersContent />
    </AdminGuard>
  );
}