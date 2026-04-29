const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxMGM4ZTcyZGE0MDY0YjUxYjM2MWMwYzMwOWVmMmU5YSIsImlhdCI6MTc3NDk3Nzc0MiwiZXhwIjoyMDkwMzM3NzQyfQ.MFFjWufEEzBfRzl29GLbYzXZqJI4Ihc8FCIKhExARo4";
const HA_BASE_URL = "http://192.168.1.8:8123";
const CONFIG = {
  entities: {
    temperature: "sensor.esp32_temperature_esp32",
    humidity: "sensor.humidity",
    pressure: "sensor.pressure",
    wind: "sensor.wind_speed",
    location: "zone.home"
  }
};

const el = {
  temp: document.getElementById("tempValue"),
  hum: document.getElementById("humValue"),
  pres: document.getElementById("presValue"),
  wind: document.getElementById("windValue"),
  clock: document.getElementById("clock"),
  hint: document.getElementById("hint"),
  emoji: document.getElementById("emoji")
};

//////////////////// HORLOGE
function startClock() {
  const tick = () => {
    const d = new Date();
    el.clock.textContent =
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  tick();
  setInterval(tick, 1000);
}

//////////////////// API
async function haGet() {
  const res = await fetch("/api/states", {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  });

  if (!res.ok) throw new Error("Erreur API");

  return res.json();
}

//////////////////// FORMAT
function formatSensor(s) {
  if (!s || s.state === "unknown" || s.state === "unavailable") {
    return "N/A";
  }

  const v = Number(s.state);
  if (!Number.isFinite(v)) return "N/A";

  const unit = s.attributes?.unit_of_measurement || "";
  return `${v.toFixed(2)} ${unit}`;
}

//////////////////// EMOJI
function getTempEmoji(v) {
  if (v >= 35) return "🥵";
  if (v >= 25) return "😎";
  if (v >= 15) return "🙂";
  if (v >= 5) return "🥶";
  return "❄️";
}

function getHumidityEmoji(v) {
  if (v > 80) return "💦";
  if (v > 50) return "🙂";
  return "🏜️";
}

function getWindEmoji(v) {
  if (v > 50) return "🌪️";
  if (v > 20) return "💨";
  return "🍃";
}

//////////////////// MAP
let map, marker;

function updateMap(lat, lon) {
  if (!map) {
    map = L.map("map").setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);

    marker = L.marker([lat, lon]).addTo(map);
  } else {
    marker.setLatLng([lat, lon]);
  }
}

//////////////////// GRAPH
let chart;

function initChart() {
  const ctx = document.getElementById("chart");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Température",
        data: [],
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

function updateChart(v) {
  const d = new Date();
  const label =
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(v);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

//////////////////// REFRESH
async function refresh() {
  try {
    const data = await haGet();

    const mapData = {};
    data.forEach(s => mapData[s.entity_id] = s);

    const t = mapData[CONFIG.entities.temperature];
    const h = mapData[CONFIG.entities.humidity];
    const p = mapData[CONFIG.entities.pressure];
    const w = mapData[CONFIG.entities.wind];
    const loc = mapData[CONFIG.entities.location];

    // TEMP
    if (t) {
      const v = Number(t.state);
      if (Number.isFinite(v)) {
        el.temp.textContent = `${v.toFixed(2)}°C`;
        el.emoji.textContent = getTempEmoji(v);
        updateChart(v);
      }
    }

    // HUMIDITE
    const hv = Number(h?.state);
    el.hum.textContent =
      formatSensor(h) +
      (Number.isFinite(hv) ? " " + getHumidityEmoji(hv) : "");

    // PRESSION
    el.pres.textContent = formatSensor(p);

    // VENT
    const wv = Number(w?.state);
    el.wind.textContent =
      formatSensor(w) +
      (Number.isFinite(wv) ? " " + getWindEmoji(wv) : "");

    // MAP
    if (loc?.attributes) {
      updateMap(loc.attributes.latitude, loc.attributes.longitude);
    }

    el.hint.textContent = "Données mises à jour";
  } catch (e) {
    console.error(e);
    el.hint.textContent = "Erreur API";
  }
}

//////////////////// INIT
(function () {
  startClock();
  initChart();
  refresh();
  setInterval(refresh, 5000);
})();