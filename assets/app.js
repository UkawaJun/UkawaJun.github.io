/* global marked */

const LOCALES = ["zh", "en", "ja"];
const LOCALE_LABEL = { zh: "CN", en: "EN", ja: "JP" };
const FILES = [
  "profile.md",
  "education.md",
  "work.md",
  "projects.md",
  "publications.md",
  "honors.md",
  "certificates.md",
  "course-certs.md",
  "journal.md",
  "featured.md",
  "interests.md",
];
const ROUTES = [
  { path: "/", id: "profile" },
  { path: "/education", id: "education" },
  { path: "/work", id: "work" },
  { path: "/projects", id: "projects" },
  { path: "/publications", id: "publications" },
  { path: "/honors", id: "honors" },
  { path: "/journal", id: "journal" },
];
const EDITOR_CODES = ["KeyU", "KeyK", "KeyW", "KeyU", "KeyK", "KeyJ"];
const STORAGE_LOCALE = "lz.locale";
const STORAGE_TOKEN = "lz.gh.token";
const NAV_KEY = {
  profile: "navProfile",
  education: "navEducation",
  work: "navWork",
  projects: "navProjects",
  publications: "navPublications",
  honors: "navHonors",
  journal: "navJournal",
};

const state = {
  locale: "zh",
  ui: null,
  config: { github: { owner: "UkawaJun", repo: "UkawaJun.github.io", branch: "main" } },
  files: {},
  unlocked: false,
  editorOpen: false,
  journalVisible: 5,
  nowIndex: 0,
  orbitTimer: null,
  projectFilter: "all",
  interestOn: -1,
};

function $(sel, el = document) {
  return el.querySelector(sel);
}

function parseFm(block) {
  const meta = {};
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key === "tags" || key === "awards" || key === "keywords") {
      meta[key] = value.includes(" | ") ? value.split(" | ").map((x) => x.trim()).filter(Boolean) : value;
    } else {
      meta[key] = value;
    }
  }
  return meta;
}

function parseItems(text) {
  let src = (text || "").replace(/\r\n/g, "\n").trim();
  if (!src || src.startsWith("<!--")) return [];
  if (src.startsWith("---\n")) src = src.slice(4);
  const parts = src.split(/\n---\n/);
  const items = [];
  for (let i = 0; i < parts.length; i += 2) {
    const meta = parseFm(parts[i] || "");
    const body = (parts[i + 1] || "").trim();
    if (!Object.keys(meta).length && !body) continue;
    items.push({ ...meta, body });
  }
  return items;
}

function arr(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function assetUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("mailto:")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function parseFigures(raw) {
  const text = Array.isArray(raw) ? raw.join(" | ") : String(raw || "");
  if (!text || text === "undefined") return [];
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(" | ");
      const src = idx < 0 ? line : line.slice(0, idx).trim();
      const caption = idx < 0 ? "" : line.slice(idx + 3).trim();
      return src ? { src: assetUrl(src), caption } : null;
    })
    .filter(Boolean);
}

function figureHtml(images) {
  if (!images.length) return "";
  return `<div class="figures">${images
    .map(
      (img) =>
        `<figure><img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.caption || "")}">${
          img.caption ? `<figcaption class="xs muted" style="margin-top:0.5rem">${escapeHtml(img.caption)}</figcaption>` : ""
        }</figure>`,
    )
    .join("")}</div>`;
}

function t(key) {
  const pack = state.ui?.[state.locale] || state.ui?.zh || {};
  return pack[key] || key;
}

function md(src) {
  if (!src) return "";
  if (typeof marked !== "undefined") {
    if (marked.setOptions) marked.setOptions({ breaks: true });
    return marked.parse(src);
  }
  return `<p>${escapeHtml(src)}</p>`;
}

function currentPath() {
  const p = location.pathname.replace(/\/+$/, "") || "/";
  return p === "/index.html" ? "/" : p;
}

function navigate(href) {
  const url = new URL(href, location.origin);
  history.pushState({}, "", url.pathname + url.search + url.hash);
  render();
}

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url);
  return res.json();
}

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(url);
  return res.text();
}

async function boot() {
  const stored = localStorage.getItem(STORAGE_LOCALE);
  if (LOCALES.includes(stored)) state.locale = stored;
  else state.locale = "zh";
  const [ui, config] = await Promise.all([
    loadJson("/content/ui.json"),
    loadJson("/config.json").catch(() => state.config),
  ]);
  state.ui = ui;
  state.config = config;
  await loadLocale(state.locale);
  bindChrome();
  bindKonami();
  window.addEventListener("popstate", () => {
    if (location.hash) state.journalVisible = 99;
    render();
  });
  document.body.addEventListener(
    "click",
    (ev) => {
      const a = ev.target.closest("a[data-link]");
      if (!a) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (url.searchParams.get("cat") === "research") state.projectFilter = "research";
      else if (url.searchParams.get("cat") === "practice") state.projectFilter = "practice";
      if (url.hash) state.journalVisible = 99;
      else if (!url.searchParams.get("cat")) state.journalVisible = 5;
      navigate(url.pathname + url.search + url.hash);
    },
    true,
  );
  render();
}

async function loadLocale(locale) {
  state.locale = locale;
  const pack = {};
  await Promise.all(
    FILES.map(async (name) => {
      pack[name] = await loadText(`/content/${locale}/${name}`).catch(() => "");
    }),
  );
  state.files = pack;
  localStorage.setItem(STORAGE_LOCALE, locale);
  document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
}

function bindChrome() {
  const nav = $("#nav");
  nav.innerHTML = ROUTES.map((r) => `<a data-link href="${r.path}">${escapeHtml(t(NAV_KEY[r.id]))}</a>`).join("");
  const langs = $("#langs");
  langs.innerHTML =
    LOCALES.map(
      (loc) =>
        `<button type="button" class="lang${loc === state.locale ? " active" : ""}" data-loc="${loc}">${LOCALE_LABEL[loc]}</button>`,
    ).join("") +
    `<button type="button" class="lang lang-soon" data-soon="de" title="${escapeHtml(t("deSoon"))}">DE</button>` +
    `<button type="button" class="lang" data-pdf="1">PDF</button>`;
  langs.onclick = async (ev) => {
    if (ev.target.closest("[data-pdf]")) {
      window.print();
      return;
    }
    if (ev.target.closest("[data-soon]")) {
      showSoonNote();
      return;
    }
    const btn = ev.target.closest("[data-loc]");
    if (!btn) return;
    await loadLocale(btn.dataset.loc);
    bindChrome();
    render();
  };
  const foot = $("#site-foot");
  if (foot) foot.textContent = t("copyright");
}

function showSoonNote() {
  let note = $("#soon-note");
  if (!note) {
    note = document.createElement("div");
    note.id = "soon-note";
    note.setAttribute("role", "status");
    document.body.appendChild(note);
  }
  note.textContent = t("deSoon");
  note.classList.add("is-on");
  clearTimeout(showSoonNote._timer);
  showSoonNote._timer = setTimeout(() => note.classList.remove("is-on"), 2400);
}

function bindKonami() {
  let index = 0;
  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = event.target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
    if (event.code === EDITOR_CODES[index]) {
      index += 1;
      if (index === EDITOR_CODES.length) {
        state.unlocked = true;
        index = 0;
        renderFab();
      }
      return;
    }
    index = event.code === EDITOR_CODES[0] ? 1 : 0;
  });
}

function stopOrbit() {
  if (state.orbitTimer) {
    clearInterval(state.orbitTimer);
    state.orbitTimer = null;
  }
}

function bindOrbit() {
  const root = $("#orbit");
  if (!root) return;
  const cards = [...root.querySelectorAll(".orbit-card")];
  const n = cards.length;
  if (!n) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const apply = () => {
    if (state.nowIndex < 0) state.nowIndex = n - 1;
    if (state.nowIndex >= n) state.nowIndex = 0;
    cards.forEach((card, idx) => {
      let d = idx - state.nowIndex;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      card.dataset.pos = String(d);
    });
  };
  apply();
  const step = (dir) => {
    state.nowIndex = (state.nowIndex + dir + n) % n;
    apply();
  };
  const prev = $("#orbit-prev");
  const next = $("#orbit-next");
  if (prev) prev.onclick = () => step(-1);
  if (next) next.onclick = () => step(1);
  stopOrbit();
  if (reduced || n < 2) return;
  const play = () => {
    stopOrbit();
    state.orbitTimer = setInterval(() => step(1), 4200);
  };
  root.onmouseenter = stopOrbit;
  root.onmouseleave = play;
  play();
}

function foldSection(summary, inner) {
  return `<p class="small muted fold-summary">${escapeHtml(summary || "")}</p>
    <button type="button" class="fold-btn" aria-expanded="false">${escapeHtml(t("expand"))}</button>
    <div class="fold-body" hidden>${inner}</div>`;
}

function bindFolds() {
  for (const item of document.querySelectorAll(".fold-item")) {
    const btn = item.querySelector(".fold-btn");
    const body = item.querySelector(".fold-body");
    if (!btn || !body) continue;
    btn.onclick = () => {
      const open = body.hasAttribute("hidden");
      if (open) body.removeAttribute("hidden");
      else body.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? t("collapse") : t("expand");
      item.classList.toggle("is-open", open);
    };
  }
}

function bindProjectFilter() {
  const bar = $("#proj-filter");
  if (!bar) return;
  bar.onclick = (ev) => {
    const btn = ev.target.closest("[data-cat]");
    if (!btn) return;
    const cat = btn.dataset.cat;
    const href = cat === "all" ? "/projects" : `/projects?cat=${encodeURIComponent(cat)}`;
    navigate(href);
  };
}

function bindInterests() {
  const list = $("#interest-list");
  if (!list) return;
  list.onclick = (ev) => {
    const card = ev.target.closest(".interest-card");
    if (!card) return;
    const idx = Number(card.dataset.idx);
    state.interestOn = state.interestOn === idx ? -1 : idx;
    for (const el of list.querySelectorAll(".interest-card")) {
      el.classList.toggle("is-on", Number(el.dataset.idx) === state.interestOn);
    }
  };
}

function scrollToHash() {
  const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;
  const body = el.querySelector(".fold-body");
  const btn = el.querySelector(".fold-btn");
  if (body && btn && body.hasAttribute("hidden")) {
    body.removeAttribute("hidden");
    btn.setAttribute("aria-expanded", "true");
    btn.textContent = t("collapse");
    el.classList.add("is-open");
  }
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function render() {
  stopOrbit();
  bindChrome();
  const id = ROUTES.find((r) => r.path === currentPath())?.id || "profile";
  if (id === "projects") {
    if (location.hash) {
      state.projectFilter = "all";
    } else {
      const cat = new URL(location.href).searchParams.get("cat");
      state.projectFilter = cat === "research" || cat === "practice" ? cat : "all";
    }
  }
  if (id === "journal" && location.hash) state.journalVisible = 99;
  for (const a of document.querySelectorAll("nav.site a")) {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === currentPath() || (href !== "/" && currentPath().startsWith(href)));
  }
  const root = $("#app");
  root.innerHTML = views[id]();
  renderFab();
  if (id === "profile") {
    bindOrbit();
    bindInterests();
  }
  if (id === "work" || id === "projects") bindFolds();
  if (id === "projects") bindProjectFilter();
  if (id === "journal") {
    const more = $("#load-more");
    if (more) {
      more.onclick = () => {
        state.journalVisible += 5;
        render();
      };
    }
  }
  scrollToHash();
}

function firstPara(body) {
  const text = (body || "").trim();
  const chunks = text.split(/\n\n/);
  for (const chunk of chunks) {
    const line = chunk
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/^[-*]\s+/, "")
      .trim();
    if (line) return line;
  }
  return "";
}

function journalByDate() {
  return parseItems(state.files["journal.md"])
    .slice()
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function clipText(s, n) {
  const text = String(s || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= n) return text;
  return `${text.slice(0, n)}…`;
}

function contactRow(l) {
  const href = String(l.href || "").trim();
  const dead = !href || href === "#" || href === "暂无";
  const id = String(l.id || "").toLowerCase();
  const isMail = id === "mail" || href.startsWith("mailto:");
  const label = l.label || "";
  if (isMail) {
    const value = href.replace(/^mailto:/i, "");
    return `<p class="link-row"><span class="link-k">${escapeHtml(label)}</span>：${escapeHtml(value)}</p>`;
  }
  if (dead) {
    return `<p class="link-row"><span class="link-k">${escapeHtml(label)}</span>：<span class="subtle">${escapeHtml(t("urlNone"))}</span></p>`;
  }
  return `<p class="link-row"><a class="link-line" href="${escapeHtml(href)}" target="_blank" rel="noreferrer"><span class="link-k">${escapeHtml(label)}</span>：${escapeHtml(href)}</a></p>`;
}

function certList(items) {
  if (!items.length) return "";
  return `<ul class="certs">${items
    .map((c) => {
      const href = String(c.href || "").trim();
      const title = href
        ? `<a class="link-title" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(c.title || "")}</a>`
        : escapeHtml(c.title || "");
      return `<li><p>${title}</p><p class="xs subtle">${escapeHtml([c.year, c.issuer, c.detail].filter(Boolean).join(" · "))}</p></li>`;
    })
    .join("")}</ul>`;
}

function projectLinks(p) {
  const bits = [];
  if (p.github) {
    bits.push(
      `<a href="${escapeHtml(p.github)}" target="_blank" rel="noreferrer">${escapeHtml(t("githubLabel"))}</a>`,
    );
  }
  if (p.demo) {
    bits.push(`<a href="${escapeHtml(p.demo)}" target="_blank" rel="noreferrer">${escapeHtml(t("demoLabel"))}</a>`);
  }
  return bits.length ? `<p class="project-links">${bits.join("<span class='subtle'> · </span>")}</p>` : "";
}

const views = {
  profile() {
    const docs = parseItems(state.files["profile.md"]);
    const p = docs[0] || {};
    const highlights = journalByDate()
      .slice(0, 4)
      .map((j) => ({
        id: j.id || "",
        kicker: j.date || "",
        title: j.title || "",
        body: clipText(firstPara(j.body), 30),
      }));
    const links = Object.keys(p)
      .filter((k) => k.startsWith("link."))
      .map((k) => {
        const parts = arr(p[k]);
        if (parts.length >= 3) return { id: parts[0], label: parts[1], href: parts[2] };
        const bits = String(p[k]).split(" | ");
        return { id: bits[0], label: bits[1], href: bits[2] };
      });
    const featured = parseItems(state.files["featured.md"]).slice(0, 4);
    const certs = parseItems(state.files["certificates.md"]);
    const courseCerts = parseItems(state.files["course-certs.md"]);
    const interests = parseItems(state.files["interests.md"]);
    const bodyParts = String(p.body || "").split(/\n{2,}/);
    const aimIdx = bodyParts.findIndex((x) => /^(立志于：|Aim:|志：)/.test(x.trim()));
    const intro = (aimIdx >= 0 ? bodyParts.slice(0, aimIdx) : bodyParts).join("\n\n");
    const aim = aimIdx >= 0 ? bodyParts.slice(aimIdx).join("\n\n") : "";
    return `
      <div class="hero">
        <div>
          <p class="small muted">${escapeHtml(p.nameAlt || "")}</p>
          <h1 class="page-title">${escapeHtml(p.name || "")}</h1>
          <p class="lede">${escapeHtml(p.headline || "")}</p>
          <p class="small muted" style="margin-top:1.1rem">${escapeHtml(p.location || "")}<span class="subtle"> · </span>${escapeHtml(p.status || "")}</p>
          <div class="links">${links.map(contactRow).join("")}</div>
        </div>
        ${p.photo ? `<figure class="portrait"><img src="${escapeHtml(assetUrl(p.photo))}" alt="${escapeHtml(p.photoAlt || "")}"></figure>` : ""}
      </div>
      <div class="md-body prose">${md(intro)}</div>
      ${aim ? `<div class="md-body prose" style="margin-top:1.5rem">${md(aim)}</div>` : ""}
      ${
        interests.length
          ? `<section class="section">
        <div class="row-head">
          <p class="kicker">${escapeHtml(t("interests"))}</p>
          <a data-link href="/projects?cat=research" class="view-all">${escapeHtml(t("viewResearch"))} →</a>
        </div>
        <div class="interest-list" id="interest-list">
          ${interests
            .map((item, i) => {
              const n = String(i + 1).padStart(2, "0");
              const on = state.interestOn === i ? " is-on" : "";
              return `<button type="button" class="interest-card${on}" data-idx="${i}">
                <p class="interest-no">${n}</p>
                <h2 class="interest-title">${escapeHtml(item.title || "")}</h2>
                <p class="muted">${escapeHtml(item.summary || item.body || "")}</p>
              </button>`;
            })
            .join("")}
        </div>
      </section>`
          : ""
      }
      ${
        highlights.length
          ? `<section class="section">
        <p class="kicker">${escapeHtml(t("now"))}</p>
        <div class="orbit" id="orbit">
          <div class="orbit-stage">
            ${highlights
              .map(
                (h, i) => `<a class="orbit-card" data-link href="/journal${h.id ? `#${encodeURIComponent(h.id)}` : ""}" data-pos="${i === 0 ? 0 : i}">
              <p class="xs subtle orbit-date">${escapeHtml(h.kicker || "")}</p>
              <h2 class="item-title orbit-title">${escapeHtml(h.title || "")}</h2>
              <p class="small muted orbit-excerpt">${escapeHtml(h.body || "")}</p>
            </a>`,
              )
              .join("")}
          </div>
          ${
            highlights.length > 1
              ? `<div class="orbit-nav">
            <button type="button" class="btn" id="orbit-prev">${escapeHtml(t("orbitPrev"))}</button>
            <button type="button" class="btn" id="orbit-next">${escapeHtml(t("orbitNext"))}</button>
          </div>`
              : ""
          }
        </div>
      </section>`
          : ""
      }
      <section class="section">
        <div class="row-head"><p class="kicker">${escapeHtml(t("selectedWork"))}</p><a data-link href="/projects" class="view-all">${escapeHtml(t("navProjects"))} →</a></div>
        <div class="feature-grid">${featured
          .map((card) => {
            const href = card.href || `/projects#${card.id || ""}`;
            const img = card.image ? assetUrl(card.image) : "";
            const internal = String(href).startsWith("/");
            return `<a class="feature-card" ${internal ? "data-link" : 'target="_blank" rel="noreferrer"'} href="${escapeHtml(href)}">
              <div class="feature-cover">${img ? `<img src="${escapeHtml(img)}" alt="">` : `<span class="feature-ph"></span>`}</div>
              <div class="feature-body">
                <p class="feature-kicker">${escapeHtml(card.kicker || "")}</p>
                <span class="feature-arrow" aria-hidden="true">↗</span>
                <h2 class="feature-title">${escapeHtml(card.title || "")}</h2>
                <p class="small muted" style="margin-top:0.55rem">${escapeHtml(card.summary || firstPara(card.body))}</p>
              </div>
            </a>`;
          })
          .join("")}</div>
      </section>
      ${certs.length ? `<section class="section"><p class="kicker">${escapeHtml(t("certificates"))}</p>${certList(certs)}</section>` : ""}
      <section class="section">
        <p class="kicker">${escapeHtml(t("courseCerts"))}</p>
        ${courseCerts.length ? certList(courseCerts) : `<p class="small muted" style="margin-top:1rem">${escapeHtml(t("urlNone"))}</p>`}
      </section>
    `;
  },
  education() {
    const items = parseItems(state.files["education.md"]);
    return `
      <p class="kicker">${escapeHtml(t("navEducation"))}</p>
      <h1 class="page-title">${escapeHtml(t("navEducation"))}</h1>
      <ul class="stack">${items
        .map(
          (e) => `<li class="edu-card lift">
          <div class="row-head"><h2 class="item-title">${escapeHtml(e.school || "")}</h2><span class="xs subtle">${escapeHtml(e.period || "")}</span></div>
          <p class="small muted" style="margin-top:0.4rem">${escapeHtml([e.degree, e.field, e.location].filter(Boolean).join(" · "))}</p>
          ${e.body ? `<p class="small muted" style="margin-top:0.75rem;max-width:44rem">${escapeHtml(e.body)}</p>` : ""}
          ${e.courses ? `<div class="edu-panel"><p class="xs" style="letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--color-accent)">${escapeHtml(t("courses"))}</p><p style="margin-top:0.5rem">${escapeHtml(e.courses)}</p></div>` : ""}
        </li>`,
        )
        .join("")}</ul>
    `;
  },
  work() {
    const items = parseItems(state.files["work.md"]);
    return `
      <p class="kicker">${escapeHtml(t("navWork"))}</p>
      <h1 class="page-title">${escapeHtml(t("navWork"))}</h1>
      <ul class="stack">${items
        .map((e) => {
          const images = parseFigures(e.images || e.image);
          const inner = `<div class="detail-col">${md(e.body || "") ? `<div class="md-body">${md(e.body || "")}</div>` : ""}${figureHtml(images)}</div>`;
          return `<li class="lift fold-item" id="${escapeHtml(e.id || "")}">
        <div class="row-head"><h2 class="item-title">${escapeHtml(e.org || "")}</h2><span class="xs subtle">${escapeHtml(e.period || "")}</span></div>
        <p class="small muted">${escapeHtml([e.role, e.location].filter(Boolean).join(" · "))}</p>
        <div class="tags">${arr(e.tags).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("")}</div>
        ${foldSection(e.summary || firstPara(e.body), inner)}
      </li>`;
        })
        .join("")}</ul>
    `;
  },
  projects() {
    const all = parseItems(state.files["projects.md"]);
    const filter = state.projectFilter || "all";
    const items = filter === "all" ? all : all.filter((p) => (p.category || "practice") === filter);
    const note =
      filter === "research"
        ? t("researchNote")
        : filter === "practice"
          ? t("practiceNote")
          : `${t("researchNote")} ${t("practiceNote")}`;
    return `
      <p class="kicker">${escapeHtml(t("navProjects"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageProjects"))}</h1>
      <div class="filter-bar" id="proj-filter">
        <button type="button" class="btn${filter === "all" ? " btn-ink" : ""}" data-cat="all">${escapeHtml(t("catAll"))}</button>
        <button type="button" class="btn${filter === "research" ? " btn-ink" : ""}" data-cat="research">${escapeHtml(t("catResearch"))}</button>
        <button type="button" class="btn${filter === "practice" ? " btn-ink" : ""}" data-cat="practice">${escapeHtml(t("catPractice"))}</button>
      </div>
      <p class="small muted" style="margin-top:1rem;max-width:46rem">${escapeHtml(note)}</p>
      <div class="stack">${items
        .map((p) => {
          const images = parseFigures(p.images);
          const catLabel = p.category === "research" ? t("catResearch") : t("catPractice");
          return `<article class="lift fold-item" id="${escapeHtml(p.id || "")}">
          <div class="row-head"><h2 class="item-title">${escapeHtml(p.title || "")}</h2><span class="xs subtle">${escapeHtml(p.period || "")}</span></div>
          <p class="small muted">${escapeHtml([p.role, catLabel].filter(Boolean).join(" · "))}</p>
          ${arr(p.awards).length ? `<p class="small accent" style="margin-top:0.5rem">${escapeHtml(arr(p.awards).join(" · "))}</p>` : ""}
          <div class="tags">${arr(p.tags).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("")}</div>
          ${foldSection(
            p.summary || firstPara(p.body),
            `<div class="detail-col">
          <div class="md-body">${md(p.body || "")}</div>
          ${arr(p.keywords).length ? `<p class="small subtle" style="margin-top:1.1rem">${escapeHtml(t("keywords"))}：${escapeHtml(arr(p.keywords).join("；"))}</p>` : ""}
          ${figureHtml(images)}
          ${projectLinks(p)}
        </div>`,
          )}
        </article>`;
        })
        .join("")}</div>
    `;
  },
  publications() {
    const items = parseItems(state.files["publications.md"]);
    const empty =
      state.locale === "ja" ? "出版はまだありません。" : state.locale === "en" ? "No publications yet." : "尚无出版。";
    return `
      <p class="kicker">${escapeHtml(t("navPublications"))}</p>
      <h1 class="page-title">${escapeHtml(t("pagePublications"))}</h1>
      ${
        items.length
          ? `<div class="stack">${items
              .map((p) => {
                const images = parseFigures(p.images || p.image);
                return `<article class="pub-card lift">
        <p class="xs subtle">${escapeHtml([p.year, p.kind].filter(Boolean).join(" · "))}</p>
        <h2 class="item-title" style="margin-top:0.5rem">${escapeHtml(p.title || "")}</h2>
        <p class="small muted" style="margin-top:0.4rem">${escapeHtml([p.authors, p.venue].filter(Boolean).join(" · "))}</p>
        <div class="detail-col">
        ${p.body ? `<div class="md-body pub-abstract"><p class="xs" style="letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--color-accent)">${escapeHtml(t("abstract"))}</p><div style="margin-top:0.6rem">${md(p.body)}</div></div>` : ""}
        ${arr(p.keywords).length ? `<p class="small subtle" style="margin-top:1.1rem">${escapeHtml(t("keywords"))}：${escapeHtml(arr(p.keywords).join("；"))}</p>` : ""}
        ${figureHtml(images)}
        ${p.href ? `<p class="small" style="margin-top:1.1rem"><a class="accent" href="${escapeHtml(p.href)}" target="_blank" rel="noreferrer">${escapeHtml(p.href)}</a></p>` : ""}
        </div>
      </article>`;
              })
              .join("")}</div>`
          : `<p class="empty">${escapeHtml(empty)}</p>`
      }
    `;
  },
  honors() {
    const items = parseItems(state.files["honors.md"]);
    const groups = {};
    for (const h of items) {
      const y = String(h.year || "").slice(0, 4) || "—";
      (groups[y] ||= []).push(h);
    }
    for (const y of Object.keys(groups)) {
      groups[y].sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    }
    const years = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return `
      <p class="kicker">${escapeHtml(t("navHonors"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageHonors"))}</h1>
      ${years
        .map(
          (year) => `<section class="honor-year">
        <h2 class="honor-year-label">${escapeHtml(year)}</h2>
        <ul class="honors">${groups[year]
          .map((h) => {
            const img = h.image ? assetUrl(h.image) : "";
            return `<li class="honor-card${img ? " has-pop" : ""}">
            ${img ? `<div class="honor-pop"><img src="${escapeHtml(img)}" alt="${escapeHtml(h.title || "")}"></div>` : ""}
            <p class="xs subtle">${escapeHtml([h.year, h.level].filter(Boolean).join(" · "))}</p>
            <p class="item-title" style="margin-top:0.5rem;font-size:1.2rem">${escapeHtml(h.title || "")}</p>
          </li>`;
          })
          .join("")}</ul>
      </section>`,
        )
        .join("")}
    `;
  },
  journal() {
    const items = journalByDate();
    const shown = items.slice(0, state.journalVisible);
    return `
      <p class="kicker">${escapeHtml(t("navJournal"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageJournal"))}</h1>
      <ol class="stack">${shown
        .map(
          (p) => `<li class="lift journal-entry" id="${escapeHtml(p.id || "")}">
        <p class="xs subtle">${escapeHtml(p.date || "")}</p>
        <h2 class="item-title" style="margin-top:0.5rem">${escapeHtml(p.title || "")}</h2>
        <div class="detail-col"><div class="md-body">${md(p.body || "")}</div></div>
      </li>`,
        )
        .join("")}</ol>
      ${state.journalVisible < items.length ? `<p style="margin-top:3rem"><button class="btn" id="load-more" type="button">${escapeHtml(t("loadMore"))}</button></p>` : ""}
    `;
  },
};

function renderFab() {
  let fab = $("#fab");
  if (!state.unlocked) {
    fab?.remove();
    if (!state.editorOpen) $("#editor-root")?.replaceChildren();
    return;
  }
  if (!fab) {
    fab = document.createElement("button");
    fab.id = "fab";
    fab.className = "fab";
    fab.type = "button";
    document.body.appendChild(fab);
  }
  fab.textContent = t("editorEntry");
  fab.onclick = () => {
    state.editorOpen = true;
    renderEditor();
  };
}

function renderEditor() {
  const host = $("#editor-root");
  const gh = state.config.github || {};
  const token = sessionStorage.getItem(STORAGE_TOKEN) || "";
  const selected = host.querySelector("#ed-file")?.value || `content/${state.locale}/profile.md`;
  host.innerHTML = `
    <div class="editor">
      <div class="editor-panel">
        <div class="editor-head">
          <div>
            <p class="kicker">${escapeHtml(t("editorTitle"))}</p>
            <p class="small muted" style="margin:0.35rem 0 0">保存写入 GitHub 仓库 ${escapeHtml(gh.owner)}/${escapeHtml(gh.repo)}</p>
          </div>
          <button class="btn" type="button" id="ed-close">关闭</button>
        </div>
        <div class="editor-body">
          <label>GitHub Personal Access Token</label>
          <input id="ed-token" type="password" autocomplete="off" placeholder="github_pat_…" value="${escapeHtml(token)}">
          <label>文件</label>
          <select id="ed-file">${FILES.map((f) => {
            const path = `content/${state.locale}/${f}`;
            return `<option value="${path}" ${path === selected ? "selected" : ""}>${path}</option>`;
          }).join("")}</select>
          <label>Markdown</label>
          <textarea id="ed-text" spellcheck="false"></textarea>
          <div class="editor-actions">
            <button class="btn" type="button" id="ed-reload">从站点加载</button>
            <button class="btn btn-ink" type="button" id="ed-save">${escapeHtml(t("save"))}</button>
          </div>
          <p class="status" id="ed-status"></p>
        </div>
      </div>
    </div>`;
  $("#ed-close").onclick = () => {
    state.editorOpen = false;
    host.replaceChildren();
  };
  const fileSel = $("#ed-file");
  const area = $("#ed-text");
  const status = $("#ed-status");
  const loadCurrent = () => {
    const name = fileSel.value.split("/").pop();
    area.value = state.files[name] || "";
  };
  loadCurrent();
  fileSel.onchange = loadCurrent;
  $("#ed-reload").onclick = loadCurrent;
  $("#ed-save").onclick = async () => {
    const tok = $("#ed-token").value.trim();
    sessionStorage.setItem(STORAGE_TOKEN, tok);
    if (!tok) {
      status.textContent = "先填 GitHub Token。";
      return;
    }
    status.textContent = t("saving");
    try {
      await commitFile({ token: tok, path: fileSel.value, content: area.value, message: `update ${fileSel.value}` });
      const name = fileSel.value.split("/").pop();
      state.files[name] = area.value;
      status.textContent = t("saved");
      render();
    } catch (err) {
      status.textContent = `${t("saveFailed")} ${err.message || ""}`;
    }
  };
}

async function commitFile({ token, path, content, message }) {
  const { owner, repo, branch } = state.config.github;
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  let sha;
  const get = await fetch(`${api}?ref=${encodeURIComponent(branch || "main")}`, { headers });
  if (get.status === 200) {
    const json = await get.json();
    sha = json.sha;
  } else if (get.status !== 404) {
    const err = await get.json().catch(() => ({}));
    throw new Error(err.message || `GitHub ${get.status}`);
  }
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: branch || "main",
  };
  if (sha) body.sha = sha;
  const put = await fetch(api, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!put.ok) {
    const err = await put.json().catch(() => ({}));
    throw new Error(err.message || `GitHub ${put.status}`);
  }
}

boot().catch((err) => {
  document.getElementById("app").innerHTML = `<p class="empty">加载失败：${escapeHtml(err.message)}</p>`;
});
