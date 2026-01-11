/**
 * Team Page - Trang đội ngũ
 * Uses LiveEditContext from ClientLayout (unified system)
 */
import React from "react";
import { ShieldCheck, Droplets, Beaker } from "lucide-react";
import { 
  useCMSContent, 
  useCMSSection,
  PageLoading
} from "@/components/cms/DynamicPageRenderer";

// Section components
import TeamPageHeader from "@/components/pages/team/TeamPageHeader";
import TeamFounderSection from "@/components/pages/team/TeamFounderSection";
import TeamExpertisePillars from "@/components/pages/team/TeamExpertisePillars";
import TeamMembersGrid from "@/components/pages/team/TeamMembersGrid";

// Icon mapping
const iconMap = { ShieldCheck, Droplets, Beaker };

export default function Team() {
  const { page, sections, isLoading } = useCMSContent('team');

  // Parse sections từ CMS
  const founder = useCMSSection(sections, 'founder', null);
  const expertisePillarsData = useCMSSection(sections, 'expertise_pillars', []);
  const teamMembersData = useCMSSection(sections, 'team_members', []);

  // Map icons
  const expertisePillars = React.useMemo(() => {
    return expertisePillarsData.map(item => ({
      ...item,
      icon: iconMap[item.icon] || ShieldCheck
    }));
  }, [expertisePillarsData]);

  if (isLoading) return <PageLoading />;

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <TeamPageHeader
          title={page?.title || 'Người Sáng Lập & Chuyên Gia'}
          subtitle={page?.subtitle || 'Gặp gỡ đội ngũ chuyên gia tận tâm đằng sau mỗi sản phẩm organic chất lượng cao.'}
        />

        <TeamFounderSection founder={founder} />
        
        <TeamExpertisePillars pillars={expertisePillars} />
        
        <TeamMembersGrid members={teamMembersData} />
      </div>
    </div>
  );
}