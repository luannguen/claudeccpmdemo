import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Home, Scissors, Camera, Users, Phone, ArrowRight } from "lucide-react";

const sitePages = [
  {
    category: "Main Pages",
    icon: Home,
    pages: [
      {
        name: "Home",
        url: "/",
        description: "Welcome to SERENITY - Kolkata's premier luxury spa & salon experience"
      },
      {
        name: "Services",
        url: createPageUrl("Services"),
        description: "Complete menu of premium spa treatments, beauty services, and wellness therapies"
      },
      {
        name: "Gallery",
        url: createPageUrl("Gallery"),
        description: "Visual tour of our luxurious facilities and elegant treatment spaces"
      },
      {
        name: "Our Team",
        url: createPageUrl("Team"),
        description: "Meet our certified professionals and expert therapists"
      },
      {
        name: "Contact",
        url: createPageUrl("Contact"),
        description: "Get in touch, find our location, and connect with us"
      }
    ]
  },
  {
    category: "Service Categories",
    icon: Scissors,
    pages: [
      {
        name: "Massage Therapy",
        url: createPageUrl("Services?category=massage"),
        description: "Swedish, Thai, Deep Tissue, Japanese Head Spa, and therapeutic massages"
      },
      {
        name: "Beauty & Cosmetics",
        url: createPageUrl("Services?category=beauty"),
        description: "Microblading, Lash Extensions, Lip Blush, and premium beauty treatments"
      },
      {
        name: "Laser Hair Removal",
        url: createPageUrl("Services?category=laser"),
        description: "Advanced laser technology for permanent hair reduction"
      },
      {
        name: "Nail Care Services",
        url: createPageUrl("Services?category=nails"),
        description: "Manicures, Pedicures, Gel Extensions, and nail artistry"
      },
      {
        name: "Hair Services",
        url: createPageUrl("Services?category=hair"),
        description: "Cuts, Colors, Treatments, Extensions, and professional styling"
      }
    ]
  }
];

export default function Sitemap() {
  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F8F2EC] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A882]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C8A882]" />
            <span className="text-sm font-medium">Site Navigation</span>
          </div>
          
          <h1 className="font-serif font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight">
            SERENITY Website Sitemap
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]">
            Navigate through all pages and services of our luxury wellness website. 
            Find exactly what you're looking for in our organized site structure.
          </p>
        </motion.div>

        {/* Sitemap Grid */}
        <div className="space-y-12">
          {sitePages.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: sectionIndex * 0.2,
                ease: "easeOut"
              }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#C8A882]/10 rounded-2xl flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-[#C8A882]" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#0F0F0F]">
                  {section.category}
                </h2>
              </div>

              {/* Pages Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {section.pages.map((page, pageIndex) => (
                  <motion.div
                    key={page.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: sectionIndex * 0.2 + pageIndex * 0.1
                    }}
                    className="group"
                  >
                    <Link
                      to={page.url}
                      className="block p-6 bg-gray-50 rounded-2xl hover:bg-[#C8A882]/5 transition-all duration-300 hover:shadow-md group-hover:border-[#C8A882]/30 border border-transparent"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-serif text-lg font-bold text-[#0F0F0F] group-hover:text-[#C8A882] transition-colors duration-300">
                          {page.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#C8A882] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {page.description}
                      </p>
                      
                      <div className="text-xs font-mono text-[#C8A882] bg-[#C8A882]/10 px-3 py-1 rounded-full inline-block">
                        {page.url}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEO Information */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 bg-white rounded-3xl p-8 shadow-lg border border-[#C8A882]/20"
        >
          <h2 className="font-serif text-2xl font-bold text-[#0F0F0F] mb-6 text-center">
            About Our Website
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#C8A882] mb-3">
                Website Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Responsive design for all devices</li>
                <li>• Advanced booking system</li>
                <li>• Professional service catalog</li>
                <li>• Interactive gallery showcase</li>
                <li>• Team member profiles</li>
                <li>• Contact and location information</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-serif text-lg font-bold text-[#C8A882] mb-3">
                Our Location
              </h3>
              <div className="text-gray-600 space-y-1">
                <p>SERENITY Luxury Spa & Salon</p>
                <p>P-145, Sector A, Metropolitan Co-Operative</p>
                <p>Housing Society Limited, Tangra</p>
                <p>Kolkata, West Bengal 700105</p>
                <p className="mt-3 font-medium">Phone: +91 98765 43210</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-[#C8A882] to-[#FF5C8D] rounded-3xl p-12 text-white">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Ready to Experience Serenity?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Book your appointment today and discover why we're Kolkata's premier luxury spa & salon destination.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-white text-[#C8A882] px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Your Experience
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}