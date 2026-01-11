import React from "react";
import { Award, CheckCircle } from "lucide-react";

export default function LotDetailCertifications() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-green-600" />
        Chứng nhận & Cam kết
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">100% Organic</p>
            <p className="text-xs text-gray-600">Không hóa chất</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Tươi ngon</p>
            <p className="text-xs text-gray-600">Thu hoạch trong ngày</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Hoàn tiền 100%</p>
            <p className="text-xs text-gray-600">Nếu không đúng cam kết</p>
          </div>
        </div>
      </div>
    </div>
  );
}