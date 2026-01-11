/**
 * TeamMembersGrid - Grid hiển thị các thành viên team
 * Full Live Edit support
 */
import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { 
  EditableTextV2, 
  EditableImageV2,
  EditableSectionWrapper,
  EditableArrayItem 
} from "@/components/cms/EditableSectionV2";
import { useLiveEditContext } from "@/components/cms/LiveEditContext";

const SECTION_KEY = "team_members";

// Default team members
const DEFAULT_MEMBERS = [
  {
    id: "1",
    name: "Kỹ Sư Nguyễn Minh Tuấn",
    title: "Chuyên Gia Canh Tác Hữu Cơ",
    bio: "Với 15 năm kinh nghiệm trong lĩnh vực nông nghiệp hữu cơ, anh Tuấn là người đã xây dựng quy trình canh tác khép kín tại Zero Farm.",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=90",
    years_experience: 15,
    specialties: ["Canh Tác Hữu Cơ", "Quản Lý Trang Trại"]
  },
  {
    id: "2", 
    name: "Chị Trần Thị Mai",
    title: "Chuyên Viên Kiểm Nghiệm",
    bio: "Chị Mai chịu trách nhiệm kiểm tra chất lượng và đảm bảo mọi sản phẩm đều không có dư lượng hóa chất độc hại.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=90",
    years_experience: 10,
    specialties: ["Kiểm Nghiệm Chất Lượng", "An Toàn Thực Phẩm", "Phân Tích Dư Lượng"]
  },
  {
    id: "3",
    name: "Anh Phạm Văn Long",
    title: "Trưởng Phòng Canh Tác",
    bio: "Anh Long quản lý đội ngũ nông dân và quy trình canh tác hàng ngày, đảm bảo mọi sản phẩm đều được chăm sóc tận tình.",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90",
    years_experience: 12,
    specialties: ["Quản Lý Sản Xuất", "Đào Tạo Nông Dân", "Kỹ Thuật Canh Tác"]
  }
];

export default function TeamMembersGrid({ members: propMembers }) {
  const { isEditMode, getSectionFieldValue } = useLiveEditContext();
  
  // Use prop members or defaults
  const members = propMembers?.length > 0 ? propMembers : DEFAULT_MEMBERS;

  // Get section title
  const sectionTitle = getSectionFieldValue(SECTION_KEY, "title", "Đội Ngũ Chuyên Gia");

  return (
    <EditableSectionWrapper sectionKey={SECTION_KEY} label="Đội Ngũ">
      <section>
        <EditableTextV2
          sectionKey={SECTION_KEY}
          fieldPath="title"
          defaultValue="Đội Ngũ Chuyên Gia"
          className="font-serif text-3xl text-center font-bold text-[#0F0F0F] mb-12 block"
          as="h2"
          label="Tiêu đề section"
        />
        
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {members.map((member, index) => (
            <EditableArrayItem
              key={member.id || index}
              index={index}
              sectionKey={SECTION_KEY}
              label={`Thành viên ${index + 1}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  {/* Member Image */}
                  <div className="relative h-80 overflow-hidden">
                    <EditableImageV2
                      sectionKey={SECTION_KEY}
                      fieldPath={`members[${index}].image_url`}
                      defaultValue={member.image_url}
                      alt={`${member.name}, ${member.title} tại Zero Farm`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      label={`Ảnh ${member.name}`}
                    />
                    
                    {/* Experience Badge */}
                    {member.years_experience && (
                      <div className="absolute top-4 right-4 bg-[#7CB342] text-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                        <Award className="w-3 h-3" />
                        <span className="text-xs font-medium">{member.years_experience}+ Năm</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="p-8">
                    <EditableTextV2
                      sectionKey={SECTION_KEY}
                      fieldPath={`members[${index}].name`}
                      defaultValue={member.name}
                      className="font-serif text-2xl font-bold text-[#0F0F0F] mb-2 group-hover:text-[#7CB342] transition-colors duration-300 block"
                      as="h3"
                      label={`Tên ${index + 1}`}
                    />
                    
                    <EditableTextV2
                      sectionKey={SECTION_KEY}
                      fieldPath={`members[${index}].title`}
                      defaultValue={member.title}
                      className="text-[#7CB342] font-medium mb-4 block"
                      as="p"
                      label={`Chức danh ${index + 1}`}
                    />
                    
                    <EditableTextV2
                      sectionKey={SECTION_KEY}
                      fieldPath={`members[${index}].bio`}
                      defaultValue={member.bio}
                      className="text-gray-600 leading-relaxed mb-4 line-clamp-3 block"
                      as="p"
                      multiline
                      label={`Tiểu sử ${index + 1}`}
                    />
                    
                    {/* Specialties Tags */}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <span 
                            key={idx} 
                            className="bg-[#7CB342]/10 text-[#7CB342] px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </EditableArrayItem>
          ))}
        </div>
      </section>
    </EditableSectionWrapper>
  );
}