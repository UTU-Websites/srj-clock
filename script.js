/* ================= ICON MAP ================= */
const iconMap = {
  waiting: "🍂",
  boarding: "🧳",
  takeoff: "✈️",
  landing: "🛬",
  meet: "❤️"
};

/* ================= JOURNEY ================= */
const steps = [
  {
    label:"Waiting UK",
    type:"waiting",
    time:"2026-05-11T06:00:00",
    story:"Counting down the moments… 🍂",
    bgType:"video",
    bg:"https://cdn.pixabay.com/video/2020/07/10/44350-438661984_large.mp4"
  },
  {
    label:"Boarding",
    type:"boarding",
    time:"2026-05-11T09:00:00",
    story:"He’s boarding now 🧳",
    bgType:"image",
    bg:"https://cdn.pixabay.com/photo/2020/05/25/17/03/merry-christmas-5219496_960_720.jpg"
  },
  {
    label:"Takeoff 1",
    type:"takeoff",
    time:"2026-05-11T10:00:00",
    story:"He’s in the air ✈️",
    bgType:"image",
    bg:"https://cdn.pixabay.com/photo/2021/12/13/07/06/airplane-6867678_1280.jpg"
  },
  {
    label:"Landing Transit",
    type:"landing",
    time:"2026-05-11T15:00:00",
    story:"Transit landing 🛬",
    bgType:"video",
    bg:"https://cdn.pixabay.com/video/2024/02/14/200566-913040174_large.mp4"
  },
  {
    label:"Transit Wait",
    type:"waiting",
    time:"2026-05-11T16:00:00",
    story:"A pause between worlds ⏳",
    bgType:"image",
    bg:"https://cdn.pixabay.com/photo/2018/08/22/08/32/sun-3623086_960_720.jpg"
  },
  {
    label:"Takeoff 2",
    type:"takeoff",
    time:"2026-05-11T18:40:00",
    story:"Final flight to Kenya ✈️",
    bgType:"image",
    bg:"https://cdn.pixabay.com/photo/2021/12/13/07/06/airplane-6867678_1280.jpg"
  },
  {
    label:"Landing Kenya",
    type:"landing",
    time:"2026-05-12T01:25:00",
    story:"Welcome Home 🇰🇪",
    bgType:"video",
    bg:"https://cdn.pixabay.com/video/2025/02/06/256964_large.mp4"
  },
  {
    label:"Meeting",
    type:"meet",
    time:"2026-05-12T06:00:00",
    story:"Finally… together ❤️",
    bgType:"video",
    bg:"https://cdn.pixabay.com/video/2023/03/01/152798-803733100_large.mp4"
  }
]
.map(s => ({ ...s, ts: new Date(s.time).getTime() }))
.sort((a,b)=>a.ts - b.ts);

/* ================= DOM ================= */
const timeline = document.getElementById("timeline");
const storyEl = document.getElementById("storyOverlay");

/* DOUBLE LAYER SYSTEM */
const layers = [
  {
    img: document.getElementById("bg1"),
    vid: document.getElementById("bgVideo1")
  },
  {
    img: document.getElementById("bg2"),
    vid: document.getElementById("bgVideo2")
  }
];

let activeLayer = 0;
let lastStepIndex = -1;

/* ================= RENDER TIMELINE ================= */
steps.forEach((s,i)=>{
  const el = document.createElement("div");
  el.className = "step";

  el.innerHTML = `
    <div class="icon">${iconMap[s.type]}</div>
    <div class="label">${s.label}</div>
    <div class="story">${s.story}</div>
  `;

  el.onclick = () => {
    document.querySelectorAll(".step").forEach(x=>x.classList.remove("open"));
    el.classList.add("open");
    switchBackground(s);
  };

  timeline.appendChild(el);
});

/* ================= GET CURRENT ================= */
function getCurrentIndex(now){
  return steps.findIndex((s,i)=>{
    const next = steps[i+1];
    return now >= s.ts && (!next || now < next.ts);
  });
}

/* ================= SWITCH BACKGROUND (NO FLICKER) ================= */
function switchBackground(step){

  const nextLayer = (activeLayer + 1) % 2;
  const currentLayer = layers[activeLayer];
  const next = layers[nextLayer];

  // reset next layer
  next.img.style.opacity = 0;
  next.vid.style.opacity = 0;

  if(step.bgType === "video"){
    next.vid.src = step.bg;
    next.vid.style.display = "block";
    next.vid.load();
    next.vid.play().catch(()=>{});

    next.img.style.backgroundImage = "none";
  } else {
    next.img.style.backgroundImage = `url('${step.bg}')`;
    next.img.style.display = "block";

    next.vid.pause();
    next.vid.style.display = "none";
  }

  // crossfade
  setTimeout(()=>{
    next.img.style.opacity = 1;
    next.vid.style.opacity = 1;

    currentLayer.img.style.opacity = 0;
    currentLayer.vid.style.opacity = 0;

    activeLayer = nextLayer;
  }, 50);

  // story
  storyEl.classList.remove("show");
  setTimeout(()=>{
    storyEl.innerHTML = step.story;
    storyEl.classList.add("show");
  }, 400);
}

/* ================= COUNTDOWN ================= */
function updateCountdown(){
  const diff = steps[0].ts - Date.now();

  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  const s = Math.floor(diff/1000)%60;

  document.getElementById("countdown").innerText =
    diff > 0
      ? `Starts in ${d}d ${h}h ${m}m ${s}s`
      : `Journey in progress`;
}

/* ================= TOAST ================= */
function showToast(msg){
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>{
    toast.classList.remove("show");
  }, 3000);
}

/* ================= MAIN LOOP ================= */
function update(){
  const now = Date.now();

  updateCountdown();

  const index = getCurrentIndex(now);

  if(index !== lastStepIndex && index !== -1){
    lastStepIndex = index;

    const step = steps[index];

    switchBackground(step);
    showToast(`Status Update: ${step.label} ✈️`);
  }

  /* progress */
  const start = steps[0].ts;
  const end = steps[steps.length - 1].ts;

  let percent =
    now < start ? 0 :
    now > end ? 100 :
    ((now - start) / (end - start)) * 100;

  document.getElementById("glow").style.width = percent + "%";
  document.getElementById("dot").style.left = percent + "%";

  /* states */
  document.querySelectorAll(".step").forEach((el,i)=>{
    el.classList.remove("past","active","future");

    if(now > steps[i].ts) el.classList.add("past");
    else if(i === index) el.classList.add("active");
    else el.classList.add("future");
  });
}

setInterval(update,1000);

/* ================= SAFE GET INDEX ================= */
function getSafeIndex(){
  const now = Date.now();
  let index = getCurrentIndex(now);

  if(index === -1){
    if(now < steps[0].ts){
      index = 0; // before journey → first step
    } else {
      index = steps.length - 1; // after journey → last step
    }
  }

  return index;
}

/* ================= INITIAL STATE ================= */
function initScene(){
  const index = getSafeIndex();
  const step = steps[index];

  switchBackground(step);

  document.querySelectorAll(".step").forEach((el,i)=>{
    el.classList.remove("past","active","future");

    if(i < index) el.classList.add("past");
    else if(i === index) el.classList.add("active");
    else el.classList.add("future");
  });

  lastStepIndex = index; // important: sync state
}

/* ================= PRELOAD ================= */
const preload = new Image();
preload.src = steps[getSafeIndex()].bg;

/* RUN */
initScene();
update();


/* ================= FLIGHT EMBED ================= */
const FLIGHT_ID = "TK1968";

function loadFlightRadar(){
  const embed = document.getElementById("flightEmbed");

  embed.innerHTML = `
    <iframe
      src="https://www.flightradar24.com/simple_index.php?icao=${FLIGHT_ID}"
      width="100%"
      height="260"
      style="border:0; border-radius:12px;"
    ></iframe>
  `;
}

loadFlightRadar();
