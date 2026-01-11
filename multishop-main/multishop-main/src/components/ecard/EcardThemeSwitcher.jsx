/**
 * EcardThemeSwitcher - Dark/Light mode cho E-Card
 * Feature Enhancement #2
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";

export default function EcardThemeSwitcher({ currentTheme, onThemeChange }) {
  const themes = [
    { key: 'light', label: 'Sáng', icon: 'Sun', bg: 'bg-white', text: 'text-gray-900' },
    { key: 'dark', label: 'Tối', icon: 'Moon', bg: 'bg-gray-900', text: 'text-white' },
    { key: 'green', label: 'Xanh lá', icon: 'Leaf', bg: 'bg-green-50', text: 'text-green-900' },
  ];

  const [selected, setSelected] = useState(currentTheme || 'light');

  const handleChange = (theme) => {
    setSelected(theme);
    onThemeChange?.(theme);
  };

  return (
    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700 px-2">Giao diện:</span>
      {themes.map((theme) => {
        const ThemeIcon = Icon[theme.icon];
        return (
          <button
            key={theme.key}
            onClick={() => handleChange(theme.key)}
            className={`relative px-3 py-2 rounded-lg transition-all ${
              selected === theme.key
                ? 'bg-[#7CB342] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThemeIcon size={18} />
            {selected === theme.key && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-[#7CB342] rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}