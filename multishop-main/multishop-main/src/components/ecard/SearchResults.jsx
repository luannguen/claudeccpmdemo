import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SearchResults({ results }) {
  const navigate = useNavigate();

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Icon.Search size={64} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Không tìm thấy kết quả</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {results.map(profile => (
        <div
          key={profile.id}
          onClick={() => navigate(createPageUrl(`EcardView?slug=${profile.public_url_slug}`))}
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.display_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#558B2F] flex items-center justify-center text-white font-bold">
                {profile.display_name?.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{profile.display_name}</h3>
              {profile.title_profession && (
                <p className="text-sm text-gray-600">{profile.title_profession}</p>
              )}
              {profile.company_name && (
                <p className="text-xs text-gray-500">{profile.company_name}</p>
              )}
            </div>

            <Icon.ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
}