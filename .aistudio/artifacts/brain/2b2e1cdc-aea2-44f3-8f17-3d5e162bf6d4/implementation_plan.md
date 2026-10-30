# Kế Hoạch Triển Khai: Chèn Hình Ảnh Vào Câu Hỏi & Đáp Án (Đã Hoàn Thành)

## 1. Mục Tiêu & Yêu Cầu (Đã đạt)
Đã triển khai thành công tính năng chèn hình ảnh trực quan vào:
1. **Phần câu hỏi chính** (`imageUrl`): Hiển thị hình ảnh minh họa cho câu hỏi (nhận diện hình ảnh, đoán cờ, đoán đồ vật, ảnh đố vui...).
2. **Phần đáp án A (Nghiêng Trái)** (`optionAImage`): Hiển thị hình ảnh minh họa cho đáp án bên trái.
3. **Phần đáp án B (Nghiêng Phải)** (`optionBImage`): Hiển thị hình ảnh minh họa cho đáp án bên phải.

Hỗ trợ cả 2 cách:
- Tải file ảnh trực tiếp từ máy tính/điện thoại (tự động nén kích thước qua Canvas để lưu trữ Base64 siêu nhẹ trong `localStorage`).
- Dán đường dẫn link ảnh URL trực tuyến.

---

## 2. Các Thành Phần Đã Xây Dựng

### A. Schema Dữ Liệu (`src/questions.ts`)
- Mở rộng interface `Question` với `imageUrl?: string`, `optionAImage?: string`, `optionBImage?: string`.

### B. Component Tải Ảnh Thông Minh (`src/components/ImageUploader.tsx`)
- Tích hợp chọn tệp từ thiết bị (`input type="file" accept="image/*"`).
- Thu nhỏ & nén ảnh tự động qua HTML5 Canvas với độ phân giải tối đa 720px và chất lượng JPEG 0.8, dung lượng nhỏ gọn (~30–50KB).
- Hỗ trợ dán link URL ảnh với nút xác nhận nhanh.
- Xem trước thumbnail sắc nét cùng nút đổi ảnh và xóa ảnh (`✕`).

### C. Giao Diện Quản Lý & Chỉnh Sửa Câu Hỏi (`src/components/QuestionEditorModal.tsx` & `CustomQuizModal.tsx`)
- Thêm các ô upload ảnh riêng biệt cho Câu hỏi, Đáp án A (Trái), và Đáp án B (Phải) trong cả form tạo mới và form chỉnh sửa câu hỏi có sẵn.
- Danh sách câu hỏi hiển thị huy hiệu `Ảnh câu hỏi` và thumbnail thu nhỏ trực quan.

### D. Giao Diện Trận Đấu (`src/components/QuestionCard.tsx`)
- Hiển thị ảnh câu hỏi chính trong khung bo tròn sang trọng với chiều cao co giãn linh hoạt (`max-h-48 object-contain`).
- Hiển thị ảnh đáp án A và B ở trung tâm hai thẻ chọn, hòa hợp cùng hiệu ứng phát sáng neon và thanh đếm giữ đầu 2 giây.
