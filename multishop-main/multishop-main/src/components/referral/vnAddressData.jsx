/**
 * Vietnam Address Data
 * Dữ liệu tỉnh/thành, quận/huyện, phường/xã
 */

export const VN_PROVINCES = [
  { code: 'HN', name: 'Hà Nội' },
  { code: 'HCM', name: 'Hồ Chí Minh' },
  { code: 'DN', name: 'Đà Nẵng' },
  { code: 'HP', name: 'Hải Phòng' },
  { code: 'CT', name: 'Cần Thơ' },
  { code: 'AG', name: 'An Giang' },
  { code: 'BD', name: 'Bình Dương' },
  { code: 'BTH', name: 'Bình Thuận' },
  { code: 'DNA', name: 'Đồng Nai' },
  { code: 'KH', name: 'Khánh Hòa' },
  { code: 'LA', name: 'Long An' },
  { code: 'TG', name: 'Tiền Giang' },
  { code: 'VT', name: 'Vũng Tàu' },
  { code: 'QB', name: 'Quảng Bình' },
  { code: 'QN', name: 'Quảng Nam' },
  { code: 'QNG', name: 'Quảng Ngãi' },
  { code: 'TH', name: 'Thanh Hóa' },
  { code: 'NA', name: 'Nghệ An' },
];

export const VN_DISTRICTS = {
  'HN': [
    'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa',
    'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Hà Đông', 'Bắc Từ Liêm', 'Nam Từ Liêm'
  ],
  'HCM': [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
    'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức', 
    'Bình Thạnh', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Gò Vấp'
  ],
  'DN': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'],
};

export const COMMON_WARDS = [
  'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Ông Lãnh',
  'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
  'Phường Tân Định', 'Phường Đa Kao', 'Phường Võ Thị Sáu',
  'Xã Tân Thới Nhì', 'Xã Bình Hưng Hòa'
];

export function searchAddress(query, type = 'all') {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  const results = [];
  
  if (type === 'province' || type === 'all') {
    VN_PROVINCES.forEach(p => {
      if (p.name.toLowerCase().includes(q)) {
        results.push({ type: 'province', ...p });
      }
    });
  }
  
  if (type === 'district' || type === 'all') {
    Object.entries(VN_DISTRICTS).forEach(([province, districts]) => {
      districts.forEach(d => {
        if (d.toLowerCase().includes(q)) {
          results.push({ type: 'district', name: d, province });
        }
      });
    });
  }
  
  if (type === 'ward' || type === 'all') {
    COMMON_WARDS.forEach(w => {
      if (w.toLowerCase().includes(q)) {
        results.push({ type: 'ward', name: w });
      }
    });
  }
  
  return results.slice(0, 8);
}