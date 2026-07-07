const STORAGE_KEY = "pulselore_portfolio_request_draft_v1";
const REQUESTS_KEY = "pulselore_portfolio_request_records_v1";
const CONTACT_EMAIL = "contact@pulselore.studio";

const form = document.querySelector("[data-request-form]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const stepList = document.querySelector("[data-step-list]");
const progressText = document.querySelector("[data-progress-text]");
const progressBar = document.querySelector("[data-progress-bar]");
const currentStepLabel = document.querySelector("[data-current-step-label]");
const errorEl = document.querySelector("[data-error]");
const prevBtn = document.querySelector("[data-prev]");
const nextBtn = document.querySelector("[data-next]");
const submitBtn = document.querySelector("[data-submit]");
const saveBtn = document.querySelector("[data-save]");
const creatorType = document.querySelector("[data-creator-type]");
const creatorFields = document.querySelector("[data-creator-fields]");
const reviewSummary = document.querySelector("[data-review-summary]");
const resultBox = document.querySelector("[data-submit-result]");
const essentialDesign = document.querySelector("[data-essential-design]");
const templatePicker = document.querySelector("[data-template-picker]");
const primeDirection = document.querySelector("[data-prime-direction]");
const mediaHeading = document.querySelector("[data-media-heading]");
const mediaList = document.querySelector("[data-media-list]");

let currentStep = 1;

const stepTitles = steps.map((step) => ({
  number: Number(step.dataset.step),
  title: step.dataset.title || "",
}));

const mediaByPlan = {
  Essential: ["Profile Photo", "Banner", "Selected Images"],
  Pro: ["Profile Photo", "Banner", "Gallery Images", "Project Images"],
  Prime: [
    "Profile Photo",
    "Banner",
    "Gallery Images",
    "Project Images",
    "Video",
    "Audio",
    "Song Artwork",
    "Release Cover",
    "Background Video",
  ],
};

const creatorFieldTemplates = {
  music: [
    ["latestRelease", "Latest Release"],
    ["songTitle", "Song Title"],
    ["releaseTitle", "Release Title"],
    ["releaseDate", "Release Date"],
    ["coverArt", "Cover Art Link"],
    ["musicYoutube", "YouTube Link"],
    ["musicSpotify", "Spotify Link"],
    ["musicApple", "Apple Music Link"],
    ["musicSoundcloud", "SoundCloud Link"],
    ["musicBandcamp", "Bandcamp Link"],
    ["creditsWrittenBy", "Written By"],
    ["creditsProducedBy", "Produced By"],
    ["creditsVocals", "Vocals"],
    ["creditsMixedBy", "Mixed By"],
    ["creditsMasteredBy", "Mastered By"],
    ["creditsFeaturing", "Featuring"],
    ["creditsAdditional", "Additional Credits"],
  ],
  band: [
    ["projectStatement", "Project Statement"],
    ["members", "Members / Contributors"],
    ["latestMusic", "Latest Music"],
    ["videos", "Videos"],
    ["bandStory", "Band Story"],
    ["bandCredits", "Credits"],
  ],
  design: [
    ["skills", "Skills"],
    ["tools", "Tools"],
    ["selectedProjects", "Selected Projects"],
    ["projectRole", "Project Role"],
    ["projectDescription", "Project Description"],
    ["caseStudyLinks", "Case Study Links"],
    ["process", "Process"],
  ],
  visual: [
    ["collections", "Collections"],
    ["projectStories", "Project Stories"],
    ["galleryDirection", "Gallery Direction"],
    ["exhibitionLinks", "Exhibition Links"],
  ],
  film: [
    ["showreel", "Showreel"],
    ["selectedFilms", "Selected Films"],
    ["videoLinks", "Video Links"],
    ["filmRole", "Role"],
    ["filmCredits", "Credits"],
  ],
  threeD: [
    ["sceneLink", "3D Scene Link"],
    ["splineLink", "Spline Link"],
    ["sketchfabLink", "Sketchfab Link"],
    ["threeDProjects", "Projects"],
  ],
  general: [["creatorNotes", "Creator-Specific Notes"]],
};

function creatorGroup(value) {
  if (["Singer", "Music Artist", "Producer", "Beatmaker", "Composer", "DJ"].includes(value)) return "music";
  if (value === "Band") return "band";
  if (["Designer", "UI / UX Designer", "Creative Director"].includes(value)) return "design";
  if (["Photographer", "Illustrator", "Model"].includes(value)) return "visual";
  if (["Filmmaker", "Motion Designer"].includes(value)) return "film";
  if (value === "3D Artist") return "threeD";
  return "general";
}

function getPlan() {
  return form.elements.plan?.value || "";
}

function slugToTemplate(slug) {
  const map = {
    "band-story": "Band Story",
    "minimal-professional": "Minimal Professional",
    "editorial-portrait": "Editorial Portrait",
    "interactive-portal": "Interactive Portal",
    "emerald-luxe": "Emerald Luxe",
    "cinematic-artist": "Cinematic Artist",
  };
  return map[slug] || "";
}

function setError(message = "") {
  errorEl.textContent = message;
}

function formDataObject() {
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

function applyData(data) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const fields = Array.from(form.querySelectorAll(`[name="${CSS.escape(key)}"]`));
    fields.forEach((field) => {
      if (field.type === "radio" || field.type === "checkbox") {
        field.checked = Array.isArray(value) ? value.includes(field.value) : value === field.value || value === "on";
      } else {
        field.value = value;
      }
    });
  });
  renderDynamicFields();
  Object.entries(data || {}).forEach(([key, value]) => {
    const field = form.querySelector(`[name="${CSS.escape(key)}"]`);
    if (field && field.type !== "radio" && field.type !== "checkbox") field.value = value;
  });
}

function validateUrl(value) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function validateUrlList(value) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .every(validateUrl);
}

function validateCurrentStep() {
  setError("");
  const active = steps.find((step) => Number(step.dataset.step) === currentStep);
  const required = Array.from(active.querySelectorAll("[required]"));
  const missing = required.filter((field) => {
    if (field.type === "radio") return !form.querySelector(`[name="${field.name}"]:checked`);
    if (field.type === "checkbox") return !field.checked;
    return !String(field.value || "").trim();
  });
  if (missing.length) {
    setError("Please complete the required field(s) before continuing.");
    return false;
  }

  const badUrl = Array.from(active.querySelectorAll("[data-url-field]")).find((field) => !validateUrl(field.value));
  if (badUrl) {
    setError("Please use safe links only: https://, http://, or email where allowed.");
    badUrl.focus();
    return false;
  }

  const badEmail = Array.from(active.querySelectorAll('input[type="email"]')).find((field) => {
    return String(field.value || "").trim() && !field.checkValidity();
  });
  if (badEmail) {
    setError("Please enter a valid email address.");
    badEmail.focus();
    return false;
  }

  const urlList = active.querySelector("[data-url-list]");
  if (urlList && !validateUrlList(urlList.value)) {
    setError("Custom links must be one safe URL per line.");
    urlList.focus();
    return false;
  }

  if (currentStep === 2 && getPlan() !== "Essential" && !form.elements.template?.value) {
    setError("Please choose a template or go back and choose Essential.");
    return false;
  }

  return true;
}

function renderStepButtons() {
  stepList.innerHTML = "";
  stepTitles.forEach((step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = step.number === currentStep ? "is-active" : "";
    button.innerHTML = `<span>${String(step.number).padStart(2, "0")}</span><span>${step.title}</span>`;
    button.addEventListener("click", () => {
      if (step.number > currentStep + 1) {
        setError("Please continue step by step so the request stays complete.");
        return;
      }
      if (step.number > currentStep && !validateCurrentStep()) return;
      currentStep = step.number;
      setError("");
      render();
    });
    stepList.appendChild(button);
  });
}

function renderDynamicFields() {
  const plan = getPlan();
  const isEssential = plan === "Essential";
  const isPrime = plan === "Prime";
  essentialDesign.classList.toggle("hidden", !isEssential);
  templatePicker.classList.toggle("hidden", isEssential);
  primeDirection.classList.toggle("hidden", !isPrime);

  if (isEssential) {
    Array.from(form.querySelectorAll('[name="template"]')).forEach((field) => {
      field.checked = false;
    });
  }

  const media = mediaByPlan[plan] || ["Profile Photo", "Banner", "Selected Images"];
  mediaHeading.textContent = `${plan || "Selected"} media`;
  mediaList.innerHTML = media.map((item) => `<li>${item}</li>`).join("");

  const data = formDataObject();
  const group = creatorGroup(data.creatorType);
  const currentValues = {};
  Array.from(creatorFields.querySelectorAll("[name]")).forEach((field) => {
    currentValues[field.name] = field.value;
  });
  creatorFields.innerHTML = "";

  creatorFieldTemplates[group].forEach(([name, label]) => {
    const wrapper = document.createElement("label");
    const isLink = /link|youtube|spotify|apple|soundcloud|bandcamp|spline|sketchfab/i.test(name);
    wrapper.innerHTML = `${label}<textarea name="${name}" ${isLink ? "data-url-list" : ""} placeholder="${isLink ? "Safe links only, one per line" : "Write rough notes if needed"}"></textarea>`;
    creatorFields.appendChild(wrapper);
    const field = wrapper.querySelector("textarea");
    if (currentValues[name]) field.value = currentValues[name];
  });
}

function renderReview() {
  const data = formDataObject();
  const rows = [
    ["Plan", data.plan || "-"],
    ["Selected Template", data.plan === "Essential" ? "PulseLore chooses design" : data.template || "-"],
    ["Artist Name", data.artistName || "-"],
    ["Creator Type", data.creatorType || "-"],
    ["Contact", [data.contactName, data.contactEmail, data.contactPhone].filter(Boolean).join(" / ") || "-"],
    ["Bio", data.shortBio || "-"],
    ["Media", data.mediaLinks ? "Private links provided" : "No media links yet"],
    ["Social Links", countLinks(data)],
    ["Custom Direction", data.customDirection || data.creativeDirection || "-"],
  ];
  reviewSummary.innerHTML = rows
    .map((row, index) => `<div class="summary-row"><strong>${row[0]}</strong><span>${escapeHtml(String(row[1]))}</span><button type="button" data-edit-step="${Math.min(index + 1, 7)}">Edit</button></div>`)
    .join("");
  reviewSummary.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => {
      currentStep = Number(button.dataset.editStep);
      render();
    });
  });
}

function countLinks(data) {
  const keys = [
    "officialWebsite",
    "youtube",
    "spotify",
    "appleMusic",
    "instagram",
    "facebook",
    "tiktok",
    "soundcloud",
    "bandcamp",
    "vimeo",
    "behance",
    "dribbble",
    "github",
    "linkedin",
  ];
  const count = keys.filter((key) => data[key]).length + (data.customLinks ? data.customLinks.split(/\n+/).filter(Boolean).length : 0);
  return `${count} link${count === 1 ? "" : "s"}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function buildRequestId() {
  const d = new Date();
  return `PL-PORT-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-4)}`;
}

function buildEmailBody(id, data) {
  return [
    `Request ID: ${id}`,
    `Date: ${new Date().toLocaleString()}`,
    `Status: NEW`,
    "",
    `Plan: ${data.plan || "-"}`,
    `Selected Template: ${data.plan === "Essential" ? "PulseLore chooses design" : data.template || "-"}`,
    `Prime Direction: ${data.primeDirection || "-"}`,
    "",
    `Artist / Creator Name: ${data.artistName || "-"}`,
    `Stage Name: ${data.stageName || "-"}`,
    `Project / Band Name: ${data.projectName || "-"}`,
    `Creator Type: ${data.creatorType || "-"}`,
    `Profession / Role: ${data.profession || "-"}`,
    `Location: ${data.location || "-"}`,
    `Public Tagline: ${data.tagline || "-"}`,
    "",
    `Contact Name: ${data.contactName || "-"}`,
    `Contact Email: ${data.contactEmail || "-"}`,
    `Contact Phone / Messaging: ${data.contactPhone || "-"}`,
    "",
    `Short Bio: ${data.shortBio || "-"}`,
    `Full About: ${data.fullAbout || "-"}`,
    `Artist Story: ${data.artistStory || "-"}`,
    `Creative Direction: ${data.creativeDirection || "-"}`,
    `Desired Feeling: ${data.desiredFeeling || "-"}`,
    `Special Notes: ${data.specialNotes || "-"}`,
    "",
    `Media Links: ${data.mediaLinks || "-"}`,
    `Media Notes: ${data.mediaNotes || "-"}`,
    "",
    `Official Website: ${data.officialWebsite || "-"}`,
    `YouTube: ${data.youtube || "-"}`,
    `Spotify: ${data.spotify || "-"}`,
    `Apple Music: ${data.appleMusic || "-"}`,
    `Instagram: ${data.instagram || "-"}`,
    `Custom Links: ${data.customLinks || "-"}`,
    "",
    `Creator Details:`,
    JSON.stringify(creatorDetails(data), null, 2),
    "",
    "Business process:",
    "NEW -> CONTACTED -> ACCEPTED/DECLINED -> CONVERTED TO PROJECT",
    "",
    "This request does not create a public page automatically.",
  ].join("\n");
}

function creatorDetails(data) {
  const excluded = new Set([
    "plan",
    "template",
    "primeDirection",
    "customDirection",
    "artistName",
    "stageName",
    "projectName",
    "creatorType",
    "profession",
    "location",
    "tagline",
    "contactName",
    "contactEmail",
    "contactPhone",
    "shortBio",
    "fullAbout",
    "artistStory",
    "creativeDirection",
    "desiredFeeling",
    "specialNotes",
    "mediaLinks",
    "mediaNotes",
    "officialWebsite",
    "youtube",
    "spotify",
    "appleMusic",
    "instagram",
    "facebook",
    "tiktok",
    "soundcloud",
    "bandcamp",
    "vimeo",
    "behance",
    "dribbble",
    "github",
    "linkedin",
    "publicEmail",
    "customLinks",
    "submitConsent",
  ]);
  const details = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!excluded.has(key) && String(value).trim()) details[key] = value;
  });
  return details;
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formDataObject()));
  setError("Draft saved in this browser.");
}

function submitRequest() {
  if (!validateCurrentStep()) return;
  const data = formDataObject();
  const id = buildRequestId();
  const record = {
    id,
    status: "NEW",
    createdAt: new Date().toISOString(),
    data,
  };
  const existing = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
  existing.push(record);
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(existing));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  const subject = encodeURIComponent(`PulseLore Portfolio Request ${id} - ${data.artistName || "New Client"}`);
  const body = encodeURIComponent(buildEmailBody(id, data));
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<strong>Request record prepared: ${id}</strong><p>This request has been saved in this browser. Your email app will open so you can send it to PulseLore. The request is not genuinely received until the email is sent.</p><p>PulseLore will review the scope, price, timeline, media delivery, and next steps. No public page is created automatically.</p>`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

function render() {
  renderDynamicFields();
  steps.forEach((step) => {
    step.classList.toggle("is-active", Number(step.dataset.step) === currentStep);
  });
  const activeTitle = stepTitles.find((step) => step.number === currentStep)?.title || "";
  progressText.textContent = `${currentStep} / ${steps.length}`;
  currentStepLabel.textContent = activeTitle;
  progressBar.style.width = `${(currentStep / steps.length) * 100}%`;
  prevBtn.disabled = false;
  prevBtn.textContent = currentStep === 1 ? "Back to Artist Station" : "Back";
  nextBtn.classList.toggle("hidden", currentStep === steps.length);
  submitBtn.classList.toggle("hidden", currentStep !== steps.length);
  if (currentStep === 8) renderReview();
  renderStepButtons();
}

function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const template = slugToTemplate(params.get("template") || "");
  if (plan) {
    const planField = form.querySelector(`[name="plan"][value="${plan[0].toUpperCase() + plan.slice(1)}"]`);
    if (planField) planField.checked = true;
  }
  if (template) {
    const templateField = form.querySelector(`[name="template"][value="${template}"]`);
    if (templateField) templateField.checked = true;
  }
}

const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    applyData(JSON.parse(saved));
  } catch {}
}

initFromUrl();
renderDynamicFields();
render();

form.addEventListener("input", () => {
  setError("");
  renderDynamicFields();
});

prevBtn.addEventListener("click", () => {
  if (currentStep === 1) {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "../index.html";
    }
    return;
  }

  currentStep -= 1;
  setError("");
  render();
});

nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  currentStep = Math.min(steps.length, currentStep + 1);
  setError("");
  render();
});

saveBtn.addEventListener("click", saveDraft);
submitBtn.addEventListener("click", submitRequest);
