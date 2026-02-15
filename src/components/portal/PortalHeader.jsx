import React from 'react';
import { Bell, MessageSquare, Settings, LogOut, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function PortalHeader({ user, unreadNotifications = 0 }) {
  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">{user?.full_name || 'User'}</h2>
        <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'Administrator' : user?.department || 'User'}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-[#D50000] text-white text-xs rounded-full flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Messages */}
        <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <MessageSquare className="w-5 h-5 text-gray-600" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}