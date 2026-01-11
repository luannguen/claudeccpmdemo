/**
 * ContactFAQSection - Section FAQ
 */
import React from "react";
import { motion } from "framer-motion";

export default function ContactFAQSection({ faqItems }) {
  if (!faqItems || faqItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mt-16"
    >
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-[#7CB342]/20">
        <h2 className="font-serif text-2xl font-bold text-[#0F0F0F] mb-8 text-center">
          Câu Hỏi Thường Gặp
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqItems.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 pb-4">
              <h3 className="font-medium text-[#0F0F0F] mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}