import React, { useState } from "react";
import { FileText } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  useAdminPosts,
  useFilteredPosts,
  usePostMutations
} from "@/components/hooks/useAdminPosts";

// Components
import PostsHeader from "@/components/admin/posts/PostsHeader";
import PostsFilters from "@/components/admin/posts/PostsFilters";
import PostCard from "@/components/admin/posts/PostCard";
import PostFormModal from "@/components/admin/posts/PostFormModal";

function AdminPostsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Data hooks
  const { data: posts = [], isLoading } = useAdminPosts();
  const filteredPosts = useFilteredPosts(posts, searchTerm, categoryFilter, statusFilter);

  // Mutations
  const { createMutation, updateMutation, deleteMutation } = usePostMutations(() => {
    setIsModalOpen(false);
    setEditingPost(null);
  });

  // Handlers
  const handleAddNew = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Xóa bài viết này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  return (
    <div>
      <PostsHeader onAddNew={handleAddNew} />

      <PostsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy bài viết</p>
        </div>
      )}

      {isModalOpen && (
        <PostFormModal
          post={editingPost}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

export default function AdminPosts() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPostsContent />
      </AdminLayout>
    </AdminGuard>
  );
}