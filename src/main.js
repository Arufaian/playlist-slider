// Show modal on load and preload colors
window.addEventListener("load", () => {
  document.getElementById("notificationModal").style.display = "flex";
  preloadCardColors();
});

function closeModal() {
  document.getElementById("notificationModal").style.display = "none";

  // ✅ Play lagu setelah interaksi user
  isPaused = false;
  pauseButton.textContent = "▐▐";
  updateActiveSong(currentIndex); // hanya dipanggil setelah tombol diklik
}

document.getElementById("notificationModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

/* SLIDER & PLAYER LOGIC */
const items = document.querySelectorAll('input[name="slider"]');
const songInfos = document.querySelectorAll(".song-info");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pauseButton = document.getElementById("pause");
const progressEls = document.querySelectorAll(".progress");
const audioPlayer = document.createElement("audio");
let currentIndex = 0;
let progressInterval;
let isPaused = false;

document.body.appendChild(audioPlayer);

const durations = [163, 246, 177, 294, 267];
const startTimes = [30, 121, 41, 115, 175];
const audioSources = [
  "../assets/audio/supernatural.mp3",
  "../assets/audio/NIKI.mp3",
  "../assets/audio/7-rings.mp3",
  "../assets/audio/daylight.mp3",
  "../assets/audio/the-only-exception.mp3",
];

function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = Math.floor(seconds % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

function updateTimeIndicator(index, progressPct) {
  const totalSongTime = durations[index];
  const elapsed =
    startTimes[index] +
    (progressPct / 100) * (totalSongTime - startTimes[index]);
  const remaining = totalSongTime - elapsed;
  const indicator = songInfos[index].querySelector(".time-indicator");
  const elapsedSpan = indicator.querySelector(".elapsed");
  const remainingSpan = indicator.querySelector(".remaining");

  elapsedSpan.innerText = formatTime(elapsed);
  remainingSpan.innerText = formatTime(remaining);
}

function startProgressBar(el, index, override = null) {
  clearInterval(progressInterval);

  const initial =
    override !== null ? override : (startTimes[index] / durations[index]) * 100;
  el.style.width = initial + "%";
  updateTimeIndicator(index, initial);

  const remainingPct = 100 - initial;
  const totalTime = durations[index] - startTimes[index];
  let elapsed = 0;

  if (override !== null) {
    const needed = 100 - (startTimes[index] / durations[index]) * 100;
    const done = initial - (startTimes[index] / durations[index]) * 100;
    elapsed = (done / needed) * totalTime;
  }

  const remainingTime = totalTime - elapsed;
  const intervalDelay = 100;
  const totalSteps = (remainingTime * 1000) / intervalDelay;
  const inc = remainingPct / totalSteps;

  progressInterval = setInterval(() => {
    let w = parseFloat(el.style.width);
    if (w < 100) {
      w += inc;
      el.style.width = w + "%";
      updateTimeIndicator(index, w);
    } else {
      el.style.width = "100%";
      updateTimeIndicator(index, 100);
      clearInterval(progressInterval);
      setTimeout(() => nextButton.click(), 1000);
    }
  }, intervalDelay);
}

function resetProgressBar(el) {
  el.style.width = "0%";
}

function updateActiveSong(index) {
  items.forEach((item, i) => {
    if (i === index) {
      item.checked = true;
      songInfos[i].classList.add("active");

      audioPlayer.src = audioSources[index];

      audioPlayer.onloadedmetadata = () => {
        audioPlayer.currentTime = startTimes[index];

        // ✅ Play jika tidak dalam keadaan pause
        if (!isPaused) audioPlayer.play();

        // ✅ Mulai progress bar
        startProgressBar(progressEls[index], index);
      };
    } else {
      songInfos[i].classList.remove("active");
      resetProgressBar(progressEls[i]);
    }
  });
}

prevButton.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  isPaused = false;
  pauseButton.textContent = "▐▐";
  updateActiveSong(currentIndex);
});

nextButton.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % items.length;
  isPaused = false;
  pauseButton.textContent = "▐▐";
  updateActiveSong(currentIndex);
});

pauseButton.addEventListener("click", () => {
  const curEl = progressEls[currentIndex];
  if (!isPaused) {
    audioPlayer.pause();
    clearInterval(progressInterval);
    isPaused = true;
    pauseButton.textContent = "►";
  } else {
    audioPlayer.play();
    const w = parseFloat(curEl.style.width);
    startProgressBar(curEl, currentIndex, w);
    isPaused = false;
    pauseButton.textContent = "▐▐";
  }
});

audioPlayer.addEventListener("ended", () => {
  nextButton.click();
});

updateActiveSong(currentIndex);

document.getElementById("favorite").addEventListener("click", function () {
  this.classList.toggle("favorited");
});

function preloadCardColors() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const img = card.querySelector("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    function processImage() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < data.length; i += 4 * 100) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const bgColor = `rgb(${r}, ${g}, ${b})`;
        card.style.backgroundColor = bgColor;
        card.style.borderColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
      } catch (e) {
        console.warn("Gagal membaca warna:", img.src);
      }
    }

    if (img.complete) {
      processImage();
    } else {
      img.onload = processImage;
    }
  });
}
