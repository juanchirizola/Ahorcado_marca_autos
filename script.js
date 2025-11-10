// Base de datos de marcas de autos con sus pistas
const carBrands = [
    { name: "TOYOTA", hint: "País de origen: Japón 🇯🇵" },
    { name: "BMW", hint: "País de origen: Alemania 🇩🇪" },
    { name: "FERRARI", hint: "País de origen: Italia 🇮🇹" },
    { name: "FORD", hint: "País de origen: Estados Unidos 🇺🇸" },
    { name: "MERCEDES", hint: "País de origen: Alemania 🇩🇪" },
    { name: "HONDA", hint: "País de origen: Japón 🇯🇵" },
    { name: "VOLKSWAGEN", hint: "País de origen: Alemania 🇩🇪" },
    { name: "NISSAN", hint: "País de origen: Japón 🇯🇵" },
    { name: "AUDI", hint: "País de origen: Alemania 🇩🇪" },
    { name: "HYUNDAI", hint: "País de origen: Corea del Sur 🇰🇷" }
];

// Variables del juego
let currentWord = "";
let currentHint = "";
let guessedLetters = [];
let wrongLetters = [];
let attemptsLeft = 6;
let gameWon = false;
let gameLost = false;
let hintUsed = false;

// Elementos del DOM
const wordDisplay = document.getElementById('word-display');
const hintDisplay = document.getElementById('hint');
const wrongLettersDisplay = document.getElementById('wrong-letters');
const attemptsDisplay = document.getElementById('attempts');
const hangmanParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
const modal = document.getElementById('game-over-modal');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const correctWordDisplay = document.getElementById('correct-word');

// Contadores de victorias y derrotas
let wins = parseInt(localStorage.getItem('hangmanWins')) || 0;
let losses = parseInt(localStorage.getItem('hangmanLosses')) || 0;

// Inicializar el juego
function initGame() {
    // Seleccionar palabra aleatoria
    const randomIndex = Math.floor(Math.random() * carBrands.length);
    currentWord = carBrands[randomIndex].name;
    currentHint = carBrands[randomIndex].hint;
    
    // Resetear variables del juego
    guessedLetters = [];
    wrongLetters = [];
    attemptsLeft = 6;
    gameWon = false;
    gameLost = false;
    hintUsed = false;
    
    // Actualizar interfaz
    updateWordDisplay();
    updateHintDisplay();
    updateWrongLetters();
    updateAttempts();
    resetHangman();
    resetKeyboard();
    hideModal();
    
    // Actualizar contadores
    updateScore();
}

// Actualizar la visualización de la palabra
function updateWordDisplay() {
    let display = "";
    for (let letter of currentWord) {
        if (guessedLetters.includes(letter)) {
            display += letter + " ";
        } else {
            display += "_ ";
        }
    }
    wordDisplay.textContent = display.trim();
}

// Actualizar la pista
function updateHintDisplay() {
    if (hintUsed) {
        hintDisplay.textContent = currentHint;
        hintDisplay.style.display = 'block';
    } else {
        hintDisplay.style.display = 'none';
    }
}

// Actualizar letras incorrectas
function updateWrongLetters() {
    wrongLettersDisplay.textContent = wrongLetters.join(', ');
}

// Actualizar intentos restantes
function updateAttempts() {
    attemptsDisplay.textContent = attemptsLeft;
}

// Actualizar contadores de victorias/derrotas
function updateScore() {
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
}

// Resetear el ahorcado
function resetHangman() {
    hangmanParts.forEach(part => {
        document.getElementById(part).style.display = 'none';
    });
}

// Resetear teclado
function resetKeyboard() {
    const letterButtons = document.querySelectorAll('.letter-btn');
    letterButtons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });
}

// Mostrar parte del ahorcado
function showHangmanPart() {
    const partIndex = 6 - attemptsLeft - 1;
    if (partIndex >= 0 && partIndex < hangmanParts.length) {
        document.getElementById(hangmanParts[partIndex]).style.display = 'block';
    }
}

// Verificar si la letra está en la palabra
function checkLetter(letter) {
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
        return; // Ya se usó esta letra
    }
    
    if (currentWord.includes(letter)) {
        guessedLetters.push(letter);
        updateWordDisplay();
        checkWin();
    } else {
        wrongLetters.push(letter);
        attemptsLeft--;
        updateWrongLetters();
        updateAttempts();
        showHangmanPart();
        checkLose();
    }
}

// Verificar si ganó
function checkWin() {
    let allLettersGuessed = true;
    for (let letter of currentWord) {
        if (!guessedLetters.includes(letter)) {
            allLettersGuessed = false;
            break;
        }
    }
    
    if (allLettersGuessed) {
        gameWon = true;
        wins++;
        localStorage.setItem('hangmanWins', wins);
        showGameOverModal(true);
    }
}

// Verificar si perdió
function checkLose() {
    if (attemptsLeft <= 0) {
        gameLost = true;
        losses++;
        localStorage.setItem('hangmanLosses', losses);
        showGameOverModal(false);
    }
}

// Mostrar modal de fin de juego
function showGameOverModal(won) {
    if (won) {
        gameOverTitle.textContent = "¡Felicidades! 🎉";
        gameOverTitle.className = "win";
        gameOverMessage.textContent = "¡Has adivinado la marca de auto correctamente!";
    } else {
        gameOverTitle.textContent = "¡Game Over! 😞";
        gameOverTitle.className = "lose";
        gameOverMessage.textContent = "Se acabaron los intentos. ¡Mejor suerte la próxima vez!";
    }
    
    correctWordDisplay.textContent = `La marca era: ${currentWord}`;
    modal.style.display = 'block';
}

// Ocultar modal
function hideModal() {
    modal.style.display = 'none';
}

// Mostrar pista
function showHint() {
    if (!hintUsed && !gameWon && !gameLost) {
        hintUsed = true;
        updateHintDisplay();
        document.getElementById('hint-btn').disabled = true;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Botones de letras
    const letterButtons = document.querySelectorAll('.letter-btn');
    letterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!gameWon && !gameLost) {
                const letter = this.dataset.letter;
                checkLetter(letter);
                
                // Marcar botón como usado
                this.disabled = true;
                if (currentWord.includes(letter)) {
                    this.classList.add('correct');
                } else {
                    this.classList.add('incorrect');
                }
            }
        });
    });
    
    // Botón de nuevo juego
    document.getElementById('new-game-btn').addEventListener('click', initGame);
    
    // Botón de pista
    document.getElementById('hint-btn').addEventListener('click', showHint);
    
    // Botón de jugar de nuevo (modal)
    document.getElementById('play-again-btn').addEventListener('click', function() {
        hideModal();
        initGame();
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Soporte para teclado
    document.addEventListener('keydown', function(e) {
        if (!gameWon && !gameLost) {
            const letter = e.key.toUpperCase();
            if (letter >= 'A' && letter <= 'Z') {
                const button = document.querySelector(`[data-letter="${letter}"]`);
                if (button && !button.disabled) {
                    button.click();
                }
            }
        }
    });
    
    // Inicializar el primer juego
    initGame();
});

