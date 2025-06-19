// My actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1FcYlRycH60htgRy8OMGH1bFhlS5tywc",
  authDomain: "smartchef-9001a.firebaseapp.com",
  projectId: "smartchef-9001a",
  appId: "1:474453878282:web:aef38849d00dd31bba61f3d"
};

//Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

//DOM
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const userEmail = document.getElementById("user-email");
const authMessage = document.getElementById("auth-message");

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => authMessage.textContent = "")
    .catch(err => authMessage.textContent = err.message);
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => authMessage.textContent = "")
    .catch(err => authMessage.textContent = err.message);
}

function logout() {
  auth.signOut();
}

//To handle login
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = "none";
    appSection.style.display = "block";
    userEmail.textContent = user.email;
  } else {
    authSection.style.display = "block";
    appSection.style.display = "none";
  }
});