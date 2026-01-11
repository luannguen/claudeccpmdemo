import React from 'react';

export default function ThemePreviewStyles({ color = '#7CB342' }) {
  return (
    <style>{`:root { --ecard-primary: ${color}; }`}</style>
  );
}