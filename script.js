document.addEventListener("DOMContentLoaded", () => {
  let map;
  let markers = [];
  let zonePolygons = [];
  let addTreeMode = false;
  let addZoneMode = false;

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
    alert("Registration successful! Please login.");
    showLogin();
  });

  // Handle login (mock implementation)
  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    alert("Login successful!");
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("map-container").style.display = "block";
    initializeMap();
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

    map.on("click", (e) => {
      if (addTreeMode) {
        addTree(e.latlng);
      } else if (addZoneMode) {
        addZone(e.latlng);
      }
    });
  }

  // Function to add a tree marker
  function addTree(location) {
    const treeName = prompt("Enter tree name:");
    if (treeName) {
      const marker = L.marker(location).addTo(map);
      marker.bindPopup(`<b>${treeName}</b>`).openPopup();
      markers.push({ name: treeName, marker });
    }
  }

  // Function to add a zone
  function addZone(location) {
    if (zonePolygons.length === 0 || zonePolygons[zonePolygons.length - 1].getLatLngs().length >= 3) {
      const polygon = L.polygon([location]).addTo(map);
      zonePolygons.push(polygon);
      polygon.bindPopup("Click to complete this zone").openPopup();
      
      // Complete the zone on the next click
      map.once("click", (e) => {
        polygon.addLatLng(e.latlng);
        polygon.bindPopup("Zone completed!").openPopup();
      });
    } else {
      zonePolygons[zonePolygons.length - 1].addLatLng(location);
    }
  }

  // Function to search for a tree or zone
  window.search = function () {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const foundMarker = markers.find(marker => marker.name.toLowerCase() === searchTerm);
    const foundZone = zonePolygons.find(polygon => polygon.getPopup() && polygon.getPopup().getContent().toLowerCase().includes(searchTerm));

    if (foundMarker) {
      map.setView(foundMarker.marker.getLatLng(), 15);
      foundMarker.marker.openPopup();
    } else if (foundZone) {
      const latLngs = foundZone.getLatLngs()[0];
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds);
      foundZone.openPopup();
    } else {
      alert("No matching trees or zones found.");
    }
  };

  // Function to toggle add tree mode
  window.toggleAddTreeMode = function () {
    addTreeMode = !addTreeMode;
    addZoneMode = false;
    alert(addTreeMode ? "Add Tree mode activated. Click on the map to add a tree." : "Add Tree mode deactivated.");
  };

  // Function to toggle add zone mode
  window.toggleAddZoneMode = function () {
    addZoneMode = !addZoneMode;
    addTreeMode = false;
    alert(addZoneMode ? "Add Zone mode activated. Click on the map to add a zone." : "Add Zone mode deactivated.");
  };
});
