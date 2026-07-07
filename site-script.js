const storage = {
  contact: "pulselore-contact-draft",
  songLog: "pulselore-song-checker-log",
  zen: "pulselore-talk-zen-local-history",
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function copyText(text, statusEl) {
  navigator.clipboard?.writeText(text).then(
    () => {
      if (statusEl) statusEl.textContent = "Copied.";
    },
    () => {
      if (statusEl) statusEl.textContent = "Copy failed. Select the text and copy manually.";
    }
  );
}

function formDataObject(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      return;
    }
    data[key] = value;
  });
  return data;
}

function initContact() {
  const form = qs("[data-contact-form]");
  if (!form) return;
  const status = qs("[data-contact-status]");
  const saved = localStorage.getItem(storage.contact);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([key, value]) => {
        const field = form.elements[key];
        if (field) field.value = value;
      });
    } catch {}
  }

  form.addEventListener("input", () => {
    localStorage.setItem(storage.contact, JSON.stringify(formDataObject(form)));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formDataObject(form);
    const missing = ["name", "email", "project"].filter((key) => !String(data[key] || "").trim());
    if (missing.length) {
      status.textContent = "Please complete name, email, and project summary.";
      return;
    }
    const subject = encodeURIComponent(`PulseLore Studio project request from ${data.name}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nProject type: ${data.type || "Not selected"}\n\nProject:\n${data.project}\n\nNotes:\n${data.notes || ""}`
    );
    status.textContent = "Opening your email app with the prepared message.";
    window.location.href = `mailto:contact@pulselore.studio?subject=${subject}&body=${body}`;
  });
}

function songMarkdown(data) {
  const files = Array.isArray(data.files) ? data.files : data.files ? [data.files] : [];
  return `# AI Record - Creation Log

Song title: ${data.songTitle || ""}
Artist: ${data.artist || ""}
Project: ${data.project || ""}
Release stage: ${data.releaseStage || ""}

## Authorship
Lyrics written by: ${data.lyricsBy || ""}
AI used for lyrics: ${data.aiLyrics || ""}
Lead vocal performed by: ${data.vocalBy || ""}
AI vocal involvement: ${data.aiVocal || ""}

## Production
DAW / editor: ${data.daw || ""}
Mixing / mastering notes: ${data.mastering || ""}

## AI tools
Tool names: ${data.tools || ""}
Purpose: ${data.purpose || ""}
Prompt / formula notes: ${data.prompt || ""}
Tool link or ID: ${data.toolId || ""}

## Archive files kept
${files.map((file) => `- ${file}`).join("\n") || "- None selected"}

## Rights / source notes
${data.rights || ""}

Disclaimer: This is a self-attested creative record and documentation support checklist. It is not legal proof, not copyright registration, and not a certified AI detector.`;
}

function initSongChecker() {
  const form = qs("[data-song-log-form]");
  if (!form) return;
  const output = qs("[data-song-output]");
  const status = qs("[data-song-status]");

  const render = () => {
    const data = formDataObject(form);
    output.textContent = songMarkdown(data);
    return data;
  };

  const saved = localStorage.getItem(storage.songLog);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([key, value]) => {
        const fields = qsa(`[name="${key}"]`, form);
        fields.forEach((field) => {
          if (field.type === "checkbox") field.checked = Array.isArray(value) ? value.includes(field.value) : value === field.value;
          else field.value = value;
        });
      });
    } catch {}
  }
  render();

  form.addEventListener("input", render);
  qs("[data-song-save]")?.addEventListener("click", () => {
    localStorage.setItem(storage.songLog, JSON.stringify(render()));
    status.textContent = "Draft saved in this browser.";
  });
  qs("[data-song-export]")?.addEventListener("click", () => {
    const data = render();
    downloadJSON(`${data.songTitle || "pulselore-creation-log"}.json`, data);
    status.textContent = "JSON exported.";
  });
  qs("[data-song-copy]")?.addEventListener("click", () => copyText(output.textContent, status));
  qs("[data-song-reset]")?.addEventListener("click", () => {
    form.reset();
    localStorage.removeItem(storage.songLog);
    render();
    status.textContent = "Draft cleared.";
  });
}

function initZen() {
  const form = qs("[data-zen-form]");
  if (!form) return;
  const input = qs("[data-zen-input]");
  const log = qs("[data-zen-log]");
  const status = qs("[data-zen-status]");
  let history = [];

  const saved = localStorage.getItem(storage.zen);
  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch {}
  }

  const draw = () => {
    log.innerHTML = "";
    if (!history.length) {
      log.innerHTML = '<div class="message">Talk With Zen is a local shell in Phase 1. It can shape prompts and notes here, but no AI backend is connected yet.</div>';
      return;
    }
    history.forEach((item) => {
      const el = document.createElement("div");
      el.className = `message ${item.role === "user" ? "user" : ""}`;
      el.textContent = item.text;
      log.appendChild(el);
    });
  };

  const save = () => localStorage.setItem(storage.zen, JSON.stringify(history));
  draw();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    history.push({ role: "user", text });
    history.push({
      role: "zen",
      text: "Phase 1 local shell: I saved your note. When the AI backend is connected, this space will answer with PulseLore context. For now, turn this into a clear next step: define goal, input, output, risk, and action.",
    });
    input.value = "";
    save();
    draw();
    status.textContent = "Saved locally.";
  });

  qs("[data-zen-copy]")?.addEventListener("click", () => copyText(history.map((m) => `${m.role}: ${m.text}`).join("\n\n"), status));
  qs("[data-zen-export]")?.addEventListener("click", () => downloadJSON("talk-with-zen-local-history.json", history));
  qs("[data-zen-reset]")?.addEventListener("click", () => {
    history = [];
    save();
    draw();
    status.textContent = "Local history cleared.";
  });
}

initContact();
initSongChecker();
initZen();


