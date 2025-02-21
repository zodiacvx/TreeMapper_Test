document.addEventListener("DOMContentLoaded", () => {
  // Import Firebase functions
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
  import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCLgpSekin2rP7iPlJTMTteeVy8SrRCq5c",
    authDomain: "tree-mapper-72441.firebaseapp.com",
    projectId: "tree-mapper-72441",
    storageBucket: "tree-mapper-72441.appspot.com",
    messagingSenderId: "390512097821",
    appId: "1:390512097821:web:f4ea1824f9742d2882e4f4",
    measurementId: "G-NQH16GLXSE"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);

  let map, tempMarker, tempPolygon;
  let addTreeMode = false;
  let addZoneMode = false;
  let markers = [];
  let zonePoints = [];

  // Show registration form
  window.showRegister = function () {
    document.getElementById("register-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
  };

  // Show login form
  window.showLogin = function () {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
  };

  // Handle registration
  document.getElementById("register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Registration successful! Please login.");
        showLogin();
      })
      .catch((error) => {
        alert(error.message);
      });
  });

  // Handle login
  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Login successful!");
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("map-container").style.display = "block";
        initializeMap(userCredential.user.uid);
      })
      .catch((error) => {
        alert(error.message);
      });
  });

  // Initialize the map
  function initializeMap(userId) {
    map = L.map("map").setView([7.8731, 80.7718], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          map.setView(userLocation, 15);
          L.marker(userLocation).addTo(map).bindPopup("You are here!").openPopup();
        },
        (error) => {
          alert("Unable to retrieve location: " + error.message);
        }
      );
    }
    loadUserData(userId);
  }

  // Load user-specific trees and zones
  function loadUserData(userId) {
    const userRef = ref(database, "users/" + userId);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.trees) {
          for (const tree of userData.trees) {
            const marker = L.marker([tree.lat, tree.lng]).addTo(map);
            marker.bindPopup(`<b>${tree.name}</b>`).openPopup();
            markers.push({ name: tree.name, marker, type: "tree" });
          }
        }
      }
    });
  }
});
