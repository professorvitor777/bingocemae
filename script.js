/* Bingo Surreal — script.js
   Features:
   - 1..90 grid, click to mark/unmark
   - Random draw, auto-draw with speed
   - Undo last, reset, export/import (JSON)
   - Big animated reveal, confetti, sound (WebAudio) and voice (speechSynthesis)
   - Save/load state via localStorage
   - Keyboard shortcuts: Space=draw, U=undo, R=reset, F=fullscreen
*/

(() => {
  const TOTAL = 90;
  const STORAGE_KEY = "bingo_cemae_state_v1";

  // DOM
  const gridEl = document.getElementById("grid");
  const drawBtn = document.getElementById("drawBtn");
  const undoBtn = document.getElementById("undoBtn");
  const resetBtn = document.getElementById("resetBtn");
  const autoToggle = document.getElementById("autoToggle");
  const autoSpeed = document.getElementById("autoSpeed");
  const lastList = document.getElementById("lastList");
  const allCalled = document.getElementById("allCalled");
  const calledCount = document.getElementById("calledCount");
  const remainingCount = document.getElementById("remainingCount");
  const bigReveal = document.getElementById("bigReveal");
  const revealInner = document.getElementById("revealInner");
  const soundBtn = document.getElementById("soundBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const fileInput = document.getElementById("fileInput");

  // state
  let called = []; // numbers drawn in order
  let marked = new Set(); // quick lookup
  let autoTimer = null;
  let soundOn = true;
  let voiceOn = true;

  // Audio setup (simple beep)
  const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
  function beep(freq = 440, duration = 220, type = "sine"){
    if(!audioCtx || !soundOn) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration/1000);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + duration/1000 + 0.02);
  }

  // Init grid
  function buildGrid(){
    gridEl.innerHTML = "";
    for(let i=1;i<=TOTAL;i++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.num = i;
      cell.tabIndex = 0;
      cell.setAttribute("role","button");
      cell.setAttribute("aria-label", `Número ${i}`);
      cell.innerText = i;
      cell.addEventListener("click", () => toggleManual(i));
      cell.addEventListener("keydown", (e) => {
        if(e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleManual(i); }
      });
      gridEl.appendChild(cell);
    }
  }

  // Render state
  function render(){
    const cells = gridEl.querySelectorAll(".cell");
    cells.forEach(c => {
      const n = Number(c.dataset.num);
      if(marked.has(n)) c.classList.add("called");
      else c.classList.remove("called");
    });

    calledCount.innerText = called.length;
    remainingCount.innerText = TOTAL - called.length;

    // last N (up to 8)
    lastList.innerHTML = "";
    const lastSlice = called.slice(-8).reverse();
    lastSlice.forEach((num, idx) => {
      const b = document.createElement("div");
      b.className = "badge" + (idx===0 ? " recent" : "");
      b.innerText = num;
      lastList.appendChild(b);
    });

    // full history
    allCalled.innerHTML = "";
    called.forEach(n => {
      const ch = document.createElement("div");
      ch.className = "chip";
      ch.innerText = n;
      allCalled.appendChild(ch);
    });

    saveState();
  }

  // Save / Load
  function saveState(){
    try {
      const state = { called };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e){}
  }
  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const st = JSON.parse(raw);
      if(st && Array.isArray(st.called)){
        called = st.called;
        marked = new Set(called);
      }
    } catch(e){}
  }

  // toggle manual mark (user click)
  function toggleManual(num){
    if(marked.has(num)) {
      // unmark: only if it's last? We'll allow unmark anywhere but remove from called order
      marked.delete(num);
      called = called.filter(x => x !== num);
      render();
    } else {
      markNumber(num, { manual:true });
    }
  }

  // mark number (used by draw or manual)
  function markNumber(num, { manual=false } = {}){
    if(marked.has(num)) return;
    marked.add(num);
    called.push(num);
    // reveal animation if not manual
    revealBig(num);
    // sound & voice
    if(soundOn) beep(220 + (num%20)*10, 220, "sine");
    if(voiceOn) sayNumber(num);
    // confetti for first few draws
    if(!manual) popConfetti();
    render();
  }

  // draw random
  function drawRandom(){
    const available = [];
    for(let i=1;i<=TOTAL;i++) if(!marked.has(i)) available.push(i);
    if(available.length === 0){
      revealMessage("Todos sorteados");
      stopAuto();
      return;
    }
    const idx = Math.floor(Math.random() * available.length);
    const num = available[idx];
    markNumber(num);
  }

  // reveal big overlay
  let revealTimeout = null;
  function revealBig(num){
    revealInner.innerText = num;
    bigReveal.classList.add("show");
    // small pulsing animation handled by CSS; hide after time
    clearTimeout(revealTimeout);
    revealTimeout = setTimeout(() => {
      bigReveal.classList.remove("show");
    }, 1600);
  }
  function revealMessage(txt){
    revealInner.innerText = txt;
    bigReveal.classList.add("show");
    clearTimeout(revealTimeout);
    revealTimeout = setTimeout(() => {
      bigReveal.classList.remove("show");
    }, 1300);
  }

  // confetti
  function popConfetti(){
    const tpl = document.getElementById("confettiTpl");
    const frag = document.createDocumentFragment();
    const count = 24;
    for(let i=0;i<count;i++){
      const el = tpl.content.firstElementChild.cloneNode(true);
      const size = 6 + Math.random()*10;
      el.style.width = el.style.height = size + "px";
      el.style.left = (innerWidth/2 - 40) + (Math.random()*80 - 40) + "px";
      el.style.top = (innerHeight/2 - 40) + (Math.random()*80 - 40) + "px";
      el.style.background = randomColor();
      el.style.transform = `translateY(0) rotate(${Math.random()*360}deg)`;
      document.body.appendChild(el);
      animateConfetti(el);
    }
    // cleanup later
    setTimeout(() => {
      document.querySelectorAll(".confetti").forEach(e => e.remove());
    }, 2400);
  }
  function animateConfetti(el){
    const fall = 900 + Math.random()*1200;
    const xShift = (Math.random()*800 - 400);
    el.animate([
      { transform: el.style.transform, opacity:1 },
      { transform: `translate(${xShift}px, ${fall}px) rotate(${Math.random()*720}deg)`, opacity:0.2 }
    ], { duration: 700 + Math.random()*1000, easing: "cubic-bezier(.2,.9,.3,1)"});
  }
  function randomColor(){
    const palette = ["#22c55e","#16a34a","#f59e0b","#ef4444","#06b6d4","#a78bfa"];
    return palette[Math.floor(Math.random()*palette.length)];
  }

  // speech
  function sayNumber(num){
    if(!window.speechSynthesis) return;
    const s = new SpeechSynthesisUtterance(`${num}`);
    s.lang = "pt-BR";
    s.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(s);
  }

  // undo last
  function undoLast(){
    if(called.length === 0) return;
    const last = called.pop();
    marked.delete(last);
    render();
    revealMessage(`Desfeito: ${last}`);
    if(soundOn) beep(120, 160, "triangle");
  }

  // reset
  function resetAll(){
    if(!confirm("Resetar tudo? Isso limpará o histórico atual.")) return;
    called = [];
    marked.clear();
    stopAuto();
    render();
    revealMessage("Resetado");
  }

  // auto draw
  function startAuto(){
    stopAuto();
    const speed = Number(autoSpeed.value);
    autoTimer = setInterval(() => {
      if(document.hidden) return; // pause if tab hidden
      drawRandom();
      if(called.length >= TOTAL) stopAuto();
    }, speed);
  }
  function stopAuto(){
    if(autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    autoToggle.checked = false;
  }

  // keyboard shortcuts
  function keyHandler(e){
    // ignore if focus in input / file dialogues
    const tag = document.activeElement.tagName;
    if(tag === "INPUT" || tag === "TEXTAREA") return;
    if(e.code === "Space"){ e.preventDefault(); drawRandom(); }
    if(e.key.toLowerCase() === "u") undoLast();
    if(e.key.toLowerCase() === "r") resetAll();
    if(e.key.toLowerCase() === "f") toggleFullscreen();
  }

  // full screen
  function toggleFullscreen(){
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // export / import
  function exportState(){
    const payload = { called };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bingo-state.json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function importStateFromFile(file){
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if(Array.isArray(json.called)){
          called = json.called.slice();
          marked = new Set(called);
          render();
          revealMessage("Estado importado");
        } else alert("Arquivo inválido");
      } catch(e){
        alert("Erro ao importar: arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  // UI wiring
  function wire(){
    drawBtn.addEventListener("click", drawRandom);
    undoBtn.addEventListener("click", undoLast);
    resetBtn.addEventListener("click", resetAll);
    autoToggle.addEventListener("change", () => {
      if(autoToggle.checked) startAuto(); else stopAuto();
    });
    autoSpeed.addEventListener("input", () => {
      if(autoTimer) startAuto();
    });
    soundBtn.addEventListener("click", () => { soundOn = !soundOn; soundBtn.style.opacity = soundOn ? 1 : 0.45; });
    voiceBtn.addEventListener("click", () => { voiceOn = !voiceOn; voiceBtn.style.opacity = voiceOn ? 1 : 0.45; });
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    exportBtn.addEventListener("click", exportState);
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if(f) importStateFromFile(f);
      fileInput.value = "";
    });

    document.addEventListener("keydown", keyHandler);
    window.addEventListener("beforeunload", saveState);
  }

  // init
  function init(){
    buildGrid();
    loadState();
    render();
    wire();
    // small visual hint on first load
    setTimeout(() => drawBtn.classList.add("pulse"), 1200);
    setTimeout(() => drawBtn.classList.remove("pulse"), 2300);
  }

  // convenience wrapper for marking by number (external)
  function markNumber(num){ markNumberInternal(num); }
  // protect naming conflict
  function markNumberInternal(num, opts){ /* not used externally */ }

  // Start
  init();

})();
