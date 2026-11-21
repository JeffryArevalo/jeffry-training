/* Road to C&O 100: what to run and lift each day.
   Routes: #/  #/run  #/run/w3  #/lift  #/lift/A  #/lift/A/0
   The only thing saved is the weight per exercise, in this phone's localStorage (key below). */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const WEIGHTS_KEY = "jeffry-weights";

  /* ---------- Icons ---------- */
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    back: svg('<path d="M15 18l-6-6 6-6"/>'),
    chev: svg('<path d="M9 18l6-6-6-6"/>'),
    run: svg('<circle cx="15" cy="4" r="2"/><path d="M13 8l-3 4 4 3v5M10 12l-3 1-2 4M14 15l3 1 2 4M11 8l-4-1-2 3"/>'),
    dumbbell: svg('<path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  };

  const EFFORT = { easy: "Easy", hard: "Hard", race: "Race", rest: "Rest" };
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DOW_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function pd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function today() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  function md(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  function fmt(n) { return String(Math.round(n * 10) / 10); }
  const START = pd(PLAN.start);
  const RACE = pd(PLAN.race.date);

  // Plan position of a date: { wi, di, day } or null outside the plan.
  function planDay(date) {
    const off = daysBetween(START, date);
    if (off < 0) return null;
    const wi = Math.floor(off / 7), di = off % 7;
    if (!WEEKS[wi] || !WEEKS[wi].days[di]) return null;
    return { wi: wi, di: di, day: WEEKS[wi].days[di] };
  }
  function dayDate(wi, di) { return addDays(START, wi * 7 + di); }
  function currentWeekIndex() {
    const wi = Math.floor(daysBetween(START, today()) / 7);
    return Math.max(0, Math.min(WEEKS.length - 1, wi));
  }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------- Saved weights ---------- */
  function loadWeights() {
    try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveWeights(all) {
    try { localStorage.setItem(WEIGHTS_KEY, JSON.stringify(all)); return true; } catch (e) { return false; }
  }
  function getWeight(ex) { return loadWeights()[ex.id] || null; }
  function setWeight(ex, value) {
    const all = loadWeights(), cur = all[ex.id], t = iso(today());
    if (cur && cur.w === value) return true;
    // Edits on the same day correct today's number. On a new day the old number becomes "prev".
    const prev = cur ? (cur.date === t ? cur.prev : cur.w) : null;
    all[ex.id] = { w: value, date: t, prev: prev };
    return saveWeights(all);
  }
  function unitOf(ex) { return ex.each ? "lb each" : "lb"; }
  function weightMeta(entry, ex) {
    if (!entry) return ex.optional ? "Leave blank for bodyweight. Saved for next time." : "Type the weight you use. It's saved for next time.";
    let s = entry.date === iso(today()) ? "Saved today" : "Last time: " + esc(md(pd(entry.date)));
    if (entry.prev != null && entry.w !== entry.prev) {
      const up = entry.w > entry.prev;
      s += ` · <span class="${up ? "up" : "down"}">${up ? "up" : "down"} from ${fmt(entry.prev)} lb</span>`;
    }
    return s;
  }

  /* ---------- Shared bits ---------- */
  function topbar(href, label, section) {
    return `<div class="topbar"><button class="back" data-go="${href}">${I.back}${esc(label)}</button>${section ? `<span class="section-name">${esc(section)}</span>` : ""}</div>`;
  }
  function effortBadge(e) { return `<span class="effort e-${e}">${EFFORT[e]}</span>`; }

  // The next day (from today, inclusive) that has strength on it.
  function nextStrength() {
    const t = today();
    for (let n = 0; n < 21; n++) {
      const date = addDays(t, n), p = planDay(date);
      if (p && p.day.st) return { date: date, st: p.day.st, n: n };
    }
    if (t < START) return { date: START, st: WEEKS[0].days[0].st, n: daysBetween(t, START) };
    return null;
  }
  function stDay(st) { return /Strength A/.test(st) ? "A" : /Strength B/.test(st) ? "B" : null; }

  /* ---------- Home ---------- */
  function homeView() {
    const t = today();
    const left = daysBetween(t, RACE);
    const p = planDay(t);
    const weekLine = t < START
      ? `Plan starts Mon, ${md(START)}`
      : p ? `Week ${p.wi + 1} of ${WEEKS.length} · ${esc(WEEKS[p.wi].label)}` : "Plan complete";

    // Running button
    let runLine, runSide;
    if (t < START) {
      const d = WEEKS[0].days[1];
      runLine = `First run <b>Tue, ${md(dayDate(0, 1))}</b> · ${esc(d.s)}`;
      runSide = `<span class="bb-mi">${fmt(d.mi)}<small>mi</small></span>${effortBadge(d.e)}`;
    } else if (p) {
      const d = p.day;
      runLine = d.e === "rest" ? `Today · <b>${esc(d.s)}</b>` : `Today · <b>${esc(d.s)}</b>`;
      runSide = d.mi > 0 ? `<span class="bb-mi">${fmt(d.mi)}<small>mi</small></span>${effortBadge(d.e)}` : effortBadge(d.e);
    } else {
      runLine = "Plan complete. Congratulations!";
      runSide = "";
    }

    // Workout button
    const ns = nextStrength();
    let liftLine, liftSide = "";
    if (ns) {
      const when = ns.n === 0 ? "Today" : ns.n === 1 ? "Tomorrow" : DOW[ns.date.getDay()] + ", " + md(ns.date);
      const id = stDay(ns.st);
      liftLine = `${when} · <b>${esc(ns.st)}</b>${id ? " · " + esc(STRENGTH[id].title) : ""}`;
      liftSide = id ? `<span class="bb-letter">${id}</span>` : "";
    } else {
      liftLine = "No more strength sessions in the plan.";
    }

    return `
      <section class="view">
        <header class="hero">
          <div class="eyebrow">Road to</div>
          <h1>${esc(PLAN.race.name)}</h1>
          <div class="countdown"><span class="big">${Math.max(0, left)}</span><span class="lbl">days<br>to go</span></div>
          <p class="meta">Sat, Apr 24, 2027 · ${esc(PLAN.race.time)} · ${esc(PLAN.race.place)}</p>
          <p class="week-line">${weekLine}</p>
        </header>

        <div class="big-buttons">
          <button class="big-btn sec-run" data-go="#/run" aria-label="Running plan">
            <div>
              <span class="bb-icon">${I.run}</span>
              <h2>Running</h2>
              <div class="bb-today">${runLine}</div>
            </div>
            <div class="bb-side">${runSide}</div>
          </button>
          <button class="big-btn sec-lift" data-go="#/lift" aria-label="Workout plan">
            <div>
              <span class="bb-icon">${I.dumbbell}</span>
              <h2>Workout</h2>
              <div class="bb-today">${liftLine}</div>
            </div>
            <div class="bb-side">${liftSide}</div>
          </button>
        </div>
      </section>`;
  }

  /* ---------- Running ---------- */
  function runWeekView(wi) {
    const w = WEEKS[wi], cw = currentWeekIndex(), tk = iso(today());
    const chips = WEEKS.map((x, i) =>
      `<button class="chip-week" data-go="#/run/w${x.n}" aria-pressed="${i === wi}" aria-label="Week ${x.n}"${i === wi ? ' id="chip-on"' : ""}>W${x.n}${i === cw && today() >= START ? '<i class="now-dot"></i>' : ""}</button>`).join("");

    const rows = w.days.map((d, di) => {
      const date = dayDate(wi, di), isToday = iso(date) === tk;
      const extras = [];
      if (d.st) extras.push(`<span class="mini lift">${I.dumbbell}${esc(d.st)}</span>`);
      if (d.tag) extras.push(`<span class="mini tag">${esc(d.tag)}</span>`);
      return `
        <div class="day-row e-${d.e}${isToday ? " today" : ""}">
          <span class="dr-date"><b>${DOW_ORDER[di]}</b><small>${md(date)}</small></span>
          <span class="dr-main">
            <span class="dr-title">${esc(d.s)}${isToday ? '<span class="pill-today">Today</span>' : ""}</span>
            ${d.d ? `<span class="dr-detail">${esc(d.d)}</span>` : ""}
            ${extras.length ? `<span class="dr-extras">${extras.join("")}</span>` : ""}
          </span>
          <span class="dr-right">
            ${d.mi > 0 ? `<span class="dr-mi">${fmt(d.mi)}<small>mi</small></span>` : ""}
            ${effortBadge(d.e)}
          </span>
        </div>`;
    }).join("");

    return `
      <section class="view sec-run">
        ${topbar("#/", "Home", "Running")}
        <nav class="week-chips" aria-label="Weeks">${chips}</nav>
        <div class="week-head">
          <div>
            <div class="eyebrow">${esc(w.label)}</div>
            <h1>Week ${w.n}</h1>
            <div class="dates">${esc(w.dates)}</div>
          </div>
          <div class="week-total"><b>${esc(w.total.replace(/^about /, "").replace(/ mi.*$/, ""))}</b><span>${esc(w.total.replace(/^about \d+(\.\d+)? /, ""))}</span></div>
        </div>
        <div class="days">${rows}</div>
        <div class="nav-row">
          ${wi > 0 ? `<button class="btn" data-go="#/run/w${w.n - 1}">${I.back}Week ${w.n - 1}</button>` : "<span></span>"}
          ${wi < WEEKS.length - 1 ? `<button class="btn" data-go="#/run/w${w.n + 1}">Week ${w.n + 1}${I.chev}</button>` : "<span></span>"}
        </div>
      </section>`;
  }

  /* ---------- Workout ---------- */
  function weekLoadNote() {
    const t = today();
    if (t < START) return WEEKS[0].loadNote;
    const p = planDay(t);
    return p ? WEEKS[p.wi].loadNote : null;
  }

  function liftHomeView() {
    const ns = nextStrength(), note = weekLoadNote();
    const nextId = ns ? stDay(ns.st) : null;
    const cards = ["A", "B"].map((id) => {
      const s = STRENGTH[id], isNext = nextId === id;
      const when = isNext ? (ns.n === 0 ? "Today" : ns.n === 1 ? "Tomorrow" : "Next: " + DOW[ns.date.getDay()] + ", " + md(ns.date)) : "";
      return `
        <button class="session-card${isNext ? " next" : ""}" data-go="#/lift/${id}" aria-label="${s.name}: ${esc(s.title)}">
          <span class="letter">${id}</span>
          <div>
            <h2>${esc(s.title)}</h2>
            <div class="sc-sub">${s.day} · ${s.exercises.length} exercises · ${esc(s.duration)}</div>
            ${when ? `<span class="chip accent">${esc(when)}</span>` : ""}
          </div>
          ${I.chev}
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        ${topbar("#/", "Home", "Workout")}
        <div class="eyebrow">Planet Fitness</div>
        <h1 class="page-title">Strength</h1>
        ${note ? `<div class="banner">${I.info}<span>${esc(note)}</span></div>` : ""}
        <div style="margin-top:16px">${cards}</div>
      </section>`;
  }

  function liftDayView(id) {
    const s = STRENGTH[id], weights = loadWeights(), note = weekLoadNote();
    const rows = s.exercises.map((ex, i) => {
      const saved = ex.kind === "load" ? weights[ex.id] : null;
      const right = ex.kind === "bw"
        ? `<span class="ex-w muted">Body&shy;weight</span>`
        : saved ? `<span class="ex-w">${fmt(saved.w)}<small>${unitOf(ex)}</small></span>` : `<span class="ex-w muted">Add weight</span>`;
      return `
        <button class="ex-row" data-go="#/lift/${id}/${i}" aria-label="${esc(ex.name)}">
          <span class="num">${i + 1}</span>
          <span class="ex-main">
            <span class="name">${esc(ex.name)}</span>
            <span class="target"><strong>${esc(ex.target)}</strong></span>
          </span>
          ${right}
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        ${topbar("#/lift", "Workout", s.name)}
        <div class="eyebrow">${s.name} · ${s.day}</div>
        <h1 class="page-title">${esc(s.title)}</h1>
        <p class="page-sub">${esc(s.duration)} · Warm-up: ${esc(s.warmup)}</p>
        ${note ? `<div class="banner">${I.info}<span>${esc(note)}</span></div>` : ""}
        <div class="ex-list">${rows}</div>
      </section>`;
  }

  let current = null; // exercise open on screen

  function weightCard(ex) {
    if (ex.kind !== "load") return "";
    const entry = getWeight(ex);
    return `
      <div class="weight-card">
        <label class="weight-label" for="w-input">Weight</label>
        <div class="weight-row">
          <button type="button" class="step" data-step="-5" aria-label="5 pounds less">&minus;</button>
          <div class="weight-field">
            <input id="w-input" type="text" inputmode="decimal" autocomplete="off" placeholder="${ex.optional ? "BW" : "0"}" value="${entry ? fmt(entry.w) : ""}">
            <span>${unitOf(ex)}</span>
          </div>
          <button type="button" class="step" data-step="5" aria-label="5 pounds more">+</button>
        </div>
        <p class="weight-meta" id="w-meta" aria-live="polite">${weightMeta(entry, ex)}</p>
      </div>`;
  }

  function exerciseView(id, idx) {
    const s = STRENGTH[id], ex = s.exercises[idx];
    current = ex;
    const prev = idx > 0 ? `#/lift/${id}/${idx - 1}` : null;
    const next = idx < s.exercises.length - 1 ? `#/lift/${id}/${idx + 1}` : null;
    return `
      <section class="view sec-lift">
        ${topbar("#/lift/" + id, s.name, `${idx + 1} of ${s.exercises.length}`)}
        <h1 class="page-title" style="font-size:34px">${esc(ex.name)}</h1>
        <div class="figure"><img src="images/${esc(ex.id)}.jpg" alt="How to do ${esc(ex.name)}" onerror="this.parentNode.remove()"></div>
        <div class="target-row">
          <div class="cell"><div class="k">Sets × reps</div><div class="v">${esc(ex.target)}</div></div>
          <div class="cell"><div class="k">Purpose</div><div class="purpose">${esc(ex.purpose)}</div></div>
        </div>
        ${weightCard(ex)}
        <div class="section-title">How to do it</div>
        <div class="card"><ol class="cues">${ex.cues.map((c) => `<li>${esc(c)}</li>`).join("")}</ol></div>
        <div class="nav-row">
          ${prev ? `<button class="btn" data-go="${prev}">Previous</button>` : `<button class="btn" disabled>Previous</button>`}
          <button class="btn primary" data-go="${next || "#/lift/" + id}">${next ? "Next exercise" : "Done"}</button>
        </div>
      </section>`;
  }

  function onWeightInput(raw) {
    if (!current) return;
    const text = String(raw).trim().replace(",", ".");
    if (text === "") return; // clearing the box to retype never erases the saved weight
    const v = Number(text);
    if (!isFinite(v) || v < 0) return;
    const ok = setWeight(current, Math.round(v * 10) / 10);
    const meta = document.getElementById("w-meta");
    if (meta) meta.innerHTML = ok ? weightMeta(getWeight(current), current) : "Couldn't save on this phone. Make sure private browsing is off.";
    if (!ok) toast("Couldn't save");
  }

  /* ---------- Router ---------- */
  function render() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    let html;
    current = null;
    if (parts[0] === "run") {
      const m = parts[1] && /^w(\d+)$/.exec(parts[1]);
      const wi = m && WEEKS[Number(m[1]) - 1] ? Number(m[1]) - 1 : currentWeekIndex();
      html = runWeekView(wi);
    } else if (parts[0] === "lift") {
      const s = STRENGTH[parts[1]];
      if (!s) html = liftHomeView();
      else if (parts[2] !== undefined && s.exercises[+parts[2]]) html = exerciseView(parts[1], +parts[2]);
      else html = liftDayView(parts[1]);
    } else {
      html = homeView();
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    const on = document.getElementById("chip-on");
    if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
  }

  app.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) {
      const h = go.getAttribute("data-go");
      if (location.hash === h) render(); else location.hash = h;
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      const input = document.getElementById("w-input");
      if (!input) return;
      const base = Number(String(input.value).replace(",", ".")) || 0;
      input.value = fmt(Math.max(0, base + Number(step.dataset.step)));
      onWeightInput(input.value);
    }
  });
  app.addEventListener("input", (e) => {
    if (e.target.id === "w-input") onWeightInput(e.target.value);
  });

  window.addEventListener("hashchange", render);
  let lastDay = iso(today());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && iso(today()) !== lastDay) { lastDay = iso(today()); render(); }
  });
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* offline support is optional */ });
  }
})();
