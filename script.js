// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnFvFKIZ2XBL3YGX-wGvB7quQiXuiHrCA",
  authDomain: "flashcards-bfb96.firebaseapp.com",
  projectId: "flashcards-bfb96",
  storageBucket: "flashcards-bfb96.appspot.com",
  messagingSenderId: "114283037265",
  appId: "1:114283037265:web:eb4710cd80df4f599aae70",
  measurementId: "G-915828YW5G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
        console.log("Signing in...");
        
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
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
        auth.signOut().then(() => {
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
        const userDoc = db.collection("users").doc(uid);
        userDoc.get().then((docSnap) => {
            if (docSnap.exists) {
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
        const userDoc = db.collection("users").doc(uid);
        userDoc.set({ flashcards: data }, { merge: true })
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
