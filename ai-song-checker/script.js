/**
 * PulseLore AI Song Checker + Creation Log
 * Workflow Audit only. No AI detection. No fake percentages.
 * All storage is browser-local (localStorage) — nothing is uploaded to a server.
 */

const STORAGE_KEY = "pulselore_song_checker_drafts_v1";

const fieldIds = [
  "songTitle",
  "artistName",
  "projectName",
  "releaseStage",
  "lyricsAuthor",
  "lyricsAI",
  "vocalPerformer",
  "vocalAI",
  "instrumentalSource",
  "daw",
  "masteringNotes",
  "aiTools",
  "promptNotes",
  "rightsNotes",
];

const saveStatus = document.getElementById("saveStatus");
const draftList = document.getElementById("draftList");
const draftEmptyState = document.getElementById("draftEmptyState");

let activeDraftId = null;

function readDrafts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}

function getChecklistValues() {
  return Array.from(
    document.querySelectorAll('#archiveChecklist input[type="checkbox"]:checked')
  ).map((el) => el.value);
}

function setChecklistValues(values) {
  const set = new Set(values || []);
  document.querySelectorAll('#archiveChecklist input[type="checkbox"]').forEach((el) => {
    el.checked = set.has(el.value);
  });
}

function collectFormData() {
  const data = {};
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    data[id] = el ? el.value : "";
  });
  data.archiveChecklist = getChecklistValues();
  return data;
}

function applyFormData(data) {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && typeof data[id] === "string") el.value = data[id];
  });
  setChecklistValues(data.archiveChecklist);
}

function clearForm() {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
    } else {
      el.value = "";
    }
  });
  setChecklistValues([]);
  activeDraftId = null;
}

function setStatus(message, state) {
  saveStatus.textContent = message;
  if (state) {
    saveStatus.dataset.state = state;
  } else {
    saveStatus.removeAttribute("data-state");
  }
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function renderDraftList() {
  const drafts = readDrafts();
  draftList.querySelectorAll(".draft-card").forEach((el) => el.remove());

  if (drafts.length === 0) {
    draftEmptyState.style.display = "block";
    return;
  }

  draftEmptyState.style.display = "none";

  drafts
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .forEach((draft) => {
      const card = document.createElement("div");
      card.className = "draft-card";

      const info = document.createElement("div");
      info.className = "draft-card-info";
      const title = document.createElement("strong");
      title.textContent = draft.data.songTitle || "(untitled song)";
      const meta = document.createElement("small");
      meta.textContent =
        (draft.data.artistName ? draft.data.artistName + " — " : "") +
        "saved " +
        formatTimestamp(draft.updatedAt);
      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "draft-card-actions";

      const loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", () => loadDraft(draft.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteDraft(draft.id));

      actions.appendChild(loadBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(info);
      card.appendChild(actions);
      draftList.appendChild(card);
    });
}

function saveDraft() {
  const data = collectFormData();

  if (!data.songTitle.trim()) {
    setStatus("Add a song title before saving.", "error");
    return;
  }

  const drafts = readDrafts();
  const now = new Date().toISOString();

  if (activeDraftId) {
    const existing = drafts.find((d) => d.id === activeDraftId);
    if (existing) {
      existing.data = data;
      existing.updatedAt = now;
      writeDrafts(drafts);
      setStatus("Draft updated.", "success");
      renderDraftList();
      return;
    }
  }

  const newDraft = {
    id: "draft_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    data,
    createdAt: now,
    updatedAt: now,
  };
  drafts.push(newDraft);

  if (!writeDrafts(drafts)) {
    setStatus("Could not save — browser storage may be full or blocked.", "error");
    return;
  }

  activeDraftId = newDraft.id;
  setStatus("Draft saved to this browser.", "success");
  renderDraftList();
}

function loadDraft(id) {
  const drafts = readDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) {
    setStatus("That draft could not be found.", "error");
    return;
  }
  applyFormData(draft.data);
  activeDraftId = draft.id;
  setStatus("Loaded: " + (draft.data.songTitle || "(untitled song)"), "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteDraft(id) {
  const drafts = readDrafts();
  const target = drafts.find((d) => d.id === id);
  const label = target ? target.data.songTitle || "(untitled song)" : "this draft";
  const confirmed = window.confirm('Delete "' + label + '"? This cannot be undone.');
  if (!confirmed) return;

  const remaining = drafts.filter((d) => d.id !== id);
  writeDrafts(remaining);
  if (activeDraftId === id) activeDraftId = null;
  setStatus("Deleted.", "success");
  renderDraftList();
}

function buildReportText() {
  const d = collectFormData();
  const lines = [
    "PulseLore AI Song Checker + Creation Log",
    "Workflow Audit — self-attested creative record",
    "Generated: " + new Date().toLocaleString(),
    "",
    "This is documentation of the reported workflow, not an AI detection result.",
    "No Human %/AI % score is included — no validated detector backs this version.",
    "",
    "--- Song & Project ---",
    "Song title: " + (d.songTitle || "-"),
    "Artist: " + (d.artistName || "-"),
    "Project: " + (d.projectName || "-"),
    "Release stage: " + (d.releaseStage || "-"),
    "",
    "--- Lyrics ---",
    "Written by: " + (d.lyricsAuthor || "-"),
    "AI involvement: " + (d.lyricsAI || "-"),
    "",
    "--- Vocals ---",
    "Lead performer: " + (d.vocalPerformer || "-"),
    "AI involvement: " + (d.vocalAI || "-"),
    "",
    "--- Instrumental / Backing ---",
    "Source: " + (d.instrumentalSource || "-"),
    "DAW used: " + (d.daw || "-"),
    "Mixing/mastering notes: " + (d.masteringNotes || "-"),
    "",
    "--- AI Tools & Prompts ---",
    "AI tools used: " + (d.aiTools || "-"),
    "Prompt/session notes: " + (d.promptNotes || "-"),
    "",
    "--- Archive Checklist ---",
    d.archiveChecklist.length
      ? d.archiveChecklist.map((item) => "[x] " + item).join("\n")
      : "(nothing checked yet)",
    "",
    "--- Rights & Source Notes ---",
    d.rightsNotes || "-",
  ];
  return lines.join("\n");
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFileSlug(text) {
  return (text || "untitled")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "untitled";
}

document.getElementById("saveDraftBtn").addEventListener("click", saveDraft);

document.getElementById("newDraftBtn").addEventListener("click", () => {
  const confirmed = window.confirm("Start a new blank record? Unsaved changes will be lost.");
  if (!confirmed) return;
  clearForm();
  setStatus("Cleared. Starting a new record.", null);
});

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  const data = collectFormData();
  const slug = safeFileSlug(data.songTitle);
  downloadFile(
    "pulselore-song-checker-" + slug + ".json",
    JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2),
    "application/json"
  );
  setStatus("Exported JSON.", "success");
});

document.getElementById("exportTextBtn").addEventListener("click", () => {
  const data = collectFormData();
  const slug = safeFileSlug(data.songTitle);
  downloadFile("pulselore-song-checker-" + slug + ".txt", buildReportText(), "text/plain");
  setStatus("Exported report.", "success");
});

document.getElementById("copyReportBtn").addEventListener("click", async () => {
  const text = buildReportText();
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Report copied to clipboard.", "success");
  } catch {
    setStatus("Could not copy automatically — use Export instead.", "error");
  }
});

renderDraftList();
