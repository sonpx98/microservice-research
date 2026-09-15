'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TarotCard, ReadingType } from "../types";
import { ScrollText } from 'lucide-react';

interface ReadingInterpretationProps {
  cards: TarotCard[];
  readingType: ReadingType;
  onReset: () => void;
  onNewReading: () => void;
}

export function ReadingInterpretation({ cards, onReset, onNewReading }: ReadingInterpretationProps) {
  const interpretation = {
    overview: `Trải bài này mang năng lượng của ${cards[1].name}. Quá khứ với ${cards[0].name} đã dẫn lối bạn đến hiện tại, và ${cards[2].name} đang chờ đón ở tương lai.`,
    advice: `Hãy suy ngẫm về thông điệp của ${cards[2].name}. ${cards[2].meaning.upright}`
  };

  return (
    <div className="space-y-8 mt-8 w-full max-w-4xl mx-auto">
       <Card className="bg-slate-50 dark:bg-slate-900 border-purple-200 dark:border-purple-900 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5" /> Giải Bài Chi Tiết
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                 <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Tổng Quan</h4>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                   {interpretation.overview}
                 </p>
              </div>
               <div>
                 <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Lời Khuyên</h4>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                   {interpretation.advice}
                 </p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
               <Button variant="outline" onClick={onReset}>Về Trang Chủ</Button>
               <Button onClick={onNewReading}>Trải Bài Mới</Button>
            </div>
          </CardContent>
       </Card>
    </div>
  );
}
