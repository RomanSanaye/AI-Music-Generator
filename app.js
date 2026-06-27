const fileInput = document.getElementById("fileInput");
const uploadMsg = document.getElementById("uploadMsg");
const instrument = document.getElementById("instrument");

const generateBtn = document.getElementById("generateBtn");
const statusText = document.getElementById("statusText");

const progressSection = document.querySelector(".progress-section");
const progressBar = document.querySelector(".progress-bar");

const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const volumeControl = document.getElementById("volumeControl");
const downloadBtn = document.getElementById("downloadBtn");
const progressFill = document.querySelector(".progress-fill");

let selectedFile = null;
let selectedInstrument = "";
let isPlaying = false;

// --------------------
// Upload file
// --------------------
fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];

  uploadMsg.textContent = selectedFile
    ? `Selected: ${selectedFile.name}`
    : "No file selected";

  // Reset player state
  audioPlayer.pause();
  audioPlayer.src = "";
  isPlaying = false;
  playBtn.textContent = "▶ Play";

  // Hide progress section
  progressSection.style.display = "none";
  progressBar.classList.remove("active");
  statusText.textContent = "Waiting...";
});

// --------------------
// Instrument selection
// --------------------
instrument.addEventListener("change", (e) => {
  selectedInstrument = e.target.value;
});

// --------------------
// Generate
// --------------------
generateBtn.addEventListener("click", () => {
  if (!selectedFile || !selectedInstrument) {
    alert("Upload file and select an instrument first.");
    return;
  }

  // show UI
  progressSection.style.display = "block";
  progressFill.style.width = "0%";

  let progress = 0;
  const totalTime = 4000; // 4 seconds
  const start = Date.now();

  function updateProgress() {
    const elapsed = Date.now() - start;

    progress = Math.min((elapsed / totalTime) * 100, 100);

    // update bar
    progressFill.style.width = progress + "%";

    // update status text
    if (progress < 30) {
      statusText.textContent = "Analyzing audio... 🎧";
    } else if (progress < 70) {
      statusText.textContent = "Applying instrument effect... 🎛️";
    } else if (progress < 95) {
      statusText.textContent = "Finalizing output... 🤖";
    } else {
      statusText.textContent = "Almost ready... ✔";
    }

    // finish condition
    if (progress < 100) {
      requestAnimationFrame(updateProgress);
    } else {
      finishGeneration();
    }
  }

  updateProgress();
});

function finishGeneration() {
  const url = URL.createObjectURL(selectedFile);
  audioPlayer.src = url;

  statusText.textContent = "Completed ✔ Ready to play";

  setTimeout(() => {
    progressSection.style.display = "none";
    progressFill.style.width = "0%";
  }, 800);
}

// --------------------
// Play / Pause
// --------------------
playBtn.addEventListener("click", () => {
  if (!audioPlayer.src) {
    alert("No generated audio available.");
    return;
  }

  if (isPlaying) {
    audioPlayer.pause();
    playBtn.textContent = "▶ Play";
  } else {
    audioPlayer.play();
    playBtn.textContent = "⏸ Pause";
  }

  isPlaying = !isPlaying;
});

// Reset button when audio finishes
audioPlayer.addEventListener("ended", () => {
  isPlaying = false;
  playBtn.textContent = "▶ Play";
});

// --------------------
// Volume
// --------------------
audioPlayer.volume = 1;

volumeControl.addEventListener("input", (e) => {
  audioPlayer.volume = parseFloat(e.target.value);
});

// --------------------
// Download
// --------------------
downloadBtn.addEventListener("click", () => {
  if (!audioPlayer.src) {
    alert("No generated audio available.");
    return;
  }

  const a = document.createElement("a");
  a.href = audioPlayer.src;
  a.download = "ai-music-output.mp3";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
