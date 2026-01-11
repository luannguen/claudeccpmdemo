import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, FlaskConical, ShieldCheck, Beaker, Award, Droplets, TreeDeciduous } from 'lucide-react';
import { useLiveEditContext } from "@/components/cms/LiveEditContext";
import { EditableTextV2 } from "@/components/cms/EditableSectionV2";

const specialtyItems = [
  { icon: Leaf, text: "100% Hữu Cơ" },
  { icon: FlaskConical, text: "Không Phân Hóa Học" },
  { icon: ShieldCheck, text: "Chứng Nhận VietGAP" },
  { icon: Beaker, text: "Kiểm Nghiệm Kỹ" },
  { icon: Award, text: "Giải Thưởng Quốc Gia" },
  { icon: Droplets, text: "Tưới Nhỏ Giọt" },
  { icon: TreeDeciduous, text: "Trồng Xen Canh" }
];

export default function ProductSpecialty() {
  const extendedSpecialties = [...specialtyItems, ...specialtyItems, ...specialtyItems, ...specialtyItems];
  
  // Live Edit
  const { isEditMode } = useLiveEditContext();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
      viewport={{ once: true }}
      className="py-16 md:py-20 overflow-hidden relative"
    >
      <style jsx>{`
        .marquee-container {
          display: flex;
          width: fit-content;
          animation: marquee 60s linear infinite;
        }

        .marquee-item {
          flex-shrink: 0;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .group:hover .marquee-container {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="text-center mb-16 relative section-editable">
          <motion.h2 
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
              <EditableTextV2
                sectionKey="product_specialty"
                fieldPath="title"
                defaultValue="Quy Trình Sản Xuất"
                className="text-[#0F0F0F]"
                as="span"
                label="Tiêu đề"
              />
              <br />
              <EditableTextV2
                sectionKey="product_specialty"
                fieldPath="title_highlight"
                defaultValue="Đạt Chuẩn Quốc Tế"
                className="text-[#7CB342]"
                as="span"
                label="Highlight"
              />
          </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="mt-6 max-w-3xl mx-auto"
        >
          <EditableTextV2
            sectionKey="product_specialty"
            fieldPath="description"
            defaultValue="Tại Zero Farm, chúng tôi cam kết sử dụng phương pháp canh tác hữu cơ 100%, được chứng nhận bởi các tổ chức uy tín quốc tế."
            className="font-sans text-lg text-gray-600 leading-relaxed"
            as="p"
            label="Mô tả"
            multiline
          />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative group"
      >
        <div className="flex overflow-hidden">
            <div className="marquee-container">
                {extendedSpecialties.map((item, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 50, rotateY: 90 }}
                      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: (index % specialtyItems.length) * 0.1,
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.1, 
                        y: -10,
                        rotateZ: 5,
                        transition: { duration: 0.3 }
                      }}
                      className="marquee-item flex flex-col items-center justify-center mx-8 text-center w-32"
                    >
                        <motion.div 
                          whileHover={{ 
                            rotate: 360,
                            scale: 1.2,
                            boxShadow: "0 15px 30px rgba(124, 179, 66, 0.3)"
                          }}
                          transition={{ duration: 0.5 }}
                          className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 border-2 border-transparent hover:border-[#7CB342]/30"
                        >
                            <item.icon className="w-8 h-8 text-gray-500 transition-colors duration-300 group-hover:text-[#7CB342]" />
                        </motion.div>
                        <motion.p 
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: (index % specialtyItems.length) * 0.1 + 0.3 }}
                          viewport={{ once: true }}
                          className="font-sans text-sm text-gray-700 font-medium transition-colors duration-300 group-hover:text-[#0F0F0F]"
                        >
                            {item.text}
                        </motion.p>
                    </motion.div>
                ))}
            </div>
        </div>
      </motion.div>
    </motion.section>
  );
}