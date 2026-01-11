/**
 * Agriculture Agent
 * 
 * Handles farming/organic questions
 * Uses web search for current info
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== KNOWLEDGE BASE (No LLM) ==========

const AGRICULTURE_KB = {
  // Organic basics
  'organic là gì': {
    content: `🌱 **Organic (Hữu cơ) là gì?**

Sản phẩm organic được sản xuất theo tiêu chuẩn:
- ❌ Không thuốc trừ sâu hóa học
- ❌ Không phân bón tổng hợp
- ❌ Không chất bảo quản
- ❌ Không biến đổi gen (GMO)
- ✅ Chỉ dùng phân hữu cơ, compost
- ✅ Kiểm soát sâu bệnh tự nhiên

**Lợi ích:** An toàn cho sức khỏe, thân thiện môi trường.`,
    topic: 'organic_basics'
  },
  
  'phân hữu cơ': {
    content: `🌿 **Phân bón hữu cơ:**

**Các loại phổ biến:**
1. **Phân chuồng** - Từ gia súc, gia cầm
2. **Phân xanh** - Từ cây họ đậu
3. **Compost** - Rác thải hữu cơ ủ hoai
4. **Phân trùn quế** - Giàu dinh dưỡng

**Cách sử dụng:**
- Bón lót trước khi trồng
- Bón thúc trong giai đoạn sinh trưởng
- Liều lượng: 2-3kg/m² đất

Bạn cần tư vấn chi tiết hơn không?`,
    topic: 'fertilizer'
  },
  
  'trồng rau': {
    content: `🥬 **Hướng dẫn trồng rau cơ bản:**

**Bước 1: Chuẩn bị đất**
- Đất tơi xốp, thoát nước tốt
- Trộn phân hữu cơ 30-40%

**Bước 2: Gieo hạt/trồng cây**
- Khoảng cách phù hợp từng loại
- Tưới đủ ẩm

**Bước 3: Chăm sóc**
- Tưới 1-2 lần/ngày (sáng sớm/chiều mát)
- Bón phân định kỳ 7-10 ngày
- Nhổ cỏ, làm cỏ thường xuyên

**Bước 4: Thu hoạch**
- Theo dõi thời gian sinh trưởng
- Thu hoạch đúng độ chín

Bạn muốn biết cách trồng loại rau nào cụ thể?`,
    topic: 'planting'
  },
  
  'sâu bệnh': {
    content: `🐛 **Phòng trừ sâu bệnh hữu cơ:**

**Phương pháp tự nhiên:**
1. **Xà phòng sinh học** - Diệt rệp, bọ trĩ
2. **Ớt + tỏi ngâm** - Xua đuổi côn trùng
3. **Neem oil** - Trừ sâu an toàn
4. **Bọ rùa** - Thiên địch ăn rệp

**Biện pháp canh tác:**
- Luân canh cây trồng
- Trồng xen canh
- Loại bỏ cây bệnh ngay
- Vệ sinh vườn sạch sẽ

**Lưu ý:** Không dùng thuốc hóa học để giữ tiêu chuẩn organic!`,
    topic: 'pest_control'
  },
  
  'mùa vụ': {
    content: `📅 **Lịch mùa vụ rau củ:**

**Mùa khô (11-4):**
- Rau cải, xà lách, cà chua
- Dưa leo, bí đao, mướp

**Mùa mưa (5-10):**
- Rau muống, mồng tơi
- Rau dền, bầu bí

**Quanh năm:**
- Hành, tỏi, ớt
- Rau thơm các loại

**Mẹo:** Trồng theo mùa giúp cây phát triển tốt, ít sâu bệnh!`,
    topic: 'seasons'
  }
};

// ========== KNOWLEDGE BASE CHECK ==========

/**
 * Check knowledge base (no LLM)
 */
export function checkKnowledgeBase(query) {
  const lowerQuery = query.toLowerCase();
  
  for (const [keyword, data] of Object.entries(AGRICULTURE_KB)) {
    if (lowerQuery.includes(keyword)) {
      return {
        hit: true,
        response: {
          content: data.content,
          contentType: 'markdown',
          topic: data.topic,
          source: 'knowledge_base'
        }
      };
    }
  }
  
  return { hit: false };
}

// ========== WEB SEARCH FOR CURRENT INFO ==========

/**
 * Search web for agriculture info
 */
export async function searchAgricultureInfo(query) {
  try {
    // Use LLM with web context
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Bạn là chuyên gia nông nghiệp. Trả lời câu hỏi sau một cách ngắn gọn, dễ hiểu:

Câu hỏi: ${query}

Yêu cầu:
- Trả lời bằng tiếng Việt
- Ngắn gọn, thực tế
- Tập trung vào nông nghiệp hữu cơ
- Đưa ra lời khuyên cụ thể
- Sử dụng emoji phù hợp`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          tips: { type: 'array', items: { type: 'string' } },
          sources: { type: 'array', items: { type: 'string' } }
        },
        required: ['answer']
      }
    });
    
    let content = response.answer;
    
    if (response.tips?.length > 0) {
      content += '\n\n**💡 Mẹo:**\n' + response.tips.map(t => `- ${t}`).join('\n');
    }
    
    return success({
      content,
      contentType: 'markdown',
      source: 'web_search',
      tokensUsed: 200 // Estimate
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== MAIN HANDLER ==========

/**
 * Handle agriculture-related query
 */
export async function handleAgricultureQuery(query, userContext = {}) {
  // Check knowledge base first (free)
  const kbResult = checkKnowledgeBase(query);
  if (kbResult.hit) {
    return success({
      ...kbResult.response,
      intent: 'agriculture',
      tokensUsed: 0
    });
  }
  
  // Use web search for complex queries
  const searchResult = await searchAgricultureInfo(query);
  if (searchResult.success) {
    return success({
      ...searchResult.data,
      intent: 'agriculture'
    });
  }
  
  // Fallback
  return success({
    content: `Cảm ơn câu hỏi về nông nghiệp của bạn! 🌱

Tôi có thể hỗ trợ bạn về:
- Kỹ thuật trồng rau organic
- Phân bón hữu cơ
- Phòng trừ sâu bệnh tự nhiên
- Lịch mùa vụ

Bạn có thể hỏi cụ thể hơn được không?`,
    contentType: 'markdown',
    intent: 'agriculture',
    tokensUsed: 0
  });
}

export default {
  handleAgricultureQuery,
  checkKnowledgeBase,
  searchAgricultureInfo,
  AGRICULTURE_KB
};