export function fireConfetti(): void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const emojis = ["✨", "⭐", "🎉", "🎈"];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    Object.assign(s.style, {
      position: "fixed", left: `${Math.random() * 100}vw`, top: "-10px", zIndex: "200",
      fontSize: `${16 + Math.random() * 18}px`, pointerEvents: "none",
      transition: "transform .9s linear, opacity .9s linear",
    });
    s.setAttribute("aria-hidden", "true");
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translateY(${100 + Math.random() * 120}vh) rotate(${Math.random() * 360}deg)`;
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 1000);
  }
}
