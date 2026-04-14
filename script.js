/* ICON MAP */
const iconMap = {
  waiting: "🍂",
  boarding: "🧳",
  takeoff: "✈️",
  landing: "🛬",
  meet: "❤️"
};

/* JOURNEY (CONNECTING FLIGHT STRUCTURE) */
const steps = [
  { label:"Waiting UK", type:"waiting", time:"2026-05-11T06:00:00", story:"Pre-departure<br>waiting phase 🍂", bg:"https://pixabay.com/videos/download/video-66822_medium.mp4" },
  { label:"Boarding", type:"boarding", time:"2026-05-11T09:00:00", story:"Boarding begins 🧳", bg:"https://pixabay.com/videos/download/video-66822_medium.mp4" },
  { label:"Takeoff 1", type:"takeoff", time:"2026-05-11T10:00:00", story:"First flight<br>has departed ✈️", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" },
  { label:"Landing Transit", type:"landing", time:"2026-05-11T16:00:00", story:"Transit landing 🛬", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" },
  { label:"Transit Wait", type:"waiting", time:"2026-05-11T15:00:00", story:"Waiting for connection 🍂", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" },
  { label:"Takeoff 2", type:"takeoff", time:"2026-05-11T18:40:00", story:"Final flight to Kenya ✈️", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" },
  { label:"Landing Kenya", type:"landing", time:"2026-05-12T01:25:00", story:"Arrived in Kenya 🇰🇪", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" },
  { label:"Meeting", type:"meet", time:"2026-05-12T06:00:00", story:"Finally together ❤️", bg:"https://pixabay.com/images/download/bessi-tree-736875_1280.jpg" }
].map(s => ({ ...s, ts: new Date(s.time).getTime() }));

/* RENDER TIMELINE */
const timeline = document.getElementById("timeline");

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
    el.classList.toggle("open");
  };

  timeline.appendChild(el);
});

/* CURRENT STEP */
function getCurrent(now){
  return steps.find((s,i)=>{
    const next = steps[i+1];
    return now >= s.ts && (!next || now < next.ts);
  });
}

/*Background Change*/
function updateCinematic(current){
  const bg = document.getElementById("bg");
  const story = document.getElementById("storyOverlay");

  if(current && current.bg){

    bg.classList.remove("animate");
    bg.style.opacity = 0;

    setTimeout(()=>{
      bg.style.backgroundImage = `url('${current.bg}')`;
      bg.style.opacity = 1;
      bg.classList.add("animate");
    }, 400);

    story.classList.remove("show");

    setTimeout(()=>{
      story.innerText = current.story;
      story.classList.add("show");
    }, 500);
  }
}

/* COUNTDOWN */
function updateCountdown(){
  const diff = steps[0].ts - Date.now();

  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  const s = Math.floor(diff/1000)%60;

  document.getElementById("countdown").innerText =
    diff > 0
      ? `🍂 Starts in ${d}d ${h}h ${m}m ${s}s`
      : `Journey in progress`;
}

/* MAIN UPDATE LOOP */
function update(){
  const now = Date.now();
  const current = getCurrent(now);
  
  updateCinematic(current);

  updateCountdown();

  /* progress calc */
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
    else if(steps[i] === current) el.classList.add("active");
    else el.classList.add("future");
  });
}

setInterval(update,1000);
update();

/* detect step change */
const now = Date.now();

const currentIndex = steps.findIndex((s,i)=>{
  const next = steps[i+1];
  return now >= s.ts && (!next || now < next.ts);
});

if(currentIndex !== lastStepIndex && currentIndex !== -1){
  lastStepIndex = currentIndex;

  const step = steps[currentIndex];
  showToast(`Status Update: ${step.label} ✈️`);
}

  let lastStepIndex = -1;
  function showToast(msg){
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>{
    toast.classList.remove("show");
  }, 3500);
}

const FLIGHT_ID = "TK1968, TK0607"; 
// flight ID

function loadFlightRadar(){
  const embed = document.getElementById("flightEmbed");

  // Flightradar24 iframe pattern (public embed style)
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


  function checkOrientation(){
  if (window.innerHeight > window.innerWidth) {
    console.log("Portrait mode");
  } else {
    console.log("Landscape mode");
  }
}

  window.addEventListener("resize", checkOrientation);
  checkOrientation();