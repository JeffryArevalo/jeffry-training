/* Road to C&O 100: what to run and lift each day.
   Routes: #/  #/run  #/run/w3  #/lift  #/lift/A  #/lift/A/0
   The only thing saved is the weight per exercise, in this phone's localStorage (key below). */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const tabbar = document.getElementById("tabbar");
  const toastEl = document.getElementById("toast");
  const WEIGHTS_KEY = "jeffry-weights";
  const HAS_PHOTO = new Set(typeof PHOTOS !== "undefined" ? PHOTOS : []);
  const COVER = { A: "smith-squat", B: "lat-pulldown", light: "db-shoulder-press" };

  /* ---------- Icons ---------- */
  const svg = (p, sw) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    back: svg('<path d="M15 18l-6-6 6-6"/>', 2.4),
    chev: svg('<path d="M9 18l6-6-6-6"/>', 2.4),
    run: svg('<circle cx="15" cy="4" r="2"/><path d="M13 8l-3 4 4 3v5M10 12l-3 1-2 4M14 15l3 1 2 4M11 8l-4-1-2 3"/>'),
    dumbbell: svg('<path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"/>'),
    home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>', 2.6),
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
  function longDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
  function fmt(n) { return String(Math.round(n * 10) / 10); }
  const START = pd(PLAN.start);
  const RACE = pd(PLAN.race.date);
  const TOTAL_DAYS = daysBetween(START, RACE);

  function planDay(date) {
    const off = daysBetween(START, date);
    if (off < 0) return null;
    const wi = Math.floor(off / 7), di = off % 7;
    if (!WEEKS[wi] || !WEEKS[wi].days[di]) return null;
    return { wi: wi, di: di, day: WEEKS[wi].days[di], date: date };
  }
  function dayDate(wi, di) { return addDays(START, wi * 7 + di); }
  function currentWeekIndex() {
    const wi = Math.floor(daysBetween(START, today()) / 7);
    return Math.max(0, Math.min(WEEKS.length - 1, wi));
  }
  function when(date) {
    const n = daysBetween(today(), date);
    return n === 0 ? "Today" : n === 1 ? "Tomorrow" : DOW[date.getDay()] + ", " + md(date);
  }
  function photo(id, thumb) { return HAS_PHOTO.has(id) ? `images/${thumb ? "thumbs/" : ""}${id}.jpg` : null; }

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
    // Same-day edits correct today's number. On a new day the old number becomes "prev".
    const prev = cur ? (cur.date === t ? cur.prev : cur.w) : null;
    all[ex.id] = { w: value, date: t, prev: prev };
    return saveWeights(all);
  }
  function unitOf(ex) { return ex.each ? "lb each" : "lb"; }
  function weightMeta(entry, ex) {
    if (!entry) return ex.optional ? "Leave blank for bodyweight. Saved for next time." : "Type the weight you use. It's saved for next time.";
    let s = entry.date === iso(today()) ? "Saved today" : "Last time " + esc(md(pd(entry.date)));
    if (entry.prev != null && entry.w !== entry.prev) {
      const up = entry.w > entry.prev;
      s += ` · <span class="${up ? "up" : "down"}">${up ? "▲ up" : "▼ down"} from ${fmt(entry.prev)} lb</span>`;
    }
    return s;
  }

  /* ---------- Plan lookups ---------- */
  function nextMatching(test, fromDate) {
    for (let n = 0; n < 28; n++) {
      const p = planDay(addDays(fromDate, n));
      if (p && test(p.day)) return p;
    }
    return null;
  }
  function stDay(st) { return /Strength A/.test(st) ? "A" : /Strength B/.test(st) ? "B" : null; }
  function nextStrength() {
    const t = today();
    return nextMatching((d) => !!d.st, t < START ? START : t);
  }

  /* ---------- Shared components ---------- */
  function effortBadge(e) { return `<span class="effort e-${e}">${EFFORT[e]}</span>`; }

  function weekStrip(wi) {
    const w = WEEKS[wi], tk = iso(today());
    const scale = Math.max(1, ...w.days.filter((d) => d.e !== "race").map((d) => d.mi));
    const cells = DOW_ORDER.map((label, di) => {
      const d = w.days[di];
      if (!d) return `<div class="sd empty"><span class="sd-bar"></span><b>&nbsp;</b><small>${label[0]}</small></div>`;
      const isToday = iso(dayDate(wi, di)) === tk;
      const h = d.e === "race" ? 100 : d.mi > 0 ? Math.max(14, (d.mi / scale) * 100) : 6;
      return `<div class="sd e-${d.e}${isToday ? " today" : ""}" title="${label}: ${esc(d.s)}">
        <span class="sd-bar"><i style="height:${h}%"></i></span>
        <b>${d.mi > 0 ? fmt(d.mi) : "–"}</b><small>${label[0]}</small></div>`;
    }).join("");
    return `<div class="strip">${cells}</div>`;
  }

  // Decorative contour lines for the race card.
  const CONTOURS = `<svg class="contours" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true">
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M-20 ${170 - i * 22} C 60 ${120 - i * 22}, 120 ${210 - i * 22}, 200 ${150 - i * 22} S 330 ${90 - i * 22}, 420 ${140 - i * 22}"/>`).join("")}
  </svg>`;
  const ROUTE = `<svg class="route" viewBox="0 0 200 120" aria-hidden="true">
    <path d="M10 100 C 40 100, 40 60, 75 62 S 110 95, 140 70 S 170 20, 190 22"/>
    <circle cx="10" cy="100" r="4"/><circle class="end" cx="190" cy="22" r="6"/>
  </svg>`;

  function glassTop(href, label, right) {
    return `<div class="hero-top">
      <button class="glass-btn" data-go="${href}" aria-label="Back to ${esc(label)}">${I.back}<span>${esc(label)}</span></button>
      ${right ? `<span class="glass-pill">${right}</span>` : ""}
    </div>`;
  }

  /* ---------- Home ---------- */
  function homeView() {
    const t = today(), hr = new Date().getHours();
    const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
    const left = Math.max(0, daysBetween(t, RACE));
    const elapsed = Math.max(0, Math.min(TOTAL_DAYS, daysBetween(START, t)));
    const pct = elapsed / TOTAL_DAYS;
    const p = planDay(t);
    const wi = t < START ? 0 : p ? p.wi : WEEKS.length - 1;
    const progressLabel = t < START ? `Starts Mon, ${md(START)}` : p ? `Week ${p.wi + 1} of ${WEEKS.length} · ${esc(WEEKS[p.wi].label)}` : "Plan complete";

    // Running card
    let run;
    if (t < START) {
      const first = planDay(addDays(START, 1));
      run = { label: `First run · ${when(first.date)}`, title: first.day.s, sub: "Heart rate 145 or lower", mi: first.day.mi, e: first.day.e };
    } else if (p && p.day.e !== "rest") {
      run = { label: "Today", title: p.day.s, sub: p.day.d || (p.day.e === "easy" ? "Heart rate 145 or lower" : ""), mi: p.day.mi, e: p.day.e };
    } else if (p) {
      const nx = nextMatching((d) => d.e !== "rest", addDays(t, 1));
      run = { label: "Today", title: p.day.s, sub: nx ? `Next: ${when(nx.date)} · ${nx.day.s} · ${fmt(nx.day.mi)} mi` : "", mi: 0, e: "rest" };
    } else {
      run = { label: "Done", title: "Plan complete", sub: "Congratulations on the C&O 100.", mi: 0, e: "rest" };
    }

    // Workout card
    const ns = nextStrength();
    let liftCard = "";
    if (ns) {
      const id = stDay(ns.day.st);
      const s = id ? STRENGTH[id] : null;
      const img = photo(id ? COVER[id] : COVER.light);
      liftCard = `
        <button class="today-card lift-card" data-go="${id ? "#/lift/" + id : "#/lift"}">
          ${img ? `<img class="tc-img" src="${img}" alt="">` : ""}
          <div class="tc-shade"></div>
          <div class="tc-content">
            <span class="tc-label">${I.dumbbell}Workout · ${esc(when(ns.date))}</span>
            <h3>${s ? esc(s.title) : esc(ns.day.st)}</h3>
            <p>${s ? `${esc(ns.day.st)} · ${s.exercises.length} exercises · ${esc(s.duration)}` : "Race week: keep it light"}</p>
          </div>
          ${id ? `<span class="tc-letter">${id}</span>` : ""}
        </button>`;
    }

    return `
      <section class="view home">
        <header class="greet">
          <div class="greet-date">${esc(longDate(t))}</div>
          <h1>${greet}, Jeffry</h1>
        </header>

        <article class="race-card">
          ${CONTOURS}
          <div class="rc-row">
            <div class="rc-info">
              <span class="eyebrow">A-race</span>
              <h2>${esc(PLAN.race.name)}</h2>
              <span class="rc-meta">Sat, Apr 24 · ${esc(PLAN.race.time)} · ${esc(PLAN.race.place)}</span>
            </div>
            <div class="rc-count"><b>${left}</b><span>days to go</span></div>
          </div>
          <div class="rc-progress">
            <div class="rc-bar"><i style="width:${(pct * 100).toFixed(1)}%"></i></div>
            <div class="rc-progress-label"><span>${progressLabel}</span><span>${Math.round(pct * 100)}%</span></div>
          </div>
        </article>

        <div class="section-head"><h3>Today</h3></div>
        <button class="today-card run-card" data-go="#/run">
          ${ROUTE}
          <div class="tc-content">
            <span class="tc-label">${I.run}Running · ${esc(run.label)}</span>
            <h3>${esc(run.title)}</h3>
            ${run.sub ? `<p>${esc(run.sub)}</p>` : ""}
          </div>
          <div class="tc-side">
            ${run.mi > 0 ? `<b>${fmt(run.mi)}</b><small>miles</small>` : ""}
            ${effortBadge(run.e)}
          </div>
        </button>
        ${liftCard}

        <div class="section-head"><h3>${t < START ? "Week 1" : "This week"}</h3><button class="link" data-go="#/run/w${wi + 1}">Week ${wi + 1} ${I.chev}</button></div>
        <button class="strip-card" data-go="#/run/w${wi + 1}" aria-label="Open week ${wi + 1}">
          <div class="strip-head"><span>${esc(WEEKS[wi].dates)}</span><span><b>${esc(WEEKS[wi].total.replace(/^about /, ""))}</b></span></div>
          ${weekStrip(wi)}
        </button>
      </section>`;
  }

  /* ---------- Running ---------- */
  function runWeekView(wi) {
    const w = WEEKS[wi], cw = currentWeekIndex(), tk = iso(today()), started = today() >= START;
    const chips = WEEKS.map((x, i) =>
      `<button class="chip-week" data-go="#/run/w${x.n}" aria-pressed="${i === wi}" aria-label="Week ${x.n}"${i === wi ? ' id="chip-on"' : ""}>${x.n}${i === cw && started ? '<i class="now-dot"></i>' : ""}</button>`).join("");
    const count = (e) => w.days.filter((d) => d.e === e).length;
    const totalNum = w.total.replace(/^about /, "").replace(/ mi.*$/, "");
    const totalRest = w.total.replace(/^about \d+(\.\d+)? /, "");

    const rows = w.days.map((d, di) => {
      const date = dayDate(wi, di), isToday = iso(date) === tk;
      const extras = [];
      if (d.st) extras.push(`<span class="mini lift">${I.dumbbell}${esc(d.st)}</span>`);
      if (d.tag) extras.push(`<span class="mini tag">${esc(d.tag)}</span>`);
      return `
        <div class="day-row e-${d.e}${isToday ? " today" : ""}">
          <span class="dr-date"><small>${DOW_ORDER[di]}</small><b>${date.getDate()}</b></span>
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
        <header class="page-head">
          <div><span class="eyebrow">22-week plan</span><h1>Running</h1></div>
        </header>
        <nav class="week-chips" aria-label="Weeks"><span class="wk-label">Week</span>${chips}</nav>
        <article class="week-card">
          <div class="wc-top">
            <div>
              <span class="eyebrow">${esc(w.label)}</span>
              <h2>Week ${w.n}</h2>
              <p>${esc(w.dates)}</p>
            </div>
            <div class="wc-total"><b>${esc(totalNum)}</b><span>${esc(totalRest)}</span></div>
          </div>
          ${weekStrip(wi)}
          <div class="wc-legend">
            ${count("hard") ? `<span><i class="dot e-hard"></i>${count("hard")} hard</span>` : ""}
            ${count("easy") ? `<span><i class="dot e-easy"></i>${count("easy")} easy</span>` : ""}
            ${count("race") ? `<span><i class="dot e-race"></i>Race</span>` : ""}
            ${count("rest") ? `<span><i class="dot e-rest"></i>${count("rest")} rest</span>` : ""}
          </div>
        </article>
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
    const nextId = ns ? stDay(ns.day.st) : null;
    const cards = ["A", "B"].map((id) => {
      const s = STRENGTH[id], img = photo(COVER[id]), isNext = nextId === id;
      return `
        <button class="cover-card${isNext ? " next" : ""}" data-go="#/lift/${id}" aria-label="${s.name}: ${esc(s.title)}">
          ${img ? `<img class="tc-img" src="${img}" alt="">` : ""}
          <div class="tc-shade"></div>
          <div class="cc-top"><span class="cc-letter">${id}</span>${isNext ? `<span class="cc-chip">${esc(when(ns.date))}</span>` : ""}</div>
          <div class="cc-bottom">
            <span class="cc-day">${s.name} · ${s.day}</span>
            <h2>${esc(s.title)}</h2>
            <p>${s.exercises.length} exercises · ${esc(s.duration)}</p>
          </div>
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        <header class="page-head"><div><span class="eyebrow">Planet Fitness</span><h1>Workout</h1></div></header>
        ${note ? `<div class="banner">${I.info}<span>${esc(note)}</span></div>` : ""}
        <div class="cover-list">${cards}</div>
      </section>`;
  }

  function thumbHTML(ex) {
    const src = photo(ex.id, true);
    return src ? `<img src="${src}" alt="" loading="lazy">` : `<span class="thumb-ph">${I.dumbbell}</span>`;
  }

  function liftDayView(id) {
    const s = STRENGTH[id], weights = loadWeights(), note = weekLoadNote(), img = photo(COVER[id]);
    const rows = s.exercises.map((ex, i) => {
      const saved = ex.kind === "load" ? weights[ex.id] : null;
      const right = ex.kind === "bw"
        ? `<span class="ex-w muted">BW</span>`
        : saved ? `<span class="ex-w">${fmt(saved.w)}<small>${unitOf(ex)}</small></span>` : `<span class="ex-w add">+ lb</span>`;
      return `
        <button class="ex-row" data-go="#/lift/${id}/${i}" aria-label="${esc(ex.name)}">
          <span class="thumb">${thumbHTML(ex)}<i>${i + 1}</i></span>
          <span class="ex-main">
            <span class="name">${esc(ex.name)}</span>
            <span class="target">${esc(ex.target)}</span>
          </span>
          ${right}
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        <div class="hero${img ? "" : " no-photo"}">
          ${img ? `<img class="hero-img" src="${img}" alt="">` : ""}
          ${glassTop("#/lift", "Workout")}
          <div class="hero-bottom">
            <span class="eyebrow">${s.name} · ${s.day}</span>
            <h1>${esc(s.title)}</h1>
            <p>${s.exercises.length} exercises · ${esc(s.duration)}</p>
          </div>
        </div>
        ${note ? `<div class="banner">${I.info}<span>${esc(note)}</span></div>` : ""}
        <div class="warmup"><span class="wu-ic">${I.flame}</span><div><b>Warm-up</b><p>${esc(s.warmup)}</p></div></div>
        <div class="ex-list">${rows}</div>
      </section>`;
  }

  let current = null;

  function weightCard(ex) {
    if (ex.kind !== "load") {
      return `<div class="weight-card bw"><span class="wu-ic">${I.check}</span><div><b>Bodyweight</b><p>No weight to track. Focus on clean, controlled reps.</p></div></div>`;
    }
    const entry = getWeight(ex);
    return `
      <div class="weight-card">
        <div class="wc-head"><label class="weight-label" for="w-input">Your weight</label><span class="weight-unit">${unitOf(ex)}</span></div>
        <div class="weight-row">
          <button type="button" class="step" data-step="-5" aria-label="5 pounds less">&minus;</button>
          <div class="weight-field">
            <input id="w-input" type="text" inputmode="decimal" autocomplete="off" placeholder="${ex.optional ? "BW" : "0"}" value="${entry ? fmt(entry.w) : ""}" aria-label="Weight in pounds">
          </div>
          <button type="button" class="step" data-step="5" aria-label="5 pounds more">+</button>
        </div>
        <p class="weight-meta" id="w-meta" aria-live="polite">${weightMeta(entry, ex)}</p>
      </div>`;
  }

  function exerciseView(id, idx) {
    const s = STRENGTH[id], ex = s.exercises[idx], img = photo(ex.id);
    current = ex;
    const prev = idx > 0 ? `#/lift/${id}/${idx - 1}` : null;
    const next = idx < s.exercises.length - 1 ? `#/lift/${id}/${idx + 1}` : null;
    return `
      <section class="view sec-lift">
        <div class="hero tall${img ? "" : " no-photo"}">
          ${img ? `<img class="hero-img" src="${img}" alt="How to do ${esc(ex.name)}">` : `<span class="hero-ph">${I.dumbbell}</span>`}
          ${glassTop("#/lift/" + id, s.name, `${idx + 1} / ${s.exercises.length}`)}
          <div class="hero-bottom">
            <span class="eyebrow">${s.name} · ${esc(s.title)}</span>
            <h1>${esc(ex.name)}</h1>
          </div>
        </div>
        <div class="stat-pair">
          <div class="cell"><span class="k">Sets × reps</span><span class="v">${esc(ex.target)}</span></div>
          <div class="cell"><span class="k">Purpose</span><span class="p">${esc(ex.purpose)}</span></div>
        </div>
        ${weightCard(ex)}
        <div class="section-head"><h3>How to do it</h3></div>
        <ol class="steps">${ex.cues.map((c, i) => `<li><span>${i + 1}</span><p>${esc(c)}</p></li>`).join("")}</ol>
        <div class="nav-row">
          ${prev ? `<button class="btn" data-go="${prev}">${I.back}Previous</button>` : `<button class="btn" disabled>${I.back}Previous</button>`}
          <button class="btn primary" data-go="${next || "#/lift/" + id}">${next ? "Next" : "Done"}${next ? I.chev : ""}</button>
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

  /* ---------- Tab bar ---------- */
  function renderTabbar(active) {
    const tabs = [["home", "#/", I.home, "Today"], ["run", "#/run", I.run, "Running"], ["lift", "#/lift", I.dumbbell, "Workout"]];
    tabbar.innerHTML = `<div class="tabbar-inner">${tabs.map(([k, h, ic, l]) =>
      `<button class="tab tab-${k}" data-go="${h}" aria-current="${active === k ? "page" : "false"}">${ic}<span>${l}</span></button>`).join("")}</div>`;
  }

  /* ---------- Router ---------- */
  function render() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    let html, tab = "home";
    current = null;
    if (parts[0] === "run") {
      tab = "run";
      const m = parts[1] && /^w(\d+)$/.exec(parts[1]);
      const wi = m && WEEKS[Number(m[1]) - 1] ? Number(m[1]) - 1 : currentWeekIndex();
      html = runWeekView(wi);
    } else if (parts[0] === "lift") {
      tab = "lift";
      const s = STRENGTH[parts[1]];
      if (!s) html = liftHomeView();
      else if (parts[2] !== undefined && s.exercises[+parts[2]]) html = exerciseView(parts[1], +parts[2]);
      else html = liftDayView(parts[1]);
    } else {
      html = homeView();
    }
    app.innerHTML = html;
    renderTabbar(tab);
    window.scrollTo(0, 0);
    const on = document.getElementById("chip-on");
    if (on && on.parentNode) {
      const box = on.parentNode, b = box.getBoundingClientRect(), c = on.getBoundingClientRect();
      box.scrollLeft += c.left - b.left - (b.width - c.width) / 2;
    }
  }

  function onClick(e) {
    const go = e.target.closest("[data-go]");
    if (go) {
      const h = go.getAttribute("data-go");
      if (location.hash === h || (h === "#/" && location.hash === "")) render(); else location.hash = h;
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      const input = document.getElementById("w-input");
      if (!input) return;
      const base = Number(String(input.value).replace(",", ".")) || 0;
      input.value = fmt(Math.max(0, base + Number(step.dataset.step)));
      onWeightInput(input.value);
      input.classList.remove("bump"); void input.offsetWidth; input.classList.add("bump");
    }
  }
  app.addEventListener("click", onClick);
  tabbar.addEventListener("click", onClick);
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
