import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProfileEditModal from "@/components/ProfileEditModal";

// Hooks
import {
  useCurrentUserProfile,
  useUserProfileData,
  useUserPosts,
  useSavedPosts,
  useFollowStatus,
  useFollowMutation,
  useProfileStats
} from "@/components/hooks/useUserProfile";

// Components
import ProfileCover from "@/components/profile/ProfileCover";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileBadges from "@/components/profile/ProfileBadges";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfilePostsList from "@/components/profile/ProfilePostsList";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileLoadingState from "@/components/profile/ProfileLoadingState";

export default function UserProfile() {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get('user');
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Data hooks
  const { data: currentUser } = useCurrentUserProfile();
  const { data: profile, isLoading: profileLoading } = useUserProfileData(userEmail);
  const { data: posts = [] } = useUserPosts(userEmail);
  const { savedPosts, savedPostsData } = useSavedPosts(currentUser, activeTab);
  const { data: isFollowing, refetch: refetchFollow } = useFollowStatus(currentUser, userEmail);
  const followMutation = useFollowMutation(currentUser, userEmail, profile, isFollowing, refetchFollow);
  const stats = useProfileStats(posts, profile);

  const isOwnProfile = currentUser?.email === userEmail;

  // Loading state
  if (profileLoading) {
    return <ProfileLoadingState />;
  }

  // Not found state
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
      <ProfileCover coverPhotoUrl={profile?.cover_photo_url} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="mx-auto my-24 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              <ProfileAvatar
                profile={profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => setIsEditModalOpen(true)}
              />

              <ProfileInfo profile={profile} />

              <ProfileActions
                isOwnProfile={isOwnProfile}
                currentUser={currentUser}
                isFollowing={isFollowing}
                followMutation={followMutation}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            <ProfileStats stats={stats} />
            <ProfileBadges badges={profile?.badges} />
          </div>
        </div>

        <div className="mt-8">
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            postsCount={stats.posts}
            savedPostsCount={savedPosts.length}
            isOwnProfile={isOwnProfile}
          />

          <div className="space-y-6">
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