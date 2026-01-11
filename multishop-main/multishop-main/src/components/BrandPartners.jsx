/**
 * BrandPartners - Hiển thị đối tác thương hiệu
 * 
 * SYNC với Admin CMS -> PartnerManager
 * Đọc từ SiteConfig.partners_content
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useSiteConfig } from "@/components/hooks/useCMSPages";
import { ConditionalSection } from "@/components/cms/SectionVisibilityManager";

// Default brands (fallback nếu chưa có data)
// Note: Không dùng external SVG URLs (bị CORB block), dùng text fallback thay thế
const DEFAULT_BRANDS = [
  { id: 'vietgap', name: 'VietGAP', category: 'certification', is_active: true },
  { id: 'globalgap', name: 'GlobalGAP', category: 'certification', is_active: true },
  { id: 'organic', name: 'Organic Vietnam', category: 'certification', is_active: true },
  { id: 'vinamilk', name: 'Vinamilk', category: 'distributor', is_active: true },
  { id: 'lotte', name: 'Lotte Mart', category: 'distributor', is_active: true },
  { id: 'aeon', name: 'Aeon Mall', category: 'distributor', is_active: true },
];

export default function BrandPartners() {
  const { data: config } = useSiteConfig();
  
  // Get partners from config or use defaults
  const partners = React.useMemo(() => {
    const savedPartners = config?.partners_content || [];
    if (savedPartners.length === 0) return DEFAULT_BRANDS;
    // Only show active partners
    return savedPartners.filter(p => p.is_active !== false);
  }, [config]);

  // Duplicate for infinite scroll effect
  const extendedBrands = [...partners, ...partners];

  return (
    <ConditionalSection sectionKey="brand_partners">
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-gray-500 mb-12">
            Đối Tác & Chứng Nhận Uy Tín
          </h3>
          
          {partners.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có đối tác nào</p>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden group">
              <style>{`
                .marquee-container {
                  display: flex;
                  width: fit-content;
                  animation: marquee 120s linear infinite;
                }
                .group:hover .marquee-container {
                  animation-play-state: paused;
                }
                @keyframes marquee {
                  from { transform: translateX(0); }
                  to { transform: translateX(-50%); }
                }
                @media (max-width: 768px) {
                  .logo-item {
                    width: calc(100vw / 3 - 2rem);
                    min-width: calc(100vw / 3 - 2rem);
                    margin: 0 1rem;
                  }
                }
              `}</style>
              <div className="marquee-container">
                {extendedBrands.map((brand, index) => (
                  <div 
                    key={`${brand.id || brand.name}-${index}`} 
                    className="logo-item flex-shrink-0 w-48 mx-8 lg:mx-12 flex items-center justify-center h-24"
                  >
                    <div className="w-full h-14 flex items-center justify-center">
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`bg-[#7CB342]/10 px-6 py-3 rounded-lg ${brand.logo_url ? 'hidden' : 'flex'}`}
                        style={{ display: brand.logo_url ? 'none' : 'flex' }}
                      >
                        <span className="text-[#7CB342] font-bold text-sm">{brand.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </ConditionalSection>
  );
}