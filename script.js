// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('googleSignIn');
    const signOutButton = document.getElementById('signOutButton');
    const fileUpload = document.getElementById('fileUpload');
    const flashcard = document.getElementById('flashcard');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const shuffleButton = document.getElementById('shuffleButton');
    const restartButton = document.getElementById('restartButton');

    let cardsData = [];
    let currentIndex = 0;
    let flipped = false;
    let viewedCards = new Set();

    console.log("Script loaded, waiting for user interaction...");

    // Google Sign-In
    googleSignInButton.addEventListener('click', () => {
        console.log("Google Sign-In button clicked");
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("User signed in:", result.user);
                googleSignInButton.style.display = 'none';
                signOutButton.style.display = 'inline-block';
                fileUpload.style.display = 'block';
                flashcard.style.display = 'block';
                document.querySelector('.controls').style.display = 'flex';

                // Load user data
                loadUserData(result.user.uid);
            })
            .catch((error) => {
                console.error('Error during sign-in:', error);
            });
    });

    // Sign out
    signOutButton.addEventListener('click', () => {
        console.log("Sign Out button clicked");
        signOut(auth).then(() => {
            console.log("User signed out");
            googleSignInButton.style.display = 'inline-block';
            signOutButton.style.display = 'none';
            fileUpload.style.display = 'none';
            flashcard.style.display = 'none';
            document.querySelector('.controls').style.display = 'none';
        }).catch((error) => {
            console.error('Error during sign-out:', error);
        });
    });

    // Handle file upload
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    cardsData = JSON.parse(e.target.result);
                    console.log("JSON file uploaded:", cardsData);
                    saveUserData(auth.currentUser.uid, cardsData);
                    displayCard(currentIndex);
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Display card logic
    function displayCard(index) {
        if (cardsData.length > 0) {
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
    }

    // Load user data from Firestore
    function loadUserData(uid) {
        console.log("Loading user data for UID:", uid);
        const userDoc = doc(db, "users", uid);
        getDoc(userDoc).then((docSnap) => {
            if (docSnap.exists()) {
                cardsData = docSnap.data().flashcards;
                console.log("User data loaded:", cardsData);
                displayCard(currentIndex);
            } else {
                console.log("No such document!");
            }
        }).catch((error) => {
            console.error('Error loading document:', error);
        });
    }

    // Save user data to Firestore
    function saveUserData(uid, data) {
        console.log("Saving user data for UID:", uid);
        const userDoc = doc(db, "users", uid);
        setDoc(userDoc, { flashcards: data }, { merge: true })
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error('Error writing document:', error);
            });
    }

    // Card navigation logic
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

    // Shuffle array function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
