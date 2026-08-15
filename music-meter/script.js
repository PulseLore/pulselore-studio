document.querySelectorAll(".video-gallery-card video").forEach((video) => {
  const card = video.closest(".screen-card");
  card.addEventListener("mouseenter", () => video.play().catch(() => {}));
  card.addEventListener("mouseleave", () => video.pause());
  card.addEventListener("focusin", () => video.play().catch(() => {}));
  card.addEventListener("focusout", () => video.pause());
});


// Gentle 3D motion for product visuals and capability cards.
const mmTiltCards = [...document.querySelectorAll(".mm-tilt-card")];
const mmFinePointer = window.matchMedia("(pointer:fine)");

mmTiltCards.forEach((card) => {
  const smallCard = card.matches(".capability-grid li");
  const maxTilt = smallCard ? 3.0 : 2.2;

  const reset = () => {
    card.style.setProperty("--mm-rx", "0deg");
    card.style.setProperty("--mm-ry", "0deg");
  };

  card.addEventListener("pointermove", (event) => {
    if (!mmFinePointer.matches || event.pointerType === "touch") return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width);
    const y = (event.clientY - rect.top) / Math.max(1, rect.height);
    const ry = (x - 0.5) * maxTilt * 2;
    const rx = (0.5 - y) * maxTilt * 2;
    card.style.setProperty("--mm-rx", `${rx.toFixed(2)}deg`);
    card.style.setProperty("--mm-ry", `${ry.toFixed(2)}deg`);
  });

  card.addEventListener("pointerleave", reset);
  card.addEventListener("pointercancel", reset);
});
