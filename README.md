<<<<<<< HEAD
# nguyenquyson-vn
nguyenquyson-vn
=======
# 🌐 Website cá nhân — NGUYEN QUY SON

## Cấu trúc thư mục

| File | Là gì |
|---|---|
| `index.html` | Điểm vào gốc, tự chuyển tới trang chủ |
| `trang-chu/index.html` | 🏠 Trang chủ (ai cũng xem được) |
| `dang-nhap/index.html` | 🔐 Đăng ký / Đăng nhập thành viên |
| `gioi-thieu/index.html` | 👤 Giới thiệu bản thân *(cần đăng nhập)* |
| `so-thich/index.html` | ⚽ Sở thích *(cần đăng nhập)* |
| `blog/index.html` | ✍️ Blog *(cần đăng nhập)* |
| `ky-niem/index.html` | 📸 Album kỷ niệm *(cần đăng nhập)* |
| `lien-he/index.html` | ✉️ Liên hệ *(cần đăng nhập)* |
| `mang-xa-hoi/index.html` | 🔗 Liên kết mạng xã hội *(cần đăng nhập)* |
| `xem-truoc-email/index.html` | 👀 Xem trước email cảm ơn *(chỉ dùng local, không deploy)* |
| `build.mjs` và `package.json` | 🧰 Build/minify và chỉ đóng gói file public |
| `style.css` | 🎨 Giao diện chung — muốn đổi màu sắc thì sửa file này |
| `space.js` | 🌌 Nền vũ trụ 3D dùng chung cho mọi trang |
| `script.js` | ⚙️ Hiệu ứng chung (menu, cuộn trang, form...) |
| `auth.js` | 🔐 Hệ thống đăng nhập — chỉ gọi API cùng domain |
| `partials.js` | 🧩 Nạp các mảnh HTML dùng chung |
| `partials/nav.html` | 🧭 Thanh điều hướng dùng chung |
| `partials/footer.html` | 📎 Footer dùng chung |
| `api/auth.js` | 🔒 Proxy server-side tới Google Apps Script |
| `GOOGLE_APPS_SCRIPT.gs` | ☁️ Mã dán vào Google Sheet (máy chủ) |
| `HUONG-DAN-GOOGLE-SHEET.md` | 📖 Hướng dẫn kết nối Google Sheet từng bước |
| `MO-WEB.bat` | ▶️ Nhấp đúp để mở web qua localhost |

## Cách mở website
- **Cách 1**: đăng nhập Vercel CLI một lần bằng `npx.cmd vercel login`, rồi nhấp đúp
  `MO-WEB.bat` để chạy `vercel dev` tại `http://localhost:8765` (cần API proxy).
- Mở `index.html` trực tiếp chỉ xem giao diện; đăng nhập/đăng ký cần Vercel dev hoặc deployment.

## Triển khai lên Vercel
1. Đưa toàn bộ thư mục dự án lên một repository GitHub.
2. Trên Vercel, chọn **Add New → Project** rồi import repository đó.
3. Chọn **Framework Preset: Other**, **Root Directory: `./`**. Vercel sẽ chạy
  `npm run build` và chỉ publish thư mục `dist`.
4. Chọn **Deploy**. Địa chỉ gốc `/` sẽ mở `trang-chu/index.html`.
5. Trong **Project Settings → Environment Variables**, đặt `APPS_SCRIPT_URL` bằng
  URL Web App Google Apps Script cho Production và Preview. Không đặt endpoint trong
  `auth.js`, HTML hay repository.

Bản production hiện tại: [https://trang-web-cua-son.vercel.app](https://trang-web-cua-son.vercel.app)
Project hiện được liên kết với thư mục này qua Vercel CLI; sau khi sửa nội dung,
chạy `npx.cmd vercel --prod` để build và cập nhật production.

Các trang dùng URL có `index.html`, ví dụ `/gioi-thieu/index.html`. Không bật
**Clean URLs**, vì guard đăng nhập đang dùng các đường dẫn này. Bản deploy đã
minify HTML/CSS/JS và không chứa `GOOGLE_APPS_SCRIPT.gs`, tài liệu hướng dẫn,
hay trang preview email. Trình duyệt chỉ gọi `/api/auth`; URL Apps Script được giữ
trong môi trường server của Vercel.

> Lưu ý: Vercel đang phục vụ HTML tĩnh. Guard đăng nhập trong trình duyệt chỉ chặn
> điều hướng thông thường; người khác vẫn có thể tải HTML/JS/CSS đã minify qua
> DevTools. Minify chỉ làm code khó đọc hơn, không thể ngăn sao chép hoặc bảo vệ dữ
> liệu bí mật. Muốn giới hạn truy cập thật cần xác thực ở phía máy chủ hoặc một dịch vụ auth.

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
- ✅ 6 trang riêng + menu có gạch chân đánh dấu trang đang xem
- ✅ Đăng ký / đăng nhập / đăng xuất, lưu Google Sheet, email cảm ơn
- ✅ Hiển thị đẹp trên cả điện thoại lẫn máy tính

## Muốn đưa lên internet (miễn phí)?
- **Netlify Drop**: vào `app.netlify.com/drop`, kéo thả toàn bộ thư mục này vào là xong.
- **GitHub Pages**: tải tất cả file lên repo GitHub và bật Pages.

Cần mình giúp chỉnh sửa thêm cứ nói nhé!
>>>>>>> cb73127 (Initial website upload)
