document.addEventListener("DOMContentLoaded", () => {
  // Initialize Leaflet map with fallback location (Delhi)
  const interactiveMap = L.map("map").setView([28.6139, 77.209], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(interactiveMap);

  let userMarker;

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Center map when first found
        interactiveMap.setView([lat, lng], 15);

        // Add or update marker
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng])
            .addTo(interactiveMap)
            .bindPopup("📍 You are here")
            .openPopup();
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        alert("Could not get your location. Please enable location access.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Global variables
let currentUser = null;
let currentLocation = null;
let geofences = [];
let tourists = [];
let incidents = [];
let authorityLoggedIn = false;

// Simulated blockchain network
class BlockchainIdentity {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
  }

  generateId(userData) {
    const timestamp = Date.now();
    const hash = this.calculateHash(userData + timestamp);
    const blockchainId = `BC-${hash.substring(0, 12).toUpperCase()}`;

    const block = {
      id: blockchainId,
      userData: userData,
      timestamp: timestamp,
      verified: true,
    };

    this.chain.push(block);
    return blockchainId;
  }

  calculateHash(data) {
    // Simple hash function for demonstration
    let hash = 0;
    if (data.length === 0) return hash.toString(16);
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  verifyId(blockchainId) {
    return this.chain.some((block) => block.id === blockchainId);
  }
}

const blockchain = new BlockchainIdentity();

// AI Geo-fencing system
class GeoFencingAI {
  constructor() {
    this.riskModels = {
      safe: { riskLevel: 1, color: "#27ae60" },
      warning: { riskLevel: 5, color: "#f39c12" },
      danger: { riskLevel: 8, color: "#e74c3c" },
      restricted: { riskLevel: 10, color: "#8e44ad" },
    };
  }

  checkLocationSafety(lat, lng) {
    let maxRisk = 0;
    let status = "safe";

    geofences.forEach((fence) => {
      const distance = this.calculateDistance(lat, lng, fence.lat, fence.lng);
      if (distance <= fence.radius) {
        const riskLevel = this.riskModels[fence.type].riskLevel;
        if (riskLevel > maxRisk) {
          maxRisk = riskLevel;
          status = fence.type;
        }
      }
    });

    return { status, riskLevel: maxRisk };
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

const aiGeoFencing = new GeoFencingAI();

// Notification system
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification notification-${type}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 4000);
}

// Tourist Registration
function registerTourist() {
  const name = document.getElementById("touristName").value;
  const email = document.getElementById("touristEmail").value;
  const phone = document.getElementById("touristPhone").value;
  const nationality = document.getElementById("touristNationality").value;

  if (!name || !email || !phone || !nationality) {
    showNotification("Please fill all fields", "warning");
    return;
  }

  currentUser = {
    id: `T-${Date.now()}`,
    name,
    email,
    phone,
    nationality,
    registeredAt: new Date().toISOString(),
  };

  showNotification(`Welcome ${name}! Registration successful`, "success");
  updateStats();
}

// Blockchain ID Generation
function generateBlockchainId() {
  if (!currentUser) {
    showNotification("Please register first", "warning");
    return;
  }

  const userData = `${currentUser.name}-${currentUser.email}-${currentUser.phone}`;
  const blockchainId = blockchain.generateId(userData);

  currentUser.blockchainId = blockchainId;
  document.getElementById("blockchainId").textContent = `ID: ${blockchainId}`;

  showNotification("Blockchain Digital ID generated successfully!", "success");
}

// Location Services
function updateLocation() {
  if (!currentUser) {
    showNotification("Please register first", "warning");
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        currentLocation = { lat, lng, timestamp: new Date().toISOString() };

        document.getElementById(
          "locationStatus"
        ).innerHTML = `Location: ${lat.toFixed(6)}, ${lng.toFixed(
          6
        )}<br>Updated: ${new Date().toLocaleTimeString()}`;

        // Check safety status
        const safety = aiGeoFencing.checkLocationSafety(lat, lng);
        updateSafetyStatus(safety);

        // Add tourist to map
        addTouristToMap(currentUser.id, lat, lng);

        showNotification("Location updated successfully", "success");
      },
      (error) => {
        // Use simulated location for demo
        const lat = 28.6139 + (Math.random() - 0.5) * 0.1; // Delhi area
        const lng = 77.209 + (Math.random() - 0.5) * 0.1;

        currentLocation = { lat, lng, timestamp: new Date().toISOString() };

        document.getElementById(
          "locationStatus"
        ).innerHTML = `Location: ${lat.toFixed(6)}, ${lng.toFixed(
          6
        )} (Simulated)<br>Updated: ${new Date().toLocaleTimeString()}`;

        const safety = aiGeoFencing.checkLocationSafety(lat, lng);
        updateSafetyStatus(safety);
        addTouristToMap(currentUser.id, lat, lng);

        showNotification("Location updated (simulated)", "success");
      }
    );
  }
}

// Safety Status Update
function updateSafetyStatus(safety) {
  const statusElement = document.getElementById("safetyStatus");
  const statusClass = `status-${safety.status}`;

  statusElement.className = `safety-status ${statusClass}`;
  statusElement.innerHTML = `
                <i class="fas fa-shield-alt"></i>
                <span>Safety Status: ${safety.status.toUpperCase()} (Risk Level: ${
    safety.riskLevel
  }/10)</span>
            `;

  if (safety.status === "danger" || safety.status === "restricted") {
    showNotification(`Warning: You are in a ${safety.status} zone!`, "danger");
  }
}

// SOS Emergency System
function triggerSOS() {
  if (!currentUser) {
    showNotification("Please register first", "warning");
    return;
  }

  if (!currentLocation) {
    showNotification("Location not available. Updating location...", "warning");
    updateLocation();
    return;
  }

  const incident = {
    id: `INC-${Date.now()}`,
    userId: currentUser.id,
    type: "emergency",
    location: currentLocation,
    timestamp: new Date().toISOString(),
    status: "active",
    severity: "high",
  };

  incidents.push(incident);
  addIncidentToList(incident);
  addEmergencyMarkerToMap(currentLocation.lat, currentLocation.lng);

  // Simulate emergency response
  setTimeout(() => {
    showNotification(
      "Emergency services have been notified and are on their way!",
      "danger"
    );
    setTimeout(() => {
      showNotification("Rescue team dispatched to your location", "success");
    }, 2000);
  }, 1000);

  updateStats();
}

// Authority System
function authorityLogin() {
  const id = document.getElementById("authorityId").value;
  const password = document.getElementById("authorityPassword").value;

  if (!id || !password) {
    showNotification("Please enter credentials", "warning");
    return;
  }

  // Simple demo authentication
  if (id === "admin" && password === "safety123") {
    authorityLoggedIn = true;
    showNotification("Authority login successful", "success");

    // Initialize some demo geofences
    initializeDemoGeofences();
  } else {
    showNotification("Invalid credentials", "danger");
  }
}

// Geofence Management
function createGeofence() {
  if (!authorityLoggedIn) {
    showNotification("Please login as authority first", "warning");
    return;
  }

  const name = document.getElementById("fenceName").value;
  const type = document.getElementById("fenceType").value;
  const radius = parseInt(document.getElementById("fenceRadius").value);

  if (!name || !type || !radius) {
    showNotification("Please fill all geofence fields", "warning");
    return;
  }

  // Use current location or default to Delhi center
  const lat = currentLocation ? currentLocation.lat : 28.6139;
  const lng = currentLocation ? currentLocation.lng : 77.209;

  const geofence = {
    id: `GF-${Date.now()}`,
    name,
    type,
    radius,
    lat,
    lng,
    createdAt: new Date().toISOString(),
  };

  geofences.push(geofence);
  addGeofenceToMap(geofence);

  showNotification(`Geofence "${name}" created successfully`, "success");

  // Clear form
  document.getElementById("fenceName").value = "";
  document.getElementById("fenceRadius").value = "500";
}

// Map Visualization
function addTouristToMap(id, lat, lng) {
  L.marker([lat, lng])
    .addTo(interactiveMap)
    .bindPopup(`Tourist ID: ${id}`)
    .openPopup();
}

function addEmergencyMarkerToMap(lat, lng) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((lat + 90) / 180) * 100;

  const marker = document.createElement("div");
  marker.className = "marker marker-emergency";
  marker.style.left = `${x}%`;
  marker.style.top = `${100 - y}%`;
  marker.title = "EMERGENCY!";

  document.getElementById("touristMarkers").appendChild(marker);
}

function addGeofenceToMap(geofence) {
  const x = ((geofence.lng + 180) / 360) * 100;
  const y = ((geofence.lat + 90) / 180) * 100;
  const size = Math.min((geofence.radius / 1000) * 10, 30); // Scale radius

  const fence = document.createElement("div");
  fence.className = `geofence geofence-${geofence.type}`;
  fence.style.left = `${x - size / 2}%`;
  fence.style.top = `${100 - y - size / 2}%`;
  fence.style.width = `${size}%`;
  fence.style.height = `${size}%`;
  fence.title = `${geofence.name} (${geofence.type})`;

  document.getElementById("geofenceAreas").appendChild(fence);
}

// Incident Management
function addIncidentToList(incident) {
  const incidentsList = document.getElementById("incidentsList");
  const incidentElement = document.createElement("div");
  incidentElement.className = `incident-item ${
    incident.type === "emergency" ? "incident-emergency" : ""
  }`;

  incidentElement.innerHTML = `
                <strong>${incident.type.toUpperCase()} - ${
    incident.id
  }</strong><br>
                User: ${currentUser.name}<br>
                Status: ${incident.status}<br>
                Time: ${new Date(incident.timestamp).toLocaleTimeString()}<br>
                <button class="btn btn-success" onclick="resolveIncident('${
                  incident.id
                }')">
                    <i class="fas fa-check"></i> Resolve
                </button>
            `;

  incidentsList.appendChild(incidentElement);
}

function resolveIncident(incidentId) {
  const incident = incidents.find((inc) => inc.id === incidentId);
  if (incident) {
    incident.status = "resolved";
    showNotification("Incident resolved successfully", "success");
    updateStats();
  }
}

// Statistics Update
function updateStats() {
  document.getElementById("activeTourists").textContent = currentUser ? 1 : 0;
  document.getElementById("totalIncidents").textContent = incidents.length;
}

// Demo Initialization
function initializeDemoGeofences() {
  // Create some sample geofences around Delhi area
  const demoFences = [
    {
      id: "GF-DEMO-1",
      name: "India Gate Safe Zone",
      type: "safe",
      radius: 800,
      lat: 28.6129,
      lng: 77.2295,
      createdAt: new Date().toISOString(),
    },
    {
      id: "GF-DEMO-2",
      name: "Red Fort Warning Zone",
      type: "warning",
      radius: 600,
      lat: 28.6562,
      lng: 77.241,
      createdAt: new Date().toISOString(),
    },
    {
      id: "GF-DEMO-3",
      name: "Construction Area",
      type: "danger",
      radius: 400,
      lat: 28.62,
      lng: 77.21,
      createdAt: new Date().toISOString(),
    },
  ];

  demoFences.forEach((fence) => {
    geofences.push(fence);
    addGeofenceToMap(fence);
  });

  showNotification("Demo geofences initialized", "success");
}

// Advanced AI Features
class TouristSafetyAI {
  constructor() {
    this.riskFactors = {
      timeOfDay: this.getTimeRiskFactor(),
      crowdDensity: Math.random() * 5,
      weatherConditions: this.getWeatherRisk(),
      localEvents: Math.random() * 3,
    };
  }

  getTimeRiskFactor() {
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) return 8; // Night time
    if (hour >= 6 && hour <= 9) return 3; // Early morning
    if (hour >= 18 && hour <= 21) return 4; // Evening
    return 2; // Day time
  }

  getWeatherRisk() {
    // Simulate weather-based risk
    const conditions = ["clear", "cloudy", "rainy", "stormy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    switch (condition) {
      case "stormy":
        return 9;
      case "rainy":
        return 6;
      case "cloudy":
        return 3;
      default:
        return 1;
    }
  }

  calculateOverallRisk(location) {
    const geoRisk = aiGeoFencing.checkLocationSafety(
      location.lat,
      location.lng
    );
    const timeRisk = this.riskFactors.timeOfDay;
    const crowdRisk = this.riskFactors.crowdDensity;
    const weatherRisk = this.riskFactors.weatherConditions;

    const overallRisk =
      geoRisk.riskLevel * 0.4 +
      timeRisk * 0.3 +
      crowdRisk * 0.2 +
      weatherRisk * 0.1;

    return {
      overall: Math.min(overallRisk, 10),
      factors: {
        location: geoRisk.riskLevel,
        time: timeRisk,
        crowd: crowdRisk,
        weather: weatherRisk,
      },
    };
  }

  predictIncidentProbability(touristData, location) {
    const risk = this.calculateOverallRisk(location);
    const probability = (risk.overall / 10) * 100;

    return {
      probability: Math.round(probability),
      recommendations: this.getSafetyRecommendations(risk.overall),
    };
  }

  getSafetyRecommendations(riskLevel) {
    if (riskLevel >= 8) {
      return [
        "Consider leaving this area immediately",
        "Stay in groups and avoid isolated areas",
        "Keep emergency contacts readily available",
        "Inform someone about your whereabouts",
      ];
    } else if (riskLevel >= 5) {
      return [
        "Exercise increased caution",
        "Avoid displaying valuable items",
        "Stay in well-lit, populated areas",
        "Keep your phone charged",
      ];
    } else {
      return [
        "Area appears safe for tourists",
        "Continue normal precautions",
        "Enjoy your visit responsibly",
      ];
    }
  }
}

const touristAI = new TouristSafetyAI();

// Enhanced Safety Analysis
function performSafetyAnalysis() {
  if (!currentLocation) {
    showNotification("Please update your location first", "warning");
    return;
  }

  const analysis = touristAI.predictIncidentProbability(
    currentUser,
    currentLocation
  );
  const risk = touristAI.calculateOverallRisk(currentLocation);

  // Display detailed safety analysis
  const analysisDiv = document.createElement("div");
  analysisDiv.className = "safety-analysis";
  analysisDiv.innerHTML = `
                <h3><i class="fas fa-chart-line"></i> AI Safety Analysis</h3>
                <div class="risk-breakdown">
                    <h4>Risk Factors:</h4>
                    <p>Location Risk: ${risk.factors.location}/10</p>
                    <p>Time Factor: ${risk.factors.time}/10</p>
                    <p>Crowd Density: ${risk.factors.crowd.toFixed(1)}/10</p>
                    <p>Weather Risk: ${risk.factors.weather}/10</p>
                    <p><strong>Overall Risk: ${risk.overall.toFixed(
                      1
                    )}/10</strong></p>
                    <p><strong>Incident Probability: ${
                      analysis.probability
                    }%</strong></p>
                </div>
                <div class="recommendations">
                    <h4>AI Recommendations:</h4>
                    <ul>
                        ${analysis.recommendations
                          .map((rec) => `<li>${rec}</li>`)
                          .join("")}
                    </ul>
                </div>
            `;

  // Add to tourist panel
  const touristPanel = document.querySelector(".tourist-panel");
  const existingAnalysis = touristPanel.querySelector(".safety-analysis");
  if (existingAnalysis) {
    existingAnalysis.remove();
  }
  touristPanel.appendChild(analysisDiv);

  showNotification("AI safety analysis completed", "success");
}

// Blockchain Verification System
function verifyDigitalIdentity(blockchainId) {
  if (!blockchainId) {
    showNotification("No blockchain ID provided", "warning");
    return false;
  }

  const isValid = blockchain.verifyId(blockchainId);

  if (isValid) {
    showNotification("Digital identity verified successfully", "success");
    return true;
  } else {
    showNotification("Invalid or fraudulent digital ID detected", "danger");
    return false;
  }
}

// Emergency Response Simulation
class EmergencyResponseSystem {
  constructor() {
    this.responseTeams = [
      {
        id: "POLICE-001",
        type: "Police",
        location: { lat: 28.6139, lng: 77.209 },
        available: true,
      },
      {
        id: "MEDICAL-001",
        type: "Ambulance",
        location: { lat: 28.62, lng: 77.215 },
        available: true,
      },
      {
        id: "FIRE-001",
        type: "Fire Department",
        location: { lat: 28.61, lng: 77.2 },
        available: true,
      },
    ];
  }

  dispatchEmergencyResponse(incident) {
    const nearestTeams = this.findNearestTeams(incident.location);
    const responses = [];

    nearestTeams.forEach((team) => {
      if (team.available) {
        const eta = this.calculateETA(team.location, incident.location);
        responses.push({
          teamId: team.id,
          teamType: team.type,
          eta: eta,
          status: "dispatched",
        });
        team.available = false; // Mark as busy
      }
    });

    return responses;
  }

  findNearestTeams(incidentLocation) {
    return this.responseTeams
      .map((team) => ({
        ...team,
        distance: aiGeoFencing.calculateDistance(
          incidentLocation.lat,
          incidentLocation.lng,
          team.location.lat,
          team.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  calculateETA(teamLocation, incidentLocation) {
    const distance = aiGeoFencing.calculateDistance(
      teamLocation.lat,
      teamLocation.lng,
      incidentLocation.lat,
      incidentLocation.lng
    );

    // Assume average speed of 40 km/h in city traffic
    const timeInHours = distance / 1000 / 40;
    const timeInMinutes = Math.max(2, Math.round(timeInHours * 60));

    return timeInMinutes;
  }
}

const emergencySystem = new EmergencyResponseSystem();

// Enhanced SOS with Emergency Response
function enhancedSOS() {
  if (!currentUser || !currentLocation) {
    showNotification("Registration and location required for SOS", "warning");
    return;
  }

  const incident = {
    id: `INC-${Date.now()}`,
    userId: currentUser.id,
    type: "emergency",
    location: currentLocation,
    timestamp: new Date().toISOString(),
    status: "active",
    severity: "critical",
  };

  // Dispatch emergency response
  const responses = emergencySystem.dispatchEmergencyResponse(incident);

  // Show emergency response details
  const responseDiv = document.createElement("div");
  responseDiv.className = "emergency-response";
  responseDiv.innerHTML = `
                <h3 style="color: #e74c3c;"><i class="fas fa-ambulance"></i> Emergency Response Activated</h3>
                <div class="response-teams">
                    ${responses
                      .map(
                        (response) => `
                        <div class="response-team" style="background: #fff3f3; padding: 10px; margin: 5px 0; border-radius: 5px;">
                            <strong>${response.teamType} (${
                          response.teamId
                        })</strong><br>
                            Status: ${response.status.toUpperCase()}<br>
                            ETA: ${response.eta} minutes
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

  incidents.push(incident);
  addIncidentToList(incident);
  addEmergencyMarkerToMap(currentLocation.lat, currentLocation.lng);

  // Add response info to tourist panel
  const touristPanel = document.querySelector(".tourist-panel");
  const existingResponse = touristPanel.querySelector(".emergency-response");
  if (existingResponse) {
    existingResponse.remove();
  }
  touristPanel.appendChild(responseDiv);

  showNotification("EMERGENCY ACTIVATED! Help is on the way!", "danger");
  updateStats();

  // Simulate response updates
  setTimeout(() => {
    showNotification("Emergency teams have been dispatched", "warning");
  }, 2000);

  setTimeout(() => {
    showNotification("Police unit is en route to your location", "warning");
  }, 5000);

  setTimeout(() => {
    showNotification("Medical team has arrived at your location", "success");
  }, 10000);
}

// Add enhanced featurex to buttons
function addEnhancedFeatures() {
  // Add AI Analysis button
  const aiAnalysisBtn = document.createElement("button");
  aiAnalysisBtn.className = "btn btn-warning";
  aiAnalysisBtn.innerHTML = '<i class="fas fa-brain"></i> AI Safety Analysis';
  aiAnalysisBtn.onclick = performSafetyAnalysis;

  // Add Verify ID button
  const verifyBtn = document.createElement("button");
  verifyBtn.className = "btn btn-success";
  verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Digital ID';
  verifyBtn.onclick = () => {
    if (currentUser && currentUser.blockchainId) {
      verifyDigitalIdentity(currentUser.blockchainId);
    } else {
      showNotification("No digital ID to verify", "warning");
    }
  };

  // Add Enhanced SOS button
  const enhancedSOSBtn = document.createElement("button");
  enhancedSOSBtn.className = "btn btn-emergency";
  enhancedSOSBtn.innerHTML =
    '<i class="fas fa-exclamation-triangle"></i> ENHANCED SOS';
  enhancedSOSBtn.onclick = enhancedSOS;

  // Insert buttons into tourist panel
  const touristPanel = document.querySelector(".tourist-panel");
  const sosButton = touristPanel.querySelector(".btn-emergency");
  if (sosButton) {
    touristPanel.insertBefore(aiAnalysisBtn, sosButton);
    touristPanel.insertBefore(verifyBtn, sosButton);
    touristPanel.insertBefore(enhancedSOSBtn, sosButton);
  }
}

// Real-time updates simulation
function startRealTimeUpdates() {
  setInterval(() => {
    // Simulate tourist movement and safety updates
    if (currentLocation && currentUser) {
      // Small random movement
      currentLocation.lat += (Math.random() - 0.5) * 0.001;
      currentLocation.lng += (Math.random() - 0.5) * 0.001;

      // Update safety status
      const safety = aiGeoFencing.checkLocationSafety(
        currentLocation.lat,
        currentLocation.lng
      );
      updateSafetyStatus(safety);

      // Update tourist marker
      const marker = document.getElementById(`tourist-${currentUser.id}`);
      if (marker) {
        const x = ((currentLocation.lng + 180) / 360) * 100;
        const y = ((currentLocation.lat + 90) / 180) * 100;
        marker.style.left = `${x}%`;
        marker.style.top = `${100 - y}%`;
      }
    }
  }, 5000); // Update every 5 seconds
}

// Initialize application
function initializeApp() {
  console.log("Smart Tourist Safety System Initialized");

  // Add enhanced features
  addEnhancedFeatures();

  // Start real-time updates
  startRealTimeUpdates();

  // Show welcome message
  setTimeout(() => {
    showNotification(
      "Welcome to Smart Tourist Safety System! Register to get started.",
      "success"
    );
  }, 1000);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeApp);

// Additional utility functions
function exportIncidentReport() {
  if (incidents.length === 0) {
    showNotification("No incidents to export", "warning");
    return;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totalIncidents: incidents.length,
    incidents: incidents,
    geofences: geofences.length,
    summary: {
      emergencyCount: incidents.filter((i) => i.type === "emergency").length,
      resolvedCount: incidents.filter((i) => i.status === "resolved").length,
      activeCount: incidents.filter((i) => i.status === "active").length,
    },
  };

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(report, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute(
    "download",
    `incident-report-${Date.now()}.json`
  );
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  showNotification("Incident report exported successfully", "success");
}

function clearAllData() {
  if (
    confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    )
  ) {
    currentUser = null;
    currentLocation = null;
    geofences = [];
    tourists = [];
    incidents = [];
    authorityLoggedIn = false;

    // Clear UI
    document.getElementById("incidentsList").innerHTML =
      '<div class="incident-item">No incidents reported</div>';
    document.getElementById("touristMarkers").innerHTML = "";
    document.getElementById("geofenceAreas").innerHTML = "";
    document.getElementById("locationStatus").innerHTML =
      "Location: Not shared";
    document.getElementById("blockchainId").textContent = "ID: Not Generated";

    updateStats();
    showNotification("All data cleared successfully", "success");
  }
}

// Add export and clear buttons to authority panel
function addUtilityButtons() {
  const authorityPanel = document.querySelector(".authority-panel");

  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-warning";
  exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Report';
  exportBtn.onclick = exportIncidentReport;

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn";
  clearBtn.innerHTML = '<i class="fas fa-trash"></i> Clear Data';
  clearBtn.onclick = clearAllData;

  authorityPanel.appendChild(exportBtn);
  authorityPanel.appendChild(clearBtn);
}

// Add utility buttons when page loads
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(addUtilityButtons, 100);
});
