// Utilities
const $ = (sel, el = document) => el.querySelector(sel)
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel))
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

// Grid unit label
const gridUnit =
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--grid-unit")
  ) || 0.125
const fmt = (n) => (Math.round(n * 1000) / 1000).toString()
const lbl1 = document.querySelector("#gridUnitLabel")
const lbl2 = document.querySelector("#gridUnitLabel2")
if (lbl1) lbl1.textContent = fmt(gridUnit)
if (lbl2) lbl2.textContent = fmt(gridUnit)

// TOC build & anchors
function buildTOC() {
  const list = $("#tocList")
  list.innerHTML = ""
  $$("main h2").forEach((h2) => {
    const id = h2.id || (h2.id = slug(h2.textContent))
    const li = document.createElement("li")
    const a = document.createElement("a")
    a.href = "#" + id
    a.textContent = h2.textContent
    li.appendChild(a)
    list.appendChild(li)
    // add anchor on header card
    const card = h2.closest(".rule-section")
    const anchor = card.querySelector(".anchor")
    if (anchor) {
      anchor.href = "#" + id
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        const url = location.origin + location.pathname + "#" + id
        navigator.clipboard.writeText(url).then(() => toast("Link copied"))
      })
    }
  })
}

// Scrollspy
function spyTOC() {
  const links = $$("#toc a")
  const sections = $$("main h2").map((h) => document.getElementById(h.id))
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) =>
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + entry.target.id
            )
          )
        }
      })
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  )
  sections.forEach((sec) => io.observe(sec))
}

// Simple filter
$("#tocSearch").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase()
  $$("#content .rule-section").forEach((sec) => {
    const txt = sec.textContent.toLowerCase()
    sec.style.display = txt.includes(q) ? "" : "none"
  })
})

// Toast
let toastEl
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement("div")
    toastEl.style.cssText =
      "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111927;border:1px solid var(--border);padding:.6rem 1rem;border-radius:999px;box-shadow:var(--shadow);z-index:9999;opacity:0;transition:opacity .15s"
    document.body.appendChild(toastEl)
  }
  toastEl.textContent = msg
  toastEl.style.opacity = "1"
  setTimeout(() => (toastEl.style.opacity = "0"), 1200)
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre[class*="language-"]').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Copy';
    btn.style.position = 'absolute';
    btn.style.right = '10px';
    btn.style.top = '10px';
    btn.style.padding = '.35rem .6rem';
    btn.style.fontSize = '.85rem';
    btn.style.opacity = '.8';
    btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '.8');

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(btn);

    btn.addEventListener('click', async () => {
      const text = pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 900);
      } catch {
        btn.textContent = 'Error';
        setTimeout(() => btn.textContent = 'Copy', 900);
      }
    });
  });
});

// CLICK
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-grid-toggle]');
  if (!btn) return;
  const fig = btn.closest('.spec-figure');
  if (!fig) return;
  fig.setAttribute('data-grid-on', fig.getAttribute('data-grid-on') === '1' ? '0' : '1');
});

// Init
buildTOC()
spyTOC()