 <!-- Firebase and App Logic -->
    <script type="module">
        // Firebase Imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- DOM Elements ---
        const form = document.getElementById('waitlist-form');
        const emailInput = document.getElementById('email');
        const submitButton = document.getElementById('submit-button');
        const messageBox = document.getElementById('message');
        const spinner = document.getElementById('spinner');

        // --- Firebase Configuration ---
        const firebaseConfig = typeof __firebase_config !== 'undefined'
            ? JSON.parse(__firebase_config)
            : {
                apiKey: "AIzaSyBKM-DeAFw_RSbAwc2LWiJ-9HShhNT2AYU",
                authDomain: "cognisnap.firebaseapp.com",
                projectId: "cognisnap",
                storageBucket: "cognisnap.appspot.com",
                messagingSenderId: "629113101294",
                appId: "1:629113101294:web:2343bf1d8b3492f9168cff"
            };

        // --- App Initialization ---
        let db, auth;
        try {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            setLogLevel('debug');
            
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
                console.log("Firebase initialized and user signed in with custom token.");
            } else {
                await signInAnonymously(auth);
                console.log("Firebase initialized and user signed in anonymously.");
            }
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            displayMessage("Could not connect to the service. Please try again later.", "error");
        }

        // --- Utility Functions ---
        function displayMessage(text, type) {
            messageBox.textContent = text;
            messageBox.className = `message-box mt-4 h-6 text-sm opacity-100 transform translate-y-0 ${type === 'success' ? 'text-green-400' : 'text-red-400'}`;
            
            setTimeout(() => {
                 messageBox.className = 'message-box mt-4 h-6 text-sm opacity-0 transform translate-y-2';
            }, 5000);
        }

        function isValidEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        }
        
        function setLoading(isLoading) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
                spinner.classList.remove('hidden');
                spinner.classList.add('flex');
            } else {
                submitButton.disabled = false;
                submitButton.textContent = 'Get Early Access';
                spinner.classList.add('hidden');
                spinner.classList.remove('flex');
            }
        }

        // --- Event Listener for Form Submission ---
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!db) {
                displayMessage("Service is unavailable. Please try again later.", "error");
                return;
            }

            const email = emailInput.value.trim();

            if (!isValidEmail(email)) {
                displayMessage("Please enter a valid email address.", "error");
                return;
            }

            setLoading(true);

            try {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'cognisnap';
                const waitlistCollectionRef = collection(db, `artifacts/${appId}/public/data/waitlist`);

                const q = query(waitlistCollectionRef, where("email", "==", email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    displayMessage("This email is already on the list. We'll keep you posted!", "success");
                    emailInput.value = '';
                    setLoading(false);
                    return;
                }

                await addDoc(waitlistCollectionRef, {
                    email: email,
                    timestamp: serverTimestamp()
                });

                displayMessage("Thank you! You're on the list.", "success");
                emailInput.value = '';

            } catch (error) {
                console.error("Error adding document: ", error);
                displayMessage("Something went wrong. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        });
    </script>