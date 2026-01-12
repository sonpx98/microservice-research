'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TarotCard, ReadingType } from "../types";
import { useState, useEffect } from "react";
import { generateAIReading, AIReadingResponse, getServerRemainingRequests } from "../actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  checkClientRateLimit, 
  consumeClientQuota, 
  getRemainingRequests,
  getDailyLimit,
  syncWithServerCount
} from "../utils/tarot-rate-limit";

interface ReadingInterpretationProps {
  cards: TarotCard[];
  readingType: ReadingType;
  onReset: () => void;
  onNewReading: () => void;
}

export function ReadingInterpretation({ cards, readingType, onReset, onNewReading }: ReadingInterpretationProps) {
  const [aiReading, setAiReading] = useState<AIReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number>(getDailyLimit());

  // Sync with server Redis count on mount
  useEffect(() => {
    async function syncCount() {
      try {
        const serverData = await getServerRemainingRequests();
        // Sync localStorage with Redis count (Redis is source of truth)
        syncWithServerCount(serverData.remaining);
        setRemaining(serverData.remaining);
      } catch {
        // Fall back to localStorage if server call fails
        setRemaining(getRemainingRequests());
      }
    }
    syncCount();
  }, []);

  const handleAIRequest = async () => {
    // Client-side rate limit check
    if (!checkClientRateLimit()) {
      setError(`Bạn đã sử dụng hết ${getDailyLimit()} lượt hôm nay. Quay lại vào ngày mai nhé! 🌙`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateAIReading(cards, readingType);
      
      // Check for server-side rate limit
      if (result.rateLimited) {
        setError(result.error || 'Đã hết lượt sử dụng hôm nay.');
        return;
      }
      
      // Success - consume client quota
      consumeClientQuota();
      setRemaining(getRemainingRequests());
      setAiReading(result);
    } catch (e) {
      console.error(e);
      setError("Không thể kết nối với AI lúc này. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Basic interpretation based on keywords logic (Fallback if no AI)
  const basicInterpretation = {
    overview: `Trải bài này mang năng lượng của ${cards[1].name}. Quá khứ với ${cards[0].name} đã dẫn lối bạn đến hiện tại, và ${cards[2].name} đang chờ đón ở tương lai.`,
    advice: `Hãy suy ngẫm về thông điệp của ${cards[2].name}. ${cards[2].meaning.upright}`
  };

  return (
    <div className="space-y-8 mt-8 w-full max-w-4xl mx-auto">
       <Card className="bg-slate-50 dark:bg-slate-900 border-purple-200 dark:border-purple-900 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📜 Giải Bài Chi Tiết
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Manual/Basic Interpretation */}
            <div className="space-y-4">
              <div>
                 <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Tổng Quan</h4>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                   {basicInterpretation.overview}
                 </p>
              </div>
              
               <div>
                 <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Lời Khuyên</h4>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                   {basicInterpretation.advice}
                 </p>
              </div>
            </div>
            
            <Separator className="my-6" />

            {/* AI Section */}
            {!aiReading && !loading && (
               <div className="text-center py-6 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-dashed border-purple-300">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Muốn giải bài sâu sắc hơn?
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-4">
                    Sử dụng AI để phân tích sự liên kết giữa các lá bài và hoàn cảnh cụ thể của bạn.
                  </p>

                  {/* Remaining requests badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      remaining > 0 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {remaining > 0 ? `✨ Còn ${remaining}/${getDailyLimit()} lượt hôm nay` : '🌙 Hết lượt hôm nay'}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleAIRequest}
                    disabled={remaining <= 0}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {remaining > 0 ? '✨ Giải Mã Bằng AI' : '🔒 Quay lại ngày mai'}
                  </Button>

                  {error && (
                    <p className="text-red-500 text-sm mt-4 animate-in fade-in">
                      {error}
                    </p>
                  )}
               </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                 <LoadingSpinner className="w-8 h-8 text-purple-600" />
                 <p className="text-purple-600 animate-pulse">Đang kết nối với vũ trụ...</p>
              </div>
            )}

            {aiReading && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900">
                     <h4 className="flex items-center gap-2 font-bold text-lg text-purple-700 dark:text-purple-300 mb-4">
                       🤖 Góc Nhìn Sâu Sắc
                     </h4>
                     <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                        <p className="whitespace-pre-line">{aiReading.interpretation}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900">
                        <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">🌟 Lời Khuyên</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{aiReading.advice}</p>
                     </div>
                     <div className="bg-pink-50 dark:bg-pink-900/20 p-5 rounded-xl border border-pink-100 dark:border-pink-900">
                        <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">🧘 Thiền Định</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{aiReading.meditation}</p>
                     </div>
                  </div>
               </div>
            )}

            <div className="flex justify-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
               <Button variant="outline" onClick={onReset}>Về Trang Chủ</Button>
               <Button onClick={onNewReading}>Trải Bài Mới</Button>
            </div>

          </CardContent>
       </Card>
    </div>
  );
}
