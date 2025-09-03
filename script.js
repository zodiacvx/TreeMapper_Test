let users = [];
let currentUser = null;
let map, tempMarker, tempPolygon;
let addTreeMode = false;
let addZoneMode = false;
let markers = [];
let zonePoints = [];

function showRegister() {
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
}

function showLogin() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
}

document.getElementById('register-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  if (!username || !password) {
    alert('Please enter a username and password');
    return;
  }
  users.push({ username, password });
  alert('Registration successful! Please login.');
  showLogin();
});

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const user = users.find((user) => user.username === username && user.password === password);
  if (!user) {
    alert('Invalid username or password');
    return;
  }
  currentUser = user;
  alert('Login successful!');
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('map-container').style.display = 'block';
  getUserLocation();
});

function initializeMap(latitude, longitude) {
  map = L.map('map').setView([latitude, longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([latitude, longitude]).addTo(map)
    .bindPopup("You are here!").openPopup();
  map.on('click', onMapClick);
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        console.log("User Location:", latitude, longitude);
        initializeMap(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error.message);
        alert("Failed to get location. Please enable location services.");
        initializeMap(7.8731, 80.7718); // Default location if geolocation fails
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
    initializeMap(7.8731, 80.7718);
  }
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
    tempMarker.bindPopup(`<b>${treeName}</b>`).openPopup();
    markers.push({ name: treeName, marker: tempMarker, type: 'tree' });
    tempMarker = null;
    document.getElementById('tree-details').style.display = 'none';
    addTreeMode = false;
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
    zonePoints = [];
    tempPolygon = null;
    document.getElementById('zone-details').style.display = 'none';
    addZoneMode = false;
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
