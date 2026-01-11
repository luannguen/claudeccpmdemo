
/**
 * Bottom Navigation Items Configuration
 * Centralized config for bottom nav - used by BottomNavBar
 */

import { createPageUrl } from "@/utils";

export const bottomNavItems = [
  {
    id: "home",
    name: "Trang Chủ",
    icon: "Home",
    url: createPageUrl("Home"),
    activeColor: "text-[#7CB342]",
    inactiveColor: "text-gray-500"
  },
  {
    id: "services",
    name: "Sản Phẩm",
    icon: "Package",
    url: createPageUrl("Services"),
    activeColor: "text-blue-600",
    inactiveColor: "text-gray-500"
  },
  {
    id: "community",
    name: "Cộng Đồng",
    icon: "Users",
    url: createPageUrl("Community"),
    activeColor: "text-purple-600",
    inactiveColor: "text-gray-500"
  },
  {
    id: "books",
    name: "Thư Viện",
    icon: "Library",
    url: createPageUrl("BookLibrary"),
    activeColor: "text-emerald-600",
    inactiveColor: "text-gray-500"
  },
  {
    id: "profile",
    name: "Cá Nhân",
    icon: "User",
    url: createPageUrl("MyProfile"),
    activeColor: "text-pink-600",
    inactiveColor: "text-gray-500",
    requiresAuth: true
  }
];

export default bottomNavItems;
