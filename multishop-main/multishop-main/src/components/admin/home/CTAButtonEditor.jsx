/**
 * CTAButtonEditor - Editor đầy đủ cho CTA buttons
 * Cho phép tùy chỉnh: màu sắc, bo góc, đổ bóng, opacity, icon, hiệu ứng
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Icon } from "@/components/ui/AnimatedIcon";

// Icon options available
const ICON_OPTIONS = [
  { value: "none", label: "Không có" },
  { value: "ArrowRight", label: "Mũi tên phải" },
  { value: "ArrowLeft", label: "Mũi tên trái" },
  { value: "ShoppingCart", label: "Giỏ hàng" },
  { value: "Phone", label: "Điện thoại" },
  { value: "Mail", label: "Email" },
  { value: "Heart", label: "Trái tim" },
  { value: "Star", label: "Ngôi sao" },
  { value: "Zap", label: "Sét" },
  { value: "Gift", label: "Quà tặng" },
  { value: "Leaf", label: "Lá cây" },
  { value: "Award", label: "Giải thưởng" },
  { value: "CheckCircle", label: "Check" },
  { value: "Info", label: "Thông tin" },
  { value: "ExternalLink", label: "Link ngoài" },
  { value: "Download", label: "Tải xuống" },
  { value: "Play", label: "Phát" },
];

export default function CTAButtonEditor({ cta, onChange, label = "CTA Button" }) {
  const handleChange = (field, value) => {
    onChange({ ...cta, [field]: value });
  };

  // Preview button styles
  const getPreviewStyles = () => {
    const currentStyle = cta?.style || 'solid';
    const currentColor = cta?.color || '#7CB342';
    const currentTextColor = cta?.text_color || '#FFFFFF';
    
    const baseStyles = {
      backgroundColor: currentStyle === 'solid' ? currentColor : 'transparent',
      color: currentTextColor,
      border: currentStyle === 'outline' ? `2px solid ${currentColor}` : 'none',
      opacity: (cta?.opacity || 100) / 100,
    };

    // Border radius
    const radiusMap = {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    };
    baseStyles.borderRadius = radiusMap[cta?.border_radius || 'lg'];

    // Shadow
    const shadowMap = {
      none: 'none',
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
      xl: '0 20px 25px rgba(0,0,0,0.15)',
    };
    baseStyles.boxShadow = shadowMap[cta?.shadow || 'md'];

    // Size
    const sizeMap = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '10px 20px', fontSize: '15px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
      xl: { padding: '16px 32px', fontSize: '18px' },
    };
    const sizeStyles = sizeMap[cta?.size || 'lg'];
    baseStyles.padding = sizeStyles.padding;
    baseStyles.fontSize = sizeStyles.fontSize;

    return baseStyles;
  };

  // Animation class
  const getAnimationClass = () => {
    const animMap = {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      shake: 'animate-[wiggle_0.5s_ease-in-out_infinite]',
      glow: 'animate-[glow_2s_ease-in-out_infinite]',
    };
    return animMap[cta?.animation || 'none'];
  };

  // Get icon component - treat "none" or empty as no icon
  const iconValue = cta?.icon && cta.icon !== 'none' ? cta.icon : null;
  const IconComponent = iconValue ? Icon[iconValue] : null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <h4 className="font-medium text-gray-800">{label}</h4>

      {/* Preview */}
      <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex justify-center">
        <button
          className={`inline-flex items-center justify-center gap-2 font-medium transition-all ${getAnimationClass()}`}
          style={getPreviewStyles()}
          type="button"
        >
          {iconValue && cta?.icon_position === 'left' && IconComponent && (
            <IconComponent size={18} />
          )}
          <span>{cta?.text || 'Button Text'}</span>
          {iconValue && cta?.icon_position !== 'left' && IconComponent && (
            <IconComponent size={18} />
          )}
        </button>
      </div>
      
      {/* Live Config Display */}
      <div className="text-xs bg-white p-3 rounded border space-y-1">
        <p><span className="font-medium">Kiểu:</span> {cta?.style || 'solid'}</p>
        <p><span className="font-medium">Màu:</span> {cta?.color || '#7CB342'}</p>
        <p><span className="font-medium">Text:</span> {cta?.text_color || '#FFFFFF'}</p>
        <p><span className="font-medium">Size:</span> {cta?.size || 'lg'}</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Text</Label>
          <Input
            value={cta?.text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Mua ngay"
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-xs">Link</Label>
          <Input
            value={cta?.link || ''}
            onChange={(e) => handleChange('link', e.target.value)}
            placeholder="/Services"
            className="h-9"
          />
        </div>
      </div>

      {/* Style & Colors */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Kiểu</Label>
          <Select
            value={cta?.style || 'solid'}
            onValueChange={(v) => handleChange('style', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Màu nền/viền</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={cta?.color || '#7CB342'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-9 p-1 cursor-pointer"
            />
            <Input
              value={cta?.color || '#7CB342'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="h-9 flex-1 text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Màu chữ</Label>
          <div className="flex gap-1">
            <Input
              type="color"
              value={cta?.text_color || '#FFFFFF'}
              onChange={(e) => handleChange('text_color', e.target.value)}
              className="w-10 h-9 p-1 cursor-pointer"
            />
            <Input
              value={cta?.text_color || '#FFFFFF'}
              onChange={(e) => handleChange('text_color', e.target.value)}
              className="h-9 flex-1 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Border Radius & Shadow */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Bo góc</Label>
          <Select
            value={cta?.border_radius || 'lg'}
            onValueChange={(v) => handleChange('border_radius', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không bo</SelectItem>
              <SelectItem value="sm">Nhỏ</SelectItem>
              <SelectItem value="md">Vừa</SelectItem>
              <SelectItem value="lg">Lớn</SelectItem>
              <SelectItem value="xl">Rất lớn</SelectItem>
              <SelectItem value="full">Tròn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Đổ bóng</Label>
          <Select
            value={cta?.shadow || 'md'}
            onValueChange={(v) => handleChange('shadow', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không</SelectItem>
              <SelectItem value="sm">Nhỏ</SelectItem>
              <SelectItem value="md">Vừa</SelectItem>
              <SelectItem value="lg">Lớn</SelectItem>
              <SelectItem value="xl">Rất lớn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Kích thước</Label>
          <Select
            value={cta?.size || 'lg'}
            onValueChange={(v) => handleChange('size', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Nhỏ</SelectItem>
              <SelectItem value="md">Vừa</SelectItem>
              <SelectItem value="lg">Lớn</SelectItem>
              <SelectItem value="xl">Rất lớn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <Label className="text-xs">Độ trong suốt: {cta?.opacity || 100}%</Label>
        <Slider
          value={[cta?.opacity || 100]}
          onValueChange={([v]) => handleChange('opacity', v)}
          min={0}
          max={100}
          step={5}
          className="mt-2"
        />
      </div>

      {/* Icon */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Icon</Label>
          <Select
            value={cta?.icon || 'none'}
            onValueChange={(v) => handleChange('icon', v === 'none' ? '' : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Chọn icon" />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.value !== 'none' && Icon[opt.value] && React.createElement(Icon[opt.value], { size: 14 })}
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Vị trí Icon</Label>
          <Select
            value={cta?.icon_position || 'right'}
            onValueChange={(v) => handleChange('icon_position', v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Bên trái</SelectItem>
              <SelectItem value="right">Bên phải</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Animation */}
      <div>
        <Label className="text-xs">Hiệu ứng</Label>
        <Select
          value={cta?.animation || 'none'}
          onValueChange={(v) => handleChange('animation', v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Không</SelectItem>
            <SelectItem value="pulse">Nhấp nháy</SelectItem>
            <SelectItem value="bounce">Nhảy</SelectItem>
            <SelectItem value="shake">Rung</SelectItem>
            <SelectItem value="glow">Phát sáng</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}