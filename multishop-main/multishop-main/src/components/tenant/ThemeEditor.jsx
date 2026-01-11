import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Palette, Type, Image, Eye, Save, RefreshCw, 
  Upload, X, Check, Smartphone, Monitor, Tablet
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_THEMES = [
  {
    name: "Fresh Green",
    primary_color: "#7CB342",
    secondary_color: "#FF9800",
    accent_color: "#2196F3",
    font_family: "Playfair Display"
  },
  {
    name: "Ocean Blue",
    primary_color: "#2196F3",
    secondary_color: "#00BCD4",
    accent_color: "#FF9800",
    font_family: "Roboto"
  },
  {
    name: "Sunset Orange",
    primary_color: "#FF9800",
    secondary_color: "#F44336",
    accent_color: "#7CB342",
    font_family: "Lato"
  },
  {
    name: "Royal Purple",
    primary_color: "#9C27B0",
    secondary_color: "#673AB7",
    accent_color: "#FF9800",
    font_family: "Montserrat"
  },
  {
    name: "Earthy Brown",
    primary_color: "#795548",
    secondary_color: "#FF9800",
    accent_color: "#7CB342",
    font_family: "Playfair Display"
  }
];

const FONT_OPTIONS = [
  "Playfair Display",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Merriweather",
  "Raleway",
  "Poppins"
];

export default function ThemeEditor({ tenant, initialBrandingData, onSave }) {
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [isSaving, setIsSaving] = useState(false);
  
  const [theme, setTheme] = useState({
    logo_url: '',
    favicon_url: '',
    primary_color: '#7CB342',
    secondary_color: '#FF9800',
    accent_color: '#2196F3',
    font_family: 'Playfair Display',
    font_size: 'medium',
    border_radius: 'medium',
    button_style: 'rounded'
  });

  useEffect(() => {
    if (initialBrandingData) {
      setTheme({
        ...theme,
        ...initialBrandingData
      });
    }
  }, [initialBrandingData]);

  const applyPreset = (preset) => {
    setTheme({
      ...theme,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      font_family: preset.font_family
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(theme);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const PreviewWebsite = () => (
    <div 
      className={`bg-white rounded-xl overflow-hidden shadow-lg transition-all ${
        previewDevice === 'mobile' ? 'max-w-[375px]' :
        previewDevice === 'tablet' ? 'max-w-[768px]' :
        'w-full'
      }`}
      style={{ fontFamily: theme.font_family }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ backgroundColor: theme.primary_color }}>
        <div className="flex items-center gap-3">
          {theme.logo_url && (
            <img src={theme.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {tenant?.organization_name || "Your Farm Name"}
            </h1>
            <p className="text-sm text-white/80">100% Organic</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-8 text-center" style={{ backgroundColor: `${theme.primary_color}15` }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primary_color }}>
          Sản Phẩm Tươi Ngon
        </h2>
        <p className="text-gray-600 mb-6">
          Trực tiếp từ trang trại đến tay bạn
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            style={{ 
              backgroundColor: theme.primary_color,
              borderRadius: theme.button_style === 'square' ? '8px' : 
                            theme.button_style === 'rounded' ? '12px' : '9999px'
            }}
            className="px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Đặt Hàng Ngay
          </button>
          <button
            style={{ 
              backgroundColor: theme.secondary_color,
              borderRadius: theme.button_style === 'square' ? '8px' : 
                            theme.button_style === 'rounded' ? '12px' : '9999px'
            }}
            className="px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Xem Thêm
          </button>
        </div>
      </div>

      {/* Product Card */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-xl overflow-hidden">
            <div className="aspect-square bg-gray-100" />
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2">Sản Phẩm {i}</h3>
              <p className="text-sm text-gray-600 mb-3">Mô tả ngắn</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: theme.primary_color }}>
                  50,000đ
                </span>
                <button
                  style={{ 
                    backgroundColor: theme.accent_color,
                    borderRadius: theme.button_style === 'square' ? '6px' : 
                                  theme.button_style === 'rounded' ? '8px' : '9999px'
                  }}
                  className="px-4 py-2 text-white text-sm font-medium"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#7CB342]" />
            Theme Customization
          </h3>

          {/* Preset Themes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preset Themes
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:border-[#7CB342] transition-all text-left"
                >
                  <div className="flex gap-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: preset.primary_color }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: preset.secondary_color }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: preset.accent_color }}
                    />
                  </div>
                  <p className="text-sm font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">Màu Sắc</h4>
            
            {['primary_color', 'secondary_color', 'accent_color'].map((colorKey) => (
              <div key={colorKey}>
                <label className="block text-sm text-gray-600 mb-2 capitalize">
                  {colorKey.replace('_', ' ')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={theme[colorKey]}
                    onChange={(e) => setTheme({...theme, [colorKey]: e.target.value})}
                    className="w-16 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme[colorKey]}
                    onChange={(e) => setTheme({...theme, [colorKey]: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Font Family</label>
                <select
                  value={theme.font_family}
                  onChange={(e) => setTheme({...theme, font_family: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Button Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {['square', 'rounded', 'pill'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setTheme({...theme, button_style: style})}
                      className={`p-3 border-2 transition-all ${
                        theme.button_style === style
                          ? 'border-[#7CB342] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderRadius: style === 'square' ? '8px' : 
                                     style === 'rounded' ? '12px' : '9999px'
                      }}
                    >
                      <p className="text-sm capitalize">{style}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Logo & Assets
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Logo</label>
                {theme.logo_url ? (
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <img src={theme.logo_url} alt="Logo" className="w-32 h-32 object-contain mx-auto mb-3" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme({...theme, logo_url: ''})}
                        className="flex-1 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Xóa
                      </button>
                      <label className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center cursor-pointer">
                        <Upload className="w-4 h-4 inline mr-1" />
                        Đổi
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('File quá lớn! Tối đa 5MB');
                                return;
                              }
                              try {
                                const { data } = await base44.integrations.Core.UploadFile({ file });
                                setTheme({...theme, logo_url: data.file_url});
                              } catch (error) {
                                alert('Lỗi upload: ' + error.message);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#7CB342] transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">Tải logo lên (PNG/JPG, tối đa 5MB)</p>
                    <label className="inline-block px-4 py-2 bg-[#7CB342] text-white rounded-lg cursor-pointer hover:bg-[#5a8f31] transition-colors">
                      Chọn file
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File quá lớn! Tối đa 5MB');
                              return;
                            }
                            try {
                              const { data } = await base44.integrations.Core.UploadFile({ file });
                              setTheme({...theme, logo_url: data.file_url});
                            } catch (error) {
                              alert('Lỗi upload: ' + error.message);
                            }
                          }
                        }}
                      />
                    </label>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <input
                        type="url"
                        value={theme.logo_url}
                        onChange={(e) => setTheme({...theme, logo_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
                        placeholder="Hoặc nhập URL..."
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Favicon</label>
                {theme.favicon_url ? (
                  <div className="border-2 border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <img src={theme.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                    <input
                      type="url"
                      value={theme.favicon_url}
                      onChange={(e) => setTheme({...theme, favicon_url: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
                    />
                    <button
                      onClick={() => setTheme({...theme, favicon_url: ''})}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={theme.favicon_url}
                    onChange={(e) => setTheme({...theme, favicon_url: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                    placeholder="https://example.com/favicon.ico"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-medium hover:bg-[#FF9800] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu Theme
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0F0F0F] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#7CB342]" />
              Preview
            </h3>
            <div className="flex gap-2">
              {[
                { key: 'mobile', icon: Smartphone },
                { key: 'tablet', icon: Tablet },
                { key: 'desktop', icon: Monitor }
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPreviewDevice(key)}
                  className={`p-2 rounded-lg transition-colors ${
                    previewDevice === key
                      ? 'bg-[#7CB342] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 flex justify-center">
            <PreviewWebsite />
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Current Palette</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div 
                className="w-full h-20 rounded-xl mb-2 shadow-inner"
                style={{ backgroundColor: theme.primary_color }}
              />
              <p className="text-xs text-gray-600">Primary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-20 rounded-xl mb-2 shadow-inner"
                style={{ backgroundColor: theme.secondary_color }}
              />
              <p className="text-xs text-gray-600">Secondary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-20 rounded-xl mb-2 shadow-inner"
                style={{ backgroundColor: theme.accent_color }}
              />
              <p className="text-xs text-gray-600">Accent</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h4 className="font-bold text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chọn màu tương phản cho dễ đọc</li>
            <li>• Font chữ serif cho elegance</li>
            <li>• Button pill cho modern look</li>
            <li>• Logo nên có nền trong suốt (PNG)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}