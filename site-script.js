(() => {
  const form = document.getElementById("briefForm");
  const output = document.getElementById("briefOutput");
  const copy = document.getElementById("copyBrief");
  if (!form || !output) return;
  const saved = localStorage.getItem("pulselore-brief-builder");
  if (saved) output.textContent = saved;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = document.getElementById("projectType").value;
    const tone = document.getElementById("tone").value;
    const input = document.getElementById("briefInput").value.trim() || "No rough message provided yet.";
    const brief = `Project Goal:\nBuild a ${type} with a ${tone.toLowerCase()} direction.\n\nRequired Pages:\n- Home / opening statement\n- About or identity section\n- Work / release / service section\n- Contact or inquiry path\n\nVisual Direction:\nPulseLore dark cinematic style, cyan/violet signal accents, warm off-white text, editorial spacing, and honest project claims.\n\nTechnical Checklist:\n- Mobile layout\n- Metadata\n- Broken links\n- Contact path\n- Local-first privacy note where needed\n\nNext Message Draft:\nHi PulseLore Studio, I want to start a ${type}. ${input}`;
    output.textContent = brief;
    localStorage.setItem("pulselore-brief-builder", brief);
  });
  copy?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy Brief"), 1200);
  });
})();