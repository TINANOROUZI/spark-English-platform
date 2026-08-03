export function fireConfetti() {
  const N = 18;
  const emojis = ["✨", "⭐", "🎉", "🎈"];
  for (let i = 0; i < N; i++) {
    const s = document.createElement("span");
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.position = "fixed";
    s.style.left = Math.random() * 100 + "vw";
    s.style.top = "-10px";
    s.style.fontSize = 16 + Math.random() * 18 + "px";
    s.style.pointerEvents = "none";
    s.style.transition = "transform .9s linear, opacity .9s linear";
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translateY(${100 + Math.random() * 120}vh) rotate(${Math.random() * 360}deg)`;
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 1000);
  }
}
