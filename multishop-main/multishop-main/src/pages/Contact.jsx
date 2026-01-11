/**
 * Contact Page - Trang liên hệ
 * Uses LiveEditContext from ClientLayout (unified system)
 */
import React, { useEffect, useCallback } from "react";
import { useSiteSettings } from "@/components/cms/useSiteConfig";
import { 
  useCMSContent, 
  useCMSSection,
  PageLoading
} from "@/components/cms/DynamicPageRenderer";

// Section components
import ContactPageHeader from "@/components/pages/contact/ContactPageHeader";
import ContactInfoCards from "@/components/pages/contact/ContactInfoCards";
import ContactForm from "@/components/pages/contact/ContactForm";
import ContactFAQSection from "@/components/pages/contact/ContactFAQSection";
import ContactMapSection from "@/components/pages/contact/ContactMapSection";

export default function Contact() {
  const { contact, hours, social, isLoading: configLoading } = useSiteSettings();
  const { page, sections, isLoading: pageLoading } = useCMSContent('contact');
  
  const faqItems = useCMSSection(sections, 'faq', []);

  // ✅ Bottom Nav Events - open-map
  const handleOpenMap = useCallback(() => {
    // Scroll to map section
    const mapElement = document.getElementById('contact-map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('open-map', handleOpenMap);
    return () => window.removeEventListener('open-map', handleOpenMap);
  }, [handleOpenMap]);

  if (configLoading || pageLoading) return <PageLoading />;

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <ContactPageHeader
          title={page?.title || 'Liên Hệ Zero Farm'}
          subtitle={page?.subtitle || 'Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn về sản phẩm organic.'}
        />

        <div className="grid lg:grid-cols-2 gap-[clamp(1rem,2vw,2.5rem)]">
          <ContactInfoCards 
            contact={contact} 
            hours={hours} 
            social={social} 
          />
          <ContactForm />
        </div>

        <ContactFAQSection faqItems={faqItems} />
        
        <div id="contact-map-section">
          <ContactMapSection 
            city={contact?.city} 
            province={contact?.province} 
          />
        </div>
      </div>
    </div>
  );
}