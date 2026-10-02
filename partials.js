(function () {
    const scriptUrl = document.currentScript.src;
    const appRoot = new URL("./", scriptUrl);

    async function loadPartial(name) {
        const slot = document.querySelector('[data-partial="' + name + '"]');
        if (!slot) return;

        const response = await fetch(new URL("partials/" + name + ".html", appRoot));
        if (!response.ok) throw new Error("Không tải được giao diện " + name + ".");
        slot.outerHTML = await response.text();
    }

    window.sitePartsReady = Promise.all([loadPartial("nav"), loadPartial("footer")]).then(() => {
        const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
        document.querySelectorAll(".nav-links a[href]").forEach(link => {
            const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
            if (linkPath === currentPath) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });
    });
})();
