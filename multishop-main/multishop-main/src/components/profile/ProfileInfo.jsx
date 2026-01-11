import React from "react";
import { MapPin, Calendar, Award, Shield } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ProfileInfo({ profile }) {
  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0F0F0F]">
          {profile?.display_name}
        </h1>
        {profile?.is_verified && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
            <Shield className="w-3 h-3" />
            Đã xác thực
          </span>
        )}
      </div>
      
      {profile?.bio && (
        <p className="text-gray-700 mb-4 leading-relaxed text-lg">
          {profile.bio}
        </p>
      )}
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {profile?.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#7CB342]" />
            {profile.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#7CB342]" />
          Tham gia {formatDistanceToNow(new Date(profile?.joined_date || profile?.created_date), { addSuffix: true, locale: vi })}
        </span>
        {profile?.reputation_score > 0 && (
          <span className="flex items-center gap-1.5 text-[#7CB342] font-semibold">
            <Award className="w-4 h-4" />
            {profile.reputation_score} điểm uy tín
          </span>
        )}
      </div>

      {profile?.interests && profile.interests.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sở thích</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                #{interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}