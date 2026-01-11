import React from "react";
import SkeletonPostCard from "@/components/community/SkeletonPostCard";

export default function CommunityLoadingState() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonPostCard key={i} />
      ))}
    </div>
  );
}