const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const restartButton = document.getElementById("restartBtn");
const langButtons = document.querySelectorAll("#langSelector button");
const startTitle = document.getElementById("startTitle");
const highScoreDisplay = document.getElementById("highScore");
const gameOverBox = document.getElementById("gameOverMessage");
const gameOverText = document.getElementById("gameOverText");
const GRID_SIZE = 20;
const jsIcon = new Image();
jsIcon.src = "javascript.png";
const pythonIcon = new Image();
pythonIcon.src = "python.png";

const timerDisplay = document.getElementById("timer");
let timer = 60; // initial value
let timerInterval = null;
let maxTime = 60; // Will be set on difficulty select

let currentLang = "en";
const translations = {
  en: {
    title: "Select Difficulty",
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    gameOver: "Game Over!",
    restart: "Restart",
    score: "Score",
    high: "Highest",
    time: "Time",
    gameOverTime:
      "Game Over! Python became an outdated programming language and JavaScript can no longer devour it. JavaScript won!",
    gameOverSelf:
      "Game Over! JavaScript grew so large it can only eat itself now. JavaScript won!",
  },
  sr: {
    title: "Izaberi Težinu",
    easy: "Lako",
    normal: "Normalno",
    hard: "Teško",
    gameOver: "Kraj igre!",
    restart: "Resetuj",
    score: "Rezultat",
    high: "Najbolji rezultat",
    time: "Vreme",
    gameOverTime:
      "Kraj igre! Pajton je postao zastareo jezik i JavaScript više ne može da ga pojede. JavaScript je pobedio!",
    gameOverSelf:
      "Kraj igre! JavaScript je toliko narastao da sada može da pojede samo sebe. JavaScript je pobedio!",
  },
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentLang = button.dataset.lang;

    // Toggle highlight
    langButtons.forEach((btn) => btn.classList.remove("active-lang"));
    button.classList.add("active-lang");

    applyLanguage();
  });
});

function applyLanguage() {
  const t = translations[currentLang];

  startTitle.textContent = t.title;

  // Difficulty buttons text
  const diffBtns = document.querySelectorAll("#difficultyButtons button");
  diffBtns[0].textContent = t.easy;
  diffBtns[1].textContent = t.normal;
  diffBtns[2].textContent = t.hard;

  // Restart button
  restartButton.textContent = t.restart;
  // Remove game over div
  gameOverBox.classList.remove("show");
  // Update score + high score labels
  updateScoreDisplay();
}

// Difficulty
const difficultyButtons = document.querySelectorAll(
  "#difficultyButtons button"
);

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedSpeed = parseInt(button.dataset.speed);
    FPS = selectedSpeed;

    //Time adjustments
    if (selectedSpeed === 5) maxTime = 20;
    else if (selectedSpeed === 10) maxTime = 15;
    else if (selectedSpeed === 15) maxTime = 10;

    timer = maxTime;
    updateTimerDisplay();

    // Hide start screen
    startScreen.style.display = "none";

    // Start game loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / FPS);

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (gameOver) return;

      timer--;
      updateTimerDisplay();

      if (timer <= 0) {
        gameOver = true;
        gameOverText.textContent = translations[currentLang].gameOverTime;
        gameOverBox.classList.add("show");
        clearInterval(timerInterval);
        clearInterval(gameInterval);
      }
    }, 1000);
  });
});

// Restart
restartButton.addEventListener("click", () => {
  // Reset state
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = getRandomFoodPosition();
  score = 0;
  gameOver = false;
  updateScoreDisplay();

  // Hide Game Over box if showing
  gameOverBox.classList.remove("show");

  // Stop current game loop
  if (gameInterval) clearInterval(gameInterval);

  // Show the start screen again
  startScreen.style.display = "flex";

  // Clear time interval
  clearInterval(timerInterval);
});

let FPS = 10;
let gameInterval = null;
let score = 0;
let gameOver = false;

// High Score
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScore = parseInt(highScore); // Convert to number

function updateScoreDisplay() {
  const t = translations[currentLang];
  scoreDisplay.textContent = `${t.score}: ${score}`;
  highScoreDisplay.textContent = `${t.high}: ${highScore}`;
}

function updateTimerDisplay() {
  const t = translations[currentLang];
  timerDisplay.textContent = `${t.time}: ${timer}`;
}

let snake = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let food = getRandomFoodPosition();

// Resize canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  const adjustedSize = Math.min(size, 600);
  canvas.width = adjustedSize;
  canvas.height = adjustedSize;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Grid cell size in pixels
function getCellSize() {
  return canvas.width / GRID_SIZE;
}

// Key input
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction.y === 0) nextDirection = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && direction.y === 0)
    nextDirection = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && direction.x === 0)
    nextDirection = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && direction.x === 0)
    nextDirection = { x: 1, y: 0 };
});

// Food
function getRandomFoodPosition() {
  let newFood;
  while (
    !newFood ||
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  ) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }
  return newFood;
}

// Game loop
function updateGame() {
  if (gameOver) return;

  direction = nextDirection;

  // Move head
  const head = {
    x: (snake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
    y: (snake[0].y + direction.y + GRID_SIZE) % GRID_SIZE,
  };
  snake.unshift(head);

  // Check self-collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver = true;
      gameOverText.textContent = translations[currentLang].gameOverSelf;
      gameOverBox.classList.add("show");
      return;
    }
  }

  // Eat food or move normally
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }

    timer = maxTime;
    updateTimerDisplay();

    updateScoreDisplay();
    food = getRandomFoodPosition();
  } else {
    snake.pop();
  }

  drawGame();
}

// Draw game function
function drawGame() {
  const cellSize = getCellSize();

  // Clear canvas
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  context.fillStyle = "#f7df1e"; // JavaScript yellow
  snake.forEach((segment, index) => {
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;

    if (index === 0) {
      // Draw JS icon on head
      context.drawImage(jsIcon, x, y, cellSize, cellSize);
    } else {
      context.fillRect(x, y, cellSize, cellSize);
    }
  });

  /// Draw food
  context.drawImage(
    pythonIcon,
    food.x * cellSize,
    food.y * cellSize,
    cellSize,
    cellSize
  );
}

// Mobile swipe option
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault(); // prevent the damn scrolling
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault(); // prevent the damn scrolling
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && direction.x === 0) nextDirection = { x: 1, y: 0 };
      if (dx < 0 && direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else {
      if (dy > 0 && direction.y === 0) nextDirection = { x: 0, y: 1 };
      if (dy < 0 && direction.y === 0) nextDirection = { x: 0, y: -1 };
    }
  },
  { passive: false }
);

updateScoreDisplay();
applyLanguage();
