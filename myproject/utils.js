// utils.js — shared utilities: toast notifications & back-to-top

// ── TOAST ─────────────────────────────────────────────────────────────────────
(function () {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);

    window.showToast = function (message, type = "success") {
        const icon = type === "success" ? "✅" : "❌";
        const toast = document.createElement("div");
        toast.className = `toast-msg toast-${type}`;
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };
})();

// ── BACK TO TOP ───────────────────────────────────────────────────────────────
(function () {
    const btn = document.createElement("button");
    btn.id = "backToTop";
    btn.title = "Back to top";
    btn.innerHTML = "&#8679;";
    document.body.appendChild(btn);

    window.addEventListener("scroll", () => {
        btn.classList.toggle("visible", window.scrollY > 300);
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
