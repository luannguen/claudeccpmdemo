import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, Calendar, Sparkles } from "lucide-react";

export default function LotDetailRelated({ relatedLots }) {
  if (!relatedLots || relatedLots.length === 0) return null;

  return (
    <div>
      <h3 className="font-bold text-2xl mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-purple-600" />
        Các lot khác cùng phiên
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedLots.slice(0, 4).map(relLot => (
          <Link key={relLot.id} to={createPageUrl(`PreOrderProductDetail?lotId=${relLot.id}`)}
            className="bg-white border-2 border-gray-200 hover:border-[#7CB342] rounded-xl p-4 transition-all group">
            <div className="flex gap-3">
              {relLot.product_image ? (
                <img src={relLot.product_image} alt={relLot.lot_name}
                  className="w-20 h-20 object-cover rounded-lg" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold mb-1 group-hover:text-[#7CB342]">{relLot.lot_name}</p>
                <p className="text-sm text-gray-600 mb-2">
                  <Calendar className="w-3 h-3 inline" /> {new Date(relLot.estimated_harvest_date).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xl font-bold text-[#7CB342]">
                  {relLot.current_price?.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}