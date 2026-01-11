/**
 * useSocialProof - ECARD-F17: Micro Social Proof
 * Hook để lấy và hiển thị social proof stats
 */

import { useQuery } from "@tanstack/react-query";
import { socialProofRepository } from "../data/socialProofRepository";

/**
 * Hook để lấy social proof stats cho E-Card
 * @param {Object} profile - EcardProfile object
 */
export function useSocialProof(profile) {
  const profileId = profile?.id;
  const userEmail = profile?.created_by;

  // Lấy stats từ cache trong profile (không cần API call)
  const cachedStats = socialProofRepository.getStatsFromCache(profile);

  // Fetch stats chi tiết (orders, gifts)
  const { data: liveStats, isLoading } = useQuery({
    queryKey: ['social-proof', profileId],
    queryFn: () => socialProofRepository.getStats(profileId, userEmail),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnWindowFocus: false
  });

  // Combine stats
  const stats = {
    // Từ live query
    totalOrders: liveStats?.totalOrders || 0,
    totalGifts: liveStats?.totalGifts || 0,
    hasReferral: liveStats?.hasReferral || false,
    
    // Từ profile cache
    connectionCount: cachedStats.connectionCount,
    giftsReceived: cachedStats.giftsReceived,
    giftsSent: cachedStats.giftsSent
  };

  // Tính toán badges cần hiển thị
  const badges = [];

  // Badge 1: Số người quen đã mua (nếu > 0)
  if (stats.totalOrders > 0) {
    badges.push({
      type: 'orders',
      icon: '🔥',
      text: `${stats.totalOrders} người đã mua tại đây`,
      priority: 1
    });
  }

  // Badge 2: Số quà đã gửi (nếu > 0)
  const totalGifts = stats.totalGifts + stats.giftsSent;
  if (totalGifts > 0) {
    badges.push({
      type: 'gifts',
      icon: '🎁',
      text: `Đã có ${totalGifts} quà được gửi`,
      priority: 2
    });
  }

  // Badge 3: Số kết nối/mối quan hệ (nếu > 3)
  if (stats.connectionCount > 3) {
    badges.push({
      type: 'connections',
      icon: '👥',
      text: `${stats.connectionCount} người trong mạng lưới`,
      priority: 3
    });
  }

  // Badge 4: Được giới thiệu qua mối quan hệ (nếu có referral)
  if (stats.hasReferral) {
    badges.push({
      type: 'referral',
      icon: '✨',
      text: 'Được giới thiệu trực tiếp',
      priority: 0 // Hiển thị đầu tiên
    });
  }

  // Sắp xếp theo priority
  badges.sort((a, b) => a.priority - b.priority);

  return {
    stats,
    badges,
    isLoading,
    hasSocialProof: badges.length > 0
  };
}

export default useSocialProof;