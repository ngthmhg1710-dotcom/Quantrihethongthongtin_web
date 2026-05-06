import React, { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { CreditCard, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatVnd, SHIPPING_FEE_LEGACY, SHIPPING_FREE_SUBTOTAL_MIN_LEGACY } from '../utils/currency';
import { getCurrentLoyaltyTier, getLoyaltyDiscountMeta } from '../utils/loyalty';

const CITY_DISTRICTS: Record<string, string[]> = {
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

const CITY_OPTIONS = Object.keys(CITY_DISTRICTS);

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

function generateWardOptionsByDistrict(city: string, district: string) {
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

function canonicalVietnamCity(city: string) {
  const raw = String(city || '').trim();
  if (!raw) return '';
  const key = normalizeVietnamCityKey(raw);
  return LEGACY_VIETNAM_CITY_MAP[key] || raw;
}

function normalizeDistrict(value?: string) {
  const text = String(value || '').trim();
  // Ignore legacy zip-like numeric values such as "7000".
  if (/^\d{3,10}$/.test(text)) return '';
  return text;
}

/** For API/profile sync: keep a non-empty district when legacy data used zipCode as district. */
function districtForProfileSync(district?: string, zipCode?: string) {
  const cleaned = normalizeDistrict(district) || normalizeDistrict(zipCode);
  if (cleaned) return cleaned;
  return String(district || zipCode || '').trim();
}

function isCompleteAddressRow(row: { name?: string; address?: string; city?: string; district?: string; country?: string }) {
  return [row.name, row.address, row.city, row.district, row.country].every((v) => String(v ?? '').trim().length > 0);
}

function isValidSavedCardRow(method: {
  cardName?: string;
  last4?: string;
  expiryDate?: string;
}) {
  const name = String(method.cardName ?? '').trim();
  const last4 = String(method.last4 ?? '');
  const exp = String(method.expiryDate ?? '');
  return name.length >= 2 && /^\d{4}$/.test(last4) && /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
}

function isPostalCodeOnlyDistrict(value: string) {
  return /^\d{3,10}$/.test(value.trim());
}

/** Tránh undefined trong object — JSON.stringify bỏ key → API profile 400. */
function sanitizeAddressForApi(row: {
  label?: string;
  name?: unknown;
  address?: unknown;
  city?: unknown;
  district?: unknown;
  country?: unknown;
  isDefault?: boolean;
}) {
  return {
    label: String(row.label || 'Nhà riêng').trim() || 'Nhà riêng',
    name: String(row.name ?? '').trim(),
    address: String(row.address ?? '').trim(),
    city: String(row.city ?? '').trim(),
    district: String(row.district ?? '').trim(),
    country: String(row.country ?? '').trim(),
    isDefault: Boolean(row.isDefault),
  };
}

function normalizeCheckoutPhone(value: string) {
  return value.trim().replace(/[\s().\-_]/g, '');
}

function joinAddressParts(parts: Array<unknown>) {
  return parts
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

/** Khớp quận/huyện với danh sách (Unicode NFC) — tránh lệch ký tự vô hình giữa <select> và state. */
function resolveDistrictForVietnamOrder(country: string, cityRaw: string, districtRaw: string) {
  const cty = country.trim();
  const cityCanon = cty === 'Việt Nam' ? canonicalVietnamCity(cityRaw.trim()) : cityRaw.trim();
  let d = districtRaw.trim().normalize('NFC');
  if (cty !== 'Việt Nam' || !cityCanon || !CITY_DISTRICTS[cityCanon]?.length || !d) return d;
  const list = CITY_DISTRICTS[cityCanon];
  if (list.includes(d)) return d;
  const matched = list.find((opt) => opt.normalize('NFC') === d);
  return matched || d;
}

export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder, user, updateProfile } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [confirmedOrderTotal, setConfirmedOrderTotal] = useState<number | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    city: '',
    district: '',
    country: 'Việt Nam'
  });
  const [didPrefillShipping, setDidPrefillShipping] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [setAsDefaultAddress, setSetAsDefaultAddress] = useState(true);
  const [makeSelectedDefaultInPicker, setMakeSelectedDefaultInPicker] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'bank_transfer'>('card');
  const [didPrefillSavedCard, setDidPrefillSavedCard] = useState(false);
  const [saveCardToAccount, setSaveCardToAccount] = useState(true);
  const [setAsDefaultCard, setSetAsDefaultCard] = useState(true);
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof typeof shippingInfo, string>>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof typeof paymentInfo, string>>>({});

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const loyaltyPointsBalance = Math.max(0, Math.floor(Number(user?.loyaltyPoints ?? 0)));
  const loyaltyPricing = getLoyaltyDiscountMeta(loyaltyPointsBalance);
  const loyaltyDiscountAmount = Number(((subtotal * loyaltyPricing.discountPercent) / 100).toFixed(2));
  const subtotalAfterLoyalty = Number((subtotal - loyaltyDiscountAmount).toFixed(2));
  const shippingBase = subtotalAfterLoyalty > SHIPPING_FREE_SUBTOTAL_MIN_LEGACY ? 0 : SHIPPING_FEE_LEGACY;
  const shipping = loyaltyPricing.loyaltyFreeShipping ? 0 : shippingBase;
  const total = Number((subtotalAfterLoyalty + shipping).toFixed(2));
  const loyaltyTierApplied = getCurrentLoyaltyTier(loyaltyPointsBalance);

  useEffect(() => {
    if (!user || didPrefillShipping) return;
    const addressBook = user.shippingAddresses || [];
    const defaultAddressIndex = addressBook.findIndex((address) => address.isDefault);
    const chosenAddress = addressBook[defaultAddressIndex >= 0 ? defaultAddressIndex : 0];
    setSelectedAddressIndex(chosenAddress ? (defaultAddressIndex >= 0 ? defaultAddressIndex : 0) : -1);
    setShippingInfo((prev) => {
      const resolvedCountry =
        chosenAddress?.country || user.defaultShippingAddress?.country || prev.country;
      const rawCity = chosenAddress?.city || user.defaultShippingAddress?.city || prev.city;
      const cityResolved =
        resolvedCountry === 'Việt Nam' ? canonicalVietnamCity(String(rawCity || '')) : String(rawCity || '');
      let districtResolved =
        normalizeDistrict(chosenAddress?.district) ||
        normalizeDistrict(user.defaultShippingAddress?.district) ||
        normalizeDistrict(chosenAddress?.zipCode) ||
        normalizeDistrict(user.defaultShippingAddress?.zipCode) ||
        districtForProfileSync(chosenAddress?.district, chosenAddress?.zipCode) ||
        districtForProfileSync(
          user.defaultShippingAddress?.district,
          user.defaultShippingAddress?.zipCode
        ) ||
        prev.district;
      if (
        resolvedCountry === 'Việt Nam' &&
        cityResolved &&
        CITY_DISTRICTS[cityResolved]?.length &&
        districtResolved &&
        isPostalCodeOnlyDistrict(String(districtResolved))
      ) {
        districtResolved = '';
      }
      return {
        name: chosenAddress?.name || user.defaultShippingAddress?.name || user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: chosenAddress?.address || user.defaultShippingAddress?.address || prev.address,
        ward: '',
        city: cityResolved,
        district: districtResolved,
        country: resolvedCountry,
      };
    });
    setDidPrefillShipping(true);
  }, [user, didPrefillShipping]);

  useEffect(() => {
    if (shippingInfo.country !== 'Việt Nam') return;
    const canon = canonicalVietnamCity(shippingInfo.city);
    if (!canon || canon === shippingInfo.city) return;
    if (!CITY_DISTRICTS[canon]) return;
    setShippingInfo((prev) => {
      if (prev.country !== 'Việt Nam') return prev;
      const c = canonicalVietnamCity(prev.city);
      if (c === prev.city) return prev;
      const nextDistricts = CITY_DISTRICTS[c] || [];
      const keepDistrict = nextDistricts.includes(prev.district) ? prev.district : '';
      return { ...prev, city: c, district: keepDistrict, ward: '' };
    });
  }, [shippingInfo.country, shippingInfo.city]);

  /** Bỏ mã bưu điện nhập nhầm làm quận/huyện (VD: 70000) khi TP có danh sách quận. */
  useEffect(() => {
    if (shippingInfo.country !== 'Việt Nam') return;
    const city = canonicalVietnamCity(shippingInfo.city);
    const d = shippingInfo.district.trim();
    if (!d || !city || !CITY_DISTRICTS[city]?.length) return;
    if (!isPostalCodeOnlyDistrict(d)) return;
    setShippingInfo((prev) => ({ ...prev, district: '' }));
  }, [shippingInfo.country, shippingInfo.city, shippingInfo.district]);

  useEffect(() => {
    if (!user || didPrefillSavedCard || paymentMethod !== 'card') return;
    const savedCards = user.savedPaymentMethods || [];
    if (savedCards.length === 0) return;
    const defaultCard = savedCards.find((card) => card.isDefault) || savedCards[0];
    if (!defaultCard) return;
    setPaymentInfo((prev) => ({
      ...prev,
      cardName: defaultCard.cardName || prev.cardName,
      expiryDate: defaultCard.expiryDate || prev.expiryDate,
      cardNumber: `**** **** **** ${defaultCard.last4}`,
    }));
    setDidPrefillSavedCard(true);
  }, [user, didPrefillSavedCard, paymentMethod]);

  useEffect(() => {
    if (!user) return;
    if (cart.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [user, cart.length, step, navigate]);

  const applyAddressFromBook = (index: number) => {
    if (!user?.shippingAddresses || !user.shippingAddresses[index]) return;
    const address = user.shippingAddresses[index];
    setSelectedAddressIndex(index);
    setIsAddingNewAddress(false);
    setShippingErrors({});
    setShippingInfo((prev) => {
      const cityVo =
        address.country === 'Việt Nam' ? canonicalVietnamCity(String(address.city ?? '')) : String(address.city ?? '');
      const rawDistrict = districtForProfileSync(address.district, address.zipCode);
      const districtOk =
        address.country === 'Việt Nam' &&
        cityVo &&
        CITY_DISTRICTS[cityVo]?.length &&
        rawDistrict &&
        isPostalCodeOnlyDistrict(rawDistrict)
          ? ''
          : rawDistrict;
      return {
        ...prev,
        name: address.name,
        address: address.address,
        ward: '',
        city: cityVo,
        district: districtOk,
        country: address.country,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      };
    });
  };

  const setDefaultAddressInBook = async (index: number) => {
    if (!user?.shippingAddresses || !user.shippingAddresses[index]) return;
    try {
      const rawSel = user.shippingAddresses[index];
      const syncedSel = {
        name: String(rawSel.name ?? '').trim(),
        address: String(rawSel.address ?? '').trim(),
        city: String(rawSel.city ?? '').trim(),
        district: districtForProfileSync(rawSel.district, rawSel.zipCode),
        country: String(rawSel.country ?? '').trim(),
      };
      if (!isCompleteAddressRow(syncedSel)) {
        toast.error('Địa chỉ này chưa đủ thông tin để đặt làm mặc định.');
        return;
      }
      const mappedBook = user.shippingAddresses.map((addr, idx) => ({
        label: addr.label || (idx === 0 ? 'Nhà riêng' : `Địa chỉ ${idx + 1}`),
        name: String(addr.name ?? '').trim(),
        address: String(addr.address ?? '').trim(),
        city: String(addr.city ?? '').trim(),
        district: districtForProfileSync(addr.district, addr.zipCode),
        country: String(addr.country ?? '').trim(),
        isDefault: false,
      }));
      const nextBook = mappedBook.filter(isCompleteAddressRow).map((row) => ({
        ...row,
        isDefault:
          row.name === syncedSel.name &&
          row.address === syncedSel.address &&
          row.city === syncedSel.city &&
          row.district === syncedSel.district &&
          row.country === syncedSel.country,
      }));
      if (!nextBook.some((r) => r.isDefault)) {
        toast.error('Không thể đặt mặc định: địa chỉ không nằm trong danh sách hợp lệ đã lưu.');
        return;
      }
      await updateProfile({ shippingAddresses: nextBook.map(sanitizeAddressForApi) });
      toast.success('Đã cập nhật địa chỉ mặc định');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đặt địa chỉ mặc định');
    }
  };

  const handlePickSavedAddress = async (index: number) => {
    applyAddressFromBook(index);
    if (makeSelectedDefaultInPicker) {
      await setDefaultAddressInBook(index);
    }
    setIsAddressPickerOpen(false);
  };

  const sortedSavedAddresses = (user?.shippingAddresses || [])
    .map((address, index) => ({ address, index }))
    .sort((a, b) => {
      const aDefault = a.address.isDefault ? 1 : 0;
      const bDefault = b.address.isDefault ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return (a.address.label || '').localeCompare(b.address.label || '');
    });
  const selectedSavedAddress =
    user?.shippingAddresses && selectedAddressIndex >= 0 ? user.shippingAddresses[selectedAddressIndex] : null;
  const effectiveCityVN =
    shippingInfo.country === 'Việt Nam' ? canonicalVietnamCity(shippingInfo.city) : shippingInfo.city.trim();
  const currentDistrictOptions = effectiveCityVN ? CITY_DISTRICTS[effectiveCityVN] || [] : [];
  const cityOptionsWithCurrent = effectiveCityVN && !CITY_OPTIONS.includes(effectiveCityVN)
    ? [effectiveCityVN, ...CITY_OPTIONS]
    : CITY_OPTIONS;
  const blockPostalAsDistrict =
    shippingInfo.country === 'Việt Nam' &&
    Boolean(effectiveCityVN && CITY_DISTRICTS[effectiveCityVN]?.length) &&
    isPostalCodeOnlyDistrict(shippingInfo.district);
  const districtOptionsWithCurrent =
    shippingInfo.district &&
    !currentDistrictOptions.includes(shippingInfo.district) &&
    !blockPostalAsDistrict
      ? [shippingInfo.district, ...currentDistrictOptions]
      : currentDistrictOptions;
  const currentWardOptions = shippingInfo.country === 'Việt Nam'
    ? generateWardOptionsByDistrict(effectiveCityVN, shippingInfo.district)
    : [];
  const wardOptionsWithCurrent =
    shippingInfo.ward &&
    !currentWardOptions.includes(shippingInfo.ward)
      ? [shippingInfo.ward, ...currentWardOptions]
      : currentWardOptions;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="font-['Poppins'] text-2xl font-bold mb-3">Vui lòng đăng nhập để thanh toán</h1>
          <p className="text-gray-600 mb-6">
            Bạn cần tài khoản để đặt hàng và theo dõi lịch sử mua hàng.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login?redirect=%2Fcheckout"
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/login?mode=register&redirect=%2Fcheckout"
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step !== 'success') {
    return null;
  }

  const validateShippingInfo = () => {
    const errors: Partial<Record<keyof typeof shippingInfo, string>> = {};
    const name = shippingInfo.name.trim();
    const email = shippingInfo.email.trim();
    const phone = normalizeCheckoutPhone(shippingInfo.phone);
    const address = shippingInfo.address.trim();
    const ward = shippingInfo.ward.trim();
    const country = shippingInfo.country.trim();
    const city =
      country === 'Việt Nam'
        ? canonicalVietnamCity(shippingInfo.city.trim())
        : shippingInfo.city.trim();
    const district = shippingInfo.district.trim();

    if (name.length < 2) errors.name = 'Vui lòng nhập họ tên đầy đủ';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (!/^\+?[0-9]{8,16}$/.test(phone)) errors.phone = 'Số điện thoại không hợp lệ';
    if (address.length < 6) errors.address = 'Địa chỉ quá ngắn';
    if (ward.length < 2) errors.ward = 'Vui lòng nhập phường / xã';
    if (city.length < 2) errors.city = 'Vui lòng nhập thành phố / tỉnh';
    if (district.length < 2) errors.district = 'Vui lòng nhập quận / huyện';
    if (
      country === 'Việt Nam' &&
      city &&
      CITY_DISTRICTS[city]?.length &&
      district &&
      isPostalCodeOnlyDistrict(district)
    ) {
      errors.district = 'Vui lòng chọn quận / huyện trong danh sách (không dùng mã bưu điện).';
    }
    if (!country) errors.country = 'Vui lòng chọn quốc gia';

    return errors;
  };

  const validatePaymentInfo = () => {
    const errors: Partial<Record<keyof typeof paymentInfo, string>> = {};
    if (paymentMethod !== 'card') {
      return errors;
    }
    const cardNumber = paymentInfo.cardNumber.replace(/\s+/g, '');
    const maskedCardPattern = /^\*{12}\d{4}$/;
    const isUsingSavedMaskedCard = maskedCardPattern.test(cardNumber);
    const cvv = paymentInfo.cvv.trim();
    const cardName = paymentInfo.cardName.trim();
    const expiryDate = paymentInfo.expiryDate.trim();

    if (!isUsingSavedMaskedCard && !/^\d{13,19}$/.test(cardNumber)) errors.cardNumber = 'Số thẻ phải gồm 13-19 chữ số';
    if (!isUsingSavedMaskedCard && !/^\d{3,4}$/.test(cvv)) errors.cvv = 'CVV phải gồm 3 hoặc 4 chữ số';
    if (cardName.length < 2) errors.cardName = 'Vui lòng nhập tên chủ thẻ';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Hạn sử dụng phải theo định dạng MM/YY';
    } else {
      const [month, year] = expiryDate.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Thẻ đã hết hạn';
      }
    }

    return errors;
  };
  const detectCardBrand = (cardNumber: string) => {
    const digits = cardNumber.replace(/\D/g, '');
    if (/^4/.test(digits)) return 'Visa';
    if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-7])/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    if (/^6/.test(digits)) return 'Discover';
    return 'Card';
  };

  const hasInvalidCart = cart.some((item) => item.quantity <= 0 || item.product.price < 0);

  const paymentShippingErrors = step === 'payment' ? validateShippingInfo() : {};
  const paymentShippingBlocked =
    step === 'payment' && Object.keys(paymentShippingErrors).length > 0;

  const handleShippingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart) {
      toast.error('Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng cập nhật lại giỏ hàng.');
      navigate('/cart');
      return;
    }
    const errors = validateShippingInfo();
    setShippingErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart || cart.length === 0) {
      toast.error('Giỏ hàng trống hoặc không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
      navigate('/cart');
      return;
    }
    const shippingErrorsNow = validateShippingInfo();
    setShippingErrors(shippingErrorsNow);
    if (Object.keys(shippingErrorsNow).length > 0) {
      toast.error('Thông tin giao hàng chưa đầy đủ. Vui lòng quay lại bước 1 và kiểm tra.');
      setStep('shipping');
      return;
    }
    const errors = validatePaymentInfo();
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin thanh toán');
      return;
    }

    /** Snapshot ngay sau khi pass validate — tránh await làm state/ effect ghi đè mất quận-huyện trước khi tạo đơn. */
    const ship = { ...shippingInfo };

    if (saveAddressToAccount && user) {
      try {
        const mappedBook = (user.shippingAddresses || []).map((address, index) => ({
          label: address.label || (index === 0 ? 'Nhà riêng' : `Địa chỉ ${index + 1}`),
          name: String(address.name ?? '').trim(),
          address: String(address.address ?? '').trim(),
          city: String(address.city ?? '').trim(),
          district: districtForProfileSync(address.district, address.zipCode),
          country: String(address.country ?? '').trim(),
          isDefault: Boolean(address.isDefault),
        }));
        const skippedIncomplete = mappedBook.length - mappedBook.filter(isCompleteAddressRow).length;
        const currentBook = mappedBook.filter(isCompleteAddressRow);
        const normalizedCurrent = {
          name: ship.name.trim(),
          address: joinAddressParts([ship.address, ship.ward]),
          city:
            ship.country.trim() === 'Việt Nam'
              ? canonicalVietnamCity(ship.city.trim())
              : ship.city.trim(),
          district: resolveDistrictForVietnamOrder(ship.country, ship.city, ship.district),
          country: ship.country.trim(),
        };
        const existingIndex = currentBook.findIndex(
          (item) =>
            item.name === normalizedCurrent.name &&
            item.address === normalizedCurrent.address &&
            item.city === normalizedCurrent.city &&
            item.district === normalizedCurrent.district &&
            item.country === normalizedCurrent.country
        );
        const nextBook = [...currentBook];
        if (existingIndex === -1) {
          nextBook.push({
            label: nextBook.length === 0 ? 'Nhà riêng' : `Địa chỉ ${nextBook.length + 1}`,
            ...normalizedCurrent,
            isDefault: nextBook.length === 0 || setAsDefaultAddress,
          });
        } else if (setAsDefaultAddress) {
          nextBook[existingIndex] = { ...nextBook[existingIndex], isDefault: true };
        }
        if (setAsDefaultAddress) {
          nextBook.forEach((item, index) => {
            item.isDefault = index === (existingIndex === -1 ? nextBook.length - 1 : existingIndex);
          });
        }
        const sanitizedBook = nextBook.map(sanitizeAddressForApi);
        const badRow = sanitizedBook.find((r) => !isCompleteAddressRow(r));
        if (badRow) {
          toast.error(
            'Không lưu được sổ địa chỉ: còn dòng thiếu thông tin. Vui lòng quay lại bước 1, chọn đủ Tỉnh/TP và Quận/Huyện trong danh sách rồi thử lại.'
          );
        } else {
          // Không gửi `name`: tránh 400 nếu user.name trong DB ngắn hơn 2 ký tự (rule PATCH profile).
          await updateProfile({
            phone: normalizeCheckoutPhone(ship.phone),
            shippingAddresses: sanitizedBook,
          });
          if (skippedIncomplete > 0) {
            toast.warning(
              `Đã bỏ qua ${skippedIncomplete} địa chỉ cũ thiếu thông tin khi lưu. Bạn có thể sửa lại trong trang tài khoản.`
            );
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể lưu địa chỉ vào tài khoản');
      }
    }

    if (paymentMethod === 'card' && saveCardToAccount && user) {
      try {
        const digits = paymentInfo.cardNumber.replace(/\D/g, '');
        const cardLast4 = digits.slice(-4);
        const nextMethods = (user.savedPaymentMethods || [])
          .map((method, index) => ({
            label: method.label || `Card ${index + 1}`,
            cardName: method.cardName,
            brand: method.brand || 'Card',
            last4: method.last4,
            expiryDate: method.expiryDate,
            isDefault: Boolean(method.isDefault),
          }))
          .filter(isValidSavedCardRow);
        const existingIndex = nextMethods.findIndex(
          (method) =>
            method.last4 === cardLast4 &&
            method.expiryDate === paymentInfo.expiryDate.trim() &&
            method.cardName.toLowerCase() === paymentInfo.cardName.trim().toLowerCase()
        );
        if (existingIndex === -1) {
          nextMethods.push({
            label: `Card ${nextMethods.length + 1}`,
            cardName: paymentInfo.cardName.trim(),
            brand: detectCardBrand(digits),
            last4: cardLast4,
            expiryDate: paymentInfo.expiryDate.trim(),
            isDefault: nextMethods.length === 0 || setAsDefaultCard,
          });
        } else if (setAsDefaultCard) {
          nextMethods[existingIndex] = { ...nextMethods[existingIndex], isDefault: true };
        }
        if (setAsDefaultCard) {
          nextMethods.forEach((method, index) => {
            method.isDefault = index === (existingIndex === -1 ? nextMethods.length - 1 : existingIndex);
          });
        }
        await updateProfile({ savedPaymentMethods: nextMethods });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể lưu thẻ cho lần sau');
      }
    }

    const orderId = `ORD-${Date.now()}`;
    const orderCity =
      ship.country.trim() === 'Việt Nam'
        ? canonicalVietnamCity(ship.city.trim())
        : ship.city.trim();
    const orderDistrict = resolveDistrictForVietnamOrder(ship.country, ship.city, ship.district);
    const order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total,
      paymentMethod,
      status: 'pending' as const,
      shippingAddress: {
        name: ship.name.trim(),
        email: ship.email.trim(),
        phone: normalizeCheckoutPhone(ship.phone),
        address: joinAddressParts([ship.address, ship.ward]),
        city: orderCity,
        district: orderDistrict,
        country: ship.country.trim(),
      },
    };

    try {
      await addOrder(order);
      setConfirmedOrderTotal(total);
      clearCart();
      setStep('success');
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đặt hàng';
      toast.error(message);
    }
  };

  if (step === 'success') {
    const displayTotal = confirmedOrderTotal ?? total;
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-[#FFC0CB]" />
          </div>
          <h1 className="font-['Poppins'] text-3xl font-bold mb-4">Đơn hàng đã được xác nhận!</h1>
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã mua hàng. Chúng tôi đã gửi email xác nhận tới {shippingInfo.email}
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-600 mb-2">Tổng đơn hàng</p>
            <p className="text-3xl font-bold mb-4">{formatVnd(displayTotal)}</p>
            <p className="text-sm text-gray-600">Dự kiến giao hàng: 5-7 ngày làm việc</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard?tab=orders')}
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-b from-[#fff7fa] via-white to-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-3xl sm:text-4xl font-bold">Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-1">Hoàn tất thông tin để xác nhận đơn hàng của bạn.</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border ${
                  step === 'shipping' ? 'bg-black text-white border-black' : 'bg-[#FFE4E9] text-black border-[#ffd4de]'
                }`}
              >
                1
              </div>
              <span className={`hidden sm:inline text-sm ${step === 'shipping' ? 'text-black font-medium' : 'text-gray-500'}`}>
                Giao hàng
              </span>
            </div>
            <div className={`w-12 sm:w-20 h-1 rounded-full ${step === 'payment' ? 'bg-black' : 'bg-gray-300'}`} />
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border ${
                  step === 'payment' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                2
              </div>
              <span className={`hidden sm:inline text-sm ${step === 'payment' ? 'text-black font-medium' : 'text-gray-500'}`}>
                Thanh toán
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white rounded-3xl border border-[#f3dbe1] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6" />
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Thông tin giao hàng</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  {user.shippingAddresses && user.shippingAddresses.length > 0 && (
                    <div className="rounded-2xl border border-[#f2dce2] bg-[#fffafc] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Địa chỉ giao hàng</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {selectedSavedAddress
                              ? `${selectedSavedAddress.label}${selectedSavedAddress.isDefault ? ' (Mặc định)' : ''} • ${selectedSavedAddress.name} • ${selectedSavedAddress.address}, ${normalizeDistrict(selectedSavedAddress.district) || normalizeDistrict(selectedSavedAddress.zipCode) || ''}, ${selectedSavedAddress.city}`
                              : 'Chưa chọn địa chỉ'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddressPickerOpen(true)}
                          className="shrink-0 px-3 py-1.5 text-xs border border-gray-300 rounded-full bg-white hover:bg-gray-100"
                        >
                          Chọn địa chỉ
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Họ và tên</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.name}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, name: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="Jane Doe"
                      />
                      {shippingErrors.name && <p className="mt-1 text-xs text-red-600">{shippingErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, email: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="jane@example.com"
                      />
                      {shippingErrors.email && <p className="mt-1 text-xs text-red-600">{shippingErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, phone: e.target.value });
                        setShippingErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="+84..."
                    />
                    {shippingErrors.phone && <p className="mt-1 text-xs text-red-600">{shippingErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, address: e.target.value });
                        setShippingErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="VD: Số nhà, tên đường, tòa nhà, căn hộ…"
                    />
                    {shippingErrors.address && <p className="mt-1 text-xs text-red-600">{shippingErrors.address}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quốc gia</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => {
                          const nextCountry = e.target.value;
                          setShippingInfo((prev) => {
                            const next = { ...prev, country: nextCountry };
                            if (nextCountry === 'Việt Nam') {
                              next.city = canonicalVietnamCity(prev.city);
                              const d = CITY_DISTRICTS[next.city] || [];
                              next.district = d.includes(prev.district) ? prev.district : '';
                              next.ward = '';
                            }
                            return next;
                          });
                          setShippingErrors((prev) => ({ ...prev, country: undefined, city: undefined, district: undefined, ward: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      >
                        <option>Việt Nam</option>
                        <option>Hoa Kỳ</option>
                        <option>Canada</option>
                      </select>
                      {shippingErrors.country && <p className="mt-1 text-xs text-red-600">{shippingErrors.country}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thành phố / Tỉnh</label>
                      {shippingInfo.country === 'Việt Nam' ? (
                        <select
                          required
                          value={effectiveCityVN}
                          onChange={(e) => {
                            const nextCity = e.target.value;
                            setShippingInfo((prev) => {
                              const nextDistricts = CITY_DISTRICTS[nextCity] || [];
                              const keepDistrict = nextDistricts.includes(prev.district) ? prev.district : '';
                              return { ...prev, city: nextCity, district: keepDistrict, ward: '' };
                            });
                            setShippingErrors((prev) => ({ ...prev, city: undefined, district: undefined, ward: undefined }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        >
                          <option value="">Chọn thành phố / tỉnh</option>
                          {cityOptionsWithCurrent.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={shippingInfo.city}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, city: e.target.value });
                            setShippingErrors((prev) => ({ ...prev, city: undefined }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                          placeholder="Thành phố / Tỉnh"
                        />
                      )}
                      {shippingErrors.city && <p className="mt-1 text-xs text-red-600">{shippingErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quận / Huyện</label>
                      {shippingInfo.country === 'Việt Nam' ? (
                        <select
                          required
                          disabled={!effectiveCityVN}
                          value={shippingInfo.district}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, district: e.target.value, ward: '' });
                            setShippingErrors((prev) => ({ ...prev, district: undefined, ward: undefined }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">{effectiveCityVN ? 'Chọn quận / huyện' : 'Chọn thành phố trước'}</option>
                          {districtOptionsWithCurrent.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={shippingInfo.district}
                          onChange={(e) => {
                            setShippingInfo({ ...shippingInfo, district: e.target.value, ward: '' });
                            setShippingErrors((prev) => ({ ...prev, district: undefined, ward: undefined }));
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                          placeholder="Quận / Huyện"
                        />
                      )}
                      {shippingErrors.district && <p className="mt-1 text-xs text-red-600">{shippingErrors.district}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phường / Xã</label>
                    {shippingInfo.country === 'Việt Nam' && currentWardOptions.length > 0 ? (
                      <select
                        required
                        disabled={!shippingInfo.district}
                        value={shippingInfo.ward}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, ward: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, ward: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC0CB] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">{shippingInfo.district ? 'Chọn phường / xã' : 'Chọn quận / huyện trước'}</option>
                        {wardOptionsWithCurrent.map((ward) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={shippingInfo.ward}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, ward: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, ward: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder={
                          shippingInfo.country === 'Việt Nam'
                            ? 'Nhập phường / xã (quận này chưa có dữ liệu danh mục)'
                            : 'Phường / Xã'
                        }
                      />
                    )}
                    {shippingErrors.ward && <p className="mt-1 text-xs text-red-600">{shippingErrors.ward}</p>}
                  </div>

                  <div className="rounded-2xl border border-[#f2dce2] bg-[#fffafc] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        />
                        Lưu địa chỉ này vào sổ địa chỉ
                      </label>
                      {isAddingNewAddress && saveAddressToAccount && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={setAsDefaultAddress}
                            onChange={(e) => setSetAsDefaultAddress(e.target.checked)}
                          />
                          Đặt làm địa chỉ mặc định
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Khi đặt hàng, địa chỉ sẽ được lưu vào tài khoản (tùy chọn).
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors font-medium shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                  >
                    Tiếp tục tới thanh toán
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-3xl border border-[#f3dbe1] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Thông tin thanh toán</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {paymentShippingBlocked && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                      <p className="font-semibold mb-2">Thông tin giao hàng chưa đủ — không thể đặt hàng</p>
                      <ul className="list-disc pl-5 space-y-1 mb-3">
                        {Object.entries(paymentShippingErrors).map(([key, msg]) => (
                          <li key={key}>{msg}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setStep('shipping')}
                        className="font-medium underline"
                      >
                        ← Quay lại bước 1 để sửa
                      </button>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#f2dce2] bg-[#fffafc] p-4">
                    <p className="text-sm font-medium mb-2">Phương thức thanh toán</p>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-transparent hover:border-[#f0d0d9] hover:bg-white transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => {
                            setPaymentMethod('card');
                            setPaymentErrors({});
                          }}
                        />
                        Thẻ ngân hàng
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-transparent hover:border-[#f0d0d9] hover:bg-white transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => {
                            setPaymentMethod('cod');
                            setPaymentErrors({});
                          }}
                        />
                        Thanh toán khi nhận hàng (COD)
                      </label>
                      <label className="flex items-center gap-2 p-2.5 rounded-lg border border-transparent hover:border-[#f0d0d9] hover:bg-white transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => {
                            setPaymentMethod('bank_transfer');
                            setPaymentErrors({});
                          }}
                        />
                        Chuyển khoản ngân hàng
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' ? (
                    <>
                  <div className="rounded-2xl border border-[#f2dce2] bg-[#fffafc] p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={saveCardToAccount}
                          onChange={(e) => setSaveCardToAccount(e.target.checked)}
                        />
                        Lưu thẻ rút gọn cho lần mua sau
                      </label>
                      {saveCardToAccount && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={setAsDefaultCard}
                            onChange={(e) => setSetAsDefaultCard(e.target.checked)}
                          />
                          Đặt làm thẻ mặc định
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Chỉ lưu tên thẻ, loại thẻ, 4 số cuối và hạn dùng. Không lưu số thẻ đầy đủ/CVV.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
                        setPaymentErrors((prev) => ({ ...prev, cardNumber: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {paymentErrors.cardNumber && <p className="mt-1 text-xs text-red-600">{paymentErrors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cardName}
                      onChange={(e) => {
                        setPaymentInfo({ ...paymentInfo, cardName: e.target.value });
                        setPaymentErrors((prev) => ({ ...prev, cardName: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="Jane Doe"
                    />
                    {paymentErrors.cardName && <p className="mt-1 text-xs text-red-600">{paymentErrors.cardName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                          setPaymentInfo({ ...paymentInfo, expiryDate: formatted });
                          setPaymentErrors((prev) => ({ ...prev, expiryDate: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {paymentErrors.expiryDate && <p className="mt-1 text-xs text-red-600">{paymentErrors.expiryDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        required
                        value={paymentInfo.cvv}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPaymentInfo({ ...paymentInfo, cvv: raw });
                          setPaymentErrors((prev) => ({ ...prev, cvv: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="123"
                        maxLength={4}
                      />
                      {paymentErrors.cvv && <p className="mt-1 text-xs text-red-600">{paymentErrors.cvv}</p>}
                    </div>
                  </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                      {paymentMethod === 'cod'
                        ? 'Đơn hàng sẽ được thanh toán khi nhận hàng.'
                        : 'Vui lòng chuyển khoản theo thông tin được gửi sau khi đặt hàng.'}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="flex-1 bg-gray-100 text-black py-3 rounded-full hover:bg-gray-200 transition-colors border border-gray-200 font-medium"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={paymentShippingBlocked}
                      className={`flex-1 py-3 rounded-full transition-colors font-medium ${
                        paymentShippingBlocked
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800 shadow-[0_8px_20px_rgba(0,0,0,0.18)]'
                      }`}
                    >
                      Đặt hàng
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-[#f3dbe1] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sticky top-24">
              <h3 className="font-['Poppins'] font-semibold text-xl mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">SL: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatVnd(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                {(loyaltyPricing.discountPercent > 0 || loyaltyPricing.loyaltyFreeShipping) && loyaltyTierApplied && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-2">
                    <span className="font-medium">{loyaltyTierApplied.title}</span>
                    {loyaltyPricing.discountPercent > 0 && (
                      <span> — Giảm {loyaltyPricing.discountPercent}% trên tạm tính.</span>
                    )}
                    {loyaltyPricing.loyaltyFreeShipping && (
                      <span> Miễn phí giao hàng cho đơn này.</span>
                    )}
                  </p>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatVnd(subtotal)}</span>
                </div>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 text-sm">
                    <span>Giảm thành viên ({loyaltyPricing.discountPercent}%)</span>
                    <span>-{formatVnd(loyaltyDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'MIỄN PHÍ' : formatVnd(shipping)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{formatVnd(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {isAddressPickerOpen && user?.shippingAddresses && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setIsAddressPickerOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-['Poppins'] font-semibold text-xl">Chọn địa chỉ giao hàng</h3>
                <p className="text-sm text-gray-500">{user.shippingAddresses.length} địa chỉ đã lưu</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressPickerOpen(false)}
                className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  const defaultIndex = user.shippingAddresses?.findIndex((address) => address.isDefault) ?? -1;
                  if (defaultIndex >= 0) applyAddressFromBook(defaultIndex);
                  else applyAddressFromBook(0);
                  setIsAddressPickerOpen(false);
                }}
                className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
              >
                Dùng địa chỉ mặc định
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewAddress(true);
                  setSelectedAddressIndex(-1);
                  setShippingErrors({});
                  setShippingInfo({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: '',
                    ward: '',
                    city: '',
                    district: '',
                    country: 'Việt Nam',
                  });
                  setSetAsDefaultAddress(true);
                  setMakeSelectedDefaultInPicker(false);
                  setIsAddressPickerOpen(false);
                }}
                className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
              >
                Thêm địa chỉ mới
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm mb-3">
              <input
                type="checkbox"
                checked={makeSelectedDefaultInPicker}
                onChange={(e) => setMakeSelectedDefaultInPicker(e.target.checked)}
              />
              Đặt địa chỉ đang chọn làm mặc định
            </label>

            <div className="grid gap-2">
              {sortedSavedAddresses.map(({ address, index }) => (
                <label
                  key={`${address.label}-${address.address}-${index}`}
                  className={`flex gap-3 items-start px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                    selectedAddressIndex === index ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddressModal"
                    checked={selectedAddressIndex === index}
                    onChange={() => void handlePickSavedAddress(index)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {address.label} {address.isDefault ? '(Mặc định)' : ''}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {address.name} - {address.address}, {normalizeDistrict(address.district) || normalizeDistrict(address.zipCode) || ''}, {address.city}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

