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

  // Handle registration
  document.getElementById("register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    alert(`User Registered: ${username}`);
    showLogin();
  });

  // Handle login
  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    alert(`User Logged In: ${username}`);
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
  }

  // Toggle Add Tree Mode
  window.toggleAddTreeMode = function () {
    addTreeMode = !addTreeMode;
    document.getElementById("tree-details").style.display = addTreeMode ? "block" : "none";
  };

  // Save Tree
  window.saveTree = function () {
    const treeName = document.getElementById("tree-name").value;
    if (tempMarker) {
      const latLng = tempMarker.getLatLng();
      const marker = L.marker(latLng).addTo(map);
      marker.bindPopup(`<b>${treeName}</b>`).openPopup();
      markers.push({ name: treeName, marker, type: "tree" });
      tempMarker.remove(); // Remove tempMarker after saving
      tempMarker = null; // Reset tempMarker
      document.getElementById("tree-name").value = ""; // Clear input
      toggleAddTreeMode(); // Hide the input
    } else {
      alert("Please select a location on the map to add the tree.");
    }
  };

  // Cancel adding tree
  window.cancelAddTree = function () {
    if (tempMarker) {
      tempMarker.remove(); // Remove the temporary marker if it exists
      tempMarker = null;
    }
    toggleAddTreeMode(); // Hide the input
  };

  // Toggle Add Zone Mode
  window.toggleAddZoneMode = function () {
    addZoneMode = !addZoneMode;
    document.getElementById("zone-details").style.display = addZoneMode ? "block" : "none";

    // Enable drawing mode for zone
    if (addZoneMode) {
      map.on("click", addZonePoint);
    } else {
      map.off("click", addZonePoint);
      if (tempPolygon) {
        tempPolygon.remove(); // Remove the temporary polygon if exists
        tempPolygon = null;
      }
      zonePoints = []; // Clear zone points
    }
  };

  // Add a point to the zone
  function addZonePoint(e) {
    const latLng = e.latlng;
    zonePoints.push(latLng);
    if (tempPolygon) {
      tempPolygon.remove(); // Remove previous polygon
    }
    tempPolygon = L.polygon(zonePoints).addTo(map);
  }

  // Save Zone
  window.saveZone = function () {
    const zoneName = document.getElementById("zone-name").value;
    if (zonePoints.length > 0) {
      tempPolygon.bindPopup(`<b>${zoneName}</b>`).openPopup();
      // Add your code here to save the zone (e.g., to your database)
      document.getElementById("zone-name").value = ""; // Clear input
      toggleAddZoneMode(); // Hide the input
    } else {
      alert("Please select points on the map to create the zone.");
    }
  };

  // Cancel adding zone
  window.cancelAddZone = function () {
    if (tempPolygon) {
      tempPolygon.remove(); // Remove the temporary polygon if it exists
      tempPolygon = null;
    }
    toggleAddZoneMode(); // Hide the input
  };

  // Search functionality
  window.search = function () {
    const query = document.getElementById("search-input").value.toLowerCase();
    const foundMarkers = markers.filter(marker => marker.name.toLowerCase().includes(query));

    if (foundMarkers.length > 0) {
      const marker = foundMarkers[0].marker; // Zoom to the first found marker
      map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    } else {
      alert("No results found.");
    }
  };
});
