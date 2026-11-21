// Jeffry's plan: Nov 23, 2026 to the C&O Canal 100 (Apr 24, 2027).
// Source: "Training Plan Nov 23, 2026 to C&O Canal 100.docx". Edit this file to change the plan.

const PLAN = {
  start: "2026-11-23", // Monday of Week 1
  race: { name: "C&O Canal 100", date: "2027-04-24", time: "7:00 AM", place: "Knoxville, MD" },
  goals: [
    "A-race: C&O Canal 100, Saturday April 24, 2027, 7:00 AM, Knoxville, MD. Registration opens January 1, 2027 at 12:00 AM ET.",
    "Speed goal: a 3:30 marathon (8:00/mi). Benchmarks: about a 22:30 5K or a 1:40 half.",
    "Spring checkpoint: a flat marathon in mid-March. Around 3:50 keeps 3:30 on track for a fall marathon after C&O.",
    "Body composition: strength twice a week and protein at 175–190 g/day.",
  ],
  marathonGoalPace: 480, // 8:00/mi in seconds
  fiveKGoal: 1350,       // 22:30
};

const RULES = [
  "Easy runs and long runs stay at HR 145 or lower. Walk the hills if needed to hold it.",
  "Never more than two hard days a week. A missed hard day is skipped, not moved.",
  "Body Battery 40 or higher: run as planned. Below 30: skip the run.",
  "Weekly mileage rises 10% or less. Every 4th week is a lighter week.",
  "Strength is part of the plan, not optional. The left hip and glute are the main injury risk.",
  "Left hip, hamstring or adductor pain that changes your stride: stop the run and walk home.",
  "Strides = 20 seconds building to fast but relaxed, full walk-back recovery.",
  "Protein 175–190 g/day and 8–9 hours of sleep.",
];

// start/end of the later phases are approximate (the plan says "mid-March", "late March").
const PHASES = [
  { name: "Recovery", dates: "Nov 23–29", volume: "about 22 mi", start: "2026-11-23", end: "2026-11-29" },
  { name: "Speed base", dates: "Nov 30–Jan 10", volume: "27–40 mi/week", note: "5K test Dec 2", start: "2026-11-30", end: "2027-01-10" },
  { name: "Marathon build", dates: "Jan 11–mid Mar", volume: "40–55 mi/week", start: "2027-01-11", end: "2027-03-14",
    details: [
      "Wednesday: intervals and threshold reps.",
      "Saturday: long run building from 16 to 20 mi, with 6–10 mi at marathon pace in the middle.",
      "Sunday: easy 6–10 mi, the first back-to-back runs.",
      "Lighter weeks around Feb 1 and Mar 1. Re-test the 5K in the Feb 1 week.",
    ] },
  { name: "Checkpoint", dates: "Mid-March", volume: "Marathon race", start: "2027-03-15", end: "2027-03-21",
    details: ["Race the checkpoint marathon all out.", "Then one easy recovery week.", "Open item: pick the mid-March marathon."] },
  { name: "100-specific", dates: "Late Mar–Apr 4", volume: "55–65 mi/week", start: "2027-03-22", end: "2027-04-04",
    details: [
      "Back-to-backs of about 20 + 15 mi on flat towpath or roads.",
      "Full race fueling on every long run: PF 30 at 55–60 g carbs per hour, plus sodium.",
      "One headlamp run of 12–15 mi to practice night running.",
      "Wednesday stays, but shorter.",
    ] },
  { name: "Taper + race", dates: "Apr 5–23", volume: "Race Apr 24", start: "2027-04-05", end: "2027-04-24",
    details: [
      "Volume drops about 30%, then 50%, then a race week.",
      "Keep a few strides and short pace pieces.",
      "C&O Canal 100, Saturday April 24.",
    ] },
];

// type: rest | easy | strides | intervals | tempo | long | tt
// pace (hard days): "5k" | "5k+10" | "5k-5" (slightly faster than 5K) | "tempo"
// strength: "A" or "B" when a strength session is on that day
const WEEKS = [
  { n: 1, dates: "Nov 23–29", label: "Recovery", miles: 22, phase: "Recovery", loadNote: "Learn the machines at light loads.",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A at light loads", mi: 0, strength: "A" },
      { type: "easy", title: "Easy", detail: "Easy run", mi: 4 },
      { type: "strides", title: "Easy + 4 strides", detail: "Easy run + 4 strides", mi: 4 },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 4, strength: "B", tag: "Thanksgiving" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "easy", title: "Easy", detail: "Easy run", mi: 4 },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 6 },
    ] },
  { n: 2, dates: "Nov 30–Dec 6", label: "5K time trial", miles: 27, phase: "Speed base",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 5 },
      { type: "tt", title: "5K time trial", detail: "2 mi warm-up, 5K all-out on a flat track or towpath, 1 mi cool-down", mi: 6 },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 4, strength: "B" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "easy", title: "Easy", detail: "Easy run (no tempo this week)", mi: 4 },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 8 },
    ] },
  { n: 3, dates: "Dec 7–13", label: "Speed base", miles: 32, phase: "Speed base",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 5 },
      { type: "intervals", title: "6 × 800 m", detail: "1.5 mi warm-up, 6 × 800 m at 5K pace with 400 m jog, 1.5 mi cool-down", mi: 6.5, pace: "5k" },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 5, strength: "B" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "tempo", title: "20 min tempo", detail: "2 mi warm-up, 20 min tempo, 1 mi cool-down", mi: 5.5, pace: "tempo" },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 10 },
    ] },
  { n: 4, dates: "Dec 14–20", label: "Speed base", miles: 35, phase: "Speed base",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 5 },
      { type: "intervals", title: "5 × 1,000 m", detail: "Warm-up, 5 × 1,000 m at 5K pace with 400 m jog, cool-down", mi: 7, pace: "5k" },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 5, strength: "B" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "tempo", title: "25 min tempo", detail: "Warm-up, 25 min tempo, cool-down", mi: 6, pace: "tempo" },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 12 },
    ] },
  { n: 5, dates: "Dec 21–27", label: "Lighter week", miles: 28, phase: "Speed base", light: true, loadNote: "Lighter week: drop loads about 20%.",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A at lighter loads", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 5 },
      { type: "intervals", title: "8 × 400 m", detail: "Warm-up, 8 × 400 m slightly faster than 5K pace with 200 m jog, cool-down", mi: 5.5, pace: "5k-5" },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 4, strength: "B", tag: "Christmas Eve" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides (no tempo)", mi: 4.5 },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 9 },
    ] },
  { n: 6, dates: "Dec 28–Jan 3", label: "Speed base", miles: 38, phase: "Speed base",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 6 },
      { type: "intervals", title: "4 × 1 mile", detail: "Warm-up, 4 × 1 mile at 5K pace + 10 sec with 400 m jog, cool-down", mi: 7.5, pace: "5k+10" },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 5, strength: "B" },
      { type: "rest", title: "Rest", detail: "Rest. Register for C&O Canal 100 at midnight (12:00 AM ET).", mi: 0, tag: "Register for C&O" },
      { type: "tempo", title: "2 × 15 min tempo", detail: "Warm-up, 2 × 15 min tempo with 3 min jog, cool-down", mi: 7, pace: "tempo" },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 13 },
    ] },
  { n: 7, dates: "Jan 4–10", label: "Speed base", miles: 40, phase: "Speed base",
    days: [
      { type: "rest", title: "Rest", detail: "Rest + Strength A", mi: 0, strength: "A" },
      { type: "strides", title: "Easy + 6 strides", detail: "Easy run + 6 strides", mi: 6 },
      { type: "intervals", title: "6 × 1,000 m", detail: "Warm-up, 6 × 1,000 m at 5K pace with 400 m jog, cool-down", mi: 8, pace: "5k" },
      { type: "easy", title: "Easy", detail: "Easy run + Strength B", mi: 5, strength: "B" },
      { type: "rest", title: "Rest", detail: "Rest", mi: 0 },
      { type: "tempo", title: "30 min tempo", detail: "Warm-up, 30 min continuous tempo, cool-down", mi: 7, pace: "tempo" },
      { type: "long", title: "Long run", detail: "Long, easy", mi: 14 },
    ] },
];

// kind: load (weight + reps) | reps (reps only) | time (seconds)
// each: true = dumbbell weight per hand. side: per leg / per side note shown with reps.
const STRENGTH = {
  A: {
    id: "A", name: "Day A", day: "Monday", dow: 1, title: "Lower body + core", duration: "50–60 min",
    warmup: "5 min bike, leg swings, band walks. Preps the hips.",
    exercises: [
      { id: "smith-squat", name: "Smith machine squat", sets: 3, reps: "6–8", kind: "load", purpose: "Leg strength, running economy",
        cues: ["Bar on upper back, feet slightly forward of the bar", "Brace, sit down to thighs parallel", "Drive up through mid-foot, knees track over toes"] },
      { id: "rdl", name: "Dumbbell Romanian deadlift", sets: 3, reps: "8", kind: "load", each: true, purpose: "Hamstrings, posterior chain",
        cues: ["Soft knees, flat back, dumbbells close to the legs", "Push the hips back until the hamstrings stretch", "Squeeze glutes to stand, don't lean back"] },
      { id: "hip-thrust", name: "Smith machine hip thrust", sets: 3, reps: "10", kind: "load", purpose: "Glute strength for the left hip",
        cues: ["Upper back on the bench, bar padded across the hips", "Chin tucked, drive through the heels", "Full lockout, squeeze the glutes 1 second"] },
      { id: "bss", name: "Bulgarian split squat (dumbbells)", sets: 3, reps: "8", side: "each leg", kind: "load", each: true, purpose: "Single-leg stability",
        cues: ["Rear foot laces-down on the bench", "Lower straight down, front knee over mid-foot", "Push through the front heel, hips level"] },
      { id: "calf-raise", name: "Single-leg calf raise, straight and bent knee", sets: 3, reps: "12", side: "each leg", kind: "load", optionalLoad: true, purpose: "Achilles and calf durability",
        cues: ["Ball of the foot on a step, heel hanging", "Full stretch at the bottom, pause at the top", "Half the reps straight-knee, half bent-knee"] },
      { id: "copenhagen", name: "Copenhagen plank", sets: 3, reps: "20 sec", side: "each side", kind: "time", purpose: "Adductors, groin strain history",
        cues: ["Top leg on the bench, forearm under the shoulder", "Lift the hips into a straight line", "Start with the knee on the bench if needed"] },
      { id: "band-walk", name: "Lateral band walk", sets: 2, reps: "20", side: "each direction", kind: "reps", purpose: "Glute medius",
        cues: ["Band above the knees or at the ankles", "Half squat, chest up", "Step wide and slow, keep tension on the band"] },
      { id: "dead-bug", name: "Dead bug", sets: 3, reps: "10", side: "each side", kind: "reps", purpose: "Core control",
        cues: ["Lower back pressed into the floor", "Extend opposite arm and leg slowly", "Exhale as you reach, don't let the back arch"] },
      { id: "pallof", name: "Cable Pallof press", sets: 3, reps: "10", side: "each side", kind: "load", purpose: "Anti-rotation core",
        cues: ["Stand side-on to the cable at chest height", "Press the handle straight out, resist the twist", "Pause 2 seconds, bring it back to the chest"] },
    ],
  },
  B: {
    id: "B", name: "Day B", day: "Thursday", dow: 4, title: "Upper body + core", duration: "40–50 min",
    warmup: "After the easy run. One light set of the first exercise.",
    exercises: [
      { id: "lat-pulldown", name: "Lat pulldown or assisted pull-up", sets: 3, reps: "8–10", kind: "load", purpose: "Back width",
        cues: ["Grip a bit wider than the shoulders", "Pull the bar to the upper chest, elbows down", "Control the bar all the way up"] },
      { id: "db-bench", name: "Dumbbell bench press", sets: 3, reps: "8–10", kind: "load", each: true, purpose: "Chest",
        cues: ["Feet planted, shoulder blades pinched", "Lower to chest level with elbows at about 45 degrees", "Press up and slightly in"] },
      { id: "cable-row", name: "Seated cable row", sets: 3, reps: "10", kind: "load", purpose: "Upper back, posture",
        cues: ["Sit tall, slight knee bend", "Pull to the belly button, squeeze the shoulder blades", "Return slowly without rounding"] },
      { id: "db-shoulder-press", name: "Dumbbell shoulder press", sets: 3, reps: "8–10", kind: "load", each: true, purpose: "Shoulders",
        cues: ["Seated, back against the pad", "Press from ear height to lockout", "Ribs down, no arching"] },
      { id: "lateral-raise", name: "Lateral raise", sets: 3, reps: "12–15", kind: "load", each: true, purpose: "Delts",
        cues: ["Lead with the elbows", "Raise to shoulder height only", "Slow 3-second lower"] },
      { id: "pushdown", name: "Cable tricep pushdown", sets: 3, reps: "12", kind: "load", purpose: "Arms",
        cues: ["Elbows pinned to the sides", "Push down to full extension", "Let the handle rise slowly"] },
      { id: "db-curl", name: "Dumbbell curl", sets: 3, reps: "12", kind: "load", each: true, purpose: "Arms",
        cues: ["Elbows by the sides", "Curl up without swinging", "Lower under control"] },
      { id: "face-pull", name: "Cable face pull", sets: 3, reps: "15", kind: "load", purpose: "Shoulder health",
        cues: ["Rope at face height", "Pull to the face, elbows high and wide", "Squeeze the rear delts"] },
      { id: "knee-raise", name: "Hanging knee raise", sets: 3, reps: "10", kind: "reps", purpose: "Core",
        cues: ["Hang with the shoulders engaged", "Curl the knees up toward the chest", "Lower slowly, no swinging"] },
      { id: "side-plank", name: "Side plank", sets: 3, reps: "30 sec", side: "each side", kind: "time", purpose: "Lateral core, hip stability",
        cues: ["Elbow under the shoulder", "Hips up, body in a straight line", "Breathe, don't let the hips sag"] },
    ],
  },
};

const PROGRESSION = [
  "Keep 2 reps in reserve on every set.",
  "When all sets hit the top of the rep range, add the smallest weight step next session.",
  "Never train legs to failure.",
  "Lighter weeks (Week 5) drop loads by about 20%.",
];
