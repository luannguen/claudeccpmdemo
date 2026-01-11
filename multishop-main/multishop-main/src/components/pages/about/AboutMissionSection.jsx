/**
 * AboutMissionSection - Sứ mệnh và tầm nhìn
 */
import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Compass } from "lucide-react";

const missions = [
  {
    icon: Target,
    title: "Sứ Mệnh",
    description: "Mang đến thực phẩm hữu cơ chất lượng cao, an toàn cho sức khỏe với giá cả hợp lý nhất cho mọi gia đình Việt.",
    color: "bg-[#7CB342]"
  },
  {
    icon: Eye,
    title: "Tầm Nhìn",
    description: "Trở thành nền tảng nông nghiệp hữu cơ hàng đầu Việt Nam, kết nối người tiêu dùng với nông sản sạch từ nông trại.",
    color: "bg-blue-500"
  },
  {
    icon: Compass,
    title: "Giá Trị Cốt Lõi",
    description: "Minh bạch - Bền vững - Cộng đồng. Chúng tôi tin vào sức mạnh của sự kết nối giữa người trồng và người tiêu dùng.",
    color: "bg-[#FF9800]"
  }
];

export default function AboutMissionSection() {
  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F0F0F] mb-4">
            Chúng Tôi Tin Vào Điều Gì?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mỗi sản phẩm đều mang theo một câu chuyện về sự tận tâm và tình yêu với nông nghiệp bền vững.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 ${mission.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <mission.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F0F0F] mb-4">{mission.title}</h3>
              <p className="text-gray-600 leading-relaxed">{mission.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}