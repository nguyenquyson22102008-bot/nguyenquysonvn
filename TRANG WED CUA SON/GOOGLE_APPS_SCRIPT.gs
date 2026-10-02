// ============================================================
// MÃ GOOGLE APPS SCRIPT — dán vào Google Sheet của bạn
// (hướng dẫn từng bước trong file HUONG-DAN-GOOGLE-SHEET.md)
// ============================================================
// Mã này nhận dữ liệu ĐĂNG KÝ / ĐĂNG NHẬP từ website và
// ghi / tra cứu trong sheet "ThanhVien" của bảng tính.

var SHEET_NAME = "ThanhVien";

// ✏️ Sau khi đưa website lên Netlify/GitHub, thay link dưới bằng link thật
// để nút "Khám phá website" trong thư cảm ơn bấm được.
// Chưa điền thì thư tự ẩn nút này (không sao cả).
var SITE_URL = "https://doi-link-web-vao-day";

// Kiểm tra nhanh kết nối: mở URL Web App bằng trình duyệt,
// thấy dòng {"ok":true,...} nghĩa là deployment đã hoạt động.
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, service: "thanh-vien" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var out = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  };
  var lock;
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return out({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." });
    }
    var data = JSON.parse(e.postData.contents);
    var action = String(data.action || "");
    var email = String(data.email || "").trim().toLowerCase();
    var passhash = String(data.passhash || "").toLowerCase();
    var phone = String(data.phone || "").trim().replace(/[\s().-]/g, "");
    if (/^\+84\d{9}$/.test(phone)) phone = "0" + phone.substring(3);

    if (action !== "register" && action !== "login") {
      return out({ ok: false, error: "Yêu cầu không hợp lệ" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return out({ ok: false, error: "Email không hợp lệ." });
    }
    if (!/^[a-f0-9]{64}$/.test(passhash)) {
      return out({ ok: false, error: "Mật khẩu gửi lên không hợp lệ." });
    }

    var name = String(data.name || "").trim();
    if (action === "register" && (name.length < 2 || name.length > 100)) {
      return out({ ok: false, error: "Họ tên cần từ 2 đến 100 ký tự." });
    }
    if (action === "register" && !/^0\d{9}$/.test(phone)) {
      return out({ ok: false, error: "Số điện thoại cần đủ 10 số, có thể bắt đầu bằng +84." });
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // lần đầu chạy: tạo hàng tiêu đề
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian", "Họ và tên", "Email", "Mật khẩu (đã mã hóa)", "Số điện thoại", "Email cảm ơn"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    } else {
      if (!sheet.getRange(1, 5).getValue()) {
        sheet.getRange(1, 5).setValue("Số điện thoại").setFontWeight("bold");
      }
      if (!sheet.getRange(1, 6).getValue()) {
        sheet.getRange(1, 6).setValue("Email cảm ơn").setFontWeight("bold");
      }
    }
    var values = sheet.getDataRange().getValues();

    // ----- ĐĂNG KÝ: kiểm tra trùng email rồi ghi hàng mới -----
    if (action === "register") {
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][2]).trim().toLowerCase() === email) {
          return out({ ok: false, error: "Email này đã được đăng ký rồi!" });
        }
      }
      var registeredRow = sheet.getLastRow() + 1;
      sheet.appendRow([new Date(), escapeSheetText(name), escapeSheetText(email), passhash, escapeSheetText(phone)]);
      lock.releaseLock();
      lock = null;

      var emailSent = true;
      var senderUsed = "";
      try {
        senderUsed = sendRegistrationThanks(email, name);
      } catch (mailError) {
        emailSent = false;
        Logger.log("Không gửi được email cảm ơn tới " + email + ": " + mailError.message);
      }
      // Ghi trạng thái gửi email vào cột cuối để bạn kiểm tra nhanh trong Sheet
      sheet.getRange(registeredRow, 6).setValue(emailSent ? "Đã gửi từ " + senderUsed : "Lỗi");
      return out({ ok: true, name: name, emailSent: emailSent, senderUsed: senderUsed });
    }

    // ----- ĐĂNG NHẬP: giới hạn thử sai, tra email, so khớp mật khẩu đã mã hóa -----
    var cache = CacheService.getScriptCache();
    var failKey = "fail_" + email;
    var fails = Number(cache.get(failKey) || 0);
    if (action === "login" && fails >= 5) {
      return out({ ok: false, error: "Bạn đã thử sai quá nhiều lần. Vui lòng thử lại sau 15 phút." });
    }
    for (var j = 1; j < values.length; j++) {
      if (String(values[j][2]).trim().toLowerCase() === email) {
        if (String(values[j][3]).toLowerCase() === passhash) {
          cache.remove(failKey);
          return out({ ok: true, name: values[j][1] });
        }
        cache.put(failKey, String(fails + 1), 900); // ghi nhớ 15 phút
        return out({ ok: false, error: "Sai mật khẩu!" });
      }
    }
    return out({ ok: false, error: "Không tìm thấy tài khoản với email này!" });
  } catch (err) {
    return out({ ok: false, error: "Lỗi máy chủ: " + err.message });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function escapeSheetText(value) {
  var text = String(value);
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

// Thử tài khoản chính trước, sau đó lần lượt các alias đã xác minh trong Gmail.
// Không dùng mật khẩu ứng dụng; việc này cần cấp quyền GmailApp khi chạy.
function sendRegistrationThanks(email, name) {
  var subject = "Chào " + name + "! Cảm ơn bạn đã đăng ký thành viên";
  var body = buildThankYouText(name);
  var htmlBody = buildThankYouHtml(name);
  var primaryEmail = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
  var aliases = GmailApp.getAliases().filter(function (alias) {
    return String(alias).toLowerCase() !== primaryEmail;
  });
  var lastError;

  if (!aliases.length) {
    throw new Error("Không tìm thấy địa chỉ gửi phụ đã xác minh trong Gmail.");
  }

  for (var i = 0; i < aliases.length; i++) {
    var sender = aliases[i];
    var options = { htmlBody: htmlBody, name: "NGUYEN QUY SON", from: sender };

    try {
      GmailApp.sendEmail(email, subject, body, options);
      return sender;
    } catch (err) {
      lastError = err;
      Logger.log("Gửi email thất bại từ " + (sender || "tài khoản chính") + ": " + err.message);
    }
  }

  throw new Error("Không gửi được từ các địa chỉ phụ: " + (lastError ? lastError.message : "không có địa chỉ gửi khả dụng"));
}

function buildThankYouText(name) {
  return "Xin chào " + name + ",\n\n" +
    "Cảm ơn bạn đã đăng ký tài khoản trên website của NGUYEN QUY SON!\n\n" +
    "Từ giờ bạn có thể tự do khám phá các trang: Giới thiệu, Sở thích,\n" +
    "Sản phẩm, Blog, Kỷ niệm và Liên hệ.\n\n" +
    "Chúc bạn có những trải nghiệm thật vui. Hẹn gặp bạn trên website!\n\n" +
    "Trân trọng,\nNGUYEN QUY SON";
}

// ----- Thiết kế thư cảm ơn dạng HTML, cùng tông đen vũ trụ với website -----
// Email dùng bảng (table) + CSS viết trực tiếp (inline) để hiển thị đúng
// trên Gmail, Outlook... — cách chuẩn cho email, đừng đổi sang div/CSS file ngoài.
function buildThankYouHtml(name) {
  var pages = [
    ["Giới thiệu", "#6366f1"], ["Sở thích", "#ec4899"], ["Sản phẩm", "#22d3ee"],
    ["Blog", "#a855f7"], ["Kỷ niệm", "#f59e0b"], ["Liên hệ", "#10b981"]
  ];
  var cells = "";
  for (var i = 0; i < pages.length; i++) {
    cells += '<td width="33%" align="center" style="padding: 12px 4px;">' +
      '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ' + pages[i][1] + '; margin-right: 7px;"></span>' +
      '<span style="color: #e9edf8; font-size: 14px;">' + pages[i][0] + '</span>' +
      '</td>';
    if (i % 3 === 2 && i < pages.length - 1) cells += '</tr><tr>';
  }
  var pagesGrid = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #10162c; border: 1px solid #232a45; border-radius: 12px;"><tr>' + cells + '</tr></table>';

  var showButton = SITE_URL.indexOf("doi-link") === -1;
  var buttonRow = showButton
    ? '<tr><td align="center" style="padding: 10px 40px 6px;">' +
      '<a href="' + SITE_URL + '" style="display: inline-block; padding: 14px 36px; border-radius: 12px; background-color: #6d5bf0; background-image: linear-gradient(120deg, #6366f1, #a855f7 50%, #ec4899); color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none;">Khám phá website</a>' +
      '</td></tr>'
    : "";

  return '<div style="margin: 0; padding: 24px 12px; background-color: #030409; font-family: Arial, Helvetica, sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #0a0f1e; border: 1px solid #232a45; border-radius: 18px; overflow: hidden;">' +
      '<tr><td style="height: 6px; background-color: #6d5bf0; background-image: linear-gradient(90deg, #ff004c, #ffea00, #00ffd5, #7a5cff, #e100ff); font-size: 0; line-height: 6px;">&nbsp;</td></tr>' +
      '<tr><td style="padding: 34px 40px 8px; text-align: center;">' +
        '<div style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #ffffff;">NGUYEN QUY SON</div>' +
        '<div style="margin-top: 4px; font-size: 11px; letter-spacing: 4px; color: #7c88a8;">PERSONAL SPACE</div>' +
      '</td></tr>' +
      '<tr><td style="padding: 26px 40px 0;">' +
        '<div style="font-size: 26px; font-weight: bold; color: #ffffff; line-height: 1.3;">Chào ' + name + '!</div>' +
        '<div style="margin-top: 10px; font-size: 15px; color: #a3aec9; line-height: 1.7;">Cảm ơn bạn đã đăng ký thành viên. Từ giờ bạn có thể tự do khám phá những góc nhỏ của mình trên internet:</div>' +
      '</td></tr>' +
      '<tr><td style="padding: 22px 40px 0;">' + pagesGrid + '</td></tr>' +
      buttonRow +
      '<tr><td style="padding: 18px 40px 34px;">' +
        '<div style="border-top: 1px solid #232a45; padding-top: 16px; font-size: 12px; color: #7c88a8; line-height: 1.7; text-align: center;">Bạn nhận được email này vì đã đăng ký tài khoản trên website của NGUYEN QUY SON.<br />Nếu không phải bạn, chỉ cần bỏ qua email này.</div>' +
      '</td></tr>' +
    '</table>' +
  '</div>';
}
