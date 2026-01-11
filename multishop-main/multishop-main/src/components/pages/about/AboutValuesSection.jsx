/**
 * AboutValuesSection - Cam kết và giá trị
 */
import React from "react";
import { motion } from "framer-motion";
import { Shield, Truck, Leaf, Award, Heart, Users } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "100% Hữu Cơ",
    description: "Không thuốc trừ sâu, không hóa chất độc hại"
  },
  {
    icon: Shield,
    title: "An Toàn Tuyệt Đối",
    description: "Kiểm định chất lượng nghiêm ngặt"
  },
  {
    icon: Truck,
    title: "Giao Hàng Tận Nơi",
    description: "Nhanh chóng, đúng hẹn, bảo quản tươi ngon"
  },
  {
    icon: Award,
    title: "Chứng Nhận Quốc Tế",
    description: "Đạt tiêu chuẩn organic toàn cầu"
  },
  {
    icon: Heart,
    title: "Hỗ Trợ Nông Dân",
    description: "Thu mua giá công bằng, bền vững"
  },
  {
    icon: Users,
    title: "Cộng Đồng Xanh",
    description: "Xây dựng lối sống lành mạnh cùng nhau"
  }
];

export default function AboutValuesSection() {
  return (
    <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-[#7CB342]/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">
            Cam Kết Của Chúng Tôi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            6 giá trị cốt lõi định hình mọi hoạt động của chúng tôi
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all group cursor-default"
            >
              <div className="w-14 h-14 bg-[#7CB342]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#7CB342] transition-colors">
                <value.icon className="w-7 h-7 text-[#7CB342] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-[#0F0F0F] mb-2">{value.title}</h3>
              <p className="text-sm text-gray-500">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}