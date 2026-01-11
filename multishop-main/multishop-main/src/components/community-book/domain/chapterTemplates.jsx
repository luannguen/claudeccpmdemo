/**
 * Chapter Templates
 * Pre-defined templates for different types of chapters
 */

export const CHAPTER_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Trang trắng',
    description: 'Bắt đầu với trang trắng',
    icon: 'FileText',
    content: ''
  },
  
  recipe: {
    id: 'recipe',
    name: 'Công thức',
    description: 'Mẫu cho công thức nấu ăn, chế biến',
    icon: 'ChefHat',
    content: `## Nguyên liệu

- Nguyên liệu 1: số lượng
- Nguyên liệu 2: số lượng
- Nguyên liệu 3: số lượng

## Dụng cụ cần thiết

- Dụng cụ 1
- Dụng cụ 2

## Các bước thực hiện

### Bước 1: Chuẩn bị
Mô tả bước chuẩn bị...

### Bước 2: Chế biến
Mô tả bước chế biến...

### Bước 3: Hoàn thiện
Mô tả bước hoàn thiện...

## Mẹo & Lưu ý

- Mẹo 1
- Mẹo 2

## Kết quả

Mô tả thành phẩm mong đợi...
`
  },
  
  guide: {
    id: 'guide',
    name: 'Hướng dẫn',
    description: 'Mẫu hướng dẫn từng bước',
    icon: 'BookOpen',
    content: `## Giới thiệu

Mô tả ngắn về nội dung hướng dẫn này...

## Yêu cầu trước khi bắt đầu

- Yêu cầu 1
- Yêu cầu 2

## Các bước thực hiện

### 1. Bước đầu tiên
Chi tiết bước 1...

### 2. Bước thứ hai
Chi tiết bước 2...

### 3. Bước thứ ba
Chi tiết bước 3...

## Kết quả mong đợi

Mô tả kết quả...

## Câu hỏi thường gặp

**Q: Câu hỏi 1?**
A: Trả lời...

**Q: Câu hỏi 2?**
A: Trả lời...

## Tài liệu tham khảo

- Link 1
- Link 2
`
  },
  
  story: {
    id: 'story',
    name: 'Câu chuyện',
    description: 'Mẫu cho bài viết kể chuyện',
    icon: 'Feather',
    content: `## Mở đầu

*Đặt bối cảnh cho câu chuyện...*

---

## Phần 1

Nội dung phần 1 của câu chuyện...

> "Trích dẫn hoặc lời nói nổi bật"

## Phần 2

Nội dung phần 2...

## Phần 3

Nội dung phần 3...

---

## Kết luận

Bài học rút ra hoặc kết thúc câu chuyện...

*Chia sẻ suy nghĩ của bạn trong phần bình luận!*
`
  },
  
  experience: {
    id: 'experience',
    name: 'Kinh nghiệm',
    description: 'Chia sẻ kinh nghiệm thực tế',
    icon: 'Lightbulb',
    content: `## Bối cảnh

Mô tả hoàn cảnh, vấn đề gặp phải...

## Thách thức

- Thách thức 1
- Thách thức 2
- Thách thức 3

## Giải pháp đã áp dụng

### Giải pháp 1
Mô tả chi tiết...

### Giải pháp 2
Mô tả chi tiết...

## Kết quả đạt được

- Kết quả 1
- Kết quả 2

## Bài học kinh nghiệm

1. **Bài học 1**: Mô tả...
2. **Bài học 2**: Mô tả...
3. **Bài học 3**: Mô tả...

## Lời khuyên

Những điều bạn muốn chia sẻ với người đọc...
`
  },
  
  knowledge: {
    id: 'knowledge',
    name: 'Kiến thức',
    description: 'Bài viết chia sẻ kiến thức',
    icon: 'GraduationCap',
    content: `## Tổng quan

Giới thiệu về chủ đề...

## Khái niệm cơ bản

### Khái niệm 1
Định nghĩa và giải thích...

### Khái niệm 2
Định nghĩa và giải thích...

## Chi tiết

### 1. Phần A
Nội dung chi tiết...

### 2. Phần B
Nội dung chi tiết...

### 3. Phần C
Nội dung chi tiết...

## Ứng dụng thực tế

Cách áp dụng kiến thức này trong thực tế...

## Tóm tắt

- Điểm chính 1
- Điểm chính 2
- Điểm chính 3

## Đọc thêm

- Tài liệu 1
- Tài liệu 2
`
  },

  tips: {
    id: 'tips',
    name: 'Mẹo hay',
    description: 'Danh sách mẹo và thủ thuật',
    icon: 'Zap',
    content: `## Giới thiệu

Tổng quan về các mẹo sẽ chia sẻ...

---

## 💡 Mẹo #1: [Tên mẹo]

**Vấn đề:** Mô tả vấn đề...

**Giải pháp:** Mô tả mẹo...

**Kết quả:** Lợi ích đạt được...

---

## 💡 Mẹo #2: [Tên mẹo]

**Vấn đề:** Mô tả vấn đề...

**Giải pháp:** Mô tả mẹo...

**Kết quả:** Lợi ích đạt được...

---

## 💡 Mẹo #3: [Tên mẹo]

**Vấn đề:** Mô tả vấn đề...

**Giải pháp:** Mô tả mẹo...

**Kết quả:** Lợi ích đạt được...

---

## Kết luận

Tổng kết và lời khuyên cuối...

*Bạn có mẹo nào khác? Chia sẻ trong bình luận nhé!*
`
  }
};

export const TEMPLATE_LIST = Object.values(CHAPTER_TEMPLATES);

export const getTemplate = (templateId) => {
  return CHAPTER_TEMPLATES[templateId] || CHAPTER_TEMPLATES.blank;
};

export default CHAPTER_TEMPLATES;