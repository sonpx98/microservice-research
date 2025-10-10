export type ReadingType = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  interpretation: {
    past: string;
    present: string;
    future: string;
  };
};

export const readingTypes: ReadingType[] = [
  {
    id: 'general',
    title: 'Tổng Quan',
    description: 'Cái nhìn tổng thể về cuộc sống và vận mệnh',
    icon: '🔮',
    color: 'purple',
    interpretation: {
      past: 'Quá khứ',
      present: 'Hiện tại', 
      future: 'Tương lai'
    }
  },
  {
    id: 'love',
    title: 'Tình Cảm',
    description: 'Tình yêu, mối quan hệ và cảm xúc',
    icon: '💕',
    color: 'pink',
    interpretation: {
      past: 'Tình cảm trong quá khứ',
      present: 'Tình trạng tình cảm hiện tại',
      future: 'Triển vọng tình cảm'
    }
  },
  {
    id: 'career',
    title: 'Công Việc',
    description: 'Sự nghiệp, công việc và phát triển nghề nghiệp',
    icon: '💼',
    color: 'blue',
    interpretation: {
      past: 'Sự nghiệp trong quá khứ',
      present: 'Tình hình công việc hiện tại',
      future: 'Cơ hội nghề nghiệp sắp tới'
    }
  },
  {
    id: 'money',
    title: 'Tiền Bạc',
    description: 'Tài chính, đầu tư và thịnh vượng',
    icon: '💰',
    color: 'green',
    interpretation: {
      past: 'Tình hình tài chính quá khứ',
      present: 'Trạng thái tài chính hiện tại',
      future: 'Triển vọng thu nhập và đầu tư'
    }
  },
  {
    id: 'challenges',
    title: 'Khó Khăn Sắp Tới',
    description: 'Những thách thức và cách vượt qua',
    icon: '⚡',
    color: 'red',
    interpretation: {
      past: 'Bài học từ khó khăn quá khứ',
      present: 'Thách thức hiện tại',
      future: 'Khó khăn sắp tới và cách đối phó'
    }
  },
  {
    id: 'opportunities',
    title: 'Cơ Hội Thuận Lợi',
    description: 'Những điều tích cực và cơ hội sắp đến',
    icon: '🌟',
    color: 'yellow',
    interpretation: {
      past: 'Cơ hội đã bỏ lỡ',
      present: 'Điều thuận lợi hiện tại',
      future: 'Cơ hội vàng sắp tới'
    }
  }
];