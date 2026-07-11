const GARDEN_ACCESS_CODE = "Khin@159518";
const KEY = "pulselore-baby-qa-v2";
const checks = ["Visual Check","Mobile Check","Broken Links Check","SEO / Metadata Check","Accessibility Check","Performance Check","Security / Privacy Check","Final Launch Checklist"];
const state = JSON.parse(localStorage.getItem(KEY) || '{"unlocked":false,"checks":{},"issues":[]}');
const $ = (id) => document.getElementById(id);
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function openApp(){ $("accessScreen").classList.add("app-hidden"); $("gardenApp").classList.remove("app-hidden"); render(); }
function lock(){ state.unlocked=false; save(); $("gardenApp").classList.add("app-hidden"); $("accessScreen").classList.remove("app-hidden"); $("accessCode").value=""; }
$("accessForm").addEventListener("submit",(e)=>{ e.preventDefault(); if($("accessCode").value.trim()===GARDEN_ACCESS_CODE){ state.unlocked=true; save(); openApp(); } else { $("accessMessage").textContent="That code did not open the garden."; } });
$("lockGarden").addEventListener("click",(e)=>{ e.preventDefault(); lock(); });
function render(){
  const list = $("qaChecklist");
  list.innerHTML = checks.map(name => `<label class="qa-check"><input type="checkbox" data-check="${name}" ${state.checks[name]?'checked':''}><span><strong>${name}</strong><br><small class="private-note">${hint(name)}</small></span></label>`).join("");
  list.querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{ state.checks[input.dataset.check]=input.checked; save(); renderScore(); }));
  renderIssues(); renderScore();
}
function hint(name){ return { "Visual Check":"Spacing, contrast, imagery, and first impression.", "Mobile Check":"360px, 390px, tablet, and desktop.", "Broken Links Check":"Main navigation and CTA paths.", "SEO / Metadata Check":"Title, description, icons, and social basics.", "Accessibility Check":"Readable text, focus states, labels.", "Performance Check":"Video/image weight and first load.", "Security / Privacy Check":"No secrets, no public access code text.", "Final Launch Checklist":"Ready for final publish decision." }[name]; }
function renderScore(){
  const done = checks.filter(name=>state.checks[name]).length;
  const open = state.issues.filter(i=>i.status!=="Fixed").length;
  const score = Math.max(0, Math.round((done/checks.length)*100 - open*4));
  $("score").textContent = `${score}%`;
  $("openIssues").textContent = open;
}
$("issueForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  state.issues.unshift({ id: Date.now(), title:$("issueTitle").value, page:$("issuePage").value, priority:$("issuePriority").value, status:$("issueStatus").value, notes:$("issueNotes").value });
  e.target.reset(); save(); renderIssues(); renderScore();
});
function renderIssues(){
  $("issueList").innerHTML = state.issues.length ? state.issues.map(issue=>`<article class="issue-item"><strong>${escapeHtml(issue.title)}</strong><p class="private-note">${escapeHtml(issue.page||"No page")} Â· ${issue.priority} Â· ${issue.status}</p><p>${escapeHtml(issue.notes||"")}</p><div class="actions"><button class="button secondary" data-fix="${issue.id}" type="button">Mark Fixed</button><button class="button secondary" data-delete="${issue.id}" type="button">Delete</button></div></article>`).join("") : '<p class="private-note">No issues logged yet.</p>';
  document.querySelectorAll("[data-fix]").forEach(btn=>btn.addEventListener("click",()=>{ const item=state.issues.find(i=>i.id==btn.dataset.fix); if(item)item.status="Fixed"; save(); renderIssues(); renderScore(); }));
  document.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{ state.issues=state.issues.filter(i=>i.id!=btn.dataset.delete); save(); renderIssues(); renderScore(); }));
}
$("exportMd").addEventListener("click",()=>{
  const done = checks.filter(name=>state.checks[name]).length;
  const md = `# Baby QA Garden Launch Report\n\nReadiness: ${$("score").textContent}\nChecklist: ${done}/${checks.length}\nOpen issues: ${state.issues.filter(i=>i.status!=="Fixed").length}\n\n## Checklist\n${checks.map(name=>`- [${state.checks[name]?'x':' '}] ${name}`).join("\n")}\n\n## Issues\n${state.issues.map(i=>`- ${i.status} / ${i.priority}: ${i.title} (${i.page||"No page"})`).join("\n") || "- No issues logged."}`;
  $("markdownOutput").textContent = md;
  navigator.clipboard?.writeText(md);
});
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c])); }
if(state.unlocked) openApp();