import React from "react";
import { Camera, Award } from "lucide-react";

export default function ProfileAvatar({ profile, isOwnProfile, onEdit }) {
  return (
    <div className="relative group">
      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-5xl sm:text-6xl border-6 border-white shadow-2xl overflow-hidden">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}</span>
        )}
      </div>
      
      {profile?.is_verified && (
        <div className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <Award className="w-6 h-6 text-white" />
        </div>
      )}

      {isOwnProfile && (
        <button
          onClick={onEdit}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/50 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
      )}
    </div>
  );
}