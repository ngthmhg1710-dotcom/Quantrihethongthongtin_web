/**
 * Danh mục địa chỉ VN (TP — quận — phường) dùng chung Checkout / hồ sơ.
 */

export const CITY_DISTRICTS: Record<string, string[]> = {
  'TP HCM': [
    'Quận 1',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Quận 7',
    'Quận 10',
    'Quận Bình Thạnh',
    'Quận Gò Vấp',
    'Quận Tân Bình',
    'TP Thủ Đức',
    'Huyện Bình Chánh',
    'Huyện Củ Chi',
  ],
  'Hà Nội': [
    'Quận Ba Đình',
    'Quận Hoàn Kiếm',
    'Quận Hai Bà Trưng',
    'Quận Đống Đa',
    'Quận Cầu Giấy',
    'Quận Thanh Xuân',
    'Quận Hà Đông',
    'Quận Long Biên',
    'Huyện Gia Lâm',
    'Huyện Đông Anh',
  ],
  'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu'],
  'Cần Thơ': ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Quận Ô Môn', 'Huyện Phong Điền'],
  'Hải Phòng': ['Quận Hồng Bàng', 'Quận Lê Chân', 'Quận Ngô Quyền', 'Quận Hải An', 'Quận Kiến An'],
};

export const CITY_OPTIONS = Object.keys(CITY_DISTRICTS);

const VIETNAM_ADDRESS_CATALOG: Record<string, Record<string, Record<string, string[]>>> = {
  'TP HCM': {
    'Quận 1': {
      'Phường Tân Định': ['Hai Bà Trưng', 'Trần Quang Khải', 'Đinh Tiên Hoàng'],
      'Phường Đa Kao': ['Nguyễn Đình Chiểu', 'Điện Biên Phủ', 'Mạc Đĩnh Chi'],
      'Phường Bến Nghé': ['Lê Duẩn', 'Tôn Đức Thắng', 'Nguyễn Bỉnh Khiêm'],
      'Phường Bến Thành': ['Lê Lai', 'Phạm Hồng Thái', 'Thủ Khoa Huân'],
      'Phường Nguyễn Cư Trinh': ['Trần Hưng Đạo', 'Nguyễn Trãi', 'Cống Quỳnh'],
    },
    'Quận 3': {
      'Phường Võ Thị Sáu': ['Nam Kỳ Khởi Nghĩa', 'Hai Bà Trưng', 'Điện Biên Phủ'],
      'Phường 7': ['Lý Chính Thắng', 'Kỳ Đồng', 'Trần Quốc Thảo'],
      'Phường 12': ['Cách Mạng Tháng 8', 'Nguyễn Thị Minh Khai', 'Rạch Bùng Binh'],
      'Phường 14': ['Lê Văn Sỹ', 'Trường Sa', 'Huỳnh Văn Bánh'],
      'Phường 9': ['Nguyễn Đình Chiểu', 'Bàn Cờ', 'Nguyễn Thiện Thuật'],
    },
    'Quận 4': {
      'Phường 1': ['Khánh Hội', 'Đoàn Văn Bơ', 'Vĩnh Hội'],
      'Phường 6': ['Tôn Đản', 'Hoàng Diệu', 'Bến Vân Đồn'],
      'Phường 8': ['Nguyễn Tất Thành', 'Tôn Thất Thuyết', 'Hoàng Diệu'],
      'Phường 13': ['Xóm Chiếu', 'Đoàn Văn Bơ', 'Vĩnh Khánh'],
      'Phường 18': ['Bến Vân Đồn', 'Nguyễn Trường Tộ', 'Tôn Đản'],
    },
    'Quận 5': {
      'Phường 1': ['Nguyễn Trãi', 'Trần Hưng Đạo', 'Châu Văn Liêm'],
      'Phường 5': ['Hải Thượng Lãn Ông', 'Triệu Quang Phục', 'Lão Tử'],
      'Phường 7': ['An Dương Vương', 'Nguyễn Biểu', 'Hùng Vương'],
      'Phường 11': ['Nguyễn Chí Thanh', 'Hồng Bàng', 'Trần Phú'],
      'Phường 14': ['Trần Hưng Đạo', 'Ngô Quyền', 'Nguyễn Trãi'],
    },
    'Quận 7': {
      'Phường Tân Thuận Đông': ['Huỳnh Tấn Phát', 'Lưu Trọng Lư', 'Trần Trọng Cung', 'Nguyễn Văn Quỳ'],
      'Phường Tân Thuận Tây': ['Huỳnh Tấn Phát', 'Trần Xuân Soạn', 'Tân Thuận'],
      'Phường Tân Kiểng': ['Lê Văn Lương', 'Trần Xuân Soạn', 'Nguyễn Hữu Thọ'],
      'Phường Tân Hưng': ['Nguyễn Thị Thập', 'Lê Văn Lương', 'Trần Xuân Soạn'],
      'Phường Bình Thuận': ['Nguyễn Thị Thập', 'Lâm Văn Bền', 'Đường số 41'],
      'Phường Tân Quy': ['Nguyễn Thị Thập', 'Nguyễn Thị Định', 'Đường số 17'],
      'Phường Phú Thuận': ['Đào Trí', 'Phú Thuận', 'Huỳnh Tấn Phát'],
      'Phường Tân Phú': ['Nguyễn Lương Bằng', 'Hoàng Văn Thái', 'Đường số 15'],
      'Phường Phú Mỹ': ['Huỳnh Tấn Phát', 'Nguyễn Lương Bằng', 'Hoàng Quốc Việt'],
      'Phường Tân Phong': ['Nguyễn Văn Linh', 'Nguyễn Đức Cảnh', 'Đường số 6'],
    },
    'Quận 10': {
      'Phường 2': ['Ba Tháng Hai', 'Lý Thường Kiệt', 'Sư Vạn Hạnh'],
      'Phường 4': ['Ngô Gia Tự', 'Nguyễn Tri Phương', 'Vĩnh Viễn'],
      'Phường 6': ['Tô Hiến Thành', 'Thành Thái', 'Hòa Hưng'],
      'Phường 12': ['Lê Hồng Phong', 'Nguyễn Chí Thanh', 'Sư Vạn Hạnh'],
      'Phường 14': ['Bà Hạt', 'Điện Biên Phủ', 'Cao Thắng'],
    },
    'Quận Bình Thạnh': {
      'Phường 1': ['Bùi Hữu Nghĩa', 'Đinh Bộ Lĩnh', 'Nơ Trang Long'],
      'Phường 3': ['Phan Đăng Lưu', 'Vạn Kiếp', 'Chu Văn An'],
      'Phường 13': ['Điện Biên Phủ', 'Xô Viết Nghệ Tĩnh', 'Ung Văn Khiêm'],
      'Phường 22': ['Nguyễn Hữu Cảnh', 'Tôn Đức Thắng', 'Ngô Tất Tố'],
      'Phường 25': ['D2', 'Điện Biên Phủ', 'Ung Văn Khiêm'],
    },
    'Quận Gò Vấp': {
      'Phường 1': ['Nguyễn Thái Sơn', 'Phan Văn Trị', 'Lê Đức Thọ'],
      'Phường 3': ['Quang Trung', 'Thống Nhất', 'Phạm Văn Đồng'],
      'Phường 5': ['Phạm Văn Chiêu', 'Dương Quảng Hàm', 'Lê Văn Thọ'],
      'Phường 8': ['Nguyễn Oanh', 'Lê Đức Thọ', 'Phan Huy Ích'],
      'Phường 15': ['Quang Trung', 'Cây Trâm', 'Phạm Văn Chiêu'],
    },
    'Quận Tân Bình': {
      'Phường 2': ['Trường Sơn', 'Bạch Đằng', 'Hồng Hà'],
      'Phường 4': ['Hoàng Văn Thụ', 'Xuân Hồng', 'Út Tịch'],
      'Phường 8': ['Lý Thường Kiệt', 'Cách Mạng Tháng 8', 'Bắc Hải'],
      'Phường 12': ['Cộng Hòa', 'Hoàng Hoa Thám', 'Trường Chinh'],
      'Phường 15': ['Âu Cơ', 'Lạc Long Quân', 'Ni Sư Huỳnh Liên'],
    },
    'TP Thủ Đức': {
      'Phường An Phú': ['Mai Chí Thọ', 'Song Hành', 'Lương Định Của'],
      'Phường Thảo Điền': ['Quốc Hương', 'Xuân Thủy', 'Nguyễn Văn Hưởng'],
      'Phường Linh Trung': ['Hoàng Diệu 2', 'Kha Vạn Cân', 'Võ Văn Ngân'],
      'Phường Hiệp Bình Chánh': ['Phạm Văn Đồng', 'Hiệp Bình', 'Đặng Thùy Trâm'],
      'Phường Long Trường': ['Nguyễn Duy Trinh', 'Lã Xuân Oai', 'Trường Lưu'],
    },
    'Huyện Bình Chánh': {
      'Xã Bình Chánh': ['Tỉnh lộ 10', 'Đinh Đức Thiện', 'Nguyễn Hữu Trí'],
      'Xã Vĩnh Lộc A': ['Quách Điêu', 'Liên Ấp 2-6', 'Vĩnh Lộc'],
      'Xã Vĩnh Lộc B': ['Vĩnh Lộc', 'Liên Ấp 1-2', 'Nguyễn Thị Tú'],
      'Xã Lê Minh Xuân': ['Trần Đại Nghĩa', 'Kênh C', 'Láng Le Bàu Cò'],
      'Thị trấn Tân Túc': ['Nguyễn Hữu Trí', 'Quốc lộ 1A', 'Trần Văn Giàu'],
    },
    'Huyện Củ Chi': {
      'Xã Tân Thông Hội': ['Tỉnh lộ 8', 'Nguyễn Thị Rành', 'Tân Thông Hội'],
      'Xã Tân An Hội': ['Tỉnh lộ 15', 'Bến Đình', 'Nguyễn Thị Lắng'],
      'Xã Trung An': ['Võ Văn Bích', 'Trung An', 'Bến Than'],
      'Xã Phước Hiệp': ['Tỉnh lộ 2', 'Phước Hiệp', 'Nguyễn Văn Khạ'],
      'Thị trấn Củ Chi': ['Tỉnh lộ 8', 'Quốc lộ 22', 'Nguyễn Văn Khạ'],
    },
  },
  'Hà Nội': {
    'Quận Ba Đình': {
      'Phường Ngọc Hà': ['Hoàng Hoa Thám', 'Ngọc Hà', 'Đội Cấn'],
      'Phường Liễu Giai': ['Liễu Giai', 'Đào Tấn', 'Kim Mã'],
      'Phường Điện Biên': ['Điện Biên Phủ', 'Nguyễn Thái Học', 'Trần Phú'],
      'Phường Quán Thánh': ['Thanh Niên', 'Quán Thánh', 'Yên Phụ'],
      'Phường Cống Vị': ['Đội Cấn', 'Đào Tấn', 'Bưởi'],
    },
    'Quận Hoàn Kiếm': {
      'Phường Hàng Bạc': ['Hàng Bạc', 'Hàng Ngang', 'Mã Mây'],
      'Phường Hàng Đào': ['Hàng Đào', 'Đinh Tiên Hoàng', 'Cầu Gỗ'],
      'Phường Tràng Tiền': ['Tràng Tiền', 'Ngô Quyền', 'Lý Thái Tổ'],
      'Phường Cửa Nam': ['Tràng Thi', 'Điện Biên Phủ', 'Cửa Nam'],
      'Phường Hàng Bông': ['Hàng Bông', 'Phủ Doãn', 'Quán Sứ'],
    },
    'Quận Hai Bà Trưng': {
      'Phường Bạch Mai': ['Bạch Mai', 'Minh Khai', 'Đại La'],
      'Phường Vĩnh Tuy': ['Lạc Trung', 'Vĩnh Tuy', 'Minh Khai'],
      'Phường Đồng Tâm': ['Giải Phóng', 'Đại Cồ Việt', 'Lê Thanh Nghị'],
      'Phường Phố Huế': ['Phố Huế', 'Đại Cồ Việt', 'Trần Khát Chân'],
      'Phường Thanh Nhàn': ['Thanh Nhàn', 'Kim Ngưu', 'Trần Khát Chân'],
    },
    'Quận Đống Đa': {
      'Phường Láng Hạ': ['Láng Hạ', 'Thái Hà', 'Huỳnh Thúc Kháng'],
      'Phường Ô Chợ Dừa': ['Xã Đàn', 'Khâm Thiên', 'Tôn Đức Thắng'],
      'Phường Văn Miếu': ['Tôn Đức Thắng', 'Nguyễn Thái Học', 'Văn Miếu'],
      'Phường Cát Linh': ['Cát Linh', 'Giảng Võ', 'Hào Nam'],
      'Phường Trung Liệt': ['Thái Hà', 'Yên Lãng', 'Thái Thịnh'],
    },
    'Quận Cầu Giấy': {
      'Phường Dịch Vọng': ['Cầu Giấy', 'Trần Thái Tông', 'Xuân Thủy'],
      'Phường Nghĩa Đô': ['Hoàng Quốc Việt', 'Nguyễn Văn Huyên', 'Tô Hiệu'],
      'Phường Mai Dịch': ['Hồ Tùng Mậu', 'Doãn Kế Thiện', 'Phạm Văn Đồng'],
      'Phường Yên Hòa': ['Trung Kính', 'Mạc Thái Tông', 'Vũ Phạm Hàm'],
      'Phường Quan Hoa': ['Cầu Giấy', 'Nguyễn Khánh Toàn', 'Đào Tấn'],
    },
    'Quận Thanh Xuân': {
      'Phường Thanh Xuân Trung': ['Nguyễn Trãi', 'Khuất Duy Tiến', 'Ngụy Như Kon Tum'],
      'Phường Nhân Chính': ['Lê Văn Lương', 'Hoàng Đạo Thúy', 'Khuất Duy Tiến'],
      'Phường Khương Mai': ['Trường Chinh', 'Lê Trọng Tấn', 'Vương Thừa Vũ'],
      'Phường Khương Đình': ['Khương Đình', 'Hạ Đình', 'Nguyễn Xiển'],
      'Phường Phương Liệt': ['Giải Phóng', 'Phương Liệt', 'Trường Chinh'],
    },
    'Quận Hà Đông': {
      'Phường Mộ Lao': ['Trần Phú', 'Nguyễn Trãi', 'Vũ Trọng Khánh'],
      'Phường Văn Quán': ['Chiến Thắng', 'Nguyễn Khuyến', '19/5'],
      'Phường La Khê': ['Lê Trọng Tấn', 'Tố Hữu', 'Ngô Thì Nhậm'],
      'Phường Dương Nội': ['Tố Hữu', 'Lê Quang Đạo kéo dài', 'Dương Nội'],
      'Phường Yên Nghĩa': ['Quốc lộ 6', 'Yên Nghĩa', 'Phúc La'],
    },
    'Quận Long Biên': {
      'Phường Ngọc Lâm': ['Nguyễn Văn Cừ', 'Ngọc Lâm', 'Hồng Tiến'],
      'Phường Bồ Đề': ['Nguyễn Văn Cừ', 'Hồng Tiến', 'Ái Mộ'],
      'Phường Việt Hưng': ['Ngô Gia Tự', 'Việt Hưng', 'Vũ Đức Thận'],
      'Phường Gia Thụy': ['Nguyễn Văn Cừ', 'Gia Thụy', 'Ngọc Lâm'],
      'Phường Phúc Lợi': ['Phúc Lợi', 'Vũ Xuân Thiều', 'Cầu Phù Đổng'],
    },
    'Huyện Gia Lâm': {
      'Xã Trâu Quỳ': ['Ngô Xuân Quảng', 'Kiên Thành', 'Trâu Quỳ'],
      'Xã Đa Tốn': ['Đa Tốn', 'Hà Huy Tập', 'Cổ Bi'],
      'Xã Dương Xá': ['Hà Huy Tập', 'Dương Xá', 'Cổ Bi'],
      'Xã Yên Viên': ['Yên Viên', 'Hà Huy Tập', 'Đặng Xá'],
      'Thị trấn Yên Viên': ['Hà Huy Tập', 'Yên Viên', 'Đức Giang'],
    },
    'Huyện Đông Anh': {
      'Xã Đông Hội': ['Trường Sa', 'Đông Hội', 'Uy Nỗ'],
      'Xã Vĩnh Ngọc': ['Võ Nguyên Giáp', 'Vĩnh Ngọc', 'Hải Bối'],
      'Xã Hải Bối': ['Võ Nguyên Giáp', 'Hải Bối', 'Kim Nỗ'],
      'Xã Kim Nỗ': ['Cao Lỗ', 'Kim Nỗ', 'Uy Nỗ'],
      'Thị trấn Đông Anh': ['Cao Lỗ', 'Tổ 1', 'Quốc lộ 3'],
    },
  },
  'Đà Nẵng': {
    'Quận Hải Châu': {
      'Phường Hải Châu 1': ['Bạch Đằng', 'Trần Phú', 'Lê Duẩn'],
      'Phường Bình Hiên': ['Núi Thành', '2 Tháng 9', 'Trưng Nữ Vương'],
      'Phường Thuận Phước': ['Lê Đức Thọ', 'Đống Đa', 'Như Nguyệt'],
      'Phường Hòa Cường Bắc': ['2 Tháng 9', 'Xô Viết Nghệ Tĩnh', 'Núi Thành'],
      'Phường Nam Dương': ['Phan Châu Trinh', 'Nguyễn Văn Linh', 'Hoàng Diệu'],
    },
    'Quận Thanh Khê': {
      'Phường Thanh Khê Đông': ['Điện Biên Phủ', 'Hà Huy Tập', 'Nguyễn Tất Thành'],
      'Phường Thanh Khê Tây': ['Trần Cao Vân', 'Tôn Đức Thắng', 'Yên Khê 1'],
      'Phường Xuân Hà': ['Nguyễn Tất Thành', 'Lê Độ', 'Ông Ích Khiêm'],
      'Phường Chính Gián': ['Hùng Vương', 'Lê Độ', 'Nguyễn Hoàng'],
      'Phường An Khê': ['Trường Chinh', 'Điện Biên Phủ', 'Lê Trọng Tấn'],
    },
    'Quận Sơn Trà': {
      'Phường An Hải Bắc': ['Phạm Văn Đồng', 'Ngô Quyền', 'Hồ Nghinh'],
      'Phường Mân Thái': ['Võ Văn Kiệt', 'Ngô Quyền', 'Lê Văn Lương'],
      'Phường Phước Mỹ': ['Võ Nguyên Giáp', 'Phạm Văn Đồng', 'Hồ Nghinh'],
      'Phường Thọ Quang': ['Yết Kiêu', 'Ngô Quyền', 'Lê Đức Thọ'],
      'Phường Nại Hiên Đông': ['Lê Đức Thọ', 'Ngô Quyền', 'Vũ Văn Dũng'],
    },
    'Quận Ngũ Hành Sơn': {
      'Phường Mỹ An': ['Ngũ Hành Sơn', 'Châu Thị Vĩnh Tế', 'An Thượng 1'],
      'Phường Khuê Mỹ': ['Trần Đại Nghĩa', 'Chương Dương', 'Mai Đăng Chơn'],
      'Phường Hòa Hải': ['Lê Văn Hiến', 'Trường Sa', 'Mai Đăng Chơn'],
      'Phường Hòa Quý': ['Nam Kỳ Khởi Nghĩa', 'Trần Đại Nghĩa', 'Đại lộ Võ Chí Công'],
      'Phường Khuê Trung': ['Cách Mạng Tháng 8', 'Hòa Cầm', 'Thăng Long'],
    },
    'Quận Liên Chiểu': {
      'Phường Hòa Minh': ['Nguyễn Sinh Sắc', 'Tôn Đức Thắng', 'Kinh Dương Vương'],
      'Phường Hòa Khánh Bắc': ['Nguyễn Lương Bằng', 'Tôn Đức Thắng', 'Âu Cơ'],
      'Phường Hòa Khánh Nam': ['Âu Cơ', 'Nguyễn Chánh', 'Lê Trọng Tấn'],
      'Phường Hòa Hiệp Bắc': ['Nguyễn Tất Thành', 'Đèo Hải Vân', 'Nam Ô 1'],
      'Phường Hòa Hiệp Nam': ['Nguyễn Lương Bằng', 'Hòa Hiệp', 'Bàu Tràm'],
    },
  },
  'Cần Thơ': {
    'Quận Ninh Kiều': {
      'Phường Tân An': ['Hòa Bình', 'Nguyễn An Ninh', 'Hai Bà Trưng'],
      'Phường An Cư': ['3 Tháng 2', 'Mậu Thân', 'Nguyễn Văn Cừ'],
      'Phường An Hòa': ['Cách Mạng Tháng 8', 'Nguyễn Trãi', '30 Tháng 4'],
      'Phường An Nghiệp': ['Trần Hưng Đạo', 'Nguyễn Trãi', 'Lý Tự Trọng'],
      'Phường Xuân Khánh': ['30 Tháng 4', 'Mậu Thân', '3 Tháng 2'],
    },
    'Quận Bình Thủy': {
      'Phường Bình Thủy': ['Lê Hồng Phong', 'Cách Mạng Tháng 8', 'Bùi Hữu Nghĩa'],
      'Phường Trà An': ['Võ Văn Kiệt', 'Lê Hồng Phong', 'Cách Mạng Tháng 8'],
      'Phường Long Hòa': ['Bùi Hữu Nghĩa', 'Nguyễn Chí Thanh', 'Long Hòa'],
      'Phường Thới An Đông': ['Lê Hồng Phong', 'Trà Nóc', 'Thới An Đông'],
      'Phường An Thới': ['Cách Mạng Tháng 8', 'Lê Hồng Phong', 'Nguyễn Văn Linh'],
    },
    'Quận Cái Răng': {
      'Phường Hưng Phú': ['Võ Nguyên Giáp', 'Nguyễn Văn Linh', 'Trần Hoàng Na'],
      'Phường Hưng Thạnh': ['Nam Sông Hậu', 'Phạm Hùng', 'Nguyễn Văn Cừ nối dài'],
      'Phường Ba Láng': ['Quốc lộ 1A', 'Ba Láng', 'Phú Thứ'],
      'Phường Phú Thứ': ['Nam Sông Hậu', 'Phú Thứ', 'Bốn Tổng Một Ngàn'],
      'Phường Lê Bình': ['Nguyễn Văn Linh', 'Lê Bình', 'Trần Hoàng Na'],
    },
    'Quận Ô Môn': {
      'Phường Châu Văn Liêm': ['Quốc lộ 91', 'Nguyễn Văn Cừ', 'Châu Văn Liêm'],
      'Phường Thới Hòa': ['Quốc lộ 91', 'Thới Hòa', 'Lộ Tẻ'],
      'Phường Trường Lạc': ['Trường Lạc', 'Quốc lộ 91', 'Ô Môn'],
      'Phường Thới An': ['Thới An', 'Nguyễn Văn Linh', 'Quốc lộ 91'],
      'Phường Phước Thới': ['Phước Thới', 'Lộ Vòng Cung', 'Ô Môn'],
    },
    'Huyện Phong Điền': {
      'Xã Nhơn Ái': ['Tỉnh lộ 923', 'Nhơn Ái', 'Mỹ Khánh'],
      'Xã Mỹ Khánh': ['Mỹ Khánh', 'Lộ Vòng Cung', 'Tỉnh lộ 923'],
      'Xã Giai Xuân': ['Tỉnh lộ 918', 'Giai Xuân', 'Phong Điền'],
      'Xã Tân Thới': ['Tân Thới', 'Tỉnh lộ 926', 'Phong Điền'],
      'Thị trấn Phong Điền': ['Nguyễn Văn Cừ nối dài', 'Phong Điền', 'Tỉnh lộ 923'],
    },
  },
  'Hải Phòng': {
    'Quận Hồng Bàng': {
      'Phường Hoàng Văn Thụ': ['Hồng Bàng', 'Quang Trung', 'Minh Khai'],
      'Phường Sở Dầu': ['Hùng Vương', 'Sở Dầu', 'Tôn Đức Thắng'],
      'Phường Thượng Lý': ['Hùng Vương', 'Thượng Lý', 'Bạch Đằng'],
      'Phường Hạ Lý': ['Hạ Lý', 'Lê Lai', 'Quang Trung'],
      'Phường Minh Khai': ['Minh Khai', 'Điện Biên Phủ', 'Hoàng Văn Thụ'],
    },
    'Quận Lê Chân': {
      'Phường An Biên': ['Tô Hiệu', 'Lạch Tray', 'Nguyễn Đức Cảnh'],
      'Phường An Dương': ['An Dương', 'Tôn Đức Thắng', 'Hùng Vương'],
      'Phường Cát Dài': ['Cát Dài', 'Tô Hiệu', 'Trần Nguyên Hãn'],
      'Phường Đông Hải': ['Lạch Tray', 'Nguyễn Văn Linh', 'Hồ Sen'],
      'Phường Vĩnh Niệm': ['Võ Nguyên Giáp', 'Bùi Viện', 'Thiên Lôi'],
    },
    'Quận Ngô Quyền': {
      'Phường Máy Tơ': ['Lê Hồng Phong', 'Lạch Tray', 'Đà Nẵng'],
      'Phường Lạch Tray': ['Lạch Tray', 'Văn Cao', 'Lê Lợi'],
      'Phường Cầu Đất': ['Cầu Đất', 'Điện Biên Phủ', 'Trần Phú'],
      'Phường Gia Viên': ['Lê Lai', 'Trần Phú', 'Minh Khai'],
      'Phường Vạn Mỹ': ['Đà Nẵng', 'Vạn Mỹ', 'Ngô Quyền'],
    },
    'Quận Hải An': {
      'Phường Đằng Hải': ['Lê Hồng Phong', 'Đằng Hải', 'Văn Cao'],
      'Phường Đông Hải 1': ['Ngô Gia Tự', 'Lê Hồng Phong', 'Đông Hải'],
      'Phường Đông Hải 2': ['Ngô Gia Tự', 'Đông Hải 2', 'Bùi Viện'],
      'Phường Thành Tô': ['Thành Tô', 'Nguyễn Bỉnh Khiêm', 'Đình Vũ'],
      'Phường Tràng Cát': ['Tràng Cát', 'Đình Vũ', 'Lê Hồng Phong'],
    },
    'Quận Kiến An': {
      'Phường Ngọc Sơn': ['Trần Thành Ngọ', 'Ngọc Sơn', 'Thiên Lôi'],
      'Phường Trần Thành Ngọ': ['Trần Thành Ngọ', 'Phan Đăng Lưu', 'Phù Liễn'],
      'Phường Đồng Hòa': ['Phan Đăng Lưu', 'Đồng Hòa', 'Trường Chinh'],
      'Phường Bắc Sơn': ['Bắc Sơn', 'Thiên Lôi', 'Phan Đăng Lưu'],
      'Phường Quán Trữ': ['Trường Chinh', 'Quán Trữ', 'Phan Đăng Lưu'],
    },
  },
};

export function generateWardOptionsByDistrict(city: string, district: string) {
  const c = city.trim();
  const d = district.trim();
  if (!c || !d) return [];
  return Object.keys(VIETNAM_ADDRESS_CATALOG[c]?.[d] || {});
}

function normalizeVietnamCityKey(city: string) {
  return city
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/** Gom tên cũ (HCM, TP. Hồ Chí Minh, …) về một mục duy nhất trong dropdown: TP HCM */
const LEGACY_VIETNAM_CITY_MAP: Record<string, string> = {
  'tp. ho chi minh': 'TP HCM',
  'tp ho chi minh': 'TP HCM',
  'ho chi minh': 'TP HCM',
  'hcm': 'TP HCM',
  'tp hcm': 'TP HCM',
  'tp. hcm': 'TP HCM',
  'tphcm': 'TP HCM',
  'tp.hcm': 'TP HCM',
  'sai gon': 'TP HCM',
  'sg': 'TP HCM',
};

export function canonicalVietnamCity(city: string) {
  const raw = String(city || '').trim();
  if (!raw) return '';
  const key = normalizeVietnamCityKey(raw);
  return LEGACY_VIETNAM_CITY_MAP[key] || raw;
}

export function normalizeDistrict(value?: string) {
  const text = String(value || '').trim();
  // Ignore legacy zip-like numeric values such as "7000".
  if (/^\d{3,10}$/.test(text)) return '';
  return text;
}

/** For API/profile sync: keep a non-empty district when legacy data used zipCode as district. */
export function districtForProfileSync(district?: string, zipCode?: string) {
  const cleaned = normalizeDistrict(district) || normalizeDistrict(zipCode);
  if (cleaned) return cleaned;
  return String(district || zipCode || '').trim();
}

/** Địa chỉ cũ gộp phường trong một dòng — bóc tách theo danh mục nếu không có field `ward`. */
export function inferWardFromSavedAddressLine(country: string, cityRaw: string, districtRaw: string, addressLine: string) {
  if (country.trim() !== 'Việt Nam') return '';
  const city = canonicalVietnamCity(cityRaw.trim());
  const district = districtRaw.trim().normalize('NFC');
  if (!city || !district) return '';
  const wards = generateWardOptionsByDistrict(city, district);
  if (!wards.length) return '';
  const line = addressLine.normalize('NFC').toLowerCase();
  for (const w of [...wards].sort((a, b) => b.length - a.length)) {
    const needle = w.normalize('NFC').toLowerCase();
    if (line.includes(needle)) return w;
  }
  return '';
}

export function resolveWardFromSaved(addr: {
  ward?: string;
  country?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  address?: string;
}) {
  const explicit = String(addr.ward ?? '').trim();
  if (explicit.length >= 2) return explicit;
  const district = districtForProfileSync(addr.district, addr.zipCode);
  return inferWardFromSavedAddressLine(
    String(addr.country ?? ''),
    String(addr.city ?? ''),
    district,
    String(addr.address ?? ''),
  );
}

/**
 * Bóc phường/xã đúng catalog khỏi dòng địa chỉ — gỡ các đoạn trùng tên phường
 * (xảy ra khi dữ liệu cũ nối/ghép ward nhiều lần).
 */
export function normalizeVietnamAddressLineParts(
  country: string,
  cityRaw: string,
  districtForCatalog: string,
  zipCode: string | undefined,
  addressLine: string,
  explicitWard?: string,
): { address: string; ward: string } {
  const ctry = String(country ?? '').trim();
  if (ctry !== 'Việt Nam') {
    return { address: String(addressLine ?? '').trim(), ward: String(explicitWard ?? '').trim() };
  }
  const city = canonicalVietnamCity(String(cityRaw ?? '').trim());
  const districtKey = String(districtForCatalog ?? '').trim();
  const wardsList = generateWardOptionsByDistrict(city, districtKey);
  if (!wardsList.length) {
    return { address: String(addressLine ?? '').trim(), ward: String(explicitWard ?? '').trim() };
  }

  const wardByNfc = new Map<string, string>();
  for (const w of wardsList) {
    wardByNfc.set(w.normalize('NFC'), w);
  }

  const explicitNfc = String(explicitWard ?? '').trim().normalize('NFC');
  const explicitCanon = explicitNfc ? wardByNfc.get(explicitNfc) : undefined;

  const rawLine = String(addressLine ?? '').trim();
  const segments = rawLine
    .normalize('NFC')
    .split(/\s*,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  const streetParts: string[] = [];
  const wardsFoundInOrder: string[] = [];
  for (const seg of segments) {
    const canon = wardByNfc.get(seg.normalize('NFC'));
    if (canon) {
      if (!wardsFoundInOrder.includes(canon)) wardsFoundInOrder.push(canon);
      continue;
    }
    streetParts.push(seg);
  }

  let ward = '';
  if (explicitCanon) {
    ward = explicitCanon;
  } else if (wardsFoundInOrder.length > 0) {
    ward = wardsFoundInOrder[0];
  } else {
    const streetJoined = streetParts.join(', ');
    const distProfile = districtForProfileSync(districtKey, zipCode);
    const inferred = inferWardFromSavedAddressLine(ctry, city, distProfile, streetJoined || rawLine);
    ward = inferred && wardByNfc.has(inferred.normalize('NFC')) ? inferred : '';
  }

  if (!ward && explicitNfc && !explicitCanon) {
    ward = String(explicitWard ?? '').trim();
  }

  let addressClean = streetParts.join(', ').trim();
  if (!addressClean && rawLine && !ward) {
    addressClean = rawLine;
  }

  return { address: addressClean, ward };
}

export function sanitizeVietnamShippingRowFields(row: {
  country?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  address?: string;
  ward?: string;
}): { address: string; ward: string; city: string; district: string } {
  const country = String(row.country ?? '').trim();
  const addressRaw = String(row.address ?? '').trim();
  const wardRaw = String(row.ward ?? '').trim();
  if (country !== 'Việt Nam') {
    return {
      address: addressRaw,
      ward: wardRaw,
      city: String(row.city ?? '').trim(),
      district: String(row.district ?? '').trim(),
    };
  }
  const city = canonicalVietnamCity(String(row.city ?? '').trim());
  const districtRaw = districtForProfileSync(row.district, row.zipCode).trim();
  const districtCatalog = resolveDistrictForVietnamOrder(country, city, districtRaw);
  if (!generateWardOptionsByDistrict(city, districtCatalog).length) {
    return { address: addressRaw, ward: wardRaw, city, district: districtRaw };
  }
  const split = normalizeVietnamAddressLineParts(country, city, districtCatalog, row.zipCode, addressRaw, wardRaw);
  const nextAddress = split.address.trim() ? split.address : split.ward ? '' : addressRaw;
  const nextWard = split.ward || wardRaw;
  return {
    address: nextAddress,
    ward: nextWard,
    city,
    district: districtCatalog,
  };
}

export function isPostalCodeOnlyDistrict(value: string) {
  return /^\d{3,10}$/.test(value.trim());
}

/** Khớp quận/huyện với danh sách (Unicode NFC) — tránh lệch ký tự vô hình giữa <select> và state. */
export function resolveDistrictForVietnamOrder(country: string, cityRaw: string, districtRaw: string) {
  const cty = country.trim();
  const cityCanon = cty === 'Việt Nam' ? canonicalVietnamCity(cityRaw.trim()) : cityRaw.trim();
  let d = districtRaw.trim().normalize('NFC');
  if (cty !== 'Việt Nam' || !cityCanon || !CITY_DISTRICTS[cityCanon]?.length || !d) return d;
  const list = CITY_DISTRICTS[cityCanon];
  if (list.includes(d)) return d;
  const matched = list.find((opt) => opt.normalize('NFC') === d);
  return matched || d;
}
