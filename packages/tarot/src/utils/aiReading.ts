import type { TarotCard } from '../data/tarotCards';
import type { ReadingType } from '../data/readingTypes';

// Groq API - Free tier với Llama 3.1
const GROQ_API_URL = import.meta.env.DEV 
  ? '/api/groq/openai/v1/chat/completions'  // Use proxy in development
  : 'https://api.groq.com/openai/v1/chat/completions'; // Direct in production

export interface AIReadingResponse {
  interpretation: string;
  advice: string;
  meditation: string;
}

// Create prompt based on reading type
function createContextualPrompt(
  cards: [TarotCard, TarotCard, TarotCard], 
  readingType: ReadingType
): string {
  const contexts = {
    general: 'vận mệnh và cuộc sống tổng quát',
    love: 'tình cảm, tình yêu và mối quan hệ',
    career: 'sự nghiệp, công việc và phát triển nghề nghiệp',
    money: 'tài chính, tiền bạc và thịnh vượng',
    challenges: 'những thách thức và khó khăn sắp tới',
    opportunities: 'những cơ hội và điều thuận lợi sắp đến'
  };

  const context = contexts[readingType.id as keyof typeof contexts] || contexts.general;

  return `Bạn là một chuyên gia giải tarot chuyên nghiệp với nhiều năm kinh nghiệm. 
Hãy giải thích trải bài tarot 3 lá trong ngữ cảnh ${context}.

Thông tin trải bài:
${readingType.interpretation.past}: ${cards[0].name} - ${cards[0].meaning.upright}
${readingType.interpretation.present}: ${cards[1].name} - ${cards[1].meaning.upright}
${readingType.interpretation.future}: ${cards[2].name} - ${cards[2].meaning.upright}

Chủ đề tập trung: ${readingType.title} (${readingType.description})

Hãy trả về kết quả theo định dạng markdown sau:

**interpretation**
[Giải thích chi tiết hành trình qua 3 thời kỳ trong ngữ cảnh ${context}, kết nối các lá bài thành một câu chuyện mạch lạc, 150-200 từ]

**advice**
[Lời khuyên cụ thể và thực tế để áp dụng vào cuộc sống, phù hợp với chủ đề ${readingType.title}, 100-150 từ]

**meditation**
[Những suy ngẫm sâu sắc về bài học cuộc sống và ý nghĩa tinh thần, 100-120 từ]`;
}

// Parse markdown format response from AI
function parseMarkdownResponse(content: string): AIReadingResponse | null {
  try {
    // Extract sections based on markdown headers - more flexible regex
    const interpretationMatch = content.match(/interpretation\s*([\s\S]*?)(?=\*\*[^*]+\*\*|$)/i);
    const adviceMatch = content.match(/advice\s*([\s\S]*?)(?=\*\*[^*]+\*\*|$)/i);
    const meditationMatch = content.match(/meditation\s*([\s\S]*?)(?=\*\*[^*]+\*\*|$)/i);
    if (interpretationMatch && adviceMatch && meditationMatch) {
      return {
        interpretation: interpretationMatch[1].trim().replace(/^\n+|\n+$/g, ''),
        advice: adviceMatch[1].trim().replace(/^\n+|\n+$/g, ''),
        meditation: meditationMatch[1].trim().replace(/^\n+|\n+$/g, '')
      };
    }

    // Fallback: try to split by any bold headers
    const boldHeaderPattern = /\*\*[^*]+\*\*/g;
    const headers = content.match(boldHeaderPattern);
    const sections = content.split(boldHeaderPattern);
    
    if (sections.length >= 4 && headers && headers.length >= 3) {
      // Find sections that contain the keywords
      let interpretation = '', advice = '', meditation = '';
      
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase();
        const section = sections[i + 1]?.trim() || '';
        
        if (header.includes('giải thích') || header.includes('tổng quan') || header.includes('interpretation')) {
          interpretation = section;
        } else if (header.includes('lời khuyên') || header.includes('khuyên') || header.includes('advice')) {
          advice = section;
        } else if (header.includes('suy ngẫm') || header.includes('ngẫm') || header.includes('meditation')) {
          meditation = section;
        }
      }
      
      if (interpretation && advice && meditation) {
        return { interpretation, advice, meditation };
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing markdown response:', error);
    return null;
  }
}

export async function generateAIReading(
  cards: [TarotCard, TarotCard, TarotCard],
  apiKey?: string,
  readingType?: ReadingType
): Promise<AIReadingResponse | null> {
  // Ưu tiên sử dụng API key truyền vào, nếu không có thì lấy từ environment
  const finalApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY;
  
  if (!finalApiKey) {
    return null; // Fallback to local generation if no API key
  }

  try {
    const prompt = readingType 
      ? createContextualPrompt(cards, readingType)
      : `Bạn là một chuyên gia tarot chuyên nghiệp với nhiều năm kinh nghiệm. Hãy giải thích trải bài 3 lá sau một cách sâu sắc, tình cảm và truyền cảm hứng:

**Quá khứ**: ${cards[0].name} - ${cards[0].meaning.upright}
**Hiện tại**: ${cards[1].name} - ${cards[1].meaning.upright} 
**Tương lai**: ${cards[2].name} - ${cards[2].meaning.upright}

Hãy trả về kết quả theo định dạng markdown sau:

interpretation
[Giải thích chi tiết hành trình qua 3 thời kỳ, kết nối các lá bài thành một câu chuyện mạch lạc, 150-200 từ]

advice
[Lời khuyên cụ thể và thực tế để áp dụng vào cuộc sống, 100-150 từ]

meditation
[Những suy ngẫm sâu sắc về bài học cuộc sống và ý nghĩa tinh thần, 100-120 từ]`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Bạn là chuyên gia tarot chuyên nghiệp. Luôn trả về ONLY JSON object thuần túy, không có markdown hay text khác.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error details:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Log usage info
    console.log('📊 Groq Usage:', {
        prompt_tokens: data.usage?.prompt_tokens,
        completion_tokens: data.usage?.completion_tokens,
        total_tokens: data.usage?.total_tokens
    });

    if (content) {
      // Try parsing as JSON first
      try {
        return JSON.parse(content.trim());
      } catch {
        // If not JSON, try to find JSON block
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch {
            // If JSON parsing fails, parse markdown format
            return parseMarkdownResponse(content);
          }
        } else {
          // Parse as markdown format
          return parseMarkdownResponse(content);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('AI Reading generation failed:', error);
    return null;
  }
}

// Gemini Flash API (Google) - Alternative free option
export async function generateGeminiReading(
  cards: [TarotCard, TarotCard, TarotCard],
  apiKey?: string
): Promise<AIReadingResponse | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const prompt = `CHÍNH XÁC: Chỉ trả về JSON object thuần túy, không markdown, không text khác.

Giải thích trải bài tarot 3 lá:
Quá khứ: ${cards[0].name} - ${cards[0].meaning.upright}
Hiện tại: ${cards[1].name} - ${cards[1].meaning.upright}
Tương lai: ${cards[2].name} - ${cards[2].meaning.upright}

Format JSON chính xác:
{
  "interpretation": "Giải thích tổng quan hành trình (tiếng Việt, 150-200 từ)",
  "advice": "Lời khuyên thực tế (tiếng Việt, 100-150 từ)",
  "meditation": "Suy ngẫm sâu sắc (tiếng Việt, 100-120 từ)"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      // Try parsing as JSON first
      try {
        return JSON.parse(content.trim());
      } catch {
        // If not JSON, try to find JSON block
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch {
            // If JSON parsing fails, parse markdown format
            return parseMarkdownResponse(content);
          }
        } else {
          // Parse as markdown format
          return parseMarkdownResponse(content);
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini Reading generation failed:', error);
    return null;
  }
}