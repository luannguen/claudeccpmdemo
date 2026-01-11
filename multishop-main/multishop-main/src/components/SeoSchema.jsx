import React, { useEffect } from 'react';

export default function SeoSchema({ 
  title = "Zero Farm - Trang Trại Organic Đà Lạt | Rau Củ Sạch Không Dư Lượng",
  description = "Zero Farm - Trang trại organic hàng đầu Việt Nam. Sản phẩm 100% hữu cơ, không dư lượng hóa chất, cam kết an toàn cho sức khỏe. Giao hàng tận nhà.",
  image = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=90",
  url = "https://www.zerofarm.vn"
}) {
  
  useEffect(() => {
    // Set title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (name, content, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    setMetaTag('title', title);
    setMetaTag('description', description);
    setMetaTag('keywords', 'rau organic, rau sạch, trang trại organic, đà lạt, rau củ không dư lượng, thực phẩm hữu cơ, zero farm');
    setMetaTag('author', 'Zero Farm');
    setMetaTag('theme-color', '#7CB342');

    // Open Graph / Facebook
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:site_name', 'Zero Farm', true);
    setMetaTag('og:locale', 'vi_VN', true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', url);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // NEW FAVICON - Zero Farm Logo
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }
    // Use Leaf emoji as favicon
    favicon.setAttribute('type', 'image/svg+xml');
    favicon.setAttribute('href', "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%237CB342' width='100' height='100' rx='20'/><text y='75' x='50' text-anchor='middle' font-size='60' fill='white'>🌱</text></svg>");

    // Apple Touch Icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.setAttribute('href', "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%237CB342' width='100' height='100' rx='20'/><text y='75' x='50' text-anchor='middle' font-size='60' fill='white'>🌱</text></svg>");

    // Schema.org JSON-LD
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": `${url}/#organization`,
          "name": "Zero Farm - Trang Trại Organic",
          "url": url,
          "logo": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%237CB342' width='100' height='100' rx='20'/><text y='75' x='50' text-anchor='middle' font-size='60' fill='white'>🌱</text></svg>",
          "description": description,
          "image": image,
          "telephone": "+84-98-765-4321",
          "priceRange": "₫₫",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Đường Trần Hưng Đạo, Phường 10",
            "addressLocality": "Đà Lạt",
            "addressRegion": "Lâm Đồng",
            "addressCountry": "VN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "11.9404",
            "longitude": "108.4583"
          },
          "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "07:00", "closes": "18:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "07:00", "closes": "17:00" },
            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "08:00", "closes": "16:00" }
          ],
          "sameAs": [
            "https://www.facebook.com/zerofarmvn",
            "https://www.instagram.com/zerofarmvn"
          ],
          "hasOffer": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Rau Xà Lách Xoăn Organic" }, "price": "35000", "priceCurrency": "VND" },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Dâu Tây Đà Lạt Organic" }, "price": "180000", "priceCurrency": "VND" },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Combo Rau Củ Tuần" }, "price": "250000", "priceCurrency": "VND" }
          ]
        },
        {
          "@type": "WebSite",
          "@id": `${url}/#website`,
          "url": url,
          "name": "Zero Farm - Trang Trại Organic Không Dư Lượng",
          "publisher": { "@id": `${url}/#organization` },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${url}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }
      ]
    };

    // Add or update JSON-LD script
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

  }, [title, description, image, url]);

  return null;
}