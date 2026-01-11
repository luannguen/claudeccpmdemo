import React from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/community/PostCard";

export default function CommunityPostsList({ posts, currentUser, onLoginRequired, onEdit, onPostView, onQuickPreview }) {
  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          id={`post-${post.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
          onMouseEnter={() => onPostView?.(post.id)}
        >
          <PostCard 
            post={post} 
            currentUser={currentUser}
            onLoginRequired={onLoginRequired}
            onEdit={onEdit}
            onQuickPreview={onQuickPreview}
            priority={index < 2}
          />
        </motion.div>
      ))}
    </div>
  );
}