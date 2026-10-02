# 🌐 Website cá nhân — NGUYEN QUY SON

## Cấu trúc thư mục

| File | Là gì |
|---|---|
| `index.html` | Điểm vào gốc, tự chuyển tới trang chủ |
| `trang-chu/index.html` | 🏠 Trang chủ (ai cũng xem được) |
| `dang-nhap/index.html` | 🔐 Đăng ký / Đăng nhập thành viên |
| `gioi-thieu/index.html` | 👤 Giới thiệu bản thân *(cần đăng nhập)* |
| `so-thich/index.html` | ⚽ Sở thích *(cần đăng nhập)* |
| `san-pham/index.html` | 🛍️ Sản phẩm & dịch vụ *(cần đăng nhập)* |
| `blog/index.html` | ✍️ Blog *(cần đăng nhập)* |
| `ky-niem/index.html` | 📸 Album kỷ niệm *(cần đăng nhập)* |
| `lien-he/index.html` | ✉️ Liên hệ *(cần đăng nhập)* |
| `xem-truoc-email/index.html` | 👀 Xem trước email cảm ơn |
| `style.css` | 🎨 Giao diện chung — muốn đổi màu sắc thì sửa file này |
| `space.js` | 🌌 Nền vũ trụ 3D dùng chung cho mọi trang |
| `script.js` | ⚙️ Hiệu ứng chung (menu, cuộn trang, form...) |
| `auth.js` | 🔐 Hệ thống đăng nhập — URL Google Apps Script |
| `GOOGLE_APPS_SCRIPT.gs` | ☁️ Mã dán vào Google Sheet (máy chủ) |
| `HUONG-DAN-GOOGLE-SHEET.md` | 📖 Hướng dẫn kết nối Google Sheet từng bước |
| `MO-WEB.bat` | ▶️ Nhấp đúp để mở web qua localhost |

## Cách mở website
- **Cách 1**: nhấp đúp `MO-WEB.bat` → tự mở web tại `http://localhost:8765`
  (giữ cửa sổ đen nhỏ đang mở khi xem; đóng nó là tắt server — không sao).
- **Cách 2**: nhấp đúp thẳng `index.html` — chạy được đầy đủ mọi tính năng.

## Triển khai lên Vercel
1. Đưa toàn bộ thư mục dự án lên một repository GitHub.
2. Trên Vercel, chọn **Add New → Project** rồi import repository đó.
3. Chọn **Framework Preset: Other**, **Root Directory: `./`**, không cần build command;
  cấu hình trong `vercel.json` đặt output là thư mục gốc.
4. Chọn **Deploy**. Địa chỉ gốc `/` sẽ mở `trang-chu/index.html`.
5. Giữ nguyên `auth.js` đang trỏ tới Google Apps Script; không đưa app password hoặc
  key bí mật vào repository.

Bản production hiện tại: [https://trang-web-cua-son.vercel.app](https://trang-web-cua-son.vercel.app)

Các trang dùng URL có `index.html`, ví dụ `/gioi-thieu/index.html`. Không bật
**Clean URLs**, vì guard đăng nhập đang dùng các đường dẫn này.

> Lưu ý: Vercel đang phục vụ HTML tĩnh. Guard đăng nhập trong trình duyệt chỉ chặn
> điều hướng thông thường; người khác vẫn có thể tải trực tiếp nội dung HTML. Không
> dùng cách này để bảo vệ dữ liệu bí mật. Muốn giới hạn truy cập thật cần xác thực ở
> phía máy chủ hoặc một dịch vụ auth.

## Hệ thống thành viên (lưu Google Sheet)
- Các trang nội dung **yêu cầu đăng nhập** — chưa đăng nhập sẽ được đưa tới
  trang Đăng nhập, và sau khi đăng nhập xong tự quay lại đúng trang đang xem.
- Đăng ký gồm: họ tên, email, số điện thoại, mật khẩu (tối thiểu 6 ký tự).
- Dữ liệu ghi vào **Google Sheet** của bạn (sheet `ThanhVien`): thời gian,
  họ tên, email, mật khẩu đã mã hóa SHA-256, số điện thoại.
- Khi có người đăng ký → **email cảm ơn tự động** gửi tới họ (qua tài khoản
  Google của bạn, phụ thuộc hạn mức của Google).
- **An toàn**: mật khẩu không lưu thô; chống dò mật khẩu (tối đa 5 lần sai
  mỗi 15 phút cho một email); chặn trùng email; làm mới trang sau khi đăng nhập.
- Quên mật khẩu? Chủ website xóa dòng thành viên trong Sheet, người đó đăng ký lại.
- ⚠️ Nếu thay đổi nội dung file `GOOGLE_APPS_SCRIPT.gs`, phải vào
  **Deploy → Quản lý triển khai → chỉnh sửa → phiên bản mới** rồi Deploy lại.

## Cách sửa nội dung
1. Mở trang cần sửa bằng Notepad hoặc VS Code (nhấp chuột phải → Open with).
2. Tìm các chỗ có dấu **✏️** hoặc dòng ghi chú — đó là nội dung cần thay:
  - `gioi-thieu/index.html`: câu chuyện bản thân, câu trích dẫn
  - `san-pham/index.html`: tên, mô tả, giá sản phẩm thật
  - `lien-he/index.html`: email, số điện thoại, địa chỉ
  - `ky-niem/index.html`: thay ô màu bằng ảnh thật (hướng dẫn ngay đầu file)
  - `blog/index.html`: thêm bài viết mới (copy 1 thẻ card và sửa)
3. Lưu (Ctrl+S) → quay lại trình duyệt nhấn F5.

💡 Đổi màu sắc / font: mở `style.css`, sửa phần `:root` ở đầu file.
💡 Chỉnh nền vũ trụ (số sao, màu tinh vân...): mở `space.js`.

## Các tính năng có sẵn
- ✅ **Nền vũ trụ 3D**: sao có hào quang, dải Ngân Hà, tinh vân, sao băng —
  di chuột để vũ trụ nghiêng theo; tự tôn trọng chế độ "giảm chuyển động"
- ✅ Logo **NGUYEN QUY SON** chuyển màu cầu vồng mượt mà
- ✅ 7 trang riêng + menu có gạch chân đánh dấu trang đang xem
- ✅ Đăng ký / đăng nhập / đăng xuất, lưu Google Sheet, email cảm ơn
- ✅ Hiển thị đẹp trên cả điện thoại lẫn máy tính

## Muốn đưa lên internet (miễn phí)?
- **Netlify Drop**: vào `app.netlify.com/drop`, kéo thả toàn bộ thư mục này vào là xong.
- **GitHub Pages**: tải tất cả file lên repo GitHub và bật Pages.

Cần mình giúp chỉnh sửa thêm cứ nói nhé!
