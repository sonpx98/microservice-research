export interface TarotCard {
  id: number;
  name: string;
  suit: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  description: string;
  keywords: string[];
  imageUrl?: string; // Optional cho bây giờ
}

export const tarotCards: TarotCard[] = [
  // Major Arcana
  {
    id: 0,
    name: "The Fool",
    suit: "Major Arcana",
    meaning: {
      upright: "Khởi đầu mới, tự do, tiềm năng vô hạn",
      reversed: "Liều lĩnh, thiếu kế hoạch, hành động bốc đồng"
    },
    description: "Kẻ ngốc đại diện cho khởi đầu của hành trình tâm linh và những khả năng vô hạn.",
    keywords: ["khởi đầu", "tự do", "tiềm năng", "phiêu lưu"]
  },
  {
    id: 1,
    name: "The Magician",
    suit: "Major Arcana",
    meaning: {
      upright: "Biểu hiện, nguồn lực, sức mạnh, kỹ năng",
      reversed: "Thao túng, tài năng bị lãng phí, thiếu tập trung"
    },
    description: "Nhà ảo thuật thể hiện khả năng biến ý tưởng thành hiện thực.",
    keywords: ["biểu hiện", "kỹ năng", "sức mạnh", "tập trung"]
  },
  {
    id: 2,
    name: "The High Priestess",
    suit: "Major Arcana",
    meaning: {
      upright: "Trực giác, tiềm thức, kiến thức bí mật",
      reversed: "Bí mật bị che giấu, thiếu trung tâm nội tại"
    },
    description: "Nữ tu trưởng đại diện cho trực giác và kiến thức sâu sắc từ tiềm thức.",
    keywords: ["trực giác", "bí ẩn", "tiềm thức", "nữ tính"]
  },
  {
    id: 3,
    name: "The Empress",
    suit: "Major Arcana",
    meaning: {
      upright: "Sinh sản, nữ tính, sự phong phú, thiên nhiên",
      reversed: "Phụ thuộc, tình mẫu tử thái quá, sự sáng tạo bị cản trở"
    },
    description: "Hoàng hậu tượng trưng cho sự phong phú, sáng tạo và nuôi dưỡng.",
    keywords: ["sáng tạo", "phong phú", "mẹ", "thiên nhiên"]
  },
  {
    id: 4,
    name: "The Emperor",
    suit: "Major Arcana",
    meaning: {
      upright: "Thẩm quyền, cấu trúc, kiểm soát, cha",
      reversed: "Bạo chúa, cứng nhắc, thiếu kỷ luật"
    },
    description: "Hoàng đế đại diện cho thẩm quyền, lãnh đạo và cấu trúc.",
    keywords: ["lãnh đạo", "thẩm quyền", "cấu trúc", "cha"]
  },
  {
    id: 5,
    name: "The Hierophant",
    suit: "Major Arcana",
    meaning: {
      upright: "Tâm linh, truyền thống, tuân thủ, tôn giáo",
      reversed: "Nổi loạn, bất tuân, tự do cá nhân"
    },
    description: "Giáo hoàng thể hiện truyền thống, tâm linh và hướng dẫn.",
    keywords: ["truyền thống", "tâm linh", "hướng dẫn", "tôn giáo"]
  },
  {
    id: 6,
    name: "The Lovers",
    suit: "Major Arcana",
    meaning: {
      upright: "Tình yêu, hòa hợp, mối quan hệ, giá trị",
      reversed: "Bất hòa, thiếu cân bằng, giá trị sai lệch"
    },
    description: "Những người yêu nhau đại diện cho tình yêu, sự lựa chọn và mối quan hệ.",
    keywords: ["tình yêu", "lựa chọn", "mối quan hệ", "hòa hợp"]
  },
  {
    id: 7,
    name: "The Chariot",
    suit: "Major Arcana",
    meaning: {
      upright: "Kiểm soát, ý chí mạnh mẽ, thành công, quyết tâm",
      reversed: "Thiếu kiểm soát, thiếu định hướng, hung hăng"
    },
    description: "Xe ngựa thể hiện ý chí, quyết tâm và việc vượt qua thử thách.",
    keywords: ["ý chí", "kiểm soát", "thành công", "quyết tâm"]
  },
  {
    id: 8,
    name: "Strength",
    suit: "Major Arcana",
    meaning: {
      upright: "Sức mạnh nội tại, can đảm, kiên nhẫn, kiểm soát",
      reversed: "Tự nghi ngờ, thiếu tự tin, sức mạnh thô"
    },
    description: "Sức mạnh đại diện cho can đảm nội tại và khả năng vượt qua khó khăn.",
    keywords: ["can đảm", "kiên nhẫn", "sức mạnh", "tự tin"]
  },
  {
    id: 9,
    name: "The Hermit",
    suit: "Major Arcana",
    meaning: {
      upright: "Tìm kiếm tâm hồn, hướng dẫn nội tại, nội tâm",
      reversed: "Cô lập, cô đơn, mất phương hướng"
    },
    description: "Ẩn sĩ thể hiện việc tìm kiếm sự hiểu biết sâu sắc và hướng dẫn nội tại.",
    keywords: ["nội tâm", "tìm kiếm", "hướng dẫn", "một mình"]
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    suit: "Major Arcana",
    meaning: {
      upright: "Vận may, chu kỳ, định mệnh, chuyển biến",
      reversed: "Vận rui, thiếu kiểm soát, chu kỳ xấu"
    },
    description: "Bánh xe vận mệnh đại diện cho sự thay đổi và chu kỳ của cuộc sống.",
    keywords: ["vận mệnh", "thay đổi", "chu kỳ", "cơ hội"]
  },
  {
    id: 11,
    name: "Justice",
    suit: "Major Arcana",
    meaning: {
      upright: "Công lý, công bằng, sự thật, luật pháp",
      reversed: "Bất công, thiếu trách nhiệm, bất trung thực"
    },
    description: "Công lý thể hiện sự cân bằng, công bằng và hậu quả của hành động.",
    keywords: ["công lý", "cân bằng", "sự thật", "luật pháp"]
  },
  {
    id: 12,
    name: "The Hanged Man",
    suit: "Major Arcana",
    meaning: {
      upright: "Từ bỏ, thay đổi góc nhìn, chờ đợi",
      reversed: "Trì hoãn, kháng cự thay đổi, vô ích"
    },
    description: "Người bị treo ngược đại diện cho việc hy sinh và nhìn mọi việc từ góc độ mới.",
    keywords: ["hy sinh", "chờ đợi", "góc nhìn mới", "từ bỏ"]
  },
  {
    id: 13,
    name: "Death",
    suit: "Major Arcana",
    meaning: {
      upright: "Kết thúc, chuyển đổi, thay đổi, tái sinh",
      reversed: "Kháng cự thay đổi, trì trệ, suy tàn"
    },
    description: "Cái chết đại diện cho sự kết thúc và khởi đầu mới, không phải cái chết thật sự.",
    keywords: ["chuyển đổi", "kết thúc", "tái sinh", "thay đổi"]
  },
  {
    id: 14,
    name: "Temperance",
    suit: "Major Arcana",
    meaning: {
      upright: "Cân bằng, điều độ, kiên nhẫn, mục đích",
      reversed: "Mất cân bằng, thái quá, thiếu mục đích"
    },
    description: "Tiết độ thể hiện sự cân bằng và hòa hợp trong cuộc sống.",
    keywords: ["cân bằng", "hòa hợp", "kiên nhẫn", "điều độ"]
  },
  {
    id: 15,
    name: "The Devil",
    suit: "Major Arcana",
    meaning: {
      upright: "Cám dỗ, ràng buộc, tham vọng vật chất",
      reversed: "Giải phóng, phá vỡ xiềng xích, tự do"
    },
    description: "Ác quỷ đại diện cho cám dỗ và những ràng buộc tự tạo ra.",
    keywords: ["cám dỗ", "ràng buộc", "tham vọng", "nghiện"]
  },
  {
    id: 16,
    name: "The Tower",
    suit: "Major Arcana",
    meaning: {
      upright: "Biến động đột ngột, thức tỉnh, phá hủy",
      reversed: "Tránh thảm họa, sợ thay đổi, ảo tưởng"
    },
    description: "Tháp đại diện cho sự phá hủy đột ngột và thức tỉnh.",
    keywords: ["phá hủy", "thức tỉnh", "thay đổi", "khủng hoảng"]
  },
  {
    id: 17,
    name: "The Star",
    suit: "Major Arcana",
    meaning: {
      upright: "Hy vọng, tâm linh, gia đình, hướng dẫn",
      reversed: "Thiếu đức tin, tuyệt vọng, mất phương hướng"
    },
    description: "Ngôi sao thể hiện hy vọng, niềm tin và hướng dẫn tinh thần.",
    keywords: ["hy vọng", "niềm tin", "hướng dẫn", "tâm linh"]
  },
  {
    id: 18,
    name: "The Moon",
    suit: "Major Arcana",
    meaning: {
      upright: "Ảo tưởng, trực giác, tiềm thức, sợ hãi",
      reversed: "Giải phóng sợ hãi, nhầm lẫn, ảo tưởng"
    },
    description: "Mặt trăng đại diện cho ảo tưởng, trực giác và những điều không rõ ràng.",
    keywords: ["ảo tưởng", "trực giác", "sợ hãi", "bí ẩn"]
  },
  {
    id: 19,
    name: "The Sun",
    suit: "Major Arcana",
    meaning: {
      upright: "Niềm vui, thành công, tích cực, sinh lực",
      reversed: "Tạm thời u ám, thiếu thành công, bi quan"
    },
    description: "Mặt trời thể hiện niềm vui, thành công và năng lượng tích cực.",
    keywords: ["niềm vui", "thành công", "năng lượng", "tích cực"]
  },
  {
    id: 20,
    name: "Judgement",
    suit: "Major Arcana",
    meaning: {
      upright: "Phán xét, tái sinh, tha thứ, gọi hồn",
      reversed: "Tự nghi ngờ, thiếu tha thứ, phán xét khắc nghiệt"
    },
    description: "Phán xét đại diện cho sự tái sinh và đánh giá cuộc sống.",
    keywords: ["phán xét", "tái sinh", "tha thứ", "thức tỉnh"]
  },
  {
    id: 21,
    name: "The World",
    suit: "Major Arcana",
    meaning: {
      upright: "Hoàn thành, thành tựu, du hành, thành công",
      reversed: "Thiếu đóng khung, trì hoãn, mất tập trung"
    },
    description: "Thế giới đại diện cho sự hoàn thành và thành tựu cuối cùng.",
    keywords: ["hoàn thành", "thành công", "chu kỳ", "thành tựu"]
  },
  
  // Minor Arcana - Cups (tất cả 14 lá)
  {
    id: 22,
    name: "Ace of Cups",
    suit: "Cups",
    meaning: {
      upright: "Tình yêu mới, cảm xúc, trực giác, tâm linh",
      reversed: "Cảm xúc bị dập tắt, tình yêu đơn phương, rỗng tuếch"
    },
    description: "Khởi đầu mới trong tình yêu và cảm xúc.",
    keywords: ["tình yêu", "cảm xúc", "khởi đầu", "trực giác"]
  },
  {
    id: 23,
    name: "Two of Cups",
    suit: "Cups",
    meaning: {
      upright: "Mối quan hệ, đối tác, tình yêu, sự kết nối",
      reversed: "Mất cân bằng, chia ly, bất hòa"
    },
    description: "Mối quan hệ hài hòa và sự kết nối sâu sắc.",
    keywords: ["đối tác", "kết nối", "hài hòa", "tình yêu"]
  },
  {
    id: 24,
    name: "Three of Cups",
    suit: "Cups",
    meaning: {
      upright: "Bạn bè, cộng đồng, kỷ niệm, ăn mừng",
      reversed: "Cô lập, xung đột trong nhóm, thái quá"
    },
    description: "Niềm vui chia sẻ với bạn bè và cộng đồng.",
    keywords: ["bạn bè", "ăn mừng", "cộng đồng", "niềm vui"]
  },
  {
    id: 25,
    name: "Four of Cups",
    suit: "Cups",
    meaning: {
      upright: "Thiền định, suy tư, nhàm chán, cơ hội bị bỏ lỡ",
      reversed: "Động lực mới, tỉnh táo, nắm bắt cơ hội"
    },
    description: "Thời gian suy ngẫm và đánh giá lại cuộc sống.",
    keywords: ["thiền định", "suy tư", "nhàm chán", "cơ hội"]
  },
  {
    id: 26,
    name: "Five of Cups",
    suit: "Cups",
    meaning: {
      upright: "Mất mát, buồn bã, hối tiếc, thất vọng",
      reversed: "Chấp nhận, tha thứ, phục hồi, hy vọng"
    },
    description: "Đau buồn và mất mát, nhưng vẫn còn hy vọng.",
    keywords: ["mất mát", "buồn bã", "hối tiếc", "phục hồi"]
  },
  {
    id: 27,
    name: "Six of Cups",
    suit: "Cups",
    meaning: {
      upright: "Hoài niệm, tuổi thơ, quá khứ, sự ngây thơ",
      reversed: "Sống trong quá khứ, thiếu tiến bộ, ảo tưởng"
    },
    description: "Kỷ niệm đẹp từ quá khứ và sự ngây thơ.",
    keywords: ["hoài niệm", "tuổi thơ", "quá khứ", "ngây thơ"]
  },
  {
    id: 28,
    name: "Seven of Cups",
    suit: "Cups",
    meaning: {
      upright: "Ảo tưởng, lựa chọn, ước mơ, thiếu tập trung",
      reversed: "Quyết tâm, tập trung, làm rõ mục tiêu"
    },
    description: "Nhiều lựa chọn nhưng cần sự tập trung.",
    keywords: ["ảo tưởng", "lựa chọn", "ước mơ", "tập trung"]
  },
  {
    id: 29,
    name: "Eight of Cups",
    suit: "Cups",
    meaning: {
      upright: "Từ bỏ, tìm kiếm, hành trình tâm linh",
      reversed: "Sợ thay đổi, trì hoãn, trốn tránh"
    },
    description: "Rời bỏ quá khứ để tìm kiếm ý nghĩa sâu sắc hơn.",
    keywords: ["từ bỏ", "tìm kiếm", "hành trình", "thay đổi"]
  },
  {
    id: 30,
    name: "Nine of Cups",
    suit: "Cups",
    meaning: {
      upright: "Hài lòng, thành tựu, niềm vui, hạnh phúc",
      reversed: "Tự mãn, thái quá, hạnh phúc giả tạo"
    },
    description: "Sự hài lòng và thành tựu cá nhân.",
    keywords: ["hài lòng", "thành tựu", "niềm vui", "hạnh phúc"]
  },
  {
    id: 31,
    name: "Ten of Cups",
    suit: "Cups",
    meaning: {
      upright: "Hạnh phúc gia đình, hòa hợp, thành tựu cảm xúc",
      reversed: "Gia đình tan vỡ, giá trị sai lệch, bất hòa"
    },
    description: "Hạnh phúc và hòa hợp trong gia đình.",
    keywords: ["gia đình", "hòa hợp", "hạnh phúc", "thành tựu"]
  },
  {
    id: 32,
    name: "Page of Cups",
    suit: "Cups",
    meaning: {
      upright: "Thông điệp tình yêu, sáng tạo, trực giác, học hỏi",
      reversed: "Cảm xúc bất ổn, thiếu chín chắn, ảo tưởng"
    },
    description: "Tin nhắn mới về tình yêu hoặc cơ hội sáng tạo.",
    keywords: ["thông điệp", "sáng tạo", "trực giác", "học hỏi"]
  },
  {
    id: 33,
    name: "Knight of Cups",
    suit: "Cups",
    meaning: {
      upright: "Lãng mạn, theo đuổi ước mơ, cảm xúc, nghệ thuật",
      reversed: "Không thực tế, thay đổi thất thường, lãng mạn hóa"
    },
    description: "Người theo đuổi ước mơ với trái tim.",
    keywords: ["lãng mạn", "ước mơ", "cảm xúc", "nghệ thuật"]
  },
  {
    id: 34,
    name: "Queen of Cups",
    suit: "Cups",
    meaning: {
      upright: "Trực giác, cảm thông, chăm sóc, tâm linh",
      reversed: "Cảm xúc bất ổn, phụ thuộc, thiếu ranh giới"
    },
    description: "Người mẹ nhân từ với trực giác mạnh mẽ.",
    keywords: ["trực giác", "cảm thông", "chăm sóc", "tâm linh"]
  },
  {
    id: 35,
    name: "King of Cups",
    suit: "Cups",
    meaning: {
      upright: "Cân bằng cảm xúc, từ bi, lãnh đạo bằng trái tim",
      reversed: "Thao túng cảm xúc, thiếu kiểm soát, tâm trạng thất thường"
    },
    description: "Lãnh đạo với trí tuệ cảm xúc và lòng từ bi.",
    keywords: ["cân bằng", "từ bi", "lãnh đạo", "trái tim"]
  },
  
  // Minor Arcana - Wands (tất cả 14 lá)
  {
    id: 36,
    name: "Ace of Wands",
    suit: "Wands",
    meaning: {
      upright: "Cảm hứng, sức sáng tạo, khởi đầu mới, tiềm năng",
      reversed: "Thiếu năng lượng, trì hoãn, cảm hứng bị chặn"
    },
    description: "Khởi đầu mới đầy cảm hứng và sáng tạo.",
    keywords: ["cảm hứng", "sáng tạo", "năng lượng", "khởi đầu"]
  },
  {
    id: 37,
    name: "Two of Wands",
    suit: "Wands",
    meaning: {
      upright: "Kế hoạch tương lai, quyền lực cá nhân, quyết định",
      reversed: "Thiếu kế hoạch, sợ hãi, thiếu kiểm soát"
    },
    description: "Lập kế hoạch và nhìn về tương lai.",
    keywords: ["kế hoạch", "tương lai", "quyền lực", "quyết định"]
  },
  {
    id: 38,
    name: "Three of Wands",
    suit: "Wands",
    meaning: {
      upright: "Mở rộng, thương mại, hợp tác, tầm nhìn xa",
      reversed: "Thiếu tầm nhìn, trở ngại, kế hoạch thất bại"
    },
    description: "Mở rộng tầm nhìn và cơ hội kinh doanh.",
    keywords: ["mở rộng", "thương mại", "hợp tác", "tầm nhìn"]
  },
  {
    id: 39,
    name: "Four of Wands",
    suit: "Wands",
    meaning: {
      upright: "Kỷ niệm, ổn định, hòa hợp, thành tựu",
      reversed: "Thiếu hỗ trợ, bất ổn, kỷ niệm bị trì hoãn"
    },
    description: "Thành tựu và kỷ niệm với những người thân yêu.",
    keywords: ["kỷ niệm", "ổn định", "hòa hợp", "thành tựu"]
  },
  {
    id: 40,
    name: "Five of Wands",
    suit: "Wands",
    meaning: {
      upright: "Xung đột, cạnh tranh, thử thách, bất đồng",
      reversed: "Tránh xung đột, hợp tác, giải quyết bất đồng"
    },
    description: "Xung đột và cạnh tranh cần được giải quyết.",
    keywords: ["xung đột", "cạnh tranh", "thử thách", "bất đồng"]
  },
  {
    id: 41,
    name: "Six of Wands",
    suit: "Wands",
    meaning: {
      upright: "Chiến thắng, công nhận, thành công, tự tin",
      reversed: "Thất bại, thiếu công nhận, tự nghi ngờ"
    },
    description: "Chiến thắng và được công nhận.",
    keywords: ["chiến thắng", "công nhận", "thành công", "tự tin"]
  },
  {
    id: 42,
    name: "Seven of Wands",
    suit: "Wands",
    meaning: {
      upright: "Bảo vệ, đứng vững, thách thức, kiên trì",
      reversed: "Từ bỏ, áp lực quá lớn, thiếu tự tin"
    },
    description: "Bảo vệ vị trí và niềm tin của bạn.",
    keywords: ["bảo vệ", "đứng vững", "thách thức", "kiên trì"]
  },
  {
    id: 43,
    name: "Eight of Wands",
    suit: "Wands",
    meaning: {
      upright: "Tốc độ, tiến triển nhanh, tin nhắn, hành động",
      reversed: "Chậm trễ, thiếu kiên nhẫn, cản trở"
    },
    description: "Mọi thứ di chuyển nhanh chóng.",
    keywords: ["tốc độ", "tiến triển", "tin nhắn", "hành động"]
  },
  {
    id: 44,
    name: "Nine of Wands",
    suit: "Wands",
    meaning: {
      upright: "Kiên trì, bền bỉ, gần đích, cảnh giác",
      reversed: "Kiệt sức, từ bỏ, thiếu kiên trì"
    },
    description: "Gần đến đích nhưng cần kiên trì.",
    keywords: ["kiên trì", "bền bỉ", "gần đích", "cảnh giác"]
  },
  {
    id: 45,
    name: "Ten of Wands",
    suit: "Wands",
    meaning: {
      upright: "Gánh nặng, trách nhiệm, quá tải, hoàn thành",
      reversed: "Giải tỏa gánh nặng, ủy thác, nghỉ ngơi"
    },
    description: "Gánh nặng trách nhiệm nhưng gần hoàn thành.",
    keywords: ["gánh nặng", "trách nhiệm", "quá tải", "hoàn thành"]
  },
  {
    id: 46,
    name: "Page of Wands",
    suit: "Wands",
    meaning: {
      upright: "Tin nhắn tốt, nhiệt huyết, học hỏi, cơ hội mới",
      reversed: "Thiếu định hướng, tin xấu, thiếu cam kết"
    },
    description: "Tin nhắn mới về cơ hội và dự án.",
    keywords: ["tin nhắn", "nhiệt huyết", "học hỏi", "cơ hội"]
  },
  {
    id: 47,
    name: "Knight of Wands",
    suit: "Wands",
    meaning: {
      upright: "Hành động, phiêu lưu, bốc đồng, năng lượng",
      reversed: "Thiếu định hướng, bốc đồng, không kiên nhẫn"
    },
    description: "Hành động nhanh chóng và đầy năng lượng.",
    keywords: ["hành động", "phiêu lưu", "bốc đồng", "năng lượng"]
  },
  {
    id: 48,
    name: "Queen of Wands",
    suit: "Wands",
    meaning: {
      upright: "Tự tin, quyết đoán, ấm áp, độc lập",
      reversed: "Ghen tị, thiếu tự tin, độc đoán"
    },
    description: "Người lãnh đạo tự tin và ấm áp.",
    keywords: ["tự tin", "quyết đoán", "ấm áp", "độc lập"]
  },
  {
    id: 49,
    name: "King of Wands",
    suit: "Wands",
    meaning: {
      upright: "Lãnh đạo, tầm nhìn, doanh nhân, truyền cảm hứng",
      reversed: "Độc đoán, thiếu tầm nhìn, bốc đồng"
    },
    description: "Lãnh đạo tự nhiên với tầm nhìn xa.",
    keywords: ["lãnh đạo", "tầm nhìn", "doanh nhân", "cảm hứng"]
  },
  
  // Minor Arcana - Swords (tất cả 14 lá)
  {
    id: 50,
    name: "Ace of Swords",
    suit: "Swords",
    meaning: {
      upright: "Khả năng tư duy, sự thật, sức mạnh tinh thần",
      reversed: "Nhầm lẫn, tư duy rối loạn, thiếu tập trung"
    },
    description: "Khởi đầu mới trong tư duy và trí tuệ.",
    keywords: ["trí tuệ", "sự thật", "tư duy", "rõ ràng"]
  },
  {
    id: 51,
    name: "Two of Swords",
    suit: "Swords",
    meaning: {
      upright: "Quyết định khó khăn, bế tắc, cân bằng",
      reversed: "Nhầm lẫn, thông tin sai, quyết định tồi"
    },
    description: "Đối mặt với quyết định khó khăn.",
    keywords: ["quyết định", "bế tắc", "cân bằng", "khó khăn"]
  },
  {
    id: 52,
    name: "Three of Swords",
    suit: "Swords",
    meaning: {
      upright: "Đau lòng, chia ly, mất mát, buồn bã",
      reversed: "Phục hồi, tha thứ, chữa lành"
    },
    description: "Đau lòng và mất mát cần thời gian chữa lành.",
    keywords: ["đau lòng", "chia ly", "mất mát", "chữa lành"]
  },
  {
    id: 53,
    name: "Four of Swords",
    suit: "Swords",
    meaning: {
      upright: "Nghỉ ngơi, thiền định, phục hồi, bình tĩnh",
      reversed: "Căng thẳng, thiếu nghỉ ngơi, bất an"
    },
    description: "Thời gian nghỉ ngơi và phục hồi.",
    keywords: ["nghỉ ngơi", "thiền định", "phục hồi", "bình tĩnh"]
  },
  {
    id: 54,
    name: "Five of Swords",
    suit: "Swords",
    meaning: {
      upright: "Xung đột, thất bại, tổn thất, bất công",
      reversed: "Tha thứ, hòa giải, học từ thất bại"
    },
    description: "Xung đột và thất bại cần được giải quyết.",
    keywords: ["xung đột", "thất bại", "tổn thất", "hòa giải"]
  },
  {
    id: 55,
    name: "Six of Swords",
    suit: "Swords",
    meaning: {
      upright: "Chuyển đổi, di chuyển, hướng dẫn, bình yên",
      reversed: "Kháng cự thay đổi, cảm giác mắc kẹt"
    },
    description: "Chuyển đổi sang giai đoạn bình yên hơn.",
    keywords: ["chuyển đổi", "di chuyển", "hướng dẫn", "bình yên"]
  },
  {
    id: 56,
    name: "Seven of Swords",
    suit: "Swords",
    meaning: {
      upright: "Lừa dối, trộm cắp, chiến thuật, một mình",
      reversed: "Thú nhận, trả lại, hợp tác"
    },
    description: "Hành động bí mật hoặc chiến thuật.",
    keywords: ["lừa dối", "chiến thuật", "bí mật", "một mình"]
  },
  {
    id: 57,
    name: "Eight of Swords",
    suit: "Swords",
    meaning: {
      upright: "Bị mắc kẹt, hạn chế, nạn nhân, sợ hãi",
      reversed: "Giải phóng, tự do, vượt qua hạn chế"
    },
    description: "Cảm giác bị mắc kẹt và hạn chế.",
    keywords: ["mắc kẹt", "hạn chế", "sợ hãi", "giải phóng"]
  },
  {
    id: 58,
    name: "Nine of Swords",
    suit: "Swords",
    meaning: {
      upright: "Lo lắng, ác mộng, sợ hãi, căng thẳng",
      reversed: "Hy vọng, phục hồi, vượt qua sợ hãi"
    },
    description: "Lo lắng và sợ hãi trong đêm tối.",
    keywords: ["lo lắng", "ác mộng", "sợ hãi", "hy vọng"]
  },
  {
    id: 59,
    name: "Ten of Swords",
    suit: "Swords",
    meaning: {
      upright: "Kết thúc đau đớn, phản bội, đáy vực",
      reversed: "Phục hồi, khởi đầu mới, học từ thất bại"
    },
    description: "Kết thúc đau đớn nhưng cũng là khởi đầu mới.",
    keywords: ["kết thúc", "đau đớn", "phản bội", "khởi đầu"]
  },
  {
    id: 60,
    name: "Page of Swords",
    suit: "Swords",
    meaning: {
      upright: "Tin nhắn, tò mò, học hỏi, giao tiếp",
      reversed: "Tin đồn, thiếu tập trung, tin xấu"
    },
    description: "Tin nhắn mới và sự tò mò học hỏi.",
    keywords: ["tin nhắn", "tò mò", "học hỏi", "giao tiếp"]
  },
  {
    id: 61,
    name: "Knight of Swords",
    suit: "Swords",
    meaning: {
      upright: "Hành động nhanh, quyết đoán, dũng cảm, bốc đồng",
      reversed: "Thiếu kiên nhẫn, hung hăng, thiếu suy nghĩ"
    },
    description: "Hành động nhanh chóng và quyết đoán.",
    keywords: ["nhanh chóng", "quyết đoán", "dũng cảm", "bốc đồng"]
  },
  {
    id: 62,
    name: "Queen of Swords",
    suit: "Swords",
    meaning: {
      upright: "Độc lập, thông minh, công bằng, trực tiếp",
      reversed: "Lạnh lùng, độc đoán, thiếu cảm thông"
    },
    description: "Người phụ nữ thông minh và độc lập.",
    keywords: ["độc lập", "thông minh", "công bằng", "trực tiếp"]
  },
  {
    id: 63,
    name: "King of Swords",
    suit: "Swords",
    meaning: {
      upright: "Trí tuệ, thẩm quyền, công lý, logic",
      reversed: "Độc đoán, lạnh lùng, thiếu cảm thông"
    },
    description: "Lãnh đạo với trí tuệ và công lý.",
    keywords: ["trí tuệ", "thẩm quyền", "công lý", "logic"]
  },
  
  // Minor Arcana - Pentacles (tất cả 14 lá)
  {
    id: 64,
    name: "Ace of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Cơ hội mới, biểu hiện, thịnh vượng",
      reversed: "Cơ hội bị mất, thiếu kế hoạch, tham lam"
    },
    description: "Cơ hội mới về tài chính và vật chất.",
    keywords: ["cơ hội", "thịnh vượng", "khởi đầu", "vật chất"]
  },
  {
    id: 65,
    name: "Two of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Cân bằng, thích ứng, ưu tiên, thời gian",
      reversed: "Mất cân bằng, quá tải, tổ chức kém"
    },
    description: "Cân bằng giữa các ưu tiên và trách nhiệm.",
    keywords: ["cân bằng", "thích ứng", "ưu tiên", "linh hoạt"]
  },
  {
    id: 66,
    name: "Three of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Hợp tác, làm việc nhóm, kỹ năng, học hỏi",
      reversed: "Thiếu hợp tác, kỹ năng kém, cạnh tranh"
    },
    description: "Hợp tác và chia sẻ kỹ năng.",
    keywords: ["hợp tác", "nhóm", "kỹ năng", "học hỏi"]
  },
  {
    id: 67,
    name: "Four of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Bảo thủ, kiểm soát, an toàn, keo kiệt",
      reversed: "Hào phóng, đầu tư, chấp nhận rủi ro"
    },
    description: "Bảo vệ tài sản nhưng có thể quá bảo thủ.",
    keywords: ["bảo thủ", "kiểm soát", "an toàn", "keo kiệt"]
  },
  {
    id: 68,
    name: "Five of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Khó khăn tài chính, nghèo đói, cô lập",
      reversed: "Phục hồi tài chính, tìm kiếm giúp đỡ"
    },
    description: "Khó khăn tài chính và cần sự hỗ trợ.",
    keywords: ["khó khăn", "nghèo đói", "cô lập", "hỗ trợ"]
  },
  {
    id: 69,
    name: "Six of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Hào phóng, chia sẻ, từ thiện, cân bằng",
      reversed: "Ích kỷ, nợ nần, bất cân bằng quyền lực"
    },
    description: "Sự hào phóng và chia sẻ với người khác.",
    keywords: ["hào phóng", "chia sẻ", "từ thiện", "cân bằng"]
  },
  {
    id: 70,
    name: "Seven of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Đầu tư dài hạn, kiên nhẫn, đánh giá",
      reversed: "Thiếu kiên nhẫn, đầu tư kém, không có kế hoạch"
    },
    description: "Đánh giá kết quả và đầu tư dài hạn.",
    keywords: ["đầu tư", "kiên nhẫn", "đánh giá", "dài hạn"]
  },
  {
    id: 71,
    name: "Eight of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Kỹ năng, thủ công, học việc, cống hiến",
      reversed: "Thiếu tập trung, kỹ năng kém, lười biếng"
    },
    description: "Cống hiến và phát triển kỹ năng.",
    keywords: ["kỹ năng", "thủ công", "học việc", "cống hiến"]
  },
  {
    id: 72,
    name: "Nine of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Độc lập tài chính, thành công, sang trọng",
      reversed: "Phụ thuộc tài chính, thiếu kỷ luật"
    },
    description: "Thành công và độc lập tài chính.",
    keywords: ["độc lập", "thành công", "sang trọng", "tự lập"]
  },
  {
    id: 73,
    name: "Ten of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Tài sản gia đình, thế hệ, di sản, ổn định",
      reversed: "Mất ổn định tài chính, xung đột gia đình"
    },
    description: "Tài sản và di sản gia đình.",
    keywords: ["gia đình", "di sản", "tài sản", "ổn định"]
  },
  {
    id: 74,
    name: "Page of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Cơ hội học việc, tin tốt về tiền bạc, khởi đầu",
      reversed: "Thiếu cam kết, tin xấu về tài chính"
    },
    description: "Cơ hội mới trong học tập và tài chính.",
    keywords: ["học việc", "cơ hội", "khởi đầu", "cam kết"]
  },
  {
    id: 75,
    name: "Knight of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Chăm chỉ, kiên trì, đáng tin cậy, thực tế",
      reversed: "Lười biếng, thiếu tiến bộ, bảo thủ"
    },
    description: "Làm việc chăm chỉ và đáng tin cậy.",
    keywords: ["chăm chỉ", "kiên trì", "tin cậy", "thực tế"]
  },
  {
    id: 76,
    name: "Queen of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Nuôi dưỡng, thực tế, an toàn tài chính",
      reversed: "Ích kỷ, ghen tị, bất an tài chính"
    },
    description: "Người mẹ nuôi dưỡng với trí tuệ thực tế.",
    keywords: ["nuôi dưỡng", "thực tế", "an toàn", "chăm sóc"]
  },
  {
    id: 77,
    name: "King of Pentacles",
    suit: "Pentacles",
    meaning: {
      upright: "Thành công tài chính, lãnh đạo, hào phóng",
      reversed: "Tham lam, vật chất, lạm dụng quyền lực"
    },
    description: "Lãnh đạo thành công với trí tuệ tài chính.",
    keywords: ["thành công", "lãnh đạo", "hào phóng", "tài chính"]
  }
];