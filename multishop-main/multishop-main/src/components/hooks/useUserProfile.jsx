import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// ========== CURRENT USER ==========

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['current-user-userprofile'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });
}

// ========== USER PROFILE DATA ==========

export function useUserProfileData(userEmail) {
  return useQuery({
    queryKey: ['user-profile', userEmail],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      let userProfile = profiles[0];

      // Auto-create profile if doesn't exist
      if (!userProfile && userEmail) {
        const me = await base44.auth.me();
        const user = me && me.email === userEmail ? me : null;

        if (user) {
          userProfile = await base44.entities.UserProfile.create({
            user_email: userEmail,
            display_name: user.full_name || 'Người dùng',
            avatar_url: '',
            bio: 'Thành viên cộng đồng Zero Farm 🌱',
            location: 'Việt Nam',
            interests: ['organic', 'healthy-food'],
            followers_count: 0,
            following_count: 0,
            posts_count: 0,
            reputation_score: 0,
            badges: [],
            joined_date: user.created_date || new Date().toISOString(),
            last_active: new Date().toISOString(),
            is_verified: false,
            status: 'active'
          });
        }
      }

      return userProfile;
    },
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000
  });
}

// ========== USER POSTS ==========

export function useUserPosts(userEmail) {
  return useQuery({
    queryKey: ['user-posts-profile', userEmail],
    queryFn: async () => {
      const allPosts = await base44.entities.UserPost.list('-created_date', 100);
      return allPosts.filter((p) => p.created_by === userEmail && (p.data?.status === 'active' || p.status === 'active'));
    },
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000
  });
}

// ========== SAVED POSTS ==========

export function useSavedPosts(currentUser, activeTab) {
  const { data: savedPosts = [] } = useQuery({
    queryKey: ['saved-posts-userprofile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return [];
      const saved = await base44.entities.SavedPost.list('-created_date', 100);
      return saved.filter((s) => s.user_email === currentUser.email);
    },
    enabled: !!currentUser && activeTab === 'saved',
    staleTime: 2 * 60 * 1000
  });

  const { data: savedPostsData = [] } = useQuery({
    queryKey: ['saved-posts-data', savedPosts],
    queryFn: async () => {
      if (savedPosts.length === 0) return [];
      const postIds = savedPosts.map((s) => s.post_id);
      const allPosts = await base44.entities.UserPost.list('-created_date', 100);
      return allPosts.filter((p) => postIds.includes(p.id));
    },
    enabled: savedPosts.length > 0 && activeTab === 'saved'
  });

  return { savedPosts, savedPostsData };
}

// ========== FOLLOW STATUS ==========

export function useFollowStatus(currentUser, userEmail) {
  return useQuery({
    queryKey: ['is-following', currentUser?.email, userEmail],
    queryFn: async () => {
      if (!currentUser || currentUser.email === userEmail) return false;
      const follows = await base44.entities.Follow.list('-created_date', 100);
      return follows.some((f) => f.follower_email === currentUser.email && f.following_email === userEmail);
    },
    enabled: !!currentUser && !!userEmail && currentUser?.email !== userEmail,
    staleTime: 2 * 60 * 1000
  });
}

// ========== FOLLOW MUTATION ==========

export function useFollowMutation(currentUser, userEmail, profile, isFollowing, refetchFollow) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        // Unfollow
        const follows = await base44.entities.Follow.list('-created_date', 100);
        const followRecord = follows.find((f) =>
          f.follower_email === currentUser.email && f.following_email === userEmail
        );
        if (followRecord) {
          await base44.entities.Follow.delete(followRecord.id);
          if (profile) {
            await base44.entities.UserProfile.update(profile.id, {
              followers_count: Math.max(0, (profile.followers_count || 0) - 1)
            });
          }
        }
      } else {
        // Follow
        await base44.entities.Follow.create({
          follower_email: currentUser.email,
          following_email: userEmail,
          notification_enabled: true
        });

        if (profile) {
          await base44.entities.UserProfile.update(profile.id, {
            followers_count: (profile.followers_count || 0) + 1
          });
        }

        // Create notification
        await base44.entities.Notification.create({
          recipient_email: userEmail,
          type: 'follow',
          actor_email: currentUser.email,
          actor_name: currentUser.full_name || 'Người dùng',
          message: 'đã theo dõi bạn',
          link: `/user-profile?user=${currentUser.email}`
        });
      }
    },
    onSuccess: () => {
      refetchFollow();
      queryClient.invalidateQueries(['user-profile', userEmail]);
    }
  });
}

// ========== PROFILE STATS ==========

export function useProfileStats(posts, profile) {
  return useMemo(() => ({
    posts: posts?.length || 0,
    followers: profile?.followers_count || 0,
    following: profile?.following_count || 0,
    reputation: profile?.reputation_score || 0
  }), [posts, profile]);
}

// ========== UI STATE ==========

export function useProfileUIState() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return {
    activeTab, setActiveTab,
    isEditModalOpen, setIsEditModalOpen
  };
}

// ========== MAIN HOOK ==========

export function useUserProfilePage(userEmail) {
  // Data
  const { data: currentUser } = useCurrentUserProfile();
  const { data: profile, isLoading: profileLoading } = useUserProfileData(userEmail);
  const { data: posts = [] } = useUserPosts(userEmail);
  
  // UI State
  const uiState = useProfileUIState();
  
  // Saved Posts
  const { savedPostsData } = useSavedPosts(currentUser, uiState.activeTab);
  
  // Follow
  const { data: isFollowing, refetch: refetchFollow } = useFollowStatus(currentUser, userEmail);
  const followMutation = useFollowMutation(currentUser, userEmail, profile, isFollowing, refetchFollow);
  
  // Stats
  const stats = useProfileStats(posts, profile);
  
  // Computed
  const isOwnProfile = currentUser?.email === userEmail;

  return {
    // Data
    currentUser,
    profile,
    posts,
    savedPostsData,
    isFollowing,
    stats,
    profileLoading,
    
    // UI State
    ...uiState,
    
    // Computed
    isOwnProfile,
    
    // Actions
    followMutation
  };
}