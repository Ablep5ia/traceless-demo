// Grab the URL query string (after the `?`)
const params = new URLSearchParams(window.location.search);

// Extract individual fields
const trip = params.get("trip");
const startVehicle = params.get("startVehicle");
const start = params.get("startLocation");
const endVehicle = params.get("endVehicle");
const end = params.get("endLocation");

let map;
let directionsService;
let directionsRenderer;
let userMarker;

const emissionData = [
  { type: "flight", value: 246 },
  { type: "dcar", value: 171 },
  { type: "pcar", value: 170 },
  { type: "ebike", value: 5 },
  { type: "walk", value: 0 },
];

window.initMap = function () {
  if (!start || !end) {
    alert("Missing start or end location.");
    return;
  }

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 52, lng: 5 },
    mapTypeControl: false,
    streetViewControl: false,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "black",
      strokeWeight: 4,
    },
  });
  directionsRenderer.setMap(map);

  // Get and draw the route
  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        const leg = response.routes[0].legs[0];

        // getting distance from api's legs
        let distanceKm = Number((leg.distance.value / 1000).toFixed(1));

        // calculating emissions
        let match = emissionData.find(
          (item) => item.type === startVehicle
        ).value;

        if (match) {
          let emissionAmount = Number(((match * distanceKm) / 1000).toFixed(1));
          console.log("emissions: ", emissionAmount);

          document.getElementById("distance-result").innerHTML = `${distanceKm}`
          document.getElementById("emission-result").innerHTML = `${emissionAmount}`
        }

        new google.maps.Marker({
          position: leg.start_location,
          map,
          icon: {
            url: "../assets/icons/Other/start.svg",
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 50),
          },
          title: "Start: " + leg.start_address,
        });

        new google.maps.Marker({
          position: leg.end_location,
          map,
          icon: {
            url: "../assets/icons/Other/end.svg",
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 50),
          },
          title: "End: " + leg.end_address,
        });
      } else {
        alert("Directions request failed: " + status);
      }
    }
  );

  // Track GPS position
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!userMarker) {
          userMarker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
              url: "../assets/icons/Vehicles/car/CarGreen.svg",
              scaledSize: new google.maps.Size(26, 26),
              anchor: new google.maps.Point(13, 13), // center point of icon
            },
            title: "Your Location",
          });
        } else {
          userMarker.setPosition(pos);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  }
};
