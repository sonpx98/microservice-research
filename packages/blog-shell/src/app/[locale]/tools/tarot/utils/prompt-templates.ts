/**
 * Topic-Specific Prompt Templates for Tarot AI
 * 
 * Each reading type has its own context and focus area.
 * Uses interpretation labels from ReadingType for dynamic card positions.
 */

import { TarotCard, ReadingType } from "../types";

/**
 * Topic-specific context and guidance for AI
 */
const topicContexts: Record<string, string> = {
    general: `
Hãy đưa ra cái nhìn tổng thể về cuộc sống và vận mệnh của người hỏi.
Tập trung vào những chủ đề lớn trong cuộc sống, các bài học quan trọng và hướng đi chung.
Có thể đề cập đến nhiều khía cạnh: công việc, tình cảm, sức khỏe, gia đình...`,

    love: `
Hãy tập trung hoàn toàn vào khía cạnh TÌNH CẢM và MỐI QUAN HỆ.
Phân tích về cảm xúc, sự kết nối, tình yêu, và các mối quan hệ thân mật.
Đưa ra những suy đoán về đời sống tình cảm, có thể là người yêu hiện tại, crush, hoặc cơ hội gặp gỡ người mới.
Sử dụng ngôn ngữ lãng mạn, ấm áp khi phù hợp.`,

    career: `
Hãy tập trung hoàn toàn vào khía cạnh CÔNG VIỆC và SỰ NGHIỆP.
Phân tích về cơ hội nghề nghiệp, thăng tiến, dự án, và phát triển kỹ năng.
Đưa ra những suy đoán về môi trường làm việc, đồng nghiệp, sếp, hoặc cơ hội chuyển việc.
Có thể đề cập đến khởi nghiệp, freelance, hoặc phát triển sự nghiệp cá nhân.`,

    money: `
Hãy tập trung hoàn toàn vào khía cạnh TÀI CHÍNH và TIỀN BẠC.
Phân tích về thu nhập, chi tiêu, đầu tư, và quản lý tiền bạc.
Đưa ra những suy đoán về cơ hội kiếm tiền, rủi ro tài chính, hoặc thời điểm đầu tư.
Có thể đề cập đến tiết kiệm, nợ nần, hoặc các quyết định tài chính lớn.`,

    challenges: `
Hãy tập trung vào những KHÓ KHĂN và THÁCH THỨC sắp tới.
Phân tích những trở ngại có thể xuất hiện và cách đối phó.
Đưa ra những cảnh báo nhẹ nhàng nhưng thực tế, kèm theo lời khuyên để vượt qua.
Giọng văn nên động viên và trao quyền, không gây hoang mang.`,

    opportunities: `
Hãy tập trung vào những CƠ HỘI TÍCH CỰC và ĐIỀU THUẬN LỢI sắp đến.
Phân tích những may mắn, thời điểm tốt, và cơ hội cần nắm bắt.
Đưa ra những dự đoán lạc quan nhưng thực tế về những điều tốt đẹp phía trước.
Giọng văn nên hào hứng và truyền cảm hứng.`
};

/**
 * Build a context-aware prompt for Groq AI based on reading type
 */
export function buildPrompt(cards: TarotCard[], readingType: ReadingType): string {
    const topicContext = topicContexts[readingType.id] || topicContexts.general;

    // Use dynamic labels from readingType.interpretation
    const labels = readingType.interpretation;

    return `
Bạn là một người đọc Tarot giàu kinh nghiệm đang trò chuyện thân mật với người bạn của mình.

**Chủ đề đọc bài:** ${readingType.title}
**Mô tả:** ${readingType.description}

**Hướng dẫn về chủ đề - RẤT QUAN TRỌNG:**
${topicContext}

**Ba lá bài đã rút:**
- ${labels.past}: ${cards[0].name} (${cards[0].meaning.upright})
- ${labels.present}: ${cards[1].name} (${cards[1].meaning.upright})  
- ${labels.future}: ${cards[2].name} (${cards[2].meaning.upright})

**Phong cách viết:**
- Viết thành đoạn văn mượt mà, KHÔNG viết từng câu rời rạc như liệt kê.
- Mỗi đoạn nên có 4-5 câu liên kết với nhau, tạo thành một ý hoàn chỉnh.
- Sử dụng từ nối như "và", "nhưng", "vì vậy", "điều này cho thấy" để câu văn chảy tự nhiên.
- Giọng văn ấm áp như đang tâm sự, không phải đang đọc sách hướng dẫn.
- Đưa ra những suy đoán cụ thể liên quan đến CHỦ ĐỀ ${readingType.title.toUpperCase()}.

**Trả về JSON:**
{
  "interpretation": "Viết 3-4 ĐOẠN VĂN liền mạch:

Đoạn 1 - ${labels.past}: Một đoạn 4-5 câu phân tích lá bài đầu tiên trong ngữ cảnh ${readingType.title.toLowerCase()}.

Đoạn 2 - ${labels.present}: Một đoạn 4-5 câu về tình huống hiện tại liên quan đến ${readingType.title.toLowerCase()}.

Đoạn 3 - ${labels.future}: Một đoạn 4-5 câu về xu hướng phía trước trong lĩnh vực ${readingType.title.toLowerCase()}.

Đoạn 4 - Tổng kết: 2-3 câu kết nối cả 3 lá bài thành một thông điệp trọn vẹn về ${readingType.title.toLowerCase()}.",

  "advice": "Một đoạn ngắn 3-4 câu đưa ra lời khuyên thực tế, cụ thể liên quan đến ${readingType.title.toLowerCase()}.",
  
  "meditation": "Một câu châm ngôn ngắn gọn, truyền cảm hứng về ${readingType.title.toLowerCase()}."
}
`;
}
