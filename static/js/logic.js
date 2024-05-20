// Store USGS GeoJSON earthquake API endpoint as queryUrl. Use "all earthquakes / past 7 days" endpoint.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create function to determine marker color based on depth
function markerColor(depth) {
  return depth > 90 ? '#800026' :
         depth > 70 ? '#BD0026' :
         depth > 50 ? '#E31A1C' :
         depth > 30 ? '#FC4E2A' :
         depth > 10 ? '#FD8D3C' :
         depth > -10 ? '#FEB24C' :
         '#fc9640';
}

// Perform a GET request to the USGS endpoint GeoJson query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Create sub-function to determine marker size based on magnitude
  function markerSize(magnitude) {
    return magnitude * 4; // Adjust the multiplier as needed
  }

  // Define a sub-function to create circle markers with custom styles
  function pointToLayerFn(feature, latlng) {
    let options = {
      radius: markerSize(feature.properties.mag),
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    return L.circleMarker(latlng, options);
  }

  // Define a function to run once for each feature in the features array
  function onEachFeatureFn(feature, layer) {
    layer.bindPopup(`
      <h3 class="popup-heading">${feature.properties.place}</h3>
      <hr>
      <p>${new Date(feature.properties.time)}</p>
      <p>Depth: ${feature.geometry.coordinates[2]} km</p>
    `);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayerFn,
    onEachFeature: onEachFeatureFn
  });

  // Send the earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the street map tile layer
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create the global "all earthquakes / past 7 days" map, giving it the street map and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [37.09, -95.71], // Center coordinates
    zoom: 5, // Initial zoom level
    layers: [street, earthquakes] // Layers to display on load
  });

  // Create an overlay object to hold our overlay
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Add legend organized by depth in descending order from deepest to shallowest displayed by color
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
        depths = [90, 70, 50, 30, 10, -10];

    div.innerHTML += "<h3 style='text-align: left'>Depth</h3>";

    for (var i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<div><i style="background:' + markerColor(depths[i]) + '"></i> ' +
        (depths[i] > 0 ? depths[i] + (depths[i - 1] ? '&ndash;' + depths[i - 1] : '+') :
         depths[i] + '–' + (depths[i] + 20)) + '</div>';
    }
    return div;
  };
  legend.addTo(myMap);
}

