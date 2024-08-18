const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgm = document.getElementById('bgm');
const eatSound = document.getElementById('eatSound');
const deathSound = document.getElementById('deathSound');

const gridSize = 20;
let canvasSize = Math.min(window.innerWidth, window.innerHeight) - 40;
canvas.width = canvas.height = canvasSize;

let snake, direction, apple, score, isPaused, gameInterval, gameOver;

function startGame() {
    snake = [{ x: gridSize * 5, y: gridSize * 5 }];
    direction = { x: 0, y: 0 };
    score = 0;
    isPaused = false;
    gameOver = false;
    bgm.play();
    spawnApple();
    gameLoop();
}

function gameLoop() {
    gameInterval = setInterval(() => {
        if (!isPaused) {
            if (moveSnake()) {
                if (checkCollision()) {
                    endGame();
                    return;
                }
                drawGame();
            }
        }
    }, 100);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x === apple.x && head.y === apple.y) {
        snake.push({});
        score += 10;
        eatSound.play();
        spawnApple();
    } else {
        snake.pop();
    }

    snake.unshift(head);

    return true;
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }

    // Self-collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

// Draw background
ctx.fillStyle = '#111'; // Polished black
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw border
const borderWidth = 10;
ctx.strokeStyle = '#555'; // Grey color for the border
ctx.lineWidth = borderWidth;
ctx.strokeRect(0, 0, canvas.width, canvas.height); // Border like a wall
ctx.fillStyle = '#111'; // Fill inside border with black to cover the border area
ctx.fillRect(borderWidth, borderWidth, canvas.width - 2 * borderWidth, canvas.height - 2 * borderWidth);


    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        ctx.fillStyle = 'lime';
        if (index === 0) { // Draw the snake's face
            ctx.fillStyle = 'rgba(181, 11, 11, 1)';
            // Eyes
            ctx.fillRect(segment.x + gridSize / 4, segment.y + gridSize / 4, 4, 4);
            ctx.fillRect(segment.x + 3 * gridSize / 4 - 4, segment.y + gridSize / 4, 4, 4);
            // Nose
            ctx.fillRect(segment.x + gridSize / 2 - 2, segment.y + 3 * gridSize / 4, 4, 4);
        }
    });

    // Draw apple
    const img = new Image();
    img.src = 'apple.png';
    ctx.drawImage(img, apple.x, apple.y, gridSize, gridSize);

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10);

    // Draw pause button
    const buttonWidth = 60;
    const buttonHeight = 40;
    const buttonX = canvas.width - buttonWidth - 10;
    const buttonY = 10;

    // Draw button background
    ctx.fillStyle = '#007bff'; // New color for pause button
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.arc
    
    // Draw text on button
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pause', canvas.width - 40, 30);

    // Draw game over message and play again button
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Darker overlay for game over
        ctx.fillRect(canvas.width / 4, canvas.height / 2 - 40, canvas.width / 2, 80);
        ctx.fillStyle = 'red'; // New color for game over message
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Play Again', canvas.width / 2, canvas.height / 2 + 20);
    }
}

function spawnApple() {
    apple = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function endGame() {
    clearInterval(gameInterval);
    gameOver = true;
    drawGame();
    deathSound.play();
}

// Keyboard controls for PC
window.addEventListener('keydown', e => {
    if (!isPaused) {
        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) direction = { x: 0, y: -gridSize };
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = { x: 0, y: gridSize };
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = { x: -gridSize, y: 0 };
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = { x: gridSize, y: 0 };
                break;
            case ' ':
                if (gameOver) startGame();
                break;
            case 'p':
            case 'P':
                if (!gameOver) togglePause();
                break;
        }
    }
});

// Touch controls for Android
window.addEventListener('touchstart', handleTouchStart, false);
window.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            direction = { x: -gridSize, y: 0 }; // Left swipe
        } else {
            direction = { x: gridSize, y: 0 }; // Right swipe
        }
    } else {
        if (yDiff > 0) {
            direction = { x: 0, y: -gridSize }; // Up swipe
        } else {
            direction = { x: 0, y: gridSize }; // Down swipe
        }
    }

    xDown = null;
    yDown = null;
}

// Handle resizing for responsiveness
window.addEventListener('resize', () => {
    canvasSize = Math.min(window.innerWidth, window.innerHeight) - 40;
    canvas.width = canvas.height = canvasSize;
    drawGame();
});

// Handle pause button click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is within the pause button
    if (x > canvas.width - 60 && x < canvas.width - 10 && y > 10 && y < 40) {
        if (!gameOver) togglePause();
    }

    // Check if click is within the play again area
    if (gameOver && x > canvas.width / 4 && x < canvas.width * 3 / 4 && y > canvas.height / 2 - 40 && y < canvas.height / 2 + 40) {
        startGame();
    }
});

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 4, canvas.height / 2 - 20, canvas.width / 2, 40);
        ctx.fillStyle = 'yellow'; // New color for paused message
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        bgm.pause();
    } else {
        drawGame(); // Redraw to clear pause overlay
        
    }
}

startGame();
