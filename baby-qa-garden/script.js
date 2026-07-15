// Baby QA private soft lock.
// To change access later, update this soft lock and redeploy the app.
// Static browser lock only; real authentication can be added later.
const GARDEN_ACCESS_CODE = [75,104,105,110,116,64,49,53,57,53,49,56].map((code) => String.fromCharCode(code)).join("");

const storageKeys = {
  unlocked: "baby-qa-garden-access-ok",
  form: "baby-qa-garden-form-data",
  basket: "baby-qa-garden-basket",
  outputs: "baby-qa-garden-outputs",
};

const guideSteps = [
  ["QA Desk", "Use QA Desk when you want to turn messy bug notes into a clean report. Just write what happened, then copy the clean version into your work tool."],
  ["Bug Report Formatter", "Write your rough note here. I'll help shape it into Title, Steps, Expected Result, Actual Result, Environment, and Severity."],
  ["Test Case Templates", "When your brain feels tired, pick a template. Login, payment, form validation, mobile view - I'll give you a clean starting point."],
  ["Re-test Basket", "Drop bugs here when you need to check them again later. No heavy tracking, just a tiny basket so you don't forget."],
  ["Daily QA Summary", "At the end of the day, add your tested, passed, failed, blocked, and re-tested counts. I'll make a clean daily update for you."],
  ["Comfort Room", "When work feels too heavy, come here for a tiny break. Pop stress bubbles, tap the soft cloud, breathe for 30 seconds, and let the panda hold the heavy part for a minute."],
  ["Privacy Reminder", "Please don't put company secrets here. No customer data, payment data, internal links, API keys, credentials, or private screenshots. This garden is only for safe notes and soft breaks."],
];

const comfortMessages = [
  "Private QA workspace.\nOne task at a time.",
  "Tiny break?\nTap the stress cloud.\nThen come back softer.",
  "You did enough today.\nLet the panda hold the heavy part for a minute.",
];

const templates = [
  {
    title: "Login",
    preconditions: "User has a valid account and can access the login page.",
    steps: ["Open the login page.", "Enter valid username and password.", "Tap the Login button."],
    expected: "User is redirected to the dashboard successfully.",
  },
  {
    title: "Form Validation",
    preconditions: "User can access the form screen.",
    steps: ["Open the form.", "Leave required fields empty.", "Submit the form."],
    expected: "Required field validation messages are shown clearly.",
  },
  {
    title: "Payment Flow",
    preconditions: "User has items ready for checkout and safe test payment data.",
    steps: ["Open checkout.", "Select payment method.", "Submit payment using safe test data."],
    expected: "Payment result is shown and order status updates correctly.",
  },
  {
    title: "Mobile View",
    preconditions: "User opens the page on a mobile viewport or device.",
    steps: ["Open the target page.", "Check layout, buttons, and text.", "Scroll and interact with main controls."],
    expected: "Page is responsive, readable, and touch-friendly with no broken layout.",
  },
  {
    title: "Error Message",
    preconditions: "User can trigger the selected error state safely.",
    steps: ["Open the feature.", "Trigger the error condition.", "Read the displayed error message."],
    expected: "Error message is clear, helpful, and appears in the correct place.",
  },
  {
    title: "Dashboard",
    preconditions: "User has access to the dashboard with safe test data.",
    steps: ["Open dashboard.", "Check loaded widgets and data.", "Refresh or change filters."],
    expected: "Dashboard data loads correctly and updates without visual issues.",
  },
  {
    title: "Notification",
    preconditions: "Notification feature is enabled for the test account.",
    steps: ["Trigger a notification event.", "Observe in-app or system notification.", "Open the notification target."],
    expected: "Notification appears with correct text and opens the expected destination.",
  },
];

let guideIndex = 0;
let editingBasketId = null;
let breathingTimer = null;
let comfortIndex = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function readJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
}

function unlockApp() {
  $("#accessScreen").classList.add("is-hidden");
  $("#app").classList.remove("is-locked");
}

function lockApp() {
  localStorage.removeItem(storageKeys.unlocked);
  $("#app").classList.add("is-locked");
  $("#accessScreen").classList.remove("is-hidden");
  $("#accessCode").value = "";
  $("#accessCode").focus();
}

function setupAccess() {
  if (localStorage.getItem(storageKeys.unlocked) === "yes") unlockApp();

  $("#accessForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const entered = $("#accessCode").value.trim();
    const message = $("#accessMessage");

    if (entered === GARDEN_ACCESS_CODE) {
      localStorage.setItem(storageKeys.unlocked, "yes");
      message.textContent = "";
      unlockApp();
      showToast("Welcome back to the private garden.");
    } else {
      message.textContent = "That code did not open the garden. Try softly again.";
    }
  });
}

function setPage(pageId) {
  $$(".page").forEach((page) => page.classList.toggle("active", page.id === pageId));
  $$("[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === pageId));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  $$("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setPage(button.dataset.page));
  });
}

function savedForm() {
  return readJSON(storageKeys.form, {});
}

function saveField(id) {
  const data = savedForm();
  data[id] = $(`#${id}`).value;
  writeJSON(storageKeys.form, data);
}

function restoreFields() {
  const data = savedForm();
  Object.keys(data).forEach((id) => {
    const field = $(`#${id}`);
    if (field) field.value = data[id];
  });

  const outputs = readJSON(storageKeys.outputs, {});
  if (outputs.bugOutput) $("#bugOutput").textContent = outputs.bugOutput;
  if (outputs.summaryOutput) $("#summaryOutput").textContent = outputs.summaryOutput;

  $$("input, textarea, select").forEach((field) => {
    if (field.id && field.id !== "accessCode" && field.id !== "importText") {
      field.addEventListener("input", () => saveField(field.id));
      field.addEventListener("change", () => saveField(field.id));
    }
  });
}

function saveOutput(id, value) {
  const outputs = readJSON(storageKeys.outputs, {});
  outputs[id] = value;
  writeJSON(storageKeys.outputs, outputs);
}

function createBugReport() {
  const note = $("#bugNote").value.trim();
  const environment = $("#bugEnvironment").value.trim() || "Not specified";
  const severity = $("#bugSeverity").value;
  const extra = $("#bugExtra").value.trim() || "None";
  const lower = note.toLowerCase();

  let title = note ? note.split(/[.\n]/)[0].slice(0, 82) : "Bug title";
  let steps = ["Open the affected page.", "Perform the action described in the rough note.", "Observe the result."];
  let expected = "Feature should work as expected.";
  let actual = note || "Actual result from rough note.";

  if (lower.includes("login") || lower.includes("password")) {
    title = "Login button does not respond after entering password";
    steps = ["Open the login page.", "Enter a valid password.", "Click the Login button."];
    expected = "User should be redirected to the dashboard.";
    actual = "Nothing happens after clicking the Login button.";
  } else if (lower.includes("payment")) {
    title = "Payment flow does not complete successfully";
    steps = ["Open the checkout page.", "Enter safe test payment details.", "Submit the payment."];
    expected = "Payment should complete and show a success confirmation.";
  } else if (lower.includes("mobile") || lower.includes("responsive")) {
    title = "Mobile layout is not displaying correctly";
    steps = ["Open the page on a mobile device or small viewport.", "Scroll through the page.", "Check text, buttons, and main layout."];
    expected = "Mobile view should be readable and touch-friendly.";
  }

  return `Title:
${title}

Steps to Reproduce:
${steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

Expected Result:
${expected}

Actual Result:
${actual}

Environment:
${environment}

Severity:
${severity}

Notes:
${extra}`;
}

function setupBugDesk() {
  $("#generateBug").addEventListener("click", () => {
    const report = createBugReport();
    $("#bugOutput").textContent = report;
    saveOutput("bugOutput", report);
  });

  $("#copyBug").addEventListener("click", () => copyText($("#bugOutput").textContent));

  $("#clearBug").addEventListener("click", () => {
    ["bugNote", "bugEnvironment", "bugExtra"].forEach((id) => {
      $(`#${id}`).value = "";
      saveField(id);
    });
    $("#bugSeverity").value = "Medium";
    saveField("bugSeverity");
    $("#bugOutput").textContent = "Your clean bug report will bloom here.";
    saveOutput("bugOutput", "");
  });
}

function setupGuide() {
  const dots = $("#guideDots");
  guideSteps.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Guide step ${index + 1}`);
    dot.addEventListener("click", () => {
      guideIndex = index;
      renderGuide();
    });
    dots.appendChild(dot);
  });

  $("#guideBack").addEventListener("click", () => {
    guideIndex = Math.max(0, guideIndex - 1);
    renderGuide();
  });

  $("#guideNext").addEventListener("click", () => {
    if (guideIndex === guideSteps.length - 1) {
      setPage("home");
      return;
    }
    guideIndex += 1;
    renderGuide();
  });

  renderGuide();
}

function renderGuide() {
  const [title, text] = guideSteps[guideIndex];
  $("#guideCount").textContent = `Step ${guideIndex + 1} of ${guideSteps.length}`;
  $("#guideTitle").textContent = title;
  $("#guideText").textContent = text;
  $("#guideBack").disabled = guideIndex === 0;
  $("#guideNext").textContent = guideIndex === guideSteps.length - 1 ? "Start using Baby's QA Garden" : "Next";
  $$("#guideDots .dot").forEach((dot, index) => dot.classList.toggle("active", index === guideIndex));
}

function templateText(template) {
  return `Test Case Title:
${template.title}

Preconditions:
${template.preconditions}

Steps:
${template.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

Expected Result:
${template.expected}`;
}

function setupTemplates() {
  const list = $("#templateList");
  templates.forEach((template) => {
    const card = document.createElement("article");
    card.className = "soft-card template-card";
    card.innerHTML = `
      <h2>${template.title}</h2>
      <p><strong>Preconditions:</strong> ${template.preconditions}</p>
      <p><strong>Steps:</strong> ${template.steps.join(" ")}</p>
      <p><strong>Expected Result:</strong> ${template.expected}</p>
      <button type="button">Copy</button>
    `;
    card.querySelector("button").addEventListener("click", () => copyText(templateText(template)));
    list.appendChild(card);
  });
}

function setupSummary() {
  $("#generateSummary").addEventListener("click", () => {
    const summary = `Today I tested ${$("#testedCount").value || 0} cases.
Passed: ${$("#passedCount").value || 0}
Failed: ${$("#failedCount").value || 0}
Blocked: ${$("#blockedCount").value || 0}
Re-tested: ${$("#retestedCount").value || 0}
Notes: ${$("#summaryNotes").value.trim() || "None"}`;

    $("#summaryOutput").textContent = summary;
    saveOutput("summaryOutput", summary);
  });

  $("#copySummary").addEventListener("click", () => copyText($("#summaryOutput").textContent));

  $("#clearSummary").addEventListener("click", () => {
    ["testedCount", "passedCount", "failedCount", "blockedCount", "retestedCount", "summaryNotes"].forEach((id) => {
      $(`#${id}`).value = "";
      saveField(id);
    });
    $("#summaryOutput").textContent = "Your daily QA summary will appear here.";
    saveOutput("summaryOutput", "");
  });
}

function basketItems() {
  return readJSON(storageKeys.basket, []);
}

function saveBasket(items) {
  writeJSON(storageKeys.basket, items);
}

function setupBasket() {
  $("#saveBasket").addEventListener("click", () => {
    const title = $("#basketTitle").value.trim();
    if (!title) {
      showToast("Add a bug title first.");
      return;
    }

    const next = {
      id: editingBasketId || crypto.randomUUID(),
      title,
      note: $("#basketNote").value.trim(),
      status: $("#basketStatus").value,
    };

    const items = basketItems();
    const updated = editingBasketId
      ? items.map((item) => (item.id === editingBasketId ? next : item))
      : [next, ...items];

    saveBasket(updated);
    editingBasketId = null;
    $("#saveBasket").textContent = "Add item";
    $("#basketTitle").value = "";
    $("#basketNote").value = "";
    $("#basketStatus").value = "To Re-test";
    ["basketTitle", "basketNote", "basketStatus"].forEach(saveField);
    renderBasket();
  });

  renderBasket();
}

function renderBasket() {
  const list = $("#basketList");
  const items = basketItems();
  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = '<p class="privacy-note">No re-test bugs yet. The basket is resting.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "soft-card basket-item";
    card.innerHTML = `
      <div>
        <h2></h2>
        <p></p>
      </div>
      <select>
        <option>To Re-test</option>
        <option>Passed</option>
        <option>Failed Again</option>
        <option>Need More Info</option>
      </select>
      <div class="item-actions">
        <button type="button" class="ghost">Edit</button>
        <button type="button" class="danger">Delete</button>
      </div>
    `;
    card.querySelector("h2").textContent = item.title;
    card.querySelector("p").textContent = item.note || "No note";
    const status = card.querySelector("select");
    status.value = item.status;
    status.addEventListener("change", () => {
      saveBasket(basketItems().map((saved) => (saved.id === item.id ? { ...saved, status: status.value } : saved)));
    });
    const buttons = card.querySelectorAll("button");
    buttons[0].addEventListener("click", () => {
      editingBasketId = item.id;
      $("#basketTitle").value = item.title;
      $("#basketNote").value = item.note;
      $("#basketStatus").value = item.status;
      $("#saveBasket").textContent = "Save edit";
      setPage("basket");
    });
    buttons[1].addEventListener("click", () => {
      saveBasket(basketItems().filter((saved) => saved.id !== item.id));
      renderBasket();
    });
    list.appendChild(card);
  });
}

function setupComfort() {
  $("#comfortMessage").textContent = comfortMessages[0];
  ["stressCloud", "petPanda", "petHippo"].forEach((id) => {
    $(`#${id}`).addEventListener("click", () => sendComfortHeart());
  });
  $$(".bubble").forEach((bubble) => bubble.addEventListener("click", () => sendComfortHeart()));
  $("#startBreathing").addEventListener("click", startBreathing);
}

function sendComfortHeart() {
  comfortIndex = (comfortIndex + 1) % comfortMessages.length;
  $("#comfortMessage").textContent = comfortMessages[comfortIndex];
  const heart = document.createElement("span");
  heart.textContent = "<3";
  heart.style.left = `${25 + Math.random() * 50}%`;
  $("#heartLayer").appendChild(heart);
  setTimeout(() => heart.remove(), 1400);
}

function startBreathing() {
  if (breathingTimer) return;
  let seconds = 30;
  const circle = $("#breathCircle");
  const button = $("#startBreathing");
  circle.classList.add("breathing");
  button.disabled = true;
  button.textContent = "Breathing...";
  circle.textContent = seconds;

  breathingTimer = setInterval(() => {
    seconds -= 1;
    circle.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(breathingTimer);
      breathingTimer = null;
      circle.textContent = "30";
      circle.classList.remove("breathing");
      button.disabled = false;
      button.textContent = "Start 30-second breathing break";
      showToast("Good job, Baby. Come back softer.");
    }
  }, 1000);
}

function setupBackup() {
  $("#exportData").addEventListener("click", () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      form: readJSON(storageKeys.form, {}),
      outputs: readJSON(storageKeys.outputs, {}),
      basket: basketItems(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "babys-qa-garden-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup exported.");
  });

  $("#importData").addEventListener("click", () => {
    try {
      const data = JSON.parse($("#importText").value);
      if (data.form) writeJSON(storageKeys.form, data.form);
      if (data.outputs) writeJSON(storageKeys.outputs, data.outputs);
      if (Array.isArray(data.basket)) saveBasket(data.basket);
      restoreFields();
      renderBasket();
      showToast("Backup imported.");
    } catch {
      showToast("Could not read that JSON.");
    }
  });

  $("#resetData").addEventListener("click", () => {
    if (!confirm("Clear saved notes and basket from this browser?")) return;
    [storageKeys.form, storageKeys.outputs, storageKeys.basket].forEach((key) => localStorage.removeItem(key));
    location.reload();
  });

  $("#logoutAccess").addEventListener("click", lockApp);
}

function copyText(text) {
  const clean = text.trim();
  if (!clean || clean.includes("will bloom") || clean.includes("will appear")) {
    showToast("Nothing to copy yet, Baby.");
    return;
  }
  navigator.clipboard?.writeText(clean).then(
    () => showToast("Copied softly."),
    () => showToast("Copy did not work. Select the text manually.")
  );
}

function setupPWA() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

function init() {
  setupAccess();
  setupNavigation();
  restoreFields();
  setupBugDesk();
  setupGuide();
  setupTemplates();
  setupSummary();
  setupBasket();
  setupComfort();
  setupBackup();
  setupPWA();
}

document.addEventListener("DOMContentLoaded", init);


