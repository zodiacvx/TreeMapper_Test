// Import Firebase functions
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

let map, tempMarker, tempPolygon;
let addTreeMode = false;
let addZoneMode = false;
let markers = [];
let zonePoints = [];

// Initialize Firebase
const database = getDatabase();
const auth = getAuth();

// Define a custom icon for the user's location
const userLocationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/zodiacvx/TreeMapper_Test/refs/heads/main/files/red_location_marker_icon_standin_2-removebg-preview.png', // Replace with your own red marker image URL
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});

// Show registration form
function showRegister() {
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
}

// Show login form
function showLogin() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
}

// Handle registration
document.getElementById('register-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert('Registration successful! Please login.');
      showLogin();
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Handle login
document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert('Login successful!');
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('map-container').style.display = 'block';
      initializeMap(userCredential.user.uid); // Pass the user's UID
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Initialize the map
function initializeMap(userId) {
  map = L.map('map').setView([7.8731, 80.7718], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = [position.coords.latitude, position.coords.longitude];
        map.setView(userLocation, 15);
        L.marker(userLocation, { icon: userLocationIcon }).addTo(map).bindPopup('You are here!').openPopup();
      },
      (error) => {
        alert('Unable to retrieve location: ' + error.message);
      }
    );
  }

  // Load user-specific data
  loadUserData(userId);

  map.on('click', onMapClick);
}

// Load user-specific trees and zones
function loadUserData(userId) {
  const userRef = ref(database, 'users/' + userId);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      // Load trees
      if (userData.trees) {
        for (const tree of userData.trees) {
          const marker = L.marker([tree.lat, tree.lng]).addTo(map);
          marker.bindPopup(`<b>${tree.name}</b>`).openPopup();
          markers.push({ name: tree.name, marker, type: 'tree' });
        }
      }
      // Load zones
      if (userData.zones) {
        for (const zone of userData.zones) {
          const polygon = L.polygon(zone.points, { color: 'green' }).addTo(map);
          polygon.bindPopup(`<b>${zone.name}</b>`);
          markers.push({ name: zone.name, marker: polygon, type: 'zone' });
        }
      }
    }
  });
}

function onMapClick(e) {
  if (addTreeMode) {
    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker(e.latlng).addTo(map);
    document.getElementById('tree-details').style.display = 'block';
  } else if (addZoneMode) {
    zonePoints.push(e.latlng);
    if (tempPolygon) map.removeLayer(tempPolygon);
    tempPolygon = L.polygon(zonePoints, { color: 'blue' }).addTo(map);
    document.getElementById('zone-details').style.display = 'block';
  }
}

function toggleAddTreeMode() {
  addTreeMode = !addTreeMode;
  addZoneMode = false;
  document.getElementById('tree-details').style.display = addTreeMode ? 'block' : 'none';
}

function toggleAddZoneMode() {
  addZoneMode = !addZoneMode;
  addTreeMode = false;
  zonePoints = [];
  if (tempPolygon) map.removeLayer(tempPolygon);
  document.getElementById('zone-details').style.display = addZoneMode ? 'block' : 'none';
}

function saveTree() {
  const treeName = document.getElementById('tree-name').value;
  if (treeName && tempMarker) {
    const userId = auth.currentUser.uid; // Get current user's UID
    const treeData = {
      name: treeName,
      lat: tempMarker.getLatLng().lat,
      lng: tempMarker.getLatLng().lng
    };
    
    // Save tree to Firebase
    const userRef = ref(database, 'users/' + userId + '/trees/' + treeName);
    set(userRef, treeData).then(() => {
      tempMarker.bindPopup(`<b>${treeName}</b>`).openPopup();
      markers.push({ name: treeName, marker: tempMarker, type: 'tree' });
      tempMarker = null;
      document.getElementById('tree-details').style.display = 'none';
      addTreeMode = false;
    }).catch((error) => {
      alert('Error saving tree: ' + error.message);
    });
  } else {
    alert('Enter a tree name and place a marker.');
  }
}

function saveZone() {
  const zoneName = document.getElementById('zone-name').value;
  if (zoneName && zonePoints.length > 2) {
    const newPolygon = L.polygon(zonePoints, { color: 'green' }).addTo(map);
    newPolygon.bindPopup(`<b>${zoneName}</b>`);
    markers.push({ name: zoneName, marker: newPolygon, type: 'zone' });
    
    const userId = auth.currentUser.uid; // Get current user's UID
    const zoneData = {
      name: zoneName,
      points: zonePoints.map(point => [point.lat, point.lng])
    };
    
    // Save zone to Firebase
    const userRef = ref(database, 'users/' + userId + '/zones/' + zoneName);
    set(userRef, zoneData).then(() => {
      zonePoints = [];
      tempPolygon = null;
      document.getElementById('zone-details').style.display = 'none';
      addZoneMode = false;
    }).catch((error) => {
      alert('Error saving zone: ' + error.message);
    });
  } else {
    alert('Enter a zone name and select at least 3 points.');
  }
}

function cancelAddTree() {
  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
  document.getElementById('tree-details').style.display = 'none';
  addTreeMode = false;
}

function cancelAddZone() {
  if (tempPolygon) {
    map.removeLayer(tempPolygon);
    tempPolygon = null;
  }
  zonePoints = [];
  document.getElementById('zone-details').style.display = 'none';
  addZoneMode = false;
}

function search() {
  const query = document.getElementById('search-input').value.toLowerCase();
  if (!query) return;
  const result = markers.find(item => item.name.toLowerCase().includes(query));
  if (result) {
    if (result.type === 'tree') {
      map.flyTo(result.marker.getLatLng(), 15);
      result.marker.openPopup();
    } else if (result.type === 'zone') {
      map.fitBounds(result.marker.getBounds());
      result.marker.openPopup();
    }
  } else {
    alert('No matching trees or zones found.');
  }
}
