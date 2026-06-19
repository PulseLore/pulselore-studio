const heroVideo = document.querySelector("[data-hero-video]");
const heroAudio = document.querySelector("[data-hero-audio]");
const soundToggle = document.querySelector("[data-sound-toggle]");

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.loop = true;

  const playPromise = heroVideo.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      document.body.classList.add("video-paused");
    });
  }
}

if (heroAudio && soundToggle) {
  heroAudio.volume = 0.34;
  heroAudio.loop = true;

  const setSoundButton = (isPlaying) => {
    soundToggle.hidden = false;
    soundToggle.textContent = isPlaying ? "Sound off" : "Sound on";
    soundToggle.setAttribute("aria-pressed", String(isPlaying));
  };

  const startAudio = async () => {
    try {
      await heroAudio.play();
      setSoundButton(true);
    } catch {
      setSoundButton(false);
    }
  };

  startAudio();

  soundToggle.addEventListener("click", async () => {
    if (heroAudio.paused) {
      await startAudio();
      return;
    }

    heroAudio.pause();
    setSoundButton(false);
  });

  window.addEventListener(
    "pointerdown",
    () => {
      if (heroAudio.paused) startAudio();
    },
    { once: true }
  );
}
