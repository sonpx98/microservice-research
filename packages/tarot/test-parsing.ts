// Test parsing markdown response
const testContent = `**Trải nghiệm bài 3 lá tarot: Cân bằng, Sinh sản và Tình yêu**\n\n**Giải thích tổng quan**\n\nKhi xem xét trải nghiệm bài 3 lá tarot này, tôi thấy một câu chuyện đầy sức mạnh và ý nghĩa. Với Two of Pentacles ở quá khứ, bạn đã học cách cân bằng và thích ứng với tình huống khó khăn. Bạn đã ưu tiên và sử dụng thời gian một cách hiệu quả để vượt qua thử thách. Đó là một dấu ấn quan trọng trong hành trình của bạn.\n\nHiện tại, bạn đang ở trong tình trạng của The Empress, nơi bạn đang cảm nhận được sự phong phú và nữ tính. Bạn đang kết nối với thiên nhiên và lắng nghe tiếng lòng của mình. Đây là một thời điểm tuyệt vời để bạn tập trung vào sự phát triển nội tâm và sự phong phú của bản thân.\n\nTương lai, bạn sẽ gặp The Lovers, nơi bạn sẽ trải nghiệm tình yêu và hòa hợp. Bạn sẽ tìm thấy giá trị và ý nghĩa trong mối quan hệ của mình. Đó là một thời điểm đầy hy vọng và tươi sáng trong hành trình của bạn.\n\nTổng thể, trải nghiệm bài 3 lá này cho thấy một hành trình từ cân bằng và thích ứng đến sự phát triển nội tâm và tình yêu. Đó là một câu chuyện đầy sức mạnh và ý nghĩa, và tôi hy vọng bạn sẽ tìm thấy sự động viên và truyền cảm hứng từ đó.\n\n**Lời khuyên thực tế**\n\nĐể tận dụng trải nghiệm bài 3 lá này, tôi khuyên bạn nên tập trung vào sự cân bằng và thích ứng trong cuộc sống hàng ngày. Hãy ưu tiên và sử dụng thời gian một cách hiệu quả để đạt được mục tiêu của mình. Sau đó, hãy dành thời gian để kết nối với thiên nhiên và lắng nghe tiếng lòng của mình. Cuối cùng, hãy mở lòng và sẵn sàng đón nhận tình yêu và hòa hợp khi đó đến.\n\nHãy nhớ rằng, sự cân bằng và thích ứng không chỉ là về việc đạt được mục tiêu, mà còn là về việc giữ gìn sự cân bằng trong cuộc sống. Hãy giữ gìn sự cân bằng giữa công việc và cuộc sống cá nhân, giữa lý trí và cảm xúc.\n\n**Suy ngẫm sâu sắc**\n\nKhi xem xét trải nghiệm bài 3 lá này, bạn hãy tự hỏi mình:\n\n- Tôi đã học được gì từ quá khứ và có thể áp dụng nó vào hiện tại và tương lai không?\n- Tôi đang kết nối với thiên nhiên và lắng nghe tiếng lòng của mình như thế nào?\n- Tôi sẵn sàng đón nhận tình yêu và hòa hợp trong cuộc sống của mình không?\n\nHãy dành thời gian để suy ngẫm và tự hỏi những câu hỏi này. Đó là một cách tuyệt vời để bạn hiểu rõ hơn về bản thân và hành trình của mình.`;

// Test the parsing function
function parseMarkdownResponse(content: string) {
  try {
    // Extract sections based on markdown headers
    const interpretationMatch = content.match(/\*\*Giải thích tổng quan\*\*([\s\S]*?)(?=\*\*|$)/i);
    const adviceMatch = content.match(/\*\*Lời khuyên thực tế\*\*([\s\S]*?)(?=\*\*|$)/i);
    const meditationMatch = content.match(/\*\*Suy ngẫm sâu sắc\*\*([\s\S]*?)(?=\*\*|$)/i);

    console.log('Interpretation match:', interpretationMatch?.[1]?.trim());
    console.log('Advice match:', adviceMatch?.[1]?.trim());
    console.log('Meditation match:', meditationMatch?.[1]?.trim());

    if (interpretationMatch && adviceMatch && meditationMatch) {
      return {
        interpretation: interpretationMatch[1].trim().replace(/^\n+|\n+$/g, ''),
        advice: adviceMatch[1].trim().replace(/^\n+|\n+$/g, ''),
        meditation: meditationMatch[1].trim().replace(/^\n+|\n+$/g, '')
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing markdown response:', error);
    return null;
  }
}

// Test the function
const result = parseMarkdownResponse(testContent);
console.log('Final result:', result);