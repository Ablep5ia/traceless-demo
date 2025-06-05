const toggleBtn = document.getElementById("greenRoutesToggle");
const dropdown = document.getElementById("greenRoutesDropdown");
const arrow = document.getElementById("greenRoutesArrow").querySelector("img");

// Coordinates for Brussels and Amsterdam
const brussels = [50.8503, 4.3517];
const amsterdam = [52.3676, 4.9041];

const map = L.map("map", {
  zoomControl: false,
  attributionControl: false,
}).setView([51.5, 4.9], 7);

// Minimal tile style (very light)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  opacity: 1,
}).addTo(map);

// Add minimal markers
L.circleMarker(brussels, {
  radius: 6,
  color: "black",
  fillColor: "black",
  fillOpacity: 1,
}).addTo(map);
L.circleMarker(amsterdam, {
  radius: 6,
  color: "black",
  fillColor: "black",
  fillOpacity: 1,
}).addTo(map);

// Add line between points
L.polyline([brussels, amsterdam], {
  color: "black",
  weight: 4,
  smoothFactor: 1,
}).addTo(map);

L.tooltip({ permanent: true, direction: "right", offset: [8, 0] })
  .setContent("Brussels")
  .setLatLng(brussels)
  .addTo(map);

L.tooltip({ permanent: true, direction: "right", offset: [-8, 0] })
  .setContent("Amsterdam")
  .setLatLng(amsterdam)
  .addTo(map);

toggleBtn.addEventListener("click", () => {
  dropdown.classList.toggle("show");

  // rotating arrow
  if (dropdown.classList.contains("show")) {
    arrow.style.transform = "rotate(90deg)";

    // RERENDER MAP
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  } else {
    arrow.style.transform = "rotate(0deg)";
  }
});
