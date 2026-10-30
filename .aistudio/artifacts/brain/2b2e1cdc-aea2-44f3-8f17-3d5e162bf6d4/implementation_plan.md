# Kế Hoạch Triển Khai: Khung Camera To Chuẩn ~250px & Hỗ Trợ Kéo Dãn Thu Phóng (ĐÃ HOÀN THÀNH)

## 1. Yêu Cầu Người Dùng
- **Vị trí**: Nằm ở thanh dưới cùng như ban đầu.
- **Kích thước mặc định**: To rõ nét, đạt chuẩn **250px x 250px** giúp người chơi quan sát rõ tư thế và góc nghiêng đầu.
- **Khả năng kéo dãn thu phóng**: Cho phép người dùng kéo thả trực tiếp góc trên-trái khung hình để phóng to / thu nhỏ tùy ý, kèm theo nút chuyển đổi kích thước nhanh (`180px` | `250px` | `320px`) và nút thu gọn tạm thời.
- **Không che khuất nội dung**: Vùng câu hỏi và đáp án ở giữa (`<main>`) duy trì tính năng cuộn thông minh (`min-h-0 overflow-y-auto`) để toàn bộ câu hỏi và đáp án có hình ảnh vẫn xem được trọn vẹn 100%.

---

## 2. Các Thay Đổi Đã Thực Hiện

1. **Tạo Component `ResizableCameraDock.tsx`**:
   - Kích thước mặc định chuẩn: `250px × 250px` như yêu cầu.
   - Tay nắm kéo dãn tương tác (Interactive drag handle) ở góc trên bên trái với icon `Scaling`, hỗ trợ chuột và cảm ứng mượt mà.
   - Giới hạn kích thước kéo dãn an toàn: Chiều rộng từ `160px` đến `450px`, chiều cao từ `140px` đến `420px`.
   - Hiển thị nhãn kích thước pixel trực quan thời gian thực khi kéo dãn (`dims.width × dims.height px`).
   - Các nút chọn cỡ nhanh: `180px`, `250px (Chuẩn)`, `320px`, nút hoàn tác về chuẩn (`RotateCcw`), và nút thu nhỏ / phóng to (`Minimize2` / `Maximize2`).
   - Tự động lưu kích thước người dùng đã chọn vào `localStorage` (`head_tilt_camera_dock_dims_v1`) để duy trì qua các vòng chơi và lượt mở lại.

2. **Cập nhật `CameraView.tsx`**:
   - Đồng bộ động độ phân giải của canvas hiển thị đường chân trời và góc nghiêng theo kích thước thật của khung (`canvas.clientWidth` & `canvas.clientHeight`), loại bỏ hiện tượng mờ hoặc méo hình khi co giãn.
   - Tự động bật chế độ đầy đủ tính năng (gồm đo góc thời gian thực, báo khóa khuôn mặt, căn chỉnh zero) khi khung đạt kích thước chuẩn.

3. **Tích hợp vào thanh đáy `App.tsx`**:
   - Đặt `ResizableCameraDock` ở góc phải của thanh đáy (`items-end justify-between`).
   - Bên trái hiển thị hướng dẫn điều khiển rõ ràng, giữ giao diện gọn gàng và không đè lên phần hình ảnh câu hỏi.

4. **Kiểm tra chất lượng**:
   - `compile_applet` thành công.
   - `lint_applet` không có lỗi TypeScript hay cú pháp.
