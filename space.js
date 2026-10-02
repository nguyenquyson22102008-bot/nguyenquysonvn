// ============================================
// NỀN VŨ TRỤ 3D — dùng chung cho mọi trang
// Gồm: tinh vân, dải Ngân Hà, vì sao bay có chiều sâu và sao băng
// ============================================
(function () {
  const canvas = document.getElementById("space");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0;

  // Nghiêng nhẹ theo con trỏ chuột (parallax)
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener("pointermove", e => {
    tmx = (e.clientX / W) * 2 - 1;
    tmy = (e.clientY / H) * 2 - 1;
  });

  // ----- Sprite ngôi sao có hào quang (vẽ sẵn 1 lần cho nhẹ máy) -----
  function makeStarSprite(color) {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const c = s.getContext("2d");
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255, 255, 255, 1)");
    g.addColorStop(0.25, "rgba(" + color + ", 0.9)");
    g.addColorStop(0.6, "rgba(" + color + ", 0.25)");
    g.addColorStop(1, "rgba(" + color + ", 0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    return s;
  }
  const STAR_COLORS = ["255,255,255", "170,195,255", "255,205,165", "240,170,252"];
  const sprites = STAR_COLORS.map(makeStarSprite);
  const whiteSprite = sprites[0];

  // ----- Vì sao bay trong không gian 3D -----
  const MAXZ = 1600, FOV = 320;
  const stars = [];
  for (let i = 0; i < 750; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 2 * MAXZ,
      y: (Math.random() - 0.5) * 2 * MAXZ,
      z: Math.random() * MAXZ,
      s: sprites[(Math.random() * sprites.length) | 0],
      tw: Math.random() * Math.PI * 2,
    });
  }

  // ----- Dải Ngân Hà chéo màn hình -----
  let galaxy = [];
  function gaussian() {
    return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  }
  const GALAXY_ANG = (-28 * Math.PI) / 180;
  function buildGalaxy() {
    galaxy = [];
    const cx = W * 0.5, cy = H * 0.42;
    const len = Math.hypot(W, H) * 0.95;
    for (let i = 0; i < 260; i++) {
      const t = (Math.random() - 0.5) * len;
      const off = gaussian() * (H * 0.085);
      const x = cx + Math.cos(GALAXY_ANG) * t - Math.sin(GALAXY_ANG) * off;
      const y = cy + Math.sin(GALAXY_ANG) * t + Math.cos(GALAXY_ANG) * off;
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      galaxy.push({ x, y, r: 0.4 + Math.random() * 1.1, a: 0.08 + Math.random() * 0.3, tw: Math.random() * Math.PI * 2 });
    }
  }

  // ----- Vignette làm tối viền, giúp chữ nổi hơn -----
  let vignette = null;
  function buildVignette() {
    vignette = document.createElement("canvas");
    vignette.width = W; vignette.height = H;
    const c = vignette.getContext("2d");
    const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    g.addColorStop(0, "rgba(0, 0, 0, 0)");
    g.addColorStop(1, "rgba(0, 0, 0, 0.62)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGalaxy();
    buildVignette();
  }
  // Chống giật khi kéo thanh địa chỉ trên điện thoại (resize liên tục)
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  resize();

  // ----- Tinh vân: các đám màu lớn, mềm, trôi rất chậm -----
  const NEBULAE = [
    { x: 0.80, y: 0.15, r: 0.75, c: "124, 58, 237", a: 0.09, sx: 0.00006, sy: 0.00004 },
    { x: 0.10, y: 0.80, r: 0.80, c: "244, 63, 148", a: 0.06, sx: 0.00005, sy: 0.00007 },
    { x: 0.42, y: 0.38, r: 0.90, c: "34, 211, 238", a: 0.05, sx: 0.00004, sy: 0.00005 },
  ];

  function paintBg() {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#010207");
    bg.addColorStop(0.55, "#030409");
    bg.addColorStop(1, "#060a1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawNebulae(t) {
    for (const n of NEBULAE) {
      const nx = (n.x + Math.sin(t * n.sx) * 0.04) * W + mx * 16;
      const ny = (n.y + Math.cos(t * n.sy) * 0.04) * H + my * 12;
      const nr = n.r * Math.max(W, H);
      const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      g.addColorStop(0, "rgba(" + n.c + ", " + n.a + ")");
      g.addColorStop(1, "rgba(" + n.c + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawGalaxyGlow() {
    const cx = W * 0.5 + mx * 22, cy = H * 0.42 + my * 14;
    const L = Math.hypot(W, H) * 0.32;
    const blobs = [
      { t: -0.75, c: "139, 124, 246", a: 0.05 },
      { t: 0.05,  c: "96, 165, 250",  a: 0.06 },
      { t: 0.85,  c: "232, 121, 249", a: 0.045 },
    ];
    for (const b of blobs) {
      const x = cx + Math.cos(GALAXY_ANG) * L * b.t;
      const y = cy + Math.sin(GALAXY_ANG) * L * b.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.38);
      g.addColorStop(0, "rgba(" + b.c + ", " + b.a + ")");
      g.addColorStop(1, "rgba(" + b.c + ", 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawGalaxyStars(now) {
    for (const s of galaxy) {
      const tw = 0.75 + 0.25 * Math.sin(now * 0.0015 + s.tw);
      ctx.globalAlpha = s.a * tw;
      ctx.drawImage(whiteSprite, s.x + mx * 22 - s.r * 2, s.y + my * 14 - s.r * 2, s.r * 4, s.r * 4);
    }
    ctx.globalAlpha = 1;
  }

  // ----- Sao băng -----
  let meteors = [], meteorClock = 0, nextMeteor = 3000;
  function updateMeteors(dt) {
    meteorClock += dt;
    if (meteorClock > nextMeteor) {
      meteorClock = 0;
      nextMeteor = 4000 + Math.random() * 6000;
      const a = Math.PI * (0.62 + Math.random() * 0.22);
      meteors.push({
        x: W * (0.25 + Math.random() * 0.7), y: H * Math.random() * 0.3,
        vx: Math.cos(a) * 0.95, vy: Math.sin(a) * 0.5, life: 1,
      });
    }
    meteors = meteors.filter(m => m.life > 0);
    for (const m of meteors) {
      m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt / 1100;
      const tailX = m.x - m.vx * 150, tailY = m.y - m.vy * 150;
      // đuôi mờ rộng
      let g = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      g.addColorStop(0, "rgba(255, 255, 255, " + (0.12 * Math.max(m.life, 0)) + ")");
      g.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.strokeStyle = g; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      // vệt chính mảnh
      g = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      g.addColorStop(0, "rgba(255, 255, 255, " + (0.9 * Math.max(m.life, 0)) + ")");
      g.addColorStop(1, "rgba(160, 200, 255, 0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tailX, tailY); ctx.stroke();
      // đầu sao băng
      ctx.fillStyle = "rgba(255, 255, 255, " + (0.9 * Math.max(m.life, 0)) + ")";
      ctx.beginPath(); ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ----- Vẽ vì sao 3D bay về phía người xem -----
  function drawStars(dt, now) {
    const cx = W / 2, cy = H / 2;
    for (const s of stars) {
      s.z -= dt * 0.05;
      if (s.z < 1) { // bay qua mặt thì quay về phía xa nhất
        s.z = MAXZ;
        s.x = (Math.random() - 0.5) * 2 * MAXZ;
        s.y = (Math.random() - 0.5) * 2 * MAXZ;
      }
      const k = FOV / s.z;
      const sx = cx + (s.x + mx * 70) * k;
      const sy = cy + (s.y + my * 70) * k;
      if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
      const depth = 1 - s.z / MAXZ;
      const twinkle = 0.6 + 0.4 * Math.sin(now * 0.002 + s.tw);
      const size = 1.4 + depth * 4.4;
      ctx.globalAlpha = (0.3 + depth * 0.7) * twinkle;
      ctx.drawImage(s.s, sx - size / 2, sy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    paintBg();
    drawNebulae(now);
    drawGalaxyGlow();
    drawGalaxyStars(now);
    updateMeteors(dt);
    drawStars(dt, now);
    ctx.drawImage(vignette, 0, 0, W, H);
    requestAnimationFrame(frame);
  }

  if (reduced) {
    // Người dùng bật chế độ "giảm chuyển động": vẽ một khung tĩnh
    paintBg();
    drawNebulae(0);
    drawGalaxyGlow();
    drawGalaxyStars(0);
    drawStars(0, 0);
    ctx.drawImage(vignette, 0, 0, W, H);
  } else {
    requestAnimationFrame(frame);
  }
})();
