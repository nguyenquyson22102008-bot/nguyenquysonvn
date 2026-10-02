// ============================================
// ĐĂNG KÝ / ĐĂNG NHẬP — lưu thành viên vào Google Sheet
// ============================================
// ⚙️ CẤU HÌNH DUY NHẤT: dán URL Web App của bạn vào đây
//    (làm theo file HUONG-DAN-GOOGLE-SHEET.md, bước 5)
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1rXYYPG0OlITsYmttdKxWQgRUA0x3-MdtP8-EAryAonEU67kkBvFMRwqUEFFX5ZBr/exec";
var PROTECTED_PAGES = [
  "gioi-thieu/index.html",
  "so-thich/index.html",
  "san-pham/index.html",
  "blog/index.html",
  "ky-niem/index.html",
  "lien-he/index.html"
];

(function () {
  const appRoot = new URL("../", document.currentScript.src);

  function appUrl(path) {
    return new URL(path, appRoot).href;
  }

  function currentPage() {
    const rootPath = decodeURIComponent(appRoot.pathname);
    const pagePath = decodeURIComponent(window.location.pathname);
    return pagePath.slice(rootPath.length).replace(/^\/+/, "").toLowerCase();
  }

  // ----- phiên đăng nhập (ghi nhớ trên máy người dùng) -----
  function getUser() {
    try { return JSON.parse(localStorage.getItem("nqs_user")); } catch (e) { return null; }
  }
  function setUser(u) { localStorage.setItem("nqs_user", JSON.stringify(u)); }
  function clearUser() { localStorage.removeItem("nqs_user"); }

  // ----- mã hóa mật khẩu (SHA-256) trước khi gửi — không lưu mật khẩu thô -----
  async function sha256(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return "x" + h.toString(16);
  }

  // ----- gọi Google Apps Script -----
  async function callApi(payload) {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    return res.json();
  }
  function notConfigured() {
    return !APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf("PASTE_URL") !== -1;
  }

  function normalizePhone(value) {
    const phone = value.trim().replace(/[\s().-]/g, "");
    return /^\+84\d{9}$/.test(phone) ? "0" + phone.slice(3) : phone;
  }

  function requestedPage() {
    const next = new URLSearchParams(window.location.search).get("next");
    return PROTECTED_PAGES.includes(next) ? next : "index.html";
  }

  function requireAuthentication() {
    const page = currentPage();
    if (PROTECTED_PAGES.includes(page) && !getUser()) {
      document.documentElement.style.visibility = "hidden";
      window.location.replace(appUrl("dang-nhap/index.html?next=" + encodeURIComponent(page)));
      return true;
    }
    return false;
  }

  // ----- cập nhật chữ trên menu theo trạng thái đăng nhập -----
  function updateNavAuth() {
    const link = document.querySelector(".nav-auth");
    if (!link) return;
    const u = getUser();
    if (u) {
      link.textContent = "Đăng xuất";
      link.title = u.name;
    } else {
      link.textContent = "Đăng nhập";
      link.removeAttribute("title");
    }
    link.onclick = function (e) {
      if (!getUser()) return;
      e.preventDefault();
      clearUser();
      // Đăng xuất ở trang protected thì nhớ trang đó để đăng nhập xong quay lại
      var page = currentPage();
      var next = PROTECTED_PAGES.indexOf(page) !== -1 ? "?next=" + encodeURIComponent(page) : "";
      window.location.href = appUrl("dang-nhap/index.html" + next);
    };
  }

  // ----- chạy trên trang đăng nhập -----
  function initAuthPage() {
    const tabLogin = document.getElementById("tabLogin");
    const tabReg = document.getElementById("tabReg");
    const loginBox = document.getElementById("loginBox");
    const regBox = document.getElementById("regBox");
    const loggedBox = document.getElementById("loggedBox");
    if (!tabLogin) return; // không phải trang đăng nhập

    function show(name) {
      loginBox.style.display = name === "login" ? "block" : "none";
      regBox.style.display = name === "reg" ? "block" : "none";
      tabLogin.classList.toggle("active", name === "login");
      tabReg.classList.toggle("active", name === "reg");
    }
    tabLogin.addEventListener("click", () => show("login"));
    tabReg.addEventListener("click", () => show("reg"));
    show("login");

    function msg(el, text, ok) {
      el.textContent = text;
      el.className = "auth-msg " + (ok ? "ok" : "err");
    }

    function setPending(form, label) {
      const button = form.querySelector("button[type='submit']");
      if (label) {
        button.dataset.idleLabel = button.dataset.idleLabel || button.textContent;
        button.textContent = label;
        button.disabled = true;
        form.setAttribute("aria-busy", "true");
        return;
      }
      button.textContent = button.dataset.idleLabel || button.textContent;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }

    function renderLogged() {
      const u = getUser();
      loggedBox.style.display = u ? "block" : "none";
      document.getElementById("formArea").style.display = u ? "none" : "block";
      if (u) {
        document.getElementById("loggedName").textContent = u.name;
        document.getElementById("loggedEmail").textContent = u.email;
      }
    }

    // ĐĂNG NHẬP
    document.getElementById("loginForm").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const m = document.getElementById("loginMsg");
      if (notConfigured()) return msg(m, "Chưa kết nối Google Sheet! Mở file auth.js và dán URL Web App vào (xem HUONG-DAN-GOOGLE-SHEET.md).", false);
      const email = form.elements.namedItem("email").value.trim();
      const passhash = await sha256(form.elements.namedItem("pass").value);
      m.textContent = "";
      m.className = "auth-msg";
      setPending(form, "Đang đăng nhập...");
      try {
        const r = await callApi({ action: "login", email, passhash });
        if (r.ok) {
          setUser({ name: r.name, email });
          window.location.href = appUrl(requestedPage());
        } else {
          msg(m, r.error || "Đăng nhập thất bại!", false);
        }
      } catch (err) {
        msg(m, "Không kết nối được Google Sheet. Kiểm tra lại URL Web App và kết nối mạng.", false);
      } finally {
        setPending(form);
      }
    });

    // ĐĂNG KÝ
    document.getElementById("regForm").addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const m = document.getElementById("regMsg");
      if (notConfigured()) return msg(m, "Chưa kết nối Google Sheet! Mở file auth.js và dán URL Web App vào (xem HUONG-DAN-GOOGLE-SHEET.md).", false);
      const name = form.elements.namedItem("name").value.trim();
      const email = form.elements.namedItem("email").value.trim();
      const phone = normalizePhone(form.elements.namedItem("phone").value);
      const p1 = form.elements.namedItem("pass").value;
      const p2 = form.elements.namedItem("pass2").value;
      if (name.length < 2) return msg(m, "Vui lòng nhập họ tên!", false);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msg(m, "Email không hợp lệ!", false);
      if (!/^0\d{9}$/.test(phone)) return msg(m, "Số điện thoại cần đủ 10 số, có thể bắt đầu bằng +84.", false);
      if (p1.length < 6) return msg(m, "Mật khẩu cần tối thiểu 6 ký tự!", false);
      if (p1 !== p2) return msg(m, "Hai mật khẩu không khớp!", false);
      const passhash = await sha256(p1);
      m.textContent = "";
      m.className = "auth-msg";
      setPending(form, "Đang tạo tài khoản...");
      try {
        const r = await callApi({ action: "register", name, email, phone, passhash });
        if (r.ok) {
          setUser({ name, email });
          window.location.href = appUrl(requestedPage());
        } else {
          msg(m, r.error || "Đăng ký thất bại!", false);
        }
      } catch (err) {
        msg(m, "Không kết nối được Google Sheet. Kiểm tra lại URL Web App và kết nối mạng.", false);
      } finally {
        setPending(form);
      }
    });

    // ĐĂNG XUẤT
    document.getElementById("logoutBtn").addEventListener("click", () => {
      clearUser();
      renderLogged();
      updateNavAuth();
      show("login");
    });

    renderLogged();
  }

  function initializePage() {
    if (requireAuthentication()) return;
    updateNavAuth();
    initAuthPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
  } else {
    initializePage();
  }
})();
