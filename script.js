document.addEventListener('DOMContentLoaded', () => {
    const flashcard = document.getElementById('flashcard');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const prevButton = document.getElementById('prevButton');
    const flipButton = document.getElementById('flipButton');
    const nextButton = document.getElementById('nextButton');
    const shuffleButton = document.getElementById('shuffleButton');
    const restartButton = document.getElementById('restartButton');

    let cardsData = [];
    let currentIndex = 0;
    let flipped = false;
    let viewedCards = new Set();

    fetch('flashcards.json')
    .then(response => response.json())
    .then(data => {
        cardsData = data;
        displayCard(currentIndex);
    })
    .catch(error => console.error('Error loading JSON:', error));

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            displayCard(currentIndex);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < cardsData.length - 1) {
            currentIndex++;
            displayCard(currentIndex);
        }
    });

    flipButton.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
        flipped = !flipped;
        if (flipped) {
            viewedCards.add(currentIndex);
        }
    });

    shuffleButton.addEventListener('click', () => {
        cardsData = shuffleArray(cardsData);
        currentIndex = 0;
        displayCard(currentIndex);
    });

    restartButton.addEventListener('click', () => {
        viewedCards.clear();
        currentIndex = 0;
        displayCard(currentIndex);
    });

    function displayCard(index) {
        const card = cardsData[index];
        cardFront.textContent = card.question;
        cardBack.textContent = card.answer;
        if (flipped) {
            flashcard.classList.remove('flipped');
            flipped = false;
        }
        if (viewedCards.has(index)) {
            flashcard.style.border = '2px solid green';
        } else {
            flashcard.style.border = '1px solid #ccc';
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});