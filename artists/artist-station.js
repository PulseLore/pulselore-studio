const modal = document.querySelector("[data-template-modal]");
const modalArt = document.querySelector("[data-modal-art]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalStatus = document.querySelector("[data-modal-status]");
const modalDescription = document.querySelector("[data-modal-description]");
const modalRequest = document.querySelector("[data-modal-request]");
const previewButtons = Array.from(document.querySelectorAll("[data-preview-template]"));
const closeButtons = Array.from(document.querySelectorAll("[data-preview-close]"));

function openPreview(button) {
  const card = button.closest(".template-card");
  if (!card || !modal) return;

  const art = card.querySelector(".template-art");
  const title = card.querySelector("h3")?.textContent?.trim() || "Template Preview";
  const status = card.querySelector(".status")?.textContent?.trim() || "Template";
  const description = card.querySelector("p")?.textContent?.trim() || "";
  const requestLink = card.querySelector('a[href*="./request/"]')?.getAttribute("href") || "./request/";

  modalArt.replaceChildren();
  if (art) {
    const clone = art.cloneNode(true);
    clone.classList.add("preview-large");
    modalArt.appendChild(clone);
  }

  modalTitle.textContent = title;
  modalStatus.textContent = status;
  modalDescription.textContent = description;
  modalRequest.href = requestLink;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close")?.focus();
}

function closePreview() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => openPreview(button));
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closePreview);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.hidden) closePreview();
});
