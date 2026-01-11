import React from "react";
import PreOrderLotCard from "@/components/preorder/PreOrderLotCard";

export default function PreOrderLotsGrid({ lots }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {lots.map((lot, index) => (
        <PreOrderLotCard key={lot.id} lot={lot} index={index} />
      ))}
    </div>
  );
}