/* global marked */

const LOCALES = ["zh", "en", "ja"];
const LOCALE_LABEL = { zh: "中", en: "EN", ja: "日" };
const FILES = [
  "profile.md",
  "education.md",
  "work.md",
  "projects.md",
  "publications.md",
  "honors.md",
  "certificates.md",
  "journal.md",
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
  config: { github: { owner: "UukawaJun", repo: "UukawaJun.github.io", branch: "main" } },
  files: {},
  unlocked: false,
  editorOpen: false,
  journalVisible: 5,
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
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

function md(src) {
  if (!src) return "";
  const m = window.marked;
  if (m && typeof m.parse === "function") return m.parse(src);
  if (typeof m === "function") return m(src);
  return escapeHtml(src);
}

function t(key) {
  return state.ui?.[state.locale]?.[key] || key;
}

function currentPath() {
  const p = location.pathname.replace(/\/index\.html$/, "") || "/";
  return p === "" ? "/" : p;
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
    state.journalVisible = 5;
    render();
  });
  document.body.addEventListener("click", (ev) => {
    const a = ev.target.closest("a[data-link]");
    if (!a) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    ev.preventDefault();
    history.pushState({}, "", url.pathname);
    state.journalVisible = 5;
    render();
  });
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
  nav.innerHTML = ROUTES.map(
    (r) => `<a data-link href="${r.path}">${escapeHtml(t(NAV_KEY[r.id]))}</a>`,
  ).join("");
  const langs = $("#langs");
  langs.innerHTML = LOCALES.map(
    (loc) =>
      `<button type="button" class="lang${loc === state.locale ? " active" : ""}" data-loc="${loc}">${LOCALE_LABEL[loc]}</button>`,
  ).join("");
  langs.onclick = async (ev) => {
    const btn = ev.target.closest("[data-loc]");
    if (!btn) return;
    await loadLocale(btn.dataset.loc);
    bindChrome();
    render();
  };
  $("#print-btn").onclick = () => window.print();
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

function render() {
  bindChrome();
  const id = ROUTES.find((r) => r.path === currentPath())?.id || "profile";
  for (const a of document.querySelectorAll("nav.site a")) {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === currentPath() || (href !== "/" && currentPath().startsWith(href)));
  }
  const root = $("#app");
  root.innerHTML = views[id]();
  renderFab();
  if (id === "journal") {
    const more = $("#load-more");
    if (more) {
      more.onclick = () => {
        state.journalVisible += 5;
        render();
      };
    }
  }
}

function firstPara(body) {
  const text = (body || "").trim();
  const line = text.split(/\n\n/)[0] || "";
  return line.replace(/^[-*]\s+/, "").trim();
}

const views = {
  profile() {
    const docs = parseItems(state.files["profile.md"]);
    const p = docs[0] || {};
    const highlights = docs.slice(1);
    const links = Object.keys(p)
      .filter((k) => k.startsWith("link."))
      .map((k) => {
        const parts = arr(p[k]);
        if (parts.length >= 3) return { id: parts[0], label: parts[1], href: parts[2] };
        const bits = String(p[k]).split(" | ");
        return { id: bits[0], label: bits[1], href: bits[2] };
      });
    const projects = parseItems(state.files["projects.md"]);
    const certs = parseItems(state.files["certificates.md"]);
    return `
      <div class="hero">
        <div>
          <p class="small muted">${escapeHtml(p.nameAlt || "")}</p>
          <h1 class="page-title">${escapeHtml(p.name || "")}</h1>
          <p class="muted" style="margin-top:1.25rem;font-size:var(--text-lg);line-height:var(--leading-snug);max-width:36rem">${escapeHtml(p.headline || "")}</p>
          <p class="small muted" style="margin-top:1rem">${escapeHtml(p.location || "")}<span class="subtle"> · </span>${escapeHtml(p.status || "")}</p>
          <div class="links">${links.map((l) => `<a href="${escapeHtml(l.href)}" ${String(l.href).startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHtml(l.label)}</a>`).join("")}</div>
        </div>
        ${p.photo ? `<figure class="portrait"><img src="${escapeHtml(assetUrl(p.photo))}" alt="${escapeHtml(p.photoAlt || "")}"></figure>` : ""}
      </div>
      <div class="md-body" style="margin-top:3rem;max-width:40rem;color:var(--color-fg-muted)">${md(p.body || "")}</div>
      <section class="section">
        <p class="kicker">${escapeHtml(t("now"))}</p>
        <div class="highlights">${highlights.map((h) => `<article><p class="xs subtle" style="letter-spacing:var(--tracking-caps);text-transform:uppercase">${escapeHtml(h.kicker || "")}</p><h2 class="item-title" style="margin-top:0.75rem">${escapeHtml(h.title || "")}</h2><p class="small muted" style="margin-top:0.5rem">${escapeHtml(h.body || "")}</p></article>`).join("")}</div>
      </section>
      <section class="section">
        <div class="row-head"><p class="kicker">${escapeHtml(t("selectedWork"))}</p><a data-link href="/projects" class="xs subtle">${escapeHtml(t("navProjects"))}</a></div>
        ${projects.map((proj) => `<article class="list-row"><div class="row-head"><h2 class="item-title">${escapeHtml(proj.title || "")}</h2><span class="xs subtle">${escapeHtml(proj.period || "")}</span></div><p class="small muted" style="margin-top:0.35rem">${escapeHtml(firstPara(proj.body))}</p><div class="tags">${arr(proj.tags).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("")}</div></article>`).join("")}
      </section>
      ${certs.length ? `<section class="section"><p class="kicker">${escapeHtml(t("certificates"))}</p><ul class="certs">${certs.map((c) => `<li><p>${escapeHtml(c.title || "")}</p><p class="xs subtle">${escapeHtml([c.year, c.detail].filter(Boolean).join(" · "))}</p></li>`).join("")}</ul></section>` : ""}
    `;
  },
  education() {
    const items = parseItems(state.files["education.md"]);
    return `
      <p class="kicker">${escapeHtml(t("navEducation"))}</p>
      <h1 class="page-title">${escapeHtml(t("navEducation"))}</h1>
      <ul class="stack">${items.map((e) => `<li class="edu-card">
          <div class="row-head"><h2 class="item-title">${escapeHtml(e.school || "")}</h2><span class="xs subtle">${escapeHtml(e.period || "")}</span></div>
          <p class="small muted" style="margin-top:0.4rem">${escapeHtml([e.degree, e.field, e.location].filter(Boolean).join(" · "))}</p>
          ${e.body ? `<p class="small muted" style="margin-top:0.75rem;max-width:36rem">${escapeHtml(e.body)}</p>` : ""}
          ${e.courses ? `<div class="edu-panel"><p class="xs" style="letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--color-accent)">${escapeHtml(t("courses"))}</p><p style="margin-top:0.5rem">${escapeHtml(e.courses)}</p></div>` : ""}
        </li>`).join("")}</ul>
    `;
  },
  work() {
    const items = parseItems(state.files["work.md"]);
    return `
      <p class="kicker">${escapeHtml(t("navWork"))}</p>
      <h1 class="page-title">${escapeHtml(t("navWork"))}</h1>
      <ul class="stack">${items.map((e) => `<li>
        <div class="row-head"><h2 class="item-title">${escapeHtml(e.org || "")}</h2><span class="xs subtle">${escapeHtml(e.period || "")}</span></div>
        <p class="small muted">${escapeHtml([e.role, e.location].filter(Boolean).join(" · "))}</p>
        <div class="tags">${arr(e.tags).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("")}</div>
        <div class="md-body" style="margin-top:1rem;max-width:40rem">${md(e.body || "")}</div>
      </li>`).join("")}</ul>
    `;
  },
  projects() {
    const items = parseItems(state.files["projects.md"]);
    return `
      <p class="kicker">${escapeHtml(t("navProjects"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageProjects"))}</h1>
      <div class="stack">${items.map((p) => {
        const images = (() => {
          const raw = Array.isArray(p.images) ? p.images.join(" | ") : String(p.images || "");
          if (!raw || raw === "undefined") return [];
          const idx = raw.indexOf(" | ");
          const src = idx < 0 ? raw : raw.slice(0, idx).trim();
          const caption = idx < 0 ? "" : raw.slice(idx + 3).trim();
          return src ? [{ src: assetUrl(src), caption }] : [];
        })();
        const github = typeof p.github === "string" ? p.github : "";
        return `<article id="${escapeHtml(p.id || "")}">
          <div class="row-head"><h2 class="item-title">${escapeHtml(p.title || "")}</h2><span class="xs subtle">${escapeHtml(p.period || "")}</span></div>
          <p class="small muted">${escapeHtml(p.role || "")}</p>
          ${arr(p.awards).length ? `<p class="small accent" style="margin-top:0.5rem">${escapeHtml(arr(p.awards).join(" · "))}</p>` : ""}
          <div class="tags">${arr(p.tags).map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join("")}</div>
          <div class="md-body" style="margin-top:1.25rem;max-width:40rem">${md(p.body || "")}</div>
          ${arr(p.keywords).length ? `<p class="small subtle" style="margin-top:1.25rem">${escapeHtml(t("keywords"))}：${escapeHtml(arr(p.keywords).join("；"))}</p>` : ""}
          ${images.length ? `<div class="figures">${images.map((img) => `<figure><img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.caption || "")}">${img.caption ? `<figcaption class="xs muted" style="margin-top:0.5rem">${escapeHtml(img.caption)}</figcaption>` : ""}</figure>`).join("")}</div>` : ""}
          ${github ? `<p style="margin-top:1.25rem"><a href="${escapeHtml(github)}" target="_blank" rel="noreferrer" class="accent small">${escapeHtml(t("githubLabel"))}</a></p>` : ""}
        </article>`;
      }).join("")}</div>
    `;
  },
  publications() {
    const items = parseItems(state.files["publications.md"]);
    const empty = state.locale === "ja" ? "出版はまだありません。" : state.locale === "en" ? "No publications yet." : "尚无出版。";
    return `
      <p class="kicker">${escapeHtml(t("navPublications"))}</p>
      <h1 class="page-title">${escapeHtml(t("pagePublications"))}</h1>
      ${items.length ? `<ul class="stack">${items.map((p) => `<li>
        <div class="row-head"><h2 class="item-title">${escapeHtml(p.title || "")}</h2><span class="xs subtle">${escapeHtml(p.year || "")}</span></div>
        <p class="small muted">${escapeHtml([p.authors, p.venue, p.kind].filter(Boolean).join(" · "))}</p>
        ${p.href ? `<p class="small" style="margin-top:0.5rem"><a class="accent" href="${escapeHtml(p.href)}" target="_blank" rel="noreferrer">${escapeHtml(p.href)}</a></p>` : ""}
      </li>`).join("")}</ul>` : `<p class="empty">${escapeHtml(empty)}</p>`}
    `;
  },
  honors() {
    const items = parseItems(state.files["honors.md"]).slice().sort((a, b) => String(b.year || "").localeCompare(String(a.year || "")));
    return `
      <p class="kicker">${escapeHtml(t("navHonors"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageHonors"))}</h1>
      <ul class="honors">${items.map((h) => `<li><p class="xs subtle">${escapeHtml([h.year, h.level].filter(Boolean).join(" · "))}</p><p class="item-title" style="margin-top:0.5rem;font-size:1.05rem">${escapeHtml(h.title || "")}</p></li>`).join("")}</ul>
    `;
  },
  journal() {
    const items = parseItems(state.files["journal.md"]).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const shown = items.slice(0, state.journalVisible);
    return `
      <p class="kicker">${escapeHtml(t("navJournal"))}</p>
      <h1 class="page-title">${escapeHtml(t("pageJournal"))}</h1>
      <ol class="stack">${shown.map((p) => `<li>
        <p class="xs subtle">${escapeHtml(p.date || "")}</p>
        <h2 class="item-title" style="margin-top:0.5rem">${escapeHtml(p.title || "")}</h2>
        <div class="md-body" style="margin-top:1.25rem;max-width:40rem">${md(p.body || "")}</div>
      </li>`).join("")}</ol>
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
            <p class="small muted" style="margin:0.35rem 0 0">保存写入 GitHub 仓库 ${escapeHtml(gh.owner)}/${escapeHtml(gh.repo)}，需要仓库写权限。</p>
          </div>
          <button class="btn" type="button" id="ed-close">关闭</button>
        </div>
        <div class="editor-body">
          <label>GitHub Personal Access Token（只留在这次浏览器会话）</label>
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
      status.textContent = "先填 GitHub Token。GitHub → Settings → Developer settings → Fine-grained token，给这个仓库 Contents 读写。";
      return;
    }
    status.textContent = t("saving");
    try {
      await commitFile({
        token: tok,
        path: fileSel.value,
        content: area.value,
        message: `update ${fileSel.value}`,
      });
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
