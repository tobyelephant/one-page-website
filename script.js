const presets = {
  classic: {
    work: 25 * 60,
    break: 5 * 60,
  },
  deepFocus: {
    work: 50 * 60,
    break: 10 * 60,
  },
};

let workTime = presets.classic.work;
let breakTime = presets.classic.break;

let mode = 'Work Session';
let timeLeft = workTime;
let completedSessions = 0;
let timerId = null;

const modeElement = document.getElementById('mode');
const timerElement = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const sessionCountElement = document.getElementById('sessionCount');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const presetButtons = document.querySelectorAll('[data-preset]');
const soundButtons = document.querySelectorAll('[data-sound]');
const volumeButtons = document.querySelectorAll('[data-volume]');

const backgroundSounds = {
  ocean: 'audio/ocean.mp3',
  forest: 'audio/forest.mp3',
  rain: 'audio/rain.mp3',
};

let selectedPreset = 'classic';
let selectedSound = 'none';
let selectedVolume = 'medium';
let backgroundAudio = null;

const volumeLevels = {
  low: 0.25,
  medium: 0.55,
  high: 0.85,
};

const startSound = new Audio('audio/start.mp3');
const finishSound = new Audio('audio/finish.mp3');

function getCurrentSessionLength() {
  if (mode === 'Work Session') {
    return workTime;
  }

  return breakTime;
}

function updateModeStyle() {
  if (mode === 'Work Session') {
    document.body.classList.add('work-mode');
    document.body.classList.remove('break-mode');
  } else {
    document.body.classList.add('break-mode');
    document.body.classList.remove('work-mode');
  }
}

function getSelectedVolumeLevel() {
  return volumeLevels[selectedVolume];
}

function applyVolumeToAudio(audio) {
  if (audio !== null) {
    audio.volume = getSelectedVolumeLevel();
  }
}

function applySelectedVolume() {
  applyVolumeToAudio(startSound);
  applyVolumeToAudio(finishSound);
  applyVolumeToAudio(backgroundAudio);
}

// Update which preset, sound, and volume buttons look selected.
function updateActiveButtons() {
  presetButtons.forEach(function (button) {
    const isSelected = button.dataset.preset === selectedPreset;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  soundButtons.forEach(function (button) {
    const isSelected = button.dataset.sound === selectedSound;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });

  volumeButtons.forEach(function (button) {
    const isSelected = button.dataset.volume === selectedVolume;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function updateProgressBar() {
  const sessionLength = getCurrentSessionLength();
  const elapsedTime = sessionLength - timeLeft;
  const progressPercent = (elapsedTime / sessionLength) * 100;

  progressBar.style.width = `${progressPercent}%`;
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  modeElement.textContent = mode;
  timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  sessionCountElement.textContent = completedSessions;
  updateProgressBar();
  updateModeStyle();
}

// Play short one-time sounds, such as the start and finish reminders.
function playReminderSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(function () {
    // Browsers can block audio until the user interacts with the page.
  });
}

// Create a new background audio track for the selected sound.
function loadBackgroundSound() {
  if (selectedSound === 'none') {
    backgroundAudio = null;
    return;
  }

  backgroundAudio = new Audio(backgroundSounds[selectedSound]);
  backgroundAudio.loop = true;
  applyVolumeToAudio(backgroundAudio);
}

// Start the selected background sound while the timer is running.
function playBackgroundSound() {
  if (selectedSound === 'none') {
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
function changeVolume(volumeName) {
  selectedVolume = volumeName;
  applySelectedVolume();
  updateActiveButtons();
}

function changeBackgroundSound(soundName) {
  selectedSound = soundName;
  updateActiveButtons();
  stopBackgroundSound();
  loadBackgroundSound();

  if (timerId !== null) {
    playBackgroundSound();
  }
}

// End the current session, play the finish reminder, and prepare the next session.
// The next session does not start automatically; the user clicks Start when ready.
function finishSession() {
  clearInterval(timerId);
  timerId = null;
  stopBackgroundSound();
  playReminderSound(finishSound);

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
    return;
  }

  playReminderSound(startSound);
  playBackgroundSound();

  timerId = setInterval(function () {
    timeLeft -= 1;

    if (timeLeft === 0) {
      finishSession();
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

function changePreset(presetName) {
  selectedPreset = presetName;
  pauseTimer();
  workTime = presets[selectedPreset].work;
  breakTime = presets[selectedPreset].break;
  mode = 'Work Session';
  timeLeft = workTime;
  updateActiveButtons();
  updateDisplay();
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

presetButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    changePreset(button.dataset.preset);
  });
});

soundButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    changeBackgroundSound(button.dataset.sound);
  });
});

volumeButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    changeVolume(button.dataset.volume);
  });
});

applySelectedVolume();
updateActiveButtons();
updateDisplay();
