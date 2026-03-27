let animals = [];
let currentIndex = 0;
let trendChart;
let map, mapMarker;

const currentAnimalEl = document.getElementById('currentAnimal');
const prevBtn = document.getElementById('prevAnimal');
const nextBtn = document.getElementById('nextAnimal');

async function fetchAnimals() {
  try {
    const res = await fetch('http://localhost:3000/animals'); // Get all animals
    animals = await res.json();
    if (animals.length) updateAnimal();
  } catch (err) {
    console.error('Failed to fetch animals:', err);
  }
}

prevBtn.addEventListener('click', () => {
  if (!animals.length) return;
  currentIndex = (currentIndex - 1 + animals.length) % animals.length;
  updateAnimal();
});

nextBtn.addEventListener('click', () => {
  if (!animals.length) return;
  currentIndex = (currentIndex + 1) % animals.length;
  updateAnimal();
});

async function updateAnimal() {
  if (!animals.length) return;
  const animal = animals[currentIndex];

  // Display animal info
  currentAnimalEl.textContent = `${animal.tag_number} (${animal.species})`;

  // Fetch telemetry for this animal
  let logs = [];
  try {
    const res = await fetch(`http://localhost:3000/telemetry?animal_code=${animal.animal_code}`);
    logs = await res.json();
  } catch (err) {
    console.error('Failed to fetch telemetry:', err);
  }

  const latest = logs[logs.length - 1] || {};

  // Update telemetry UI
  document.getElementById('hr').textContent =
    latest.heart_rate_bpm !== undefined && latest.heart_rate_bpm !== null
      ? `${latest.heart_rate_bpm} bpm`
      : '-';

  document.getElementById('temp').textContent =
    latest.temperature_c !== undefined && latest.temperature_c !== null
      ? `${parseFloat(latest.temperature_c).toFixed(1)} °C`
      : '-';

  document.getElementById('orientation').textContent =
    latest.orientation_deg !== undefined && latest.orientation_deg !== null
      ? latest.orientation_deg
      : 'Stable';

  document.getElementById('motion').textContent = latest.motion || 'Walking';

  document.getElementById('battery').textContent =
    latest.battery_pct !== undefined && latest.battery_pct !== null
      ? `${latest.battery_pct}%`
      : '-';

  document.getElementById('batteryBar').style.width =
    latest.battery_pct !== undefined && latest.battery_pct !== null
      ? `${latest.battery_pct}%`
      : '0%';

  document.getElementById('solar').textContent = latest.solar_status || 'Active';

  document.getElementById('systemStatus').innerHTML = `<span style="color:${
    latest.system_connected ? 'green' : 'red'
  }">${latest.system_connected ? 'Connected' : 'Disconnected'}</span>`;

  // Update logs list
  const logsEl = document.getElementById('logs');
  logsEl.innerHTML = '';
  logs.forEach(log => {
    logsEl.innerHTML += `<li>[${new Date(log.recorded_at).toLocaleTimeString()}] HR: ${
      log.heart_rate_bpm !== undefined && log.heart_rate_bpm !== null ? log.heart_rate_bpm : '-'
    }, Temp: ${
      log.temperature_c !== undefined && log.temperature_c !== null ? parseFloat(log.temperature_c).toFixed(1) : '-'
    }, Motion: ${log.motion || '-'}, Battery: ${
      log.battery_pct !== undefined && log.battery_pct !== null ? log.battery_pct : '-'
    }%</li>`;
  });

  // Update chart and map
  updateChart(logs);
  if (latest.latitude && latest.longitude) updateMap(latest.latitude, latest.longitude);
}

function updateChart(history) {
  const ctx = document.getElementById('trendChart');
  const labels = history.map(h => new Date(h.recorded_at).toLocaleTimeString());
  const hrData = history.map(h => h.heart_rate_bpm || 0);
  const tempData = history.map(h => (h.temperature_c !== undefined ? parseFloat(h.temperature_c) : 0));

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Heart Rate (bpm)', data: hrData, borderColor: 'red', fill: false, tension: 0.3 },
        { label: 'Temperature (°C)', data: tempData, borderColor: 'blue', fill: false, tension: 0.3 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}

function updateMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(`${animals[currentIndex].tag_number}`).openPopup();
  } else {
    map.setView([lat, lon], 14);
    mapMarker.setLatLng([lat, lon]);
  }
}

fetchAnimals();
