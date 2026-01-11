import React from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Hook
import { useUserProfilePage } from "@/components/hooks/useUserProfile";

// Components
import ProfileCover from "@/components/profile/ProfileCover";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileBadges from "@/components/profile/ProfileBadges";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfilePostsList from "@/components/profile/ProfilePostsList";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileLoadingState from "@/components/profile/ProfileLoadingState";
import ProfileEditModal from "@/components/ProfileEditModal";

/**
 * UserProfile - Trang profile người dùng
 */
export default function UserProfile() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('user');

  const {
    currentUser,
    profile,
    posts,
    savedPostsData,
    isFollowing,
    stats,
    profileLoading,
    activeTab, setActiveTab,
    isEditModalOpen, setIsEditModalOpen,
    isOwnProfile,
    followMutation
  } = useUserProfilePage(userEmail);

  // Loading
  if (profileLoading) {
    return <ProfileLoadingState />;
  }

  // Not found
  if (!profile && !profileLoading) {
    return (
      <ProfileNotFound
        isOwnProfile={isOwnProfile}
        currentUser={currentUser}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
      />
    );
  }

  return (
    <div className="pt-20 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      {/* Cover Photo */}
      <ProfileCover coverPhotoUrl={profile?.cover_photo_url} />

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-20">
        <div className="bg-white my-20 px-8 py-8 opacity-100 rounded-3xl shadow-2xl border-2 border-gray-100 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
            {/* Avatar */}
            <ProfileAvatar
              profile={profile}
              isOwnProfile={isOwnProfile}
              onEdit={() => setIsEditModalOpen(true)}
            />

            {/* Name & Bio */}
            <ProfileInfo profile={profile} />

            {/* Actions */}
            <ProfileActions
              isOwnProfile={isOwnProfile}
              currentUser={currentUser}
              isFollowing={isFollowing}
              followMutation={followMutation}
              onEdit={() => setIsEditModalOpen(true)}
            />
          </div>

          {/* Stats */}
          <ProfileStats stats={stats} />

          {/* Badges */}
          <ProfileBadges badges={profile?.badges} />

          {/* Interests - inline vì ProfileInfo đã có */}
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            postsCount={stats.posts}
            savedPostsCount={savedPostsData.length}
            isOwnProfile={isOwnProfile}
          />

          {/* Posts Grid */}
          <div className="space-y-4">
            <ProfilePostsList
              activeTab={activeTab}
              posts={posts}
              savedPostsData={savedPostsData}
              currentUser={currentUser}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <ProfileEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={profile}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}