const fileInput = document.getElementById("fileInput");
const uploadMsg = document.getElementById("uploadMsg");
const instrument = document.getElementById("instrument");

const generateBtn = document.getElementById("generateBtn");
const statusText = document.getElementById("statusText");

const progressSection = document.querySelector(".progress-section");
const progressFill = document.querySelector(".progress-fill");

const audioPlayer = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");
const volumeControl = document.getElementById("volumeControl");
const downloadBtn = document.getElementById("downloadBtn");
const progressTitle = document.getElementById("progressTitle");

// --------------------
// GLOBAL STATE (IMPORTANT FIX)
// --------------------
let selectedFile = null;
let selectedInstrument = "";
let isPlaying = false;
let progressActive = false;

// --------------------
// Upload file
// --------------------
fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];

  uploadMsg.textContent = selectedFile
    ? `Selected: ${selectedFile.name}`
    : "No file selected";

  // reset player
  audioPlayer.pause();
  audioPlayer.src = "";
  isPlaying = false;
  playBtn.textContent = "▶ Play";

  // reset UI
  statusText.style.color = "#94a3b8";
  progressSection.style.display = "none";
  progressFill.style.width = "0%";
  progressFill.style.background = "#38bdf8";
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
generateBtn.addEventListener("click", async () => {
  if (!selectedFile || !selectedInstrument) {
    alert("Upload file and select an instrument first.");
    return;
  }

  progressTitle.textContent = "⏳ Processing";

  // start progress
  progressActive = true;
  progressSection.style.display = "block";
  progressFill.style.width = "0%";
  progressFill.style.background = "#38bdf8";
  statusText.style.color = "#94a3b8";
  statusText.textContent = "Starting...";

  let progress = 0;
  const totalTime = 4000;
  const start = Date.now();

  function updateProgress() {
    if (!progressActive) return;

    const elapsed = Date.now() - start;
    progress = Math.min((elapsed / totalTime) * 100, 100);

    progressFill.style.width = progress + "%";

    if (progress < 30) {
      statusText.textContent = "Analyzing audio... 🎧";
    } else if (progress < 70) {
      statusText.textContent = "Applying instrument effect... 🎛️";
    } else if (progress < 95) {
      statusText.textContent = "Finalizing output... 🤖";
    } else {
      statusText.textContent = "Almost ready... ✔";
    }

    requestAnimationFrame(updateProgress);
  }

  updateProgress();

  // -----------------------------
  // SEND TO BACKEND
  // -----------------------------
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("instrument", selectedInstrument);

  try {
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    // -----------------------------
    // ERROR HANDLING
    // -----------------------------
    if (!response.ok || !data.success) {
      stopProgressUI(data.detail || data.message || "Upload failed ❌");
      return;
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------
    progressActive = false;
    finishGeneration(data);
    progressTitle.textContent = "✅ Done!";
  } catch (error) {
    stopProgressUI("Server error ❌");
    console.error(error);
  }
});

// --------------------
// STOP PROGRESS (CENTRAL FIX)
// --------------------
function stopProgressUI(message) {
  progressActive = false;

  progressTitle.textContent = "❌ Processing failed";

  statusText.textContent = message;
  statusText.style.color = "red";

  progressFill.style.width = "100%";
  progressFill.style.background = "#ef4444";

  setTimeout(() => {
    progressSection.style.display = "none";
    progressFill.style.width = "0%";
    progressFill.style.background = "#38bdf8";
    progressTitle.textContent = "⏳ Processing";
  }, 3000);
}

// --------------------
// FINISH GENERATION
// --------------------
function finishGeneration(data) {
  progressActive = false;
  const outputUrl = `http://127.0.0.1:8000/outputs/${data.output_file}`;

  audioPlayer.src = outputUrl;
  audioPlayer.load();

  statusText.textContent = "Completed ✔ Ready to play";
  statusText.style.color = "#94a3b8";

  setTimeout(() => {
    progressSection.style.display = "none";
    progressFill.style.width = "0%";
    progressFill.style.background = "#38bdf8";
  }, 800);
}

// --------------------
// PLAY / PAUSE
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

// reset on end
audioPlayer.addEventListener("ended", () => {
  isPlaying = false;
  playBtn.textContent = "▶ Play";
});

// --------------------
// VOLUME
// --------------------
audioPlayer.volume = 1;

volumeControl.addEventListener("input", (e) => {
  audioPlayer.volume = parseFloat(e.target.value);
});

// --------------------
// DOWNLOAD
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
