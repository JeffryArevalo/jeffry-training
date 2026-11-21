// Jeffry's plan: Nov 23, 2026 to the C&O Canal 100 (Apr 24, 2027).
// Source: "Training_Plan_Nov23_to_CandO_100.docx". Edit this file to change the plan.
//
// Each day: s = session, d = extra detail (optional), mi = miles,
// e = effort: "easy" | "hard" | "race" | "rest", st = strength that day (optional), tag = reminder (optional).
// Days run Monday to Sunday.

const PLAN = {
  start: "2026-11-23", // Monday of Week 1
  race: { name: "C&O Canal 100", date: "2027-04-24", time: "7:00 AM", place: "Knoxville, MD" },
};

const A = "Strength A", B = "Strength B";
const REST = { s: "Rest", mi: 0, e: "rest" };
const easy = (mi, s) => ({ s: s || "Easy", mi: mi, e: "easy" });
const strides = (mi, n) => ({ s: `Easy + ${n || 6} strides`, mi: mi, e: "easy" });
const hard = (mi, s, d) => ({ s: s, d: d, mi: mi, e: "hard" });
const withSt = (day, st, tag) => Object.assign({}, day, { st: st }, tag ? { tag: tag } : {});

const WEEKS = [
  { n: 1, dates: "Nov 23–29", label: "Recovery", total: "about 22 mi", loadNote: "Light loads this week. Learn the machines.",
    days: [withSt(REST, A + " · light"), easy(4), strides(4, 4), withSt(easy(4), B, "Thanksgiving"), REST, easy(4), easy(6, "Long run")] },
  { n: 2, dates: "Nov 30–Dec 6", label: "5K time trial", total: "about 27 mi",
    days: [withSt(REST, A), strides(5), hard(6, "5K time trial", "2 mi warm-up, 5K all-out on a flat track or towpath, 1 mi cool-down"), withSt(easy(4), B), REST, easy(4, "Easy (no tempo this week)"), easy(8, "Long run")] },
  { n: 3, dates: "Dec 7–13", label: "Speed base", total: "about 32 mi",
    days: [withSt(REST, A), strides(5), hard(6.5, "6 × 800 m at 5K pace", "1.5 mi warm-up, 400 m jog between, 1.5 mi cool-down"), withSt(easy(5), B), REST, hard(5.5, "20 min tempo", "2 mi warm-up, 1 mi cool-down"), easy(10, "Long run")] },
  { n: 4, dates: "Dec 14–20", label: "Speed base", total: "about 35 mi",
    days: [withSt(REST, A), strides(5), hard(7, "5 × 1,000 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(5), B), REST, hard(6, "25 min tempo", "Warm-up and cool-down"), easy(12, "Long run")] },
  { n: 5, dates: "Dec 21–27", label: "Lighter week", total: "about 28 mi", loadNote: "Lighter week: drop loads about 20%.",
    days: [withSt(REST, A + " · lighter"), strides(5), hard(5.5, "8 × 400 m, slightly faster than 5K pace", "Warm-up, 200 m jog between, cool-down"), withSt(easy(4), B, "Christmas Eve"), REST, easy(4.5, "Easy + 6 strides (no tempo)"), easy(9, "Long run")] },
  { n: 6, dates: "Dec 28–Jan 3", label: "Speed base", total: "about 38 mi",
    days: [withSt(REST, A), strides(6), hard(7.5, "4 × 1 mile at 5K pace + 10 sec", "Warm-up, 400 m jog between, cool-down"), withSt(easy(5), B), Object.assign({}, REST, { tag: "Register for C&O at midnight" }), hard(7, "2 × 15 min tempo", "Warm-up, 3 min jog between, cool-down"), easy(13, "Long run")] },
  { n: 7, dates: "Jan 4–10", label: "Speed base", total: "about 40 mi",
    days: [withSt(REST, A), strides(6), hard(8, "6 × 1,000 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(5), B), REST, hard(7, "30 min continuous tempo", "Warm-up and cool-down"), easy(14, "Long run")] },
  { n: 8, dates: "Jan 11–17", label: "Marathon build", total: "about 43 mi",
    days: [withSt(REST, A), strides(6), hard(8, "5 × 1 mile at threshold", "Warm-up, 1 min jog between, cool-down"), withSt(easy(6), B), REST, hard(14, "Long run, middle 4 mi at MP"), easy(9, "Easy back-to-back")] },
  { n: 9, dates: "Jan 18–24", label: "Marathon build", total: "about 46 mi",
    days: [withSt(REST, A), strides(6), hard(8, "6 × 1,000 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(7), B), REST, hard(15, "Long run, middle 5 mi at MP"), easy(10, "Easy back-to-back")] },
  { n: 10, dates: "Jan 25–31", label: "Marathon build", total: "about 49 mi",
    days: [withSt(REST, A), strides(7), hard(9, "3 × 2 miles at threshold", "Warm-up, 2 min jog between, cool-down"), withSt(easy(6), B), REST, hard(16, "Long run, middle 6 mi at MP"), easy(11, "Easy back-to-back")] },
  { n: 11, dates: "Feb 1–7", label: "Lighter week + 5K re-test", total: "about 38 mi", loadNote: "Lighter week: drop loads about 20%.",
    days: [withSt(REST, A + " · lighter"), strides(6), hard(6, "5K re-test", "2 mi warm-up, 5K all-out, 1 mi cool-down"), withSt(easy(5), B), REST, easy(12, "Long run, all easy"), easy(9, "Easy back-to-back")] },
  { n: 12, dates: "Feb 8–14", label: "Marathon build", total: "about 51 mi",
    days: [withSt(REST, A), strides(7), hard(9, "5 × 1 mile at 5K pace + 10 sec", "Warm-up, 400 m jog between, cool-down"), withSt(easy(6), B), REST, hard(17, "Long run, middle 7 mi at MP"), easy(12, "Easy back-to-back")] },
  { n: 13, dates: "Feb 15–21", label: "Marathon build", total: "about 54 mi",
    days: [withSt(REST, A), strides(7), hard(9, "4 × 1.5 miles at threshold", "Warm-up, 2 min jog between, cool-down"), withSt(easy(7), B), REST, hard(18, "Long run, middle 8 mi at MP"), easy(13, "Easy back-to-back")] },
  { n: 14, dates: "Feb 22–28", label: "Peak week", total: "about 57 mi",
    days: [withSt(REST, A), strides(8), hard(8, "8 × 800 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(7), B), REST, hard(20, "Long run, middle 10 mi at MP", "Full race fueling"), easy(14, "Easy back-to-back")] },
  { n: 15, dates: "Mar 1–7", label: "Lighter week", total: "about 47 mi", loadNote: "Lighter week: drop loads about 20%.",
    days: [withSt(REST, A + " · lighter"), strides(6), hard(9, "3 × 2 miles at threshold", "Warm-up, 2 min jog between, cool-down"), withSt(easy(6), B), REST, hard(16, "Long run, middle 8 mi at MP"), easy(10, "Easy back-to-back")] },
  { n: 16, dates: "Mar 8–14", label: "Taper", total: "about 40 mi", loadNote: "Taper: Day A at lighter loads.",
    days: [withSt(REST, A + " · lighter"), strides(6), hard(8, "6 × 1,000 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(6), B), REST, hard(12, "Long run, middle 6 mi at MP"), easy(8)] },
  { n: 17, dates: "Mar 15–21", label: "Shamrock race week", total: "about 17 mi + race", loadNote: "Race week: light upper-body session Monday only. No strength Thursday.",
    days: [withSt(REST, "Light upper body only"), strides(5), hard(5, "3 × 1 mile at goal MP", "Warm-up, 2 min jog between, cool-down"), easy(4, "Easy, no strength"), Object.assign({}, REST, { tag: "Travel to Virginia Beach" }), easy(3, "Shakeout + 4 strides"),
      { s: "Shamrock Marathon", d: "7:30 AM. Even pace at goal MP, gels every 30 min from the start", mi: 26.2, e: "race" }] },
  { n: 18, dates: "Mar 22–28", label: "Marathon recovery", total: "about 18 mi", loadNote: "Recovery week: no Day A. Strength B on Thursday.",
    days: [{ s: "Rest, easy walk", mi: 0, e: "rest" }, { s: "Rest or 30 min walk", mi: 0, e: "rest" }, easy(3, "Very easy"), withSt(easy(4), B), REST, easy(5), easy(6)] },
  { n: 19, dates: "Mar 29–Apr 4", label: "100-specific", total: "about 40 mi", loadNote: "Day A at lighter loads this week.",
    days: [withSt(REST, A + " · lighter"), strides(5), hard(6, "4 × 1 mile at threshold", "Warm-up, 1 min jog between, cool-down"), withSt(easy(5), B), REST,
      easy(15, "Long run on the towpath, all easy", "Full 100-mile fueling: 55–60 g carbs/hr + sodium"), easy(9, "Easy back-to-back on tired legs")] },
  { n: 20, dates: "Apr 5–11", label: "Last big weekend", total: "about 53 mi",
    days: [withSt(REST, A), strides(6), hard(7, "5 × 1,000 m at 5K pace", "Warm-up, 400 m jog between, cool-down"), withSt(easy(6), B), REST,
      Object.assign(easy(22, "Long run on the towpath"), { d: "Start before dawn with a headlamp. Full race fueling and race-day gear" }), easy(12, "Easy back-to-back")] },
  { n: 21, dates: "Apr 12–18", label: "Taper", total: "about 35 mi", loadNote: "Light loads. Monday is the last lower-body session.",
    days: [withSt(REST, A + " · light (last)"), strides(5), hard(6, "3 × 1 mile at threshold", "Warm-up, 2 min jog between, cool-down"), withSt(easy(5), B + " · light"), REST,
      Object.assign(easy(12, "Easy long run"), { d: "Race fueling" }), easy(7)] },
  { n: 22, dates: "Apr 19–24", label: "C&O race week", total: "about 11 mi + race", loadNote: "Race week: light upper-body session Monday only.",
    days: [withSt(REST, "Light upper body only"), strides(4, 4), easy(4, "Easy, 2 × 1 mile at MP"), easy(3, "Very easy"), Object.assign({}, REST, { tag: "Pack drop bags, early night" }),
      { s: "C&O Canal 100", d: "7:00 AM. Start slower than feels right, fuel every 30 min from the start", mi: 100, e: "race" }] },
];

// kind: "load" shows a weight box. "bw" = bodyweight or timed, no weight box.
// each: true = weight per dumbbell. Photos load from images/<id>.jpg when present.
const STRENGTH = {
  A: {
    id: "A", name: "Day A", day: "Monday", title: "Lower body + core", duration: "50–60 min",
    warmup: "5 min bike, leg swings, band walks.",
    exercises: [
      { id: "smith-squat", name: "Smith machine squat", target: "3 × 6–8", kind: "load", purpose: "Leg strength, running economy",
        cues: ["Bar on upper back, feet slightly forward of the bar", "Brace, sit down to thighs parallel", "Drive up through mid-foot, knees track over toes"] },
      { id: "rdl", name: "Dumbbell Romanian deadlift", target: "3 × 8", kind: "load", each: true, purpose: "Hamstrings, posterior chain",
        cues: ["Soft knees, flat back, dumbbells close to the legs", "Push the hips back until the hamstrings stretch", "Squeeze glutes to stand, don't lean back"] },
      { id: "hip-thrust", name: "Smith machine hip thrust", target: "3 × 10", kind: "load", purpose: "Glute strength for the left hip",
        cues: ["Upper back on the bench, bar padded across the hips", "Chin tucked, drive through the heels", "Full lockout, squeeze the glutes 1 second"] },
      { id: "bss", name: "Bulgarian split squat (dumbbells)", target: "3 × 8 each leg", kind: "load", each: true, purpose: "Single-leg stability",
        cues: ["Rear foot laces-down on the bench", "Lower straight down, front knee over mid-foot", "Push through the front heel, hips level"] },
      { id: "calf-raise", name: "Single-leg calf raise, straight and bent knee", target: "3 × 12 each leg", kind: "bw", purpose: "Achilles and calf durability",
        cues: ["Ball of the foot on a step, heel hanging", "Full stretch at the bottom, pause at the top", "Half the reps straight-knee, half bent-knee"] },
      { id: "copenhagen", name: "Copenhagen plank", target: "3 × 20 sec each side", kind: "bw", purpose: "Adductors, groin strain history",
        cues: ["Top leg on the bench, forearm under the shoulder", "Lift the hips into a straight line", "Start with the knee on the bench if needed"] },
      { id: "band-walk", name: "Lateral band walk", target: "2 × 20 each direction", kind: "bw", purpose: "Glute medius",
        cues: ["Band above the knees or at the ankles", "Half squat, chest up", "Step wide and slow, keep tension on the band"] },
      { id: "dead-bug", name: "Dead bug", target: "3 × 10 each side", kind: "bw", purpose: "Core control",
        cues: ["Lower back pressed into the floor", "Extend opposite arm and leg slowly", "Exhale as you reach, don't let the back arch"] },
      { id: "pallof", name: "Cable Pallof press", target: "3 × 10 each side", kind: "load", purpose: "Anti-rotation core",
        cues: ["Stand side-on to the cable at chest height", "Press the handle straight out, resist the twist", "Pause 2 seconds, bring it back to the chest"] },
    ],
  },
  B: {
    id: "B", name: "Day B", day: "Thursday", title: "Upper body + core", duration: "40–50 min",
    warmup: "After the easy run. One light set of the first exercise.",
    exercises: [
      { id: "lat-pulldown", name: "Lat pulldown or assisted pull-up", target: "3 × 8–10", kind: "load", purpose: "Back width",
        cues: ["Grip a bit wider than the shoulders", "Pull the bar to the upper chest, elbows down", "Control the bar all the way up"] },
      { id: "db-bench", name: "Dumbbell bench press", target: "3 × 8–10", kind: "load", each: true, purpose: "Chest",
        cues: ["Feet planted, shoulder blades pinched", "Lower to chest level, elbows at about 45 degrees", "Press up and slightly in"] },
      { id: "cable-row", name: "Seated cable row", target: "3 × 10", kind: "load", purpose: "Upper back, posture",
        cues: ["Sit tall, slight knee bend", "Pull to the belly button, squeeze the shoulder blades", "Return slowly without rounding"] },
      { id: "db-shoulder-press", name: "Dumbbell shoulder press", target: "3 × 8–10", kind: "load", each: true, purpose: "Shoulders",
        cues: ["Seated, back against the pad", "Press from ear height to lockout", "Ribs down, no arching"] },
      { id: "lateral-raise", name: "Lateral raise", target: "3 × 12–15", kind: "load", each: true, purpose: "Delts",
        cues: ["Lead with the elbows", "Raise to shoulder height only", "Slow 3-second lower"] },
      { id: "pushdown", name: "Cable tricep pushdown", target: "3 × 12", kind: "load", purpose: "Arms",
        cues: ["Elbows pinned to the sides", "Push down to full extension", "Let the handle rise slowly"] },
      { id: "db-curl", name: "Dumbbell curl", target: "3 × 12", kind: "load", each: true, purpose: "Arms",
        cues: ["Elbows by the sides", "Curl up without swinging", "Lower under control"] },
      { id: "face-pull", name: "Cable face pull", target: "3 × 15", kind: "load", purpose: "Shoulder health",
        cues: ["Rope at face height", "Pull to the face, elbows high and wide", "Squeeze the rear delts"] },
      { id: "knee-raise", name: "Hanging knee raise", target: "3 × 10", kind: "bw", purpose: "Core",
        cues: ["Hang with the shoulders engaged", "Curl the knees up toward the chest", "Lower slowly, no swinging"] },
      { id: "side-plank", name: "Side plank", target: "3 × 30 sec each side", kind: "bw", purpose: "Lateral core, hip stability",
        cues: ["Elbow under the shoulder", "Hips up, body in a straight line", "Breathe, don't let the hips sag"] },
    ],
  },
};

// Exercises with a photo in images/ (full size) and images/thumbs/ (list thumbnail).
const PHOTOS = ["band-walk", "bss", "cable-row", "calf-raise", "copenhagen", "db-bench", "db-curl", "db-shoulder-press", "dead-bug", "face-pull", "hip-thrust", "knee-raise", "lat-pulldown", "lateral-raise", "pallof", "pushdown", "rdl", "side-plank", "smith-squat"];
