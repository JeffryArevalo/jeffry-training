/* Road to C&O 100: running + strength tracker.
   Routes: #/  #/run  #/run/w3  #/run/w3/2  #/paces  #/season  #/rules  #/lift  #/lift/A  #/lift/A/0  #/backup
   Everything Jeffry logs is saved in this phone's localStorage (key below). Use Backup to export it. */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const restBar = document.getElementById("rest-bar");
  const toastEl = document.getElementById("toast");
  const KEY = "jeffry-training-v1";

  /* ---------- Icons (Lucide-style, 24px grid) ---------- */
  const svg = (p, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ""}>${p}</svg>`;
  const I = {
    back: svg('<path d="M15 18l-6-6 6-6"/>'),
    chev: svg('<path d="M9 18l6-6-6-6"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    run: svg('<circle cx="15" cy="4" r="2"/><path d="M13 8l-3 4 4 3v5M10 12l-3 1-2 4M14 15l3 1 2 4M11 8l-4-1-2 3"/>'),
    dumbbell: svg('<path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"/>'),
    heart: svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    gauge: svg('<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'),
    flag: svg('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'),
    zap: svg('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    battery: svg('<rect width="16" height="10" x="2" y="7" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>'),
    calendar: svg('<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    shield: svg('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>'),
    save: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>'),
    upload: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    up: svg('<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>'),
    info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
    alert: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>'),
    timer: svg('<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>'),
  };

  const TYPES = {
    rest: "Rest", easy: "Easy", strides: "Easy + strides", intervals: "Intervals", tempo: "Tempo", long: "Long run", tt: "Time trial",
  };
  const EASY_TYPES = ["easy", "strides", "long"];
  const HR_CAP = 145;
  const FEEL = [["1", "Easy"], ["2", "Steady"], ["3", "Hard"], ["4", "Very hard"], ["5", "All out"]];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const HEAVY = ["smith-squat", "rdl", "hip-thrust", "bss"];

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
  function dowMd(d) { return DOW[d.getDay()] + ", " + md(d); }
  const START = pd(PLAN.start);
  function weekIndexFor(d) { return Math.floor(daysBetween(START, d) / 7); }
  function dayDate(wi, di) { return addDays(START, wi * 7 + di); }
  function monIndex(d) { return (d.getDay() + 6) % 7; }
  function num(n) { return String(Math.round(n * 100) / 100); }
  function mi(n) { return n % 1 === 0 ? String(n) : String(n); }
  function pace(sec) { sec = Math.round(sec); return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
  function dur(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") : m + ":" + String(s).padStart(2, "0");
  }
  function topOf(reps) { const n = String(reps).match(/\d+/g); return n ? Number(n[n.length - 1]) : null; }
  function parseNum(v) {
    const t = String(v == null ? "" : v).trim().replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return isFinite(n) && n >= 0 ? n : NaN;
  }

  function ring(pct, size, stroke) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct));
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
      <circle class="bar" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/>
    </svg>`;
  }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  /* ---------- Storage ---------- */
  function norm(d) {
    d = d && typeof d === "object" ? d : {};
    return {
      v: 1,
      runs: d.runs && typeof d.runs === "object" ? d.runs : {},
      lifts: d.lifts && typeof d.lifts === "object" ? d.lifts : {},
      fiveK: typeof d.fiveK === "number" ? d.fiveK : null,
    };
  }
  function load() {
    try { return norm(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return norm(null); }
  }
  let DB = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(DB)); return true; }
    catch (e) { toast("Couldn't save. Is private browsing on?"); return false; }
  }

  /* ---------- Plan lookups ---------- */
  function phaseIndexFor(d) {
    if (d < pd(PHASES[0].start)) return -1;
    for (let i = 0; i < PHASES.length; i++) if (d <= pd(PHASES[i].end)) return i;
    return PHASES.length;
  }
  function weekStats(wi) {
    const w = WEEKS[wi];
    let logged = 0, done = 0, planned = 0;
    w.days.forEach((d, di) => {
      if (d.mi > 0) planned++;
      const log = DB.runs[iso(dayDate(wi, di))];
      if (log && log.status === "done") { logged += Number(log.dist) || 0; done++; }
    });
    return { logged: Math.round(logged * 10) / 10, done, planned, miles: w.miles };
  }
  function totalMiles() {
    return Math.round(Object.values(DB.runs).reduce((a, r) => a + (r.status === "done" ? Number(r.dist) || 0 : 0), 0) * 10) / 10;
  }
  function paceFor(kind) {
    if (!DB.fiveK) return null;
    const p = DB.fiveK / 3.10686;
    if (kind === "5k") return [p, p];
    if (kind === "5k+10") return [p + 10, p + 10];
    if (kind === "5k-5") return [p - 8, p - 3];
    if (kind === "tempo") return [p + 25, p + 30];
    return null;
  }
  function paceRange(r) { return Math.round(r[0]) === Math.round(r[1]) ? pace(r[0]) + "/mi" : pace(r[0]) + "–" + pace(r[1]) + "/mi"; }

  // Strength
  function liftSets(exId, key) { return (DB.lifts[exId] && DB.lifts[exId][key]) || null; }
  function doneSets(sets) { return (sets || []).filter((s) => s && s.done); }
  function lastSession(exId, beforeKey) {
    const byDate = DB.lifts[exId] || {};
    const keys = Object.keys(byDate).filter((k) => k < beforeKey && doneSets(byDate[k]).length).sort().reverse();
    return keys.length ? { date: keys[0], sets: byDate[keys[0]] } : null;
  }
  function strengthDoneOn(dayId, key) {
    return STRENGTH[dayId].exercises.some((ex) => doneSets(liftSets(ex.id, key)).length > 0);
  }
  function strengthLastDate(dayId) {
    let best = null;
    STRENGTH[dayId].exercises.forEach((ex) => {
      Object.keys(DB.lifts[ex.id] || {}).forEach((k) => { if (doneSets(DB.lifts[ex.id][k]).length && (!best || k > best)) best = k; });
    });
    return best;
  }
  function weekStrengthCount(d) {
    const mon = addDays(d, -monIndex(d));
    let n = 0;
    ["A", "B"].forEach((id) => {
      for (let i = 0; i < 7; i++) if (strengthDoneOn(id, iso(addDays(mon, i)))) { n++; break; }
    });
    return n;
  }
  function unitOf(ex) { return ex.each ? "lb each" : "lb"; }
  function summarize(ex, sets) {
    const ds = doneSets(sets);
    if (!ds.length) return "";
    if (ex.kind === "time") return ds.map((s) => s.r).join(", ") + " sec";
    if (ex.kind === "reps") return ds.map((s) => s.r).join(", ") + " reps";
    const ws = ds.map((s) => s.w);
    if (ws.every((w) => w === ws[0])) return (ws[0] ? num(ws[0]) + " lb" : "BW") + " × " + ds.map((s) => s.r).join(", ");
    return ds.map((s) => (s.w ? num(s.w) : "BW") + "×" + s.r).join(", ");
  }
  function hitTop(ex, sets) {
    const ds = doneSets(sets), top = topOf(ex.reps);
    return ds.length >= ex.sets && ds.every((s) => (s.r || 0) >= top);
  }
  function hintFor(ex, last) {
    const top = topOf(ex.reps);
    const unit = ex.kind === "time" ? "sec" : "reps";
    if (!last) {
      if (ex.kind === "load") return { tone: "info", title: "First session", text: `Pick a weight you can do for ${top} reps with 2 reps in reserve.` };
      return { tone: "info", title: "First session", text: `Aim for ${top} ${unit} on every set with clean form.` };
    }
    const ds = doneSets(last.sets);
    const maxW = Math.max(0, ...ds.map((s) => s.w || 0));
    if (hitTop(ex, last.sets)) {
      if (ex.kind === "load") return { tone: "up", title: "Add weight today", text: `You hit ${top} on every set last time. Add the smallest weight step.` };
      if (ex.kind === "time") return { tone: "up", title: "Hold longer", text: `You held ${top} sec on every set. Add 5–10 seconds.` };
      return { tone: "up", title: "Make it harder", text: `All sets hit ${top}. Slow the tempo or pause at the hardest point.` };
    }
    if (ex.kind === "load") return { tone: "info", title: maxW ? `Stay at ${num(maxW)} lb` : "Same load", text: `Beat last time by a rep where you can. Move up when every set reaches ${top}.` };
    return { tone: "info", title: "Build up", text: `Work up to ${top} ${unit} on every set.` };
  }
  function currentWeek() {
    const wi = weekIndexFor(today());
    return wi >= 0 && wi < WEEKS.length ? WEEKS[wi] : null;
  }

  /* ---------- Shared bits ---------- */
  function topbar(href, label, section) {
    return `<div class="topbar"><button class="back" data-go="${href}">${I.back}${esc(label)}</button>${section ? `<span class="section-name">${esc(section)}</span>` : ""}</div>`;
  }
  function infoCard(icon, title, text, tone) {
    return `<div class="card info-card ${tone || ""}"><span class="ic">${icon}</span><div><h3>${title}</h3>${text ? `<p>${text}</p>` : ""}</div></div>`;
  }

  /* ---------- Home ---------- */
  function homeView() {
    const t = today(), tk = iso(t);
    const raceD = pd(PLAN.race.date);
    const left = daysBetween(t, raceD);
    const pi = phaseIndexFor(t);
    const wi = weekIndexFor(t);

    const track = PHASES.map((p, i) => `<i class="${i < pi ? "past" : i === pi ? "now" : ""}" title="${esc(p.name)}"></i>`).join("");
    const phaseText = pi < 0 ? `Starts ${dowMd(START)}` : pi >= PHASES.length ? "Race complete" : `Phase ${pi + 1} of 6 · <b>${esc(PHASES[pi].name)}</b>`;
    const weekText = wi < 0 ? "Week 1 next" : wi < WEEKS.length ? `Week ${wi + 1}` : `Week ${wi + 1}`;

    // Running button
    let runLine, runRingPct = 0, runNum = "", runCap = "";
    if (wi < 0) {
      const d0 = WEEKS[0].days[0];
      runLine = `Starts <b>${dowMd(START)}</b> · ${esc(d0.detail)}`;
      runNum = `0<small>of ${WEEKS[0].miles} mi</small>`; runCap = "Week 1";
    } else if (wi < WEEKS.length) {
      const d = WEEKS[wi].days[monIndex(t)];
      const log = DB.runs[tk];
      const st = weekStats(wi);
      runRingPct = st.logged / st.miles;
      runNum = `${num(st.logged)}<small>of ${st.miles} mi</small>`; runCap = `Week ${wi + 1}`;
      if (log && log.status === "done") runLine = `<span class="done-mark">${I.check}Done</span> · ${num(log.dist)} mi${log.time ? " · " + pace(log.time / log.dist) + "/mi" : ""}`;
      else runLine = d.type === "rest" ? `Today · <b>Rest day</b>` : `Today · <b>${esc(d.title)}</b> · ${mi(d.mi)} mi`;
    } else {
      runLine = `Weeks 8+ are written before Jan 11. See the season plan.`;
      runNum = `${num(totalMiles())}<small>mi total</small>`; runCap = "Season";
      runRingPct = 1;
    }

    // Workout button
    const wk = currentWeek();
    let liftLine;
    const todayLift = t.getDay() === 1 ? "A" : t.getDay() === 4 ? "B" : null;
    if (wi < 0) liftLine = `Starts <b>${dowMd(START)}</b> · Day A, ${esc(STRENGTH.A.title.toLowerCase())}`;
    else if (todayLift && strengthDoneOn(todayLift, tk)) liftLine = `<span class="done-mark">${I.check}Done</span> · ${STRENGTH[todayLift].name}, ${esc(STRENGTH[todayLift].title.toLowerCase())}`;
    else if (todayLift) liftLine = `Today · <b>${STRENGTH[todayLift].name}</b> · ${esc(STRENGTH[todayLift].title)}`;
    else {
      const next = [1, 2, 3, 4, 5, 6, 7].map((n) => addDays(t, n)).find((d) => d.getDay() === 1 || d.getDay() === 4);
      const id = next.getDay() === 1 ? "A" : "B";
      liftLine = `Next · <b>${DOW[next.getDay()]}</b> · ${STRENGTH[id].name}, ${esc(STRENGTH[id].title.toLowerCase())}`;
    }
    const liftCount = wi < 0 ? 0 : weekStrengthCount(t);

    return `
      <section class="view">
        <header class="hero">
          <div class="eyebrow">Road to</div>
          <h1>${esc(PLAN.race.name)}</h1>
          <div class="countdown"><span class="big">${Math.max(0, left)}</span><span class="lbl">days<br>to go</span></div>
          <p class="meta">Sat, Apr 24, 2027 · ${esc(PLAN.race.time)} · ${esc(PLAN.race.place)}</p>
          <div class="phase-track" aria-hidden="true">${track}</div>
          <div class="phase-label"><span>${phaseText}</span><span>${weekText}</span></div>
        </header>

        <div class="big-buttons">
          <button class="big-btn sec-run" data-go="#/run" aria-label="Running plan">
            <div>
              <span class="bb-icon">${I.run}</span>
              <h2>Running</h2>
              <div class="bb-today">${runLine}</div>
            </div>
            <div class="bb-side">
              <div class="bb-ring">${ring(runRingPct, 84, 8)}<div class="num"><span>${runNum}</span></div></div>
              <span class="bb-cap">${runCap}</span>
            </div>
          </button>
          <button class="big-btn sec-lift" data-go="#/lift" aria-label="Workout plan">
            <div>
              <span class="bb-icon">${I.dumbbell}</span>
              <h2>Workout</h2>
              <div class="bb-today">${liftLine}</div>
            </div>
            <div class="bb-side">
              <div class="bb-ring">${ring(liftCount / 2, 84, 8)}<div class="num"><span>${liftCount}<small>of 2</small></span></div></div>
              <span class="bb-cap">This week</span>
            </div>
          </button>
        </div>
        ${wk && wk.loadNote ? `<div class="banner sec-lift">${I.info}<span>Week ${wk.n} strength: ${esc(wk.loadNote)}</span></div>` : ""}

        <div class="links">
          <button class="link-tile" data-go="#/season">${I.calendar}Season</button>
          <button class="link-tile" data-go="#/rules">${I.shield}Rules</button>
          <button class="link-tile" data-go="#/backup">${I.save}Backup</button>
        </div>
        <p class="foot">${num(totalMiles())} mi logged this season</p>
      </section>`;
  }

  /* ---------- Running: week ---------- */
  function pacesCard() {
    if (!DB.fiveK) {
      return `<div class="card pace-card">
        <div class="info-card" style="padding:0">
          <span class="ic">${I.gauge}</span>
          <div><h3>Training paces</h3><p>Set by the 5K time trial on Wed, Dec 2. Until then: intervals hard but even, tempo comfortably hard.</p></div>
        </div>
        <button class="btn block" data-go="#/paces">Enter a 5K time</button>
      </div>`;
    }
    const p = DB.fiveK / 3.10686;
    return `<button class="card pace-card" data-go="#/paces" style="text-align:left;width:100%">
      <div class="section-title" style="margin:0">Training paces <span class="chip accent">5K ${dur(DB.fiveK)}</span></div>
      <div class="pace-grid">
        <div class="pace-cell"><div class="k">5K pace</div><div class="v">${pace(p)}<small>/mi</small></div></div>
        <div class="pace-cell"><div class="k">Tempo</div><div class="v">${pace(p + 25)}–${pace(p + 30)}</div></div>
        <div class="pace-cell"><div class="k">Marathon goal</div><div class="v">${pace(PLAN.marathonGoalPace)}<small>/mi</small></div></div>
      </div>
    </button>`;
  }

  function runWeekView(wi) {
    const t = today(), tw = weekIndexFor(t);
    const w = WEEKS[wi];
    const st = weekStats(wi);
    const chips = WEEKS.map((x, i) => `<button class="chip-week" data-go="#/run/w${x.n}" aria-pressed="${i === wi}" aria-label="Week ${x.n}">W${x.n}${i === tw ? '<i class="now-dot"></i>' : ""}</button>`).join("")
      + `<button class="chip-week" data-go="#/season" aria-pressed="false">Later</button>`;

    const rows = w.days.map((d, di) => {
      const date = dayDate(wi, di), key = iso(date), log = DB.runs[key];
      const isToday = key === iso(t);
      const past = date < t;
      const sub = [];
      if (log && log.status === "done") sub.push(`<span class="mini ok">${num(log.dist)} mi${log.time ? " · " + pace(log.time / log.dist) + "/mi" : ""}${log.hr ? " · " + log.hr + " bpm" : ""}</span>`);
      else if (log && log.status === "skipped") sub.push(`<span class="mini">Skipped</span>`);
      else sub.push(`<span class="mini">${esc(TYPES[d.type])}</span>`);
      if (d.strength) {
        const sd = strengthDoneOn(d.strength, key);
        sub.push(`<span class="mini lift">${sd ? I.check : I.dumbbell}Strength ${d.strength}</span>`);
      }
      if (d.tag) sub.push(`<span class="mini tag">${esc(d.tag)}</span>`);
      let status = I.chev;
      if (log && log.status === "done") status = `<span class="st-done">${I.check}</span>`;
      else if (log && log.status === "skipped") status = `<span class="st-skip">–</span>`;
      else if (past && d.mi > 0) status = `<span class="st-miss" title="Not logged"></span>`;
      return `
        <button class="day-row type-${d.type}${isToday ? " today" : ""}${d.type === "rest" ? " is-rest" : ""}" data-go="#/run/w${w.n}/${di}" aria-label="${DOW[date.getDay()]} ${md(date)}: ${esc(d.detail)}">
          <span class="dr-date"><b>${DOW[date.getDay()]}</b><small>${md(date)}</small></span>
          <span class="dr-main">
            <span class="dr-title"><i class="tdot"></i>${esc(d.title)}${isToday ? '<span class="pill-today">Today</span>' : ""}</span>
            <span class="dr-sub">${sub.join("")}</span>
          </span>
          <span class="dr-mi">${d.mi > 0 ? `${mi(d.mi)}<small>mi</small>` : ""}</span>
          <span class="dr-status">${status}</span>
        </button>`;
    }).join("");

    return `
      <section class="view sec-run">
        ${topbar("#/", "Home", "Running")}
        <nav class="week-chips" aria-label="Weeks">${chips}</nav>
        <div class="week-head">
          <div>
            <div class="eyebrow">${esc(w.phase)}${w.light ? " · Lighter week" : ""}</div>
            <h1>Week ${w.n}</h1>
            <div class="dates">${esc(w.dates)} · ${esc(w.label)}</div>
          </div>
          <div class="week-ring">${ring(st.logged / st.miles, 92, 9)}<div class="num"><span>${num(st.logged)}<small>of ${st.miles} mi</small></span></div></div>
        </div>
        <div class="progress-line"><div class="bar-track"><div class="bar-fill" style="width:${Math.round((st.done / Math.max(1, st.planned)) * 100)}%"></div></div><span>${st.done} of ${st.planned} runs</span></div>

        <div class="section-title">This week</div>
        <div class="days">${rows}</div>

        <div class="section-title">Paces</div>
        ${pacesCard()}
        <div class="btn-row">
          <button class="btn" data-go="#/season">${I.calendar}Season</button>
          <button class="btn" data-go="#/rules">${I.shield}Rules</button>
        </div>
      </section>`;
  }

  /* ---------- Running: day ---------- */
  let formFeel = null;

  function targetCards(d) {
    if (d.type === "rest") {
      return infoCard(I.moon, "Rest day", "Recovery is training. Sleep 8–9 hours and hit 175–190 g of protein.");
    }
    if (EASY_TYPES.includes(d.type)) {
      let s = infoCard(I.heart, `Heart rate ${HR_CAP} or lower`, "Walk the hills if needed to hold it. Pace doesn't matter today.");
      if (d.type === "strides") s += infoCard(I.zap, "Strides", "20 seconds building to fast but relaxed. Full walk-back recovery between each.");
      return s;
    }
    if (d.type === "tt") {
      return infoCard(I.flag, "All-out 5K", `Flat track or towpath. Your time sets every interval and tempo pace that follows.${DB.fiveK ? " Current 5K: " + dur(DB.fiveK) + "." : ""} Goal benchmark: ${dur(PLAN.fiveKGoal)}.`);
    }
    const r = paceFor(d.pace);
    const why = { "5k": "5K pace from your time trial.", "5k+10": "5K pace + 10 sec/mi.", "5k-5": "Slightly faster than 5K pace.", tempo: "5K pace + 25–30 sec/mi." }[d.pace];
    if (r) return infoCard(I.gauge, `Target ${paceRange(r)}`, why + (d.type === "intervals" ? " Last rep as fast as the first." : " Comfortably hard."));
    return d.type === "tempo"
      ? infoCard(I.gauge, "Comfortably hard", "About 1-hour race effort. Exact paces appear once you enter your 5K time.")
      : infoCard(I.gauge, "Hard but even", "The last rep as fast as the first. Exact paces appear once you enter your 5K time.");
  }

  function runDayView(wi, di) {
    const w = WEEKS[wi], d = w.days[di];
    const date = dayDate(wi, di), key = iso(date), log = DB.runs[key] || null;
    formFeel = log && log.feel ? String(log.feel) : null;
    const isToday = key === iso(today());

    let logBlock = "";
    if (d.type !== "rest" || log) {
      const v = (x) => (x == null || x === "" ? "" : esc(x));
      const t = log && log.time ? log.time : null;
      const th = t ? Math.floor(t / 3600) : "", tm = t ? Math.floor((t % 3600) / 60) : "", ts = t ? t % 60 : "";
      const fk = log && log.fiveK ? log.fiveK : null;

      let summary = "";
      if (log && log.status === "done") {
        const hrWarn = log.hr && EASY_TYPES.includes(d.type) && log.hr > HR_CAP;
        summary = `
          <div class="status-banner">${I.check}Logged ${num(log.dist)} mi${isToday ? " today" : ""}</div>
          <div class="result">
            <div class="cell"><div class="k">Time</div><div class="v">${log.time ? dur(log.time) : "–"}</div></div>
            <div class="cell"><div class="k">Pace</div><div class="v">${log.time ? pace(log.time / log.dist) : "–"}</div></div>
            <div class="cell"><div class="k">Avg HR</div><div class="v ${log.hr ? (hrWarn ? "warn" : "ok") : ""}">${log.hr || "–"}</div></div>
          </div>
          ${hrWarn ? `<div class="banner">${I.alert}<span>Above the ${HR_CAP} cap for an easy run. Slow down and walk the hills next time.</span></div>` : ""}`;
      } else if (log && log.status === "skipped") {
        summary = `<div class="status-banner skip">Marked as skipped${d.type === "intervals" || d.type === "tempo" ? ". A missed hard day is skipped, not moved." : "."}</div>`;
      }

      logBlock = `
        ${summary}
        <section class="log-card">
          <h2 class="card-h">${log && log.status === "done" ? "Edit this run" : "Log this run"}</h2>
          <div class="field-grid">
            <label class="field"><span>Distance</span><div class="input-wrap"><input id="r-dist" type="text" inputmode="decimal" autocomplete="off" placeholder="${d.mi || "0"}" value="${v(log && log.dist)}"><em>mi</em></div></label>
            <label class="field"><span>Avg HR</span><div class="input-wrap"><input id="r-hr" type="text" inputmode="numeric" autocomplete="off" placeholder="${EASY_TYPES.includes(d.type) ? "≤" + HR_CAP : "–"}" value="${v(log && log.hr)}"><em>bpm</em></div></label>
          </div>
          <div class="field">
            <span class="field-label">Time</span>
            <div class="time-inputs">
              <div class="input-wrap"><input id="r-h" type="text" inputmode="numeric" placeholder="0" aria-label="Hours" value="${v(th)}"></div><b>:</b>
              <div class="input-wrap"><input id="r-m" type="text" inputmode="numeric" placeholder="00" aria-label="Minutes" value="${v(tm)}"></div><b>:</b>
              <div class="input-wrap"><input id="r-s" type="text" inputmode="numeric" placeholder="00" aria-label="Seconds" value="${v(ts)}"></div>
            </div>
            <small class="hint">hours : minutes : seconds. Pace is worked out for you.</small>
          </div>
          ${d.type === "tt" ? `
          <div class="field">
            <span class="field-label">5K time</span>
            <div class="time-inputs two">
              <div class="input-wrap"><input id="r-tm" type="text" inputmode="numeric" placeholder="22" aria-label="5K minutes" value="${fk ? Math.floor(fk / 60) : ""}"></div><b>:</b>
              <div class="input-wrap"><input id="r-ts" type="text" inputmode="numeric" placeholder="30" aria-label="5K seconds" value="${fk ? fk % 60 : ""}"></div>
            </div>
            <small class="hint">Saving this sets your interval and tempo paces.</small>
          </div>` : ""}
          <div class="field">
            <span class="field-label">How it felt</span>
            <div class="feel" role="group" aria-label="How it felt">
              ${FEEL.map(([k, l]) => `<button type="button" data-feel="${k}" aria-pressed="${formFeel === k}"><b>${k}</b>${l}</button>`).join("")}
            </div>
          </div>
          <label class="field"><span>Notes</span><textarea id="r-notes" placeholder="Body Battery, hip, fueling, weather…">${v(log && log.notes)}</textarea></label>
          <button class="btn primary block" style="margin-top:16px" data-action="save-run" data-key="${key}" data-w="${wi}" data-d="${di}">${I.check}${log && log.status === "done" ? "Update run" : "Save run"}</button>
          <div class="btn-row" style="grid-template-columns:1fr auto">
            <button class="btn ghost" data-action="skip-run" data-key="${key}">Mark skipped</button>
            ${log ? `<button class="text-btn" data-action="clear-run" data-key="${key}">Clear</button>` : "<span></span>"}
          </div>
        </section>`;
    }

    const strengthCard = d.strength ? `
      <button class="card info-card sec-lift" data-go="#/lift/${d.strength}" style="width:100%;text-align:left;margin-top:10px">
        <span class="ic">${I.dumbbell}</span>
        <div><h3>Strength ${d.strength} today${strengthDoneOn(d.strength, key) ? ' <span class="chip ok">Done</span>' : ""}</h3><p>${esc(STRENGTH[d.strength].title)} · ${esc(STRENGTH[d.strength].duration)}. Tap to open.</p></div>
      </button>` : "";

    return `
      <section class="view sec-run type-${d.type}">
        ${topbar("#/run/w" + w.n, "Week " + w.n, "Running")}
        <div class="eyebrow">${dowMd(date)} · Week ${w.n}</div>
        <div class="day-hero">
          <div>
            <h1>${esc(d.title)}</h1>
            <div class="chips"><span class="chip"><i class="tdot"></i>${esc(TYPES[d.type])}</span>${isToday ? '<span class="chip accent">Today</span>' : ""}${d.tag ? `<span class="chip warn">${esc(d.tag)}</span>` : ""}</div>
          </div>
          ${d.mi > 0 ? `<div class="miles"><b>${mi(d.mi)}</b><span>miles</span></div>` : ""}
        </div>
        <div class="card" style="margin-top:16px"><p class="session-detail" style="margin:0">${esc(d.detail)}</p></div>
        <div class="stack" style="margin-top:10px">
          ${targetCards(d)}
          ${d.type !== "rest" ? infoCard(I.battery, "Before you run", "Body Battery 40+: run as planned. Below 30: skip. Hip, hamstring or adductor pain that changes your stride: stop and walk home.", "warn") : ""}
        </div>
        ${strengthCard}
        ${logBlock}
        <div class="nav-row">
          ${di > 0 || wi > 0 ? `<button class="btn" data-go="${di > 0 ? `#/run/w${w.n}/${di - 1}` : `#/run/w${w.n - 1}/6`}">Previous day</button>` : "<span></span>"}
          ${di < 6 || wi < WEEKS.length - 1 ? `<button class="btn" data-go="${di < 6 ? `#/run/w${w.n}/${di + 1}` : `#/run/w${w.n + 1}/0`}">Next day</button>` : "<span></span>"}
        </div>
      </section>`;
  }

  function saveRun(btn) {
    const key = btn.dataset.key, d = WEEKS[+btn.dataset.w].days[+btn.dataset.d];
    const val = (id) => { const el = document.getElementById(id); return el ? parseNum(el.value) : null; };
    const dist = val("r-dist"), hr = val("r-hr"), h = val("r-h"), m = val("r-m"), s = val("r-s");
    if ([dist, hr, h, m, s].some((x) => Number.isNaN(x))) { toast("Check the numbers"); return; }
    if (!dist) { toast("Enter the distance"); document.getElementById("r-dist").focus(); return; }
    const time = Math.round((h || 0) * 3600 + (m || 0) * 60 + (s || 0));
    const notes = (document.getElementById("r-notes").value || "").trim();
    const rec = { status: "done", dist: dist, time: time || null, hr: hr ? Math.round(hr) : null, feel: formFeel ? Number(formFeel) : null, notes: notes, saved: new Date().toISOString() };
    if (d.type === "tt") {
      const fm = val("r-tm"), fs = val("r-ts");
      if (Number.isNaN(fm) || Number.isNaN(fs)) { toast("Check the 5K time"); return; }
      if (fm || fs) { rec.fiveK = Math.round((fm || 0) * 60 + (fs || 0)); DB.fiveK = rec.fiveK; }
    }
    DB.runs[key] = rec;
    if (save()) toast(rec.fiveK ? "Run saved. Paces updated." : "Run saved");
    render();
  }

  /* ---------- Paces ---------- */
  function pacesView() {
    const fk = DB.fiveK;
    const p = fk ? fk / 3.10686 : null;
    const rows = p ? [
      ["5K pace", pace(p) + "/mi", "Wed intervals: 800s, 1,000s"],
      ["Slightly faster", pace(p - 8) + "–" + pace(p - 3) + "/mi", "400 m repeats"],
      ["5K + 10 sec", pace(p + 10) + "/mi", "Mile repeats"],
      ["Tempo", pace(p + 25) + "–" + pace(p + 30) + "/mi", "Sat tempo runs"],
      ["Marathon goal", pace(PLAN.marathonGoalPace) + "/mi", "3:30 marathon"],
    ] : [];
    const vsGoal = fk ? fk - PLAN.fiveKGoal : null;
    return `
      <section class="view sec-run">
        ${topbar("#/run", "Running", "Paces")}
        <h1 class="page-title">Training paces</h1>
        <p class="page-sub">Your 5K time trial sets the pace for every interval and tempo session.</p>
        <section class="log-card">
          <h2 class="card-h">5K time</h2>
          <div class="time-inputs two">
            <div class="input-wrap"><input id="p-m" type="text" inputmode="numeric" placeholder="22" aria-label="Minutes" value="${fk ? Math.floor(fk / 60) : ""}"><em>min</em></div><b>:</b>
            <div class="input-wrap"><input id="p-s" type="text" inputmode="numeric" placeholder="30" aria-label="Seconds" value="${fk ? fk % 60 : ""}"><em>sec</em></div>
          </div>
          <button class="btn primary block" style="margin-top:14px" data-action="save-5k">${I.check}Save 5K time</button>
        </section>
        ${p ? `
          <div class="section-title">Your paces</div>
          <div class="card">
            <ul class="history">${rows.map(([k, v, n]) => `<li style="grid-template-columns:1fr auto"><span><strong>${k}</strong><br><span class="d">${n}</span></span><span class="s" style="font-family:'Barlow Condensed';font-weight:700;font-size:22px">${v}</span></li>`).join("")}</ul>
          </div>
          ${infoCard(vsGoal <= 0 ? I.up : I.flag, vsGoal <= 0 ? "At or under the 22:30 benchmark" : `${dur(vsGoal)} off the 22:30 benchmark`, "A 22:30 5K is the marker for a 3:30 marathon.", vsGoal <= 0 ? "up" : "")}` : ""}
      </section>`;
  }

  /* ---------- Season + rules ---------- */
  function seasonView() {
    const pi = phaseIndexFor(today());
    const phases = PHASES.map((p, i) => `
      <div class="phase ${i < pi ? "past" : i === pi ? "now" : ""}">
        <h3>${esc(p.name)}${i === pi ? ' <span class="chip accent">Now</span>' : ""}</h3>
        <div class="when">${esc(p.dates)} · ${esc(p.volume)}${p.note ? " · " + esc(p.note) : ""}</div>
        ${p.details ? `<ul class="list">${p.details.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${i < 2 ? `<button class="text-btn" data-go="#/run/w${i === 0 ? 1 : 2}">Open the weeks</button>` : ""}
      </div>`).join("");
    return `
      <section class="view sec-run">
        ${topbar("#/", "Home", "Season")}
        <h1 class="page-title">Six phases to race day</h1>
        <p class="page-sub">Mileage climbs from about 22 to 65 miles a week, with the marathon checkpoint six weeks before C&amp;O.</p>
        <div class="timeline">${phases}</div>
        ${infoCard(I.info, "Weeks 8 and later", "Week-by-week detail is written before January 11, using your 5K result and how the first seven weeks went.")}
        <div class="section-title">Goals</div>
        <div class="card"><ul class="list">${PLAN.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
      </section>`;
  }

  function rulesView() {
    const days = [["Mon", "Rest", "Day A: lower body + core"], ["Tue", "Easy + 6 × 20-sec strides", "–"], ["Wed", "Intervals (hard day 1)", "–"], ["Thu", "Easy", "Day B: upper body + core"], ["Fri", "Rest", "–"], ["Sat", "Tempo (hard day 2)", "–"], ["Sun", "Long run, HR 145 or lower", "–"]];
    return `
      <section class="view sec-run">
        ${topbar("#/", "Home", "Rules")}
        <h1 class="page-title">Ground rules</h1>
        <p class="page-sub">Two hard days a week, Wednesday and Saturday. Everything else is easy running or strength.</p>
        <div class="section-title">Every week</div>
        <div class="card"><ul class="history">${days.map(([d, r, s]) => `<li><span class="d">${d}</span><span class="s">${esc(r)}${s !== "–" ? `<br><span style="color:var(--lift);font-weight:600">${esc(s)}</span>` : ""}</span></li>`).join("")}</ul></div>
        <div class="section-title">Rules</div>
        <div class="card"><ul class="list">${RULES.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
        <div class="section-title">Strength progression</div>
        <div class="card sec-lift"><ul class="list">${PROGRESSION.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
      </section>`;
  }

  /* ---------- Workout ---------- */
  function liftHomeView() {
    const t = today(), tk = iso(t), wk = currentWeek();
    const cards = ["A", "B"].map((id) => {
      const s = STRENGTH[id];
      const isToday = t.getDay() === s.dow;
      const doneToday = strengthDoneOn(id, tk);
      const last = strengthLastDate(id);
      const status = [];
      if (doneToday) status.push(`<span class="chip ok">${I.check}Done today</span>`);
      else if (isToday) status.push(`<span class="chip accent">Today</span>`);
      if (last && last !== tk) status.push(`<span class="chip">Last: ${md(pd(last))}</span>`);
      if (!last) status.push(`<span class="chip">Not started</span>`);
      return `
        <button class="session-card${isToday ? " today" : ""}" data-go="#/lift/${id}" aria-label="${s.name}: ${esc(s.title)}">
          <span class="letter">${id}</span>
          <div>
            <h2>${esc(s.title)}</h2>
            <div class="sc-sub">${s.day} · ${s.exercises.length} exercises · ${esc(s.duration)}</div>
            <div class="sc-status">${status.join("")}</div>
          </div>
          ${I.chev}
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        ${topbar("#/", "Home", "Workout")}
        <div class="eyebrow">Planet Fitness · 2 sessions a week</div>
        <h1 class="page-title">Strength</h1>
        <p class="page-sub">Part of the plan, not optional. The left hip and glute are the main injury risk.</p>
        ${wk && wk.loadNote ? `<div class="banner">${I.info}<span>Week ${wk.n}: ${esc(wk.loadNote)}</span></div>` : ""}
        <div style="margin-top:16px">${cards}</div>
        <div class="section-title">How to progress</div>
        <div class="card"><ul class="list">${PROGRESSION.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
      </section>`;
  }

  function liftDayView(id) {
    const s = STRENGTH[id], tk = iso(today()), wk = currentWeek();
    let complete = 0;
    const rows = s.exercises.map((ex, i) => {
      const todaySets = liftSets(ex.id, tk);
      const done = doneSets(todaySets).length;
      const isComplete = done >= ex.sets;
      if (isComplete) complete++;
      const last = lastSession(ex.id, tk);
      const up = last && hitTop(ex, last.sets);
      const lastText = done
        ? `Today: ${esc(summarize(ex, todaySets))}`
        : last ? `Last ${md(pd(last.date))}: ${esc(summarize(ex, last.sets))}${up ? ` · <span class="up">${ex.kind === "load" ? "add weight" : "progress"}</span>` : ""}` : "Not logged yet";
      const state = isComplete ? `<span class="st-done">${I.check}</span>` : done ? `<span class="st-part">${done}/${ex.sets}</span>` : I.chev;
      return `
        <button class="ex-row${isComplete ? " complete" : ""}" data-go="#/lift/${id}/${i}" aria-label="${esc(ex.name)}">
          <span class="num" aria-hidden="true"></span>
          <span>
            <span class="name" style="display:block">${esc(ex.name)}</span>
            <span class="target" style="display:block"><strong>${ex.sets} × ${esc(ex.reps)}</strong>${ex.side ? " " + esc(ex.side) : ""} · ${esc(ex.purpose)}</span>
            <span class="last" style="display:block">${lastText}</span>
          </span>
          <span class="ex-state">${state}</span>
        </button>`;
    }).join("");
    return `
      <section class="view sec-lift">
        ${topbar("#/lift", "Workout", s.name)}
        <div class="eyebrow">${s.name} · ${s.day}</div>
        <h1 class="page-title">${esc(s.title)}</h1>
        <p class="page-sub">${esc(s.duration)}${id === "A" ? " · Never train legs to failure." : ""}</p>
        <div class="progress-line"><div class="bar-track"><div class="bar-fill" style="width:${Math.round((complete / s.exercises.length) * 100)}%"></div></div><span>${complete} of ${s.exercises.length} done today</span></div>
        ${wk && wk.loadNote ? `<div class="banner">${I.info}<span>Week ${wk.n}: ${esc(wk.loadNote)}</span></div>` : ""}
        <div class="card" style="margin-top:14px"><div class="eyebrow" style="margin-bottom:4px">Warm-up</div><p style="margin:0;color:var(--muted)">${esc(s.warmup)}</p></div>
        <div class="section-title">Exercises</div>
        <div class="ex-list">${rows}</div>
      </section>`;
  }

  let current = null; // { ex, dayId } while an exercise screen is open

  function setRows(ex) {
    const tk = iso(today());
    const sets = liftSets(ex.id, tk) || [];
    const last = lastSession(ex.id, tk);
    const lastSets = last ? doneSets(last.sets) : [];
    const n = Math.max(ex.sets, sets.length);
    const top = topOf(ex.reps);
    let out = "";
    for (let i = 0; i < n; i++) {
      const s = sets[i] || {};
      const ph = lastSets.length ? lastSets[Math.min(i, lastSets.length - 1)] : null;
      const wPh = ph && ph.w != null ? num(ph.w) : ex.optionalLoad ? "BW" : "–";
      const rPh = ph && ph.r != null ? ph.r : top;
      out += `
        <div class="set-row${s.done ? " done" : ""}" data-i="${i}">
          <span class="set-n">${i + 1}</span>
          ${ex.kind === "load" ? `<input class="set-in" data-f="w" type="text" inputmode="decimal" autocomplete="off" placeholder="${wPh}" value="${s.w != null ? num(s.w) : ""}" aria-label="Set ${i + 1} weight in pounds">` : ""}
          <input class="set-in" data-f="r" type="text" inputmode="numeric" autocomplete="off" placeholder="${rPh}" value="${s.r != null ? s.r : ""}" aria-label="Set ${i + 1} ${ex.kind === "time" ? "seconds" : "reps"}">
          <button class="set-check" data-check="${i}" aria-pressed="${!!s.done}" aria-label="Set ${i + 1} done">${I.check}</button>
        </div>`;
    }
    return out;
  }

  function exerciseView(id, idx) {
    const s = STRENGTH[id], ex = s.exercises[idx], tk = iso(today());
    current = { ex: ex, dayId: id };
    const last = lastSession(ex.id, tk);
    const hint = hintFor(ex, last);
    const wk = currentWeek();
    const done = doneSets(liftSets(ex.id, tk)).length;
    const history = Object.keys(DB.lifts[ex.id] || {}).filter((k) => doneSets(DB.lifts[ex.id][k]).length).sort().reverse().slice(0, 6);
    const prev = idx > 0 ? `#/lift/${id}/${idx - 1}` : null;
    const next = idx < s.exercises.length - 1 ? `#/lift/${id}/${idx + 1}` : null;
    const col = ex.kind === "time" ? "Seconds" : "Reps";

    return `
      <section class="view sec-lift">
        ${topbar("#/lift/" + id, s.name, `${idx + 1} of ${s.exercises.length}`)}
        <div class="eyebrow">${s.name} · ${esc(s.title)}</div>
        <h1 class="page-title" style="font-size:34px">${esc(ex.name)}</h1>
        <div class="figure"><img src="images/${esc(ex.id)}.jpg" alt="How to do ${esc(ex.name)}" onerror="this.parentNode.remove()"></div>
        <div class="target-row">
          <div class="cell"><div class="k">Target</div><div class="v">${ex.sets} × ${esc(ex.reps)}${ex.side ? `<small>${esc(ex.side)}</small>` : ""}</div></div>
          <div class="cell"><div class="k">Purpose</div><div class="purpose">${esc(ex.purpose)}</div></div>
        </div>
        <div style="margin-top:10px">${infoCard(hint.tone === "up" ? I.up : I.info, esc(hint.title), esc(hint.text) + (wk && wk.loadNote ? " " + esc(wk.loadNote) : ""), hint.tone === "up" ? "up" : "")}</div>

        <section class="sets${ex.kind === "load" ? "" : " no-load"}" aria-label="Sets">
          <div class="sets-head"><span>Set</span>${ex.kind === "load" ? `<span>${unitOf(ex)}</span>` : ""}<span>${col}</span><span>Done</span></div>
          <div id="set-rows">${setRows(ex)}</div>
          <div class="sets-foot">
            <button class="add-set" data-action="add-set">${I.plus}Add set</button>
            <span class="count" id="set-count">${done} of ${ex.sets} sets done</span>
          </div>
        </section>

        <div class="section-title">How to do it</div>
        <div class="card"><ol class="list" style="padding-left:20px">${ex.cues.map((c) => `<li style="color:var(--text)">${esc(c)}</li>`).join("")}</ol></div>

        <div class="section-title">History</div>
        <div class="card">${history.length ? `<ul class="history">${history.map((k) => `<li><span class="d">${k === tk ? "Today" : md(pd(k))}</span><span class="s">${esc(summarize(ex, DB.lifts[ex.id][k]))}</span></li>`).join("")}</ul>` : `<p class="empty">Your sessions will show here.</p>`}</div>

        <div class="nav-row">
          ${prev ? `<button class="btn" data-go="${prev}">Previous</button>` : `<button class="btn" disabled>Previous</button>`}
          <button class="btn primary" data-go="${next || "#/lift/" + id}">${next ? "Next exercise" : "Finish"}</button>
        </div>
      </section>`;
  }

  function ensureToday(ex, i) {
    const tk = iso(today());
    DB.lifts[ex.id] = DB.lifts[ex.id] || {};
    const arr = DB.lifts[ex.id][tk] = DB.lifts[ex.id][tk] || [];
    const n = Math.max(ex.sets, i + 1, document.querySelectorAll("#set-rows .set-row").length);
    while (arr.length < n) arr.push({ w: null, r: null, done: false });
    return arr;
  }
  function updateSetCount() {
    if (!current) return;
    const el = document.getElementById("set-count");
    if (el) el.textContent = `${doneSets(liftSets(current.ex.id, iso(today()))).length} of ${current.ex.sets} sets done`;
  }
  function onSetInput(input) {
    const ex = current.ex, row = input.closest(".set-row"), i = +row.dataset.i;
    const v = parseNum(input.value);
    if (Number.isNaN(v)) return;
    const arr = ensureToday(ex, i);
    arr[i][input.dataset.f] = v;
    save();
  }
  function onCheck(btn) {
    const ex = current.ex, row = btn.closest(".set-row"), i = +row.dataset.i;
    const arr = ensureToday(ex, i), s = arr[i];
    if (!s.done) {
      const wIn = row.querySelector('[data-f="w"]'), rIn = row.querySelector('[data-f="r"]');
      if (wIn && wIn.value.trim() === "" && isFinite(Number(wIn.placeholder))) { wIn.value = wIn.placeholder; s.w = Number(wIn.placeholder); }
      if (rIn.value.trim() === "" && isFinite(Number(rIn.placeholder))) { rIn.value = rIn.placeholder; s.r = Number(rIn.placeholder); }
      if (wIn) { const w = parseNum(wIn.value); s.w = Number.isNaN(w) ? null : w; }
      const r = parseNum(rIn.value); s.r = Number.isNaN(r) ? null : r;
      if (s.r == null) { toast(ex.kind === "time" ? "Enter the seconds" : "Enter the reps"); rIn.focus(); return; }
      if (ex.kind === "load" && s.w == null && !ex.optionalLoad) { toast("Enter the weight"); wIn.focus(); return; }
      s.done = true;
      startRest(HEAVY.includes(ex.id) ? 120 : ex.kind === "load" ? 90 : 45);
    } else {
      s.done = false;
    }
    if (save()) {
      row.classList.toggle("done", s.done);
      btn.setAttribute("aria-pressed", String(s.done));
      updateSetCount();
      if (s.done && doneSets(arr).length >= ex.sets) toast("All sets done");
    }
  }

  /* ---------- Rest timer ---------- */
  let rest = null, restTick = null;
  function startRest(sec) {
    rest = { end: Date.now() + sec * 1000, total: sec * 1000 };
    restBar.hidden = false;
    document.body.classList.add("resting");
    restBar.innerHTML = `<div class="rest-inner"><div class="rl"><span>Rest</span><b class="rest-time">${dur(sec)}</b></div>
      <button data-rest="-15" aria-label="15 seconds less">−15</button><button data-rest="15" aria-label="15 seconds more">+15</button><button class="skip" data-rest="stop">Skip</button><i class="rest-prog"></i></div>`;
    clearInterval(restTick);
    restTick = setInterval(tickRest, 250);
    tickRest();
  }
  function tickRest() {
    if (!rest) return;
    const leftMs = rest.end - Date.now();
    if (leftMs <= 0) {
      clearInterval(restTick); rest = null;
      restBar.innerHTML = `<div class="rest-inner over"><div class="rl"><b class="rest-time">Rest over · next set</b></div><button data-rest="stop">OK</button></div>`;
      try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* not supported */ }
      setTimeout(() => { if (!rest) stopRest(); }, 5000);
      return;
    }
    const t = restBar.querySelector(".rest-time"), p = restBar.querySelector(".rest-prog");
    if (t) t.textContent = dur(Math.ceil(leftMs / 1000));
    if (p) p.style.width = Math.max(0, Math.min(100, (1 - leftMs / rest.total) * 100)) + "%";
  }
  function stopRest() {
    clearInterval(restTick); rest = null;
    restBar.hidden = true; restBar.innerHTML = "";
    document.body.classList.remove("resting");
  }
  restBar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rest]");
    if (!b) return;
    const a = b.dataset.rest;
    if (a === "stop") { stopRest(); return; }
    if (rest) { rest.end += Number(a) * 1000; rest.total = Math.max(rest.total + Number(a) * 1000, 1000); tickRest(); }
  });

  /* ---------- Backup ---------- */
  function backupView() {
    const runs = Object.values(DB.runs).filter((r) => r.status === "done").length;
    const sessions = new Set();
    Object.values(DB.lifts).forEach((byDate) => Object.keys(byDate).forEach((k) => { if (doneSets(byDate[k]).length) sessions.add(k); }));
    return `
      <section class="view sec-run">
        ${topbar("#/", "Home", "Backup")}
        <h1 class="page-title">Your data</h1>
        <p class="page-sub">Everything you log is saved on this phone only. Export a backup now and then, and always open the app from the home screen icon.</p>
        <div class="stat-grid">
          <div class="cell"><div class="k">Runs</div><div class="v">${runs}</div></div>
          <div class="cell"><div class="k">Miles</div><div class="v">${num(totalMiles())}</div></div>
          <div class="cell"><div class="k">Lift days</div><div class="v">${sessions.size}</div></div>
        </div>
        <div class="stack" style="margin-top:16px">
          <button class="btn primary block" data-action="export">${I.save}Export backup</button>
          <button class="btn block" data-action="import">${I.upload}Restore from backup</button>
          <input id="import-file" class="file-input" type="file" accept="application/json,.json">
        </div>
        <div style="margin-top:16px">${infoCard(I.info, "Moving to a new phone?", "Export here, save the file to iCloud Drive, then open the app on the new phone and restore it.")}</div>
      </section>`;
  }
  async function exportData() {
    const name = `training-backup-${iso(today())}.json`;
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: "application/json" });
    try {
      const file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Training backup" });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); } catch (e) { toast("That file isn't a backup"); return; }
      if (!data || typeof data !== "object" || (!data.runs && !data.lifts)) { toast("That file isn't a backup"); return; }
      if (!confirm("Replace what's on this phone with the backup?")) return;
      DB = norm(data);
      if (save()) toast("Backup restored");
      render();
    };
    reader.readAsText(file);
  }

  /* ---------- Router ---------- */
  function render() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const t = today();
    const tw = Math.max(0, Math.min(WEEKS.length - 1, weekIndexFor(t)));
    let html;
    current = null;
    const wMatch = parts[1] && /^w(\d+)$/.exec(parts[1]);
    const wi = wMatch ? Number(wMatch[1]) - 1 : tw;
    switch (parts[0]) {
      case "run":
        if (!WEEKS[wi]) { html = runWeekView(tw); break; }
        html = parts[2] !== undefined && WEEKS[wi].days[+parts[2]] ? runDayView(wi, +parts[2]) : runWeekView(wi);
        break;
      case "paces": html = pacesView(); break;
      case "season": html = seasonView(); break;
      case "rules": html = rulesView(); break;
      case "backup": html = backupView(); break;
      case "lift": {
        const s = STRENGTH[parts[1]];
        if (!s) html = liftHomeView();
        else if (parts[2] !== undefined && s.exercises[+parts[2]]) html = exerciseView(parts[1], +parts[2]);
        else html = liftDayView(parts[1]);
        break;
      }
      default: html = homeView();
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  app.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) {
      const h = go.getAttribute("data-go");
      if (location.hash === h) render(); else location.hash = h;
      return;
    }
    const feel = e.target.closest("[data-feel]");
    if (feel) {
      formFeel = formFeel === feel.dataset.feel ? null : feel.dataset.feel;
      app.querySelectorAll("[data-feel]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.feel === formFeel)));
      return;
    }
    const check = e.target.closest("[data-check]");
    if (check && current) { onCheck(check); return; }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.dataset.action;
    if (a === "save-run") saveRun(act);
    else if (a === "skip-run") {
      const notes = (document.getElementById("r-notes") || {}).value || "";
      DB.runs[act.dataset.key] = { status: "skipped", notes: notes.trim(), saved: new Date().toISOString() };
      if (save()) toast("Marked as skipped");
      render();
    } else if (a === "clear-run") {
      if (!confirm("Clear the log for this day?")) return;
      delete DB.runs[act.dataset.key];
      if (save()) toast("Cleared");
      render();
    } else if (a === "save-5k") {
      const m = parseNum(document.getElementById("p-m").value), s = parseNum(document.getElementById("p-s").value);
      if (Number.isNaN(m) || Number.isNaN(s) || (!m && !s)) { toast("Enter minutes and seconds"); return; }
      DB.fiveK = Math.round((m || 0) * 60 + (s || 0));
      if (save()) toast("Paces updated");
      render();
    } else if (a === "add-set" && current) {
      const n = document.querySelectorAll("#set-rows .set-row").length;
      ensureToday(current.ex, n);
      save();
      document.getElementById("set-rows").innerHTML = setRows(current.ex);
    } else if (a === "export") exportData();
    else if (a === "import") document.getElementById("import-file").click();
  });

  app.addEventListener("input", (e) => {
    if (e.target.classList.contains("set-in") && current) onSetInput(e.target);
  });
  app.addEventListener("change", (e) => {
    if (e.target.id === "import-file" && e.target.files && e.target.files[0]) importData(e.target.files[0]);
  });

  window.addEventListener("hashchange", render);
  // Re-render when the app comes back to the foreground on a new day.
  let lastDay = iso(today());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && iso(today()) !== lastDay) { lastDay = iso(today()); render(); }
  });
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* offline support is optional */ });
  }
})();
