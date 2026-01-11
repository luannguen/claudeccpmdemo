/**
 * TesterProfileDropdown - Dropdown menu cho profile tester
 */

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User, LogOut, BarChart3, Settings, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TesterProfileDropdown({ profile, testerEmail, testerName, onLogout }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-600" />
            </div>
          )}
          <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
            {profile?.display_name || testerName || 'Tester'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.display_name || testerName}</p>
            <p className="text-xs text-gray-500 truncate">{testerEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link to={createPageUrl('TesterProfilePage')}>
          <DropdownMenuItem className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Hồ sơ cá nhân
          </DropdownMenuItem>
        </Link>
        
        <Link to={createPageUrl('TesterDashboardPage')}>
          <DropdownMenuItem className="cursor-pointer">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard cá nhân
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}