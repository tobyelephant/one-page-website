let workTime = 25 * 60;
let breakTime = 5 * 60;

let mode = 'Work Session';
let timeLeft = workTime;
let completedSessions = 0;
let timerId = null;

const modeElement = document.getElementById('mode');
const timerElement = document.getElementById('timer');
const sessionCountElement = document.getElementById('sessionCount');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const workDurationInput = document.getElementById('workDuration');
const breakDurationInput = document.getElementById('breakDuration');
const soundSelect = document.getElementById('soundSelect');
const applySettingsButton = document.getElementById('applySettingsButton');

const backgroundSounds = {
  ocean: 'audio/ocean.mp3',
  forest: 'audio/forest.mp3',
  rain: 'audio/rain.mp3',
};

let backgroundAudio = null;

function updateModeStyle() {
  if (mode === 'Work Session') {
    document.body.classList.add('work-mode');
    document.body.classList.remove('break-mode');
  } else {
    document.body.classList.add('break-mode');
    document.body.classList.remove('work-mode');
  }
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  modeElement.textContent = mode;
  timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  sessionCountElement.textContent = completedSessions;
  updateModeStyle();
}

// Create a new background audio track for the selected sound.
function loadBackgroundSound() {
  const selectedSound = soundSelect.value;

  if (selectedSound === 'none') {
    backgroundAudio = null;
    return;
  }

  backgroundAudio = new Audio(backgroundSounds[selectedSound]);
  backgroundAudio.loop = true;
}

// Start the selected background sound while the timer is running.
function playBackgroundSound() {
  if (soundSelect.value === 'none') {
    return;
  }

  if (backgroundAudio === null) {
    loadBackgroundSound();
  }

  backgroundAudio.play().catch(function () {
    // Browsers can block audio until the user interacts with the page.
  });
}

// Pause the background sound without losing its current place.
function pauseBackgroundSound() {
  if (backgroundAudio !== null) {
    backgroundAudio.pause();
  }
}

// Stop the background sound and rewind it to the beginning.
function stopBackgroundSound() {
  if (backgroundAudio !== null) {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
  }
}

// If the timer is running, changing the selected sound starts the new sound right away.
function changeBackgroundSound() {
  stopBackgroundSound();
  loadBackgroundSound();

  if (timerId !== null) {
    playBackgroundSound();
  }
}

function switchMode() {
  if (mode === 'Work Session') {
    completedSessions += 1;
    mode = 'Break';
    timeLeft = breakTime;
  } else {
    mode = 'Work Session';
    timeLeft = workTime;
  }

  updateDisplay();
}

function startTimer() {
  if (timerId !== null) {
    playBackgroundSound();
    return;
  }

  playBackgroundSound();

  timerId = setInterval(function () {
    timeLeft -= 1;

    if (timeLeft === 0) {
      switchMode();
    } else {
      updateDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  pauseBackgroundSound();
}

function resetTimer() {
  pauseTimer();
  stopBackgroundSound();

  if (mode === 'Work Session') {
    timeLeft = workTime;
  } else {
    timeLeft = breakTime;
  }

  updateDisplay();
}

function applySettings() {
  const newWorkMinutes = Number(workDurationInput.value);
  const newBreakMinutes = Number(breakDurationInput.value);

  if (!Number.isFinite(newWorkMinutes) || !Number.isFinite(newBreakMinutes) || newWorkMinutes <= 0 || newBreakMinutes <= 0) {
    alert('Please enter numbers greater than 0.');
    workDurationInput.value = String(workTime / 60);
    breakDurationInput.value = String(breakTime / 60);
    return;
  }

  workTime = newWorkMinutes * 60;
  breakTime = newBreakMinutes * 60;
  resetTimer();
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
soundSelect.addEventListener('change', changeBackgroundSound);
applySettingsButton.addEventListener('click', applySettings);

updateDisplay();
