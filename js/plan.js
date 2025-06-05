document.querySelectorAll(".trip-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".trip-option")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tripOptions = document.querySelectorAll(
    'input[type="radio"][name="trip"]'
  );

  function updateRadioIcons() {
    document.querySelectorAll(".trip-option").forEach((option) => {
      const input = option.querySelector('input[type="radio"]');
      const icon = option.querySelector(".circle-icon");
      const filled = icon.getAttribute("data-checked");
      const empty = "../assets/icons/Other/TickGreen.svg";

      icon.src = input.checked ? filled : empty;
    });
  }

  tripOptions.forEach((input) => {
    input.addEventListener("change", updateRadioIcons);
  });

  updateRadioIcons();
});

// map-locations auto-complete
function initAutocomplete() {
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  new google.maps.places.Autocomplete(startInput, { types: ["geocode"] });
  new google.maps.places.Autocomplete(endInput, { types: ["geocode"] });
}

// validation
document.getElementById("trip-form").addEventListener("submit", function (e) {
  const startVehicle = document.querySelector(
    'select[name="startVehicle"]'
  ).value;
  const endVehicle = document.querySelector('select[name="endVehicle"]').value;
  const startLocation = document.getElementById("startInput").value.trim();
  const endLocation = document.getElementById("endInput").value.trim();

  // Check if valid
  if (
    !startVehicle ||
    startVehicle === "Vehicle" ||
    !startLocation ||
    !endLocation
  ) {
    alert("Please fill out all fields before continuing.");
    e.preventDefault();
  }
});
