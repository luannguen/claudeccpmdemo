import React from "react";
import { Sparkles } from "lucide-react";

export default function ProfileCover({ coverPhotoUrl }) {
  return (
    <div className="relative h-72 bg-gradient-to-r from-[#7CB342] via-[#5a8f31] to-[#FF9800] overflow-hidden">
      {coverPhotoUrl ? (
        <img
          src={coverPhotoUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-24 h-24 text-white/20" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
    </div>
  );
}