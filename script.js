document.addEventListener("DOMContentLoaded", () => {
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

  // Handle registration (mock implementation)
  document.getElementById("register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    // Here you would normally handle registration logic (e.g., send data to your server)
    alert("Registration successful! Please login.");
    showLogin();
  });

  // Handle login (mock implementation)
  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Here you would normally handle login logic (e.g., validate credentials)
    alert("Login successful!");
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("map-container").style.display = "block";
    initializeMap(); // Call your map initialization function here
  });

  // Initialize the map
  function initializeMap() {
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
    
    // Load user data logic can be implemented here
    // loadUserData(userId); // Uncomment and implement if needed
  }

  // Function to load user-specific trees and zones (mock implementation)
  function loadUserData(userId) {
    // This function would normally retrieve user data from your server
    // and display markers for trees and zones on the map
  }
});
