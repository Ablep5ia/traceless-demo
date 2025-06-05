let firstUpdateSkipped = false;

// check for permission to gps
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
    },
    (error) => {
      console.error("Error getting location:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// getting html ids
function loadHTML(id, file, cssFile) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(id).innerHTML = data;

      if (cssFile) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssFile;
        document.head.appendChild(link);
      }
    })
    .catch((err) => console.error("Error loading " + file, err));
}

// ------------------------- loading correct files for these tags
loadHTML(
  "index-header",
  "html/header.html",
  "css/global-styles/header.css"
);
loadHTML("index-nav", "nav/nav.html", "nav/nav.css");

// ------------------------- hooking buttons up
// -------------- Transport Button
const transportButton = document.getElementById("transport");
const dropdown = document.getElementById("transport-dropdown");
const transportClass = document.getElementsByClassName("transport")[0];
const tagline = document.getElementById("transport-tagline");

transportButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const rect = transportButton.getBoundingClientRect();
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.top = `${rect.bottom}px`;
  dropdown.classList.toggle("visible");
  dropdown.style.border = "none";

  transportClass.classList
    ? transportClass.classList.toggle("transformed")
    : "";

  if (tagline.style.display === "flex") {
    resetTransportButton();
  } else {
    transportButton.querySelector(".transport-type").style.display = "none";
    transportButton.querySelector(".transport-value").style.display = "none";
    tagline.style.display = "flex";
    transportButton.style.backgroundColor = "var(--primary-color)";
  }
});

document.addEventListener("click", (e) => {
  if (
    !transportButton.contains(e.target) &&
    !dropdown.contains(e.target) &&
    !transportChangeButton.contains(e.target)
  ) {
    dropdown.classList.remove("visible");
    resetTransportButton();
  }
});

// -------------- Transport Change Button ??? TODO: FIX IT
const transportChangeButton = document.getElementById("transport-type-change");
const transportVisibleContent = document.getElementById(
  "transport-type-change-dropdown"
);

transportChangeButton.addEventListener("click", () => {
  transportVisibleContent.classList.toggle("visible");
});

function resetTransportButton() {
  transportButton.querySelector(".transport-type").style.display = "";
  transportButton.querySelector(".transport-value").style.display = "";
  transportVisibleContent.classList.remove("visible");
  transportButton.style.backgroundColor = "inherit";
  tagline.style.display = "none";
  if (transportClass) {
    transportClass.classList.remove("transformed");
  }
}

// ------------------------- Circle fillament
function setProgress(percent) {
  if (percent > 100) {
    percent = 100;
  }
  const ring = document.getElementById("progress-ring");
  const circumference = 2 * Math.PI * 120; // radius is 120
  const offset = circumference * (1 + percent / 100);

  ring.style.strokeDashoffset = offset;

  // --- place to change colors of the circle ---
  const stops = document.querySelectorAll("#gradient stop");
  const rootStyles = getComputedStyle(document.documentElement);
  stops[0].setAttribute(
    "stop-color",
    rootStyles.getPropertyValue("--primary-color").trim()
  );
  stops[1].setAttribute(
    "stop-color",
    rootStyles.getPropertyValue("--secondary-color").trim()
  );
  stops[2].setAttribute(
    "stop-color",
    rootStyles.getPropertyValue("--accent-color").trim()
  );
}

// Calculating current emissions:
function updateCurrentEmissions(emissionKg) {
  const maxEmission = 10;

  // Update number
  document.getElementById("circle-number").textContent = `${emissionKg.toFixed(
    1
  )} kg`;

  // Update donut
  const percent = Math.min((emissionKg / maxEmission) * 100, 100);
  setProgress(percent);
}

let lastPos = null;
let totalDistanceKm = 0;

const selectedVehicle = localStorage.getItem("vehicleType") || "dcar";

const emissionRate = 171;

function getDistanceBetween(p1, p2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- TO SIMULATE MOVEMENT CHANGE simulate TO true ----
window.simulate = false;
let fakeOffset = 0;

document.getElementById("circle-hidden-press-simulate").addEventListener("click", () => {
  window.simulate = !window.simulate;
  alert("Simulation mode is now: " + window.simulate);

  if (window.simulate) {
    startSimulation();
  } else {
    startGpsTracking();
  }
});


function positionUpdate(pos) {
  const curr = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  console.log("Current position:", curr);

  if (lastPos) {
    const dist = getDistanceBetween(lastPos, curr);

    if (!firstUpdateSkipped) {
      console.log("Skipping first update to avoid spike.");
      firstUpdateSkipped = true;
      lastPos = curr;
      return;
    }

    totalDistanceKm += dist;
    const emissionGrams = totalDistanceKm * emissionRate;
    const emissionKg = emissionGrams / 1000;

    console.log("Distance moved:", dist.toFixed(4), "km");
    console.log("Total distance:", totalDistanceKm.toFixed(4), "km");
    console.log("Emissions:", emissionKg.toFixed(4), "kg");

    updateCurrentEmissions(emissionKg);
  } else {
    console.log("First position recorded.");
  }

  lastPos = curr;
}


// if simulate is true we do this instead
let simulateInterval = null;
let geoWatchId = null;

function startSimulation() {
  stopSimulation(); 
  simulateInterval = setInterval(() => {
    const simulatedPos = {
      coords: {
        latitude: 55.8628864 + fakeOffset,
        longitude: 9.8435072 + fakeOffset,
      },
    };
    fakeOffset += 0.001;
    console.log("Simulated position update");
    positionUpdate(simulatedPos);
  }, 3000);
}

function stopSimulation() {
  if (simulateInterval) {
    clearInterval(simulateInterval);
    simulateInterval = null;
  }
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }
}

function startGpsTracking() {
  stopSimulation();
  geoWatchId = navigator.geolocation.watchPosition(
    positionUpdate,
    (err) => console.warn("Geolocation error:", err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );
}

function updateCurrentEmissions(kg) {
  document.getElementById("circle-number").textContent = `${kg.toFixed(1)} kg`;

  const percent = Math.min((kg / 10) * 100, 100); // Assuming 10 kg max for ring fill
  setProgress(percent);
}

if (window.simulate) {
  startSimulation();
} else {
  startGpsTracking();
}
