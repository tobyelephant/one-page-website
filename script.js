const workTime = 25 * 60;
const breakTime = 5 * 60;

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
    return;
  }

  timerId = setInterval(function () {
    if (timeLeft > 0) {
      timeLeft -= 1;
      updateDisplay();
    } else {
      switchMode();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  pauseTimer();
  mode = 'Work Session';
  timeLeft = workTime;
  updateDisplay();
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

updateDisplay();
