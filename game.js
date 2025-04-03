let tiles = [];
let powerUps = [];
let particles = [];
let cols = 8;
let rows = 4;
let tileW, tileH = 30;
let paddle, ball, score = 0, level = 1, aiMode = false;

function setup() {
  createCanvas(windowWidth, windowHeight - 90);
  tileW = width / cols;
  paddle = { w: 120, h: 12, y: height - 40 };
  ball = { x: width / 2, y: height / 2, r: 10, dx: 6, dy: -6 };
  generateLevel();
}

function generateLevel() {
  tiles = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows + level - 1; j++) {
      tiles.push({ x: i * tileW, y: j * tileH, w: tileW, h: tileH, alive: true, fade: 255 });
    }
  }
}

function draw() {
  background(10);
  drawParticles();
  drawTiles();
  drawPowerUps();
  drawPaddle();
  drawBall();
  moveBall();
}

function drawTiles() {
  for (let t of tiles) {
    if (t.alive || t.fade > 0) {
      fill(179, 136, 255, t.fade);
      stroke(140, 100, 255, t.fade);
      rect(t.x + 5, t.y + 5, t.w - 10, t.h - 10, 6);
      if (!t.alive) t.fade -= 10;
    }
  }
}

function drawPaddle() {
  let px = aiMode ? constrain(ball.x - paddle.w/2, 0, width - paddle.w)
                  : constrain(mouseX - paddle.w/2, 0, width - paddle.w);
  fill(179, 136, 255);
  rect(px, paddle.y, paddle.w, paddle.h, 5);
}

function drawBall() {
  fill(255);
  ellipse(ball.x, ball.y, ball.r * 2);
  particles.push({ x: ball.x, y: ball.y, alpha: 255 });
}

function drawParticles() {
  for (let p of particles) {
    fill(179, 136, 255, p.alpha);
    noStroke();
    ellipse(p.x, p.y, 6);
    p.alpha -= 5;
  }
  particles = particles.filter(p => p.alpha > 0);
}

function drawPowerUps() {
  for (let p of powerUps) {
    fill(0, 255, 255);
    ellipse(p.x, p.y, 14);
    p.y += 2;
  }

  let px = aiMode ? constrain(ball.x - paddle.w/2, 0, width - paddle.w)
                  : constrain(mouseX - paddle.w/2, 0, width - paddle.w);
  powerUps = powerUps.filter(p => {
    if (p.y > paddle.y && p.x > px && p.x < px + paddle.w) {
      paddle.w += 20;
      return false;
    }
    return p.y < height;
  });
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x < ball.r || ball.x > width - ball.r) ball.dx *= -1;
  if (ball.y < ball.r) ball.dy *= -1;

  let px = aiMode ? constrain(ball.x - paddle.w/2, 0, width - paddle.w)
                  : constrain(mouseX - paddle.w/2, 0, width - paddle.w);
  if (ball.y + ball.r >= paddle.y && ball.x > px && ball.x < px + paddle.w) {
    let hitPoint = (ball.x - (px + paddle.w / 2)) / (paddle.w / 2);
    ball.dx = 6 * hitPoint;
    ball.dy = -abs(ball.dy);
  }

  for (let t of tiles) {
    if (t.alive &&
        ball.x > t.x && ball.x < t.x + t.w &&
        ball.y - ball.r < t.y + t.h &&
        ball.y + ball.r > t.y) {
      t.alive = false;
      if (random(1) < 0.1) powerUps.push({ x: ball.x, y: ball.y });
      ball.dy *= -1;
      score++;
      document.getElementById('score').textContent = score;
    }
  }

  if (ball.y > height + 30) {
    noLoop();
    textSize(32);
    fill('#ff4d4d');
    text('Game Over', width/2 - 80, height/2);
  }

  if (tiles.every(t => !t.alive)) {
    level++;
    document.getElementById('level').textContent = level;
    generateLevel();
    ball.x = width / 2;
    ball.y = height / 2;
    ball.dy *= 1.1;
    ball.dx *= 1.1;
  }
}

function toggleAI() {
  aiMode = !aiMode;
}
