// ============================================
// HIỆU ỨNG CHUNG — menu, cuộn trang, form...
// ============================================
(function () {
  // Thanh tiến trình cuộn trang
  const progress = document.getElementById("progress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (progress && max > 0) {
      progress.style.width = (h.scrollTop / max) * 100 + "%";
    }
  });

  // Menu trên điện thoại
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    function closeMenu() {
      navLinks.classList.remove("open");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    }
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    window.addEventListener("keydown", e => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // Hiệu ứng xuất hiện khi cuộn tới
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // Năm hiện tại ở footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Form liên hệ (chế độ demo — chưa gửi đi đâu)
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      document.getElementById("formSuccess").style.display = "block";
      e.target.reset();
    });
  }
})();
