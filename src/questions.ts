export interface Question {
  id: string;
  question: string;
  imageUrl?: string; // Optional image for main question prompt (Base64 or URL)
  optionA: string; // Left option label
  optionAImage?: string; // Optional image for Left option (Base64 or URL)
  optionB: string; // Right option label
  optionBImage?: string; // Optional image for Right option (Base64 or URL)
  correct: 'left' | 'right'; // which option is correct
  explanation?: string;
  category: string;
}

export interface QuizPack {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  questions: Question[];
}

export const DEFAULT_QUIZ_PACKS: QuizPack[] = [
  {
    id: 'brain-teasers',
    title: 'Đố Mẹo Hài Hước',
    description: 'Những câu đố dí dỏm, bẫy tư duy khiến bạn phải bật cười',
    icon: '💡',
    color: 'from-amber-500 to-orange-600',
    questions: [
      {
        id: 'bt-1',
        question: 'Cái gì khi sạch thì màu đen, còn khi bẩn thì lại màu trắng?',
        optionA: 'Bảng đen lớp học',
        optionB: 'Bát sứ trắng',
        correct: 'left',
        explanation: 'Bảng đen khi bẩn dính đầy phấn trắng!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-2',
        question: 'Con gì đập thì sống, không đập thì chết?',
        optionA: 'Con muỗi',
        optionB: 'Con tim',
        correct: 'right',
        explanation: 'Trái tim đập thì sống, ngừng đập là toi!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-3',
        question: 'Tháng nào trong năm người ta ngủ ít nhất?',
        optionA: 'Tháng 2',
        optionB: 'Tháng 12',
        correct: 'left',
        explanation: 'Tháng 2 chỉ có 28 hoặc 29 ngày nên tổng thời gian ngủ ít nhất!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-4',
        question: 'Cây gì càng đốt càng dài?',
        optionA: 'Cây tre / Cây trúc',
        optionB: 'Cây nến',
        correct: 'left',
        explanation: 'Cây tre có nhiều đốt, càng nhiều đốt thân cây càng dài!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-5',
        question: 'Cái gì bạn có thể cầm bằng tay trái nhưng không bao giờ cầm được bằng tay phải?',
        optionA: 'Khuỷu tay phải',
        optionB: 'Cái thìa canh',
        correct: 'left',
        explanation: 'Tay phải làm sao tự nắm được khuỷu tay của chính nó!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-6',
        question: 'Bỏ ngoài nướng trong, ăn ngoài bỏ trong là gì?',
        optionA: 'Bắp ngô (Bắp)',
        optionB: 'Củ khoai lang',
        correct: 'left',
        explanation: 'Bỏ vỏ nướng hạt, ăn hạt xong bỏ cùi ngô!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-7',
        question: 'Cái gì đi lên dốc rồi lại xuống dốc nhưng không bao giờ chuyển động?',
        optionA: 'Con đường',
        optionB: 'Chiếc xe đạp',
        correct: 'left',
        explanation: 'Con đường trải dài lên và xuống dốc nhưng cố định một chỗ!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-8',
        question: 'Con vịt đi trước 2 con vịt, con vịt đi sau 2 con vịt, con vịt đi giữa 2 con vịt. Hỏi có mấy con vịt?',
        optionA: '3 con vịt',
        optionB: '6 con vịt',
        correct: 'left',
        explanation: 'Chỉ có 3 con vịt đi nối đuôi nhau hàng dọc!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-9',
        question: 'Quần gì rộng nhất thế gian?',
        optionA: 'Quần đảo',
        optionB: 'Quần bò thụng',
        correct: 'left',
        explanation: 'Quần đảo gồm cả vùng biển rộng bao la!',
        category: 'Đố mẹo'
      },
      {
        id: 'bt-10',
        question: 'Cái gì thuộc về bạn nhưng người khác lại dùng nhiều hơn bạn?',
        optionA: 'Tên của bạn',
        optionB: 'Điện thoại của bạn',
        correct: 'left',
        explanation: 'Tên bạn thường được mọi người gọi nhiều hơn chính bạn tự gọi!',
        category: 'Đố mẹo'
      }
    ]
  },
  {
    id: 'general-knowledge',
    title: 'Kiến Thức & Đời Sống',
    description: 'Thử tài hiểu biết về tự nhiên, khoa học và thế giới xung quanh',
    icon: '🌍',
    color: 'from-blue-600 to-indigo-700',
    questions: [
      {
        id: 'gk-1',
        question: 'Mặt Trời mọc ở hướng nào?',
        optionA: 'Hướng Đông',
        optionB: 'Hướng Tây',
        correct: 'left',
        explanation: 'Mặt Trời luôn mọc ở phía Đông và lặn ở phía Tây.',
        category: 'Khoa học'
      },
      {
        id: 'gk-2',
        question: 'Quốc gia nào có diện tích lớn nhất thế giới hiện nay?',
        optionA: 'Liên bang Nga',
        optionB: 'Canada',
        correct: 'left',
        explanation: 'Nga có diện tích hơn 17 triệu km², lớn nhất địa cầu.',
        category: 'Địa lý'
      },
      {
        id: 'gk-3',
        question: 'Công thức hóa học của nước tinh khiết là gì?',
        optionA: 'H2O',
        optionB: 'CO2',
        correct: 'left',
        explanation: 'Nước gồm 2 nguyên tử Hydro và 1 nguyên tử Oxy kết hợp.',
        category: 'Hóa học'
      },
      {
        id: 'gk-4',
        question: 'Đỉnh núi nào được mệnh danh là Nóc nhà của thế giới?',
        optionA: 'Fansipan',
        optionB: 'Everest',
        correct: 'right',
        explanation: 'Đỉnh Everest cao 8.848m thuộc dãy Himalaya hùng vĩ.',
        category: 'Địa lý'
      },
      {
        id: 'gk-5',
        question: 'Loài chim nào có khả năng bay lùi về phía sau?',
        optionA: 'Chim ruồi',
        optionB: 'Chim đại bàng',
        correct: 'left',
        explanation: 'Chim ruồi là loài chim duy nhất có thể bay lùi và lượn đứng yên.',
        category: 'Sinh học'
      },
      {
        id: 'gk-6',
        question: 'Đại dương nào có diện tích lớn nhất trên Trái Đất?',
        optionA: 'Thái Bình Dương',
        optionB: 'Đại Tây Dương',
        correct: 'left',
        explanation: 'Thái Bình Dương chiếm hơn 30% tổng diện tích bề mặt Trái Đất.',
        category: 'Địa lý'
      },
      {
        id: 'gk-7',
        question: 'Việt Nam hiện tại có tổng cộng bao nhiêu tỉnh và thành phố trực thuộc Trung ương?',
        optionA: '63 tỉnh thành',
        optionB: '64 tỉnh thành',
        correct: 'left',
        explanation: 'Sau đợt sáp nhập Hà Tây năm 2008, Việt Nam có 63 tỉnh thành.',
        category: 'Xã hội'
      },
      {
        id: 'gk-8',
        question: 'Sao Hỏa thường được gọi bằng biệt danh nào do màu sắc đặc trưng của nó?',
        optionA: 'Hành tinh Đỏ',
        optionB: 'Hành tinh Xanh',
        correct: 'left',
        explanation: 'Bề mặt sao Hỏa có nhiều oxit sắt tạo nên sắc đỏ cam đặc trưng.',
        category: 'Thiên văn'
      }
    ]
  },
  {
    id: 'quick-math',
    title: 'Phản Xạ Toán Nhanh',
    description: 'Tính nhẩm siêu tốc chỉ trong tích tắc, thử thách phản xạ não bộ',
    icon: '⚡',
    color: 'from-emerald-500 to-teal-700',
    questions: [
      {
        id: 'qm-1',
        question: '47 + 38 = ?',
        optionA: '85',
        optionB: '75',
        correct: 'left',
        explanation: '47 + 38 = 85',
        category: 'Toán học'
      },
      {
        id: 'qm-2',
        question: '7 x 8 = ?',
        optionA: '54',
        optionB: '56',
        correct: 'right',
        explanation: 'Bảng cửu chương 7 x 8 = 56!',
        category: 'Toán học'
      },
      {
        id: 'qm-3',
        question: '100 - 37 = ?',
        optionA: '63',
        optionB: '73',
        correct: 'left',
        explanation: '100 - 37 = 63',
        category: 'Toán học'
      },
      {
        id: 'qm-4',
        question: '15 x 6 = ?',
        optionA: '90',
        optionB: '85',
        correct: 'left',
        explanation: '15 x 6 = 90',
        category: 'Toán học'
      },
      {
        id: 'qm-5',
        question: '144 chia cho 12 bằng bao nhiêu?',
        optionA: '14',
        optionB: '12',
        correct: 'right',
        explanation: '12 x 12 = 144 nên 144 : 12 = 12!',
        category: 'Toán học'
      },
      {
        id: 'qm-6',
        question: '2 mũ 5 (2^5) bằng bao nhiêu?',
        optionA: '32',
        optionB: '64',
        correct: 'left',
        explanation: '2 x 2 x 2 x 2 x 2 = 32!',
        category: 'Toán học'
      },
      {
        id: 'qm-7',
        question: '99 + 88 = ?',
        optionA: '177',
        optionB: '187',
        correct: 'right',
        explanation: '99 + 88 = (100 - 1) + 88 = 187',
        category: 'Toán học'
      },
      {
        id: 'qm-8',
        question: 'Số nào là số nguyên tố nhỏ nhất?',
        optionA: '1',
        optionB: '2',
        correct: 'right',
        explanation: 'Số 2 là số nguyên tố nhỏ nhất và cũng là số nguyên tố chẵn duy nhất!',
        category: 'Toán học'
      }
    ]
  },
  {
    id: 'this-or-that',
    title: 'Bạn Chọn Cái Nào Hơn?',
    description: 'Thể hiện cá tính và quan điểm cá nhân, mọi đáp án đều có góc nhìn thú vị!',
    icon: '🎭',
    color: 'from-pink-500 to-rose-600',
    questions: [
      {
        id: 'tt-1',
        question: 'Thức uống tiếp năng lượng cho ngày mới?',
        optionA: 'Trà Sữa Full Topping',
        optionB: 'Cà Phê Đen Đá',
        correct: 'left',
        explanation: 'Phe ngọt ngào năng lượng hay phe tỉnh táo đậm đà?',
        category: 'Sở thích'
      },
      {
        id: 'tt-2',
        question: 'Đi du lịch nghỉ dưỡng lý tưởng?',
        optionA: 'Lên Rừng Núi Săn Mây',
        optionB: 'Xuống Biển Ngắm Hoàng Hôn',
        correct: 'right',
        explanation: 'Không khí se lạnh vùng cao hay tiếng sóng biển vỗ rì rào?',
        category: 'Sở thích'
      },
      {
        id: 'tt-3',
        question: 'Thú cưng nào chiếm trọn trái tim bạn?',
        optionA: 'Những Chú Mèo Hoàng Thượng',
        optionB: 'Những Chú Cún Trung Thành',
        correct: 'left',
        explanation: 'Kiêu kỳ đáng yêu hay nhiệt tình trung thực?',
        category: 'Sở thích'
      },
      {
        id: 'tt-4',
        question: 'Đồng hồ sinh học của bạn?',
        optionA: 'Dậy Sớm Đón Bình Minh',
        optionB: 'Cú Đêm Sáng Tạo Về Khuya',
        correct: 'right',
        explanation: 'Thế giới tĩnh lặng lúc 5h sáng hay lúc 1h đêm?',
        category: 'Lối sống'
      },
      {
        id: 'tt-5',
        question: 'Siêu năng lực mà bạn mơ ước nhất?',
        optionA: 'Dịch Chuyển Tức Thời',
        optionB: 'Đọc Được Suy Nghĩ Người Khác',
        correct: 'left',
        explanation: 'Không bao giờ lo kẹt xe hay thấu hiểu tâm can thiên hạ?',
        category: 'Tưởng tượng'
      }
    ]
  }
];
