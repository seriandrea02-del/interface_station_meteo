const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwNGUyZTE1OTE3YjE0M2FhYmE0ODljZTQxMzYwZjJhNiIsImlhdCI6MTc3NTcxNzI0MSwiZXhwIjoyMDkxMDc3MjQxfQ.o3oia3P0vIMMskBU1bPwQpfmgiAC2e_rwfogS3GhwFY";

const CONFIG = {
  entities: {
    temperature: "sensor.esp32tanjutest_temperature",
    humidity:  "sensor.esp32tanjutest_humidite",// mettre les entité a recupéreé dans HA
    pressure:  "sensor.esp32tanjutest_pression",// mettre les entité a recupéreé dans HA
    wind:  null,// mettre les entité a recupéreé dans HA
    location: "zone.home"
  }
};
//
const el = {
  temp: document.getElementById("tempValue"),
  hum: document.getElementById("humValue"),
  pres: document.getElementById("presValue"),
  wind: document.getElementById("windValue"),
  clock: document.getElementById("clock"),
  hint: document.getElementById("hint"),
  btnHumidity: document.getElementById("btnHumidity"),
  btnPressure: document.getElementById("btnPressure"),
  btnWind: document.getElementById("btnWind"),
  emoji: document.getElementById("emoji"),
};

function getTemperatureEmoji(value) {
  if (value >= 30) return "🥵";
  if (value >= 18) return "😎";
  if (value >= 14) return "🙂";
  if (value >= 4) return "🥶";
  return "❄️";
}
// METTRE AJOURS LHORLOGE
function startClock() {
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    el.clock.textContent = `${hh}:${mm}`;
  };
  tick();
  setInterval(tick, 1000);
}
// ENVOIS DES REQUETTE DOTORISATION DACCES 
async function haGet(path) {
  const res = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${path}`);
  }

  return res.json();
}

function formatValue(stateObj) {
  if (!stateObj) return "N/A";
  if (stateObj.state === "unknown" || stateObj.state === "unavailable") return "N/A";

  const raw = Number(stateObj.state);
  const unit = stateObj.attributes?.unit_of_measurement || "";

  if (Number.isFinite(raw)) {
    return unit ? `${raw.toFixed(2)} ${unit}` : raw.toFixed(2);
  }
  return unit ? `${stateObj.state} ${unit}` : stateObj.state;
}

function updateUI(states) {
  const t = states[CONFIG.entities.temperature];
  const h = CONFIG.entities.humidity ? states[CONFIG.entities.humidity] : null;
  const p = CONFIG.entities.pressure ? states[CONFIG.entities.pressure] : null;
  const w = CONFIG.entities.wind ? states[CONFIG.entities.wind] : null;

  if (t && t.state !== "unknown" && t.state !== "unavailable") {
    const value = Number(t.state);
    const unit = t.attributes?.unit_of_measurement || "°C";

    if (Number.isFinite(value)) {
      el.temp.textContent = `${value.toFixed(2)}${unit}`;
      el.emoji.textContent = getTemperatureEmoji(value);
    } else {
      el.temp.textContent = `--${unit}`;
      el.emoji.textContent = "❓";
    }
  } else {
    el.temp.textContent = "--°C";
    el.emoji.textContent = "❓";
  }

  el.hum.textContent = formatValue(h);
  el.pres.textContent = formatValue(p);
  el.wind.textContent = formatValue(w);
}

async function loadAllStates() {
  const list = await haGet("/api/states");
  const map = {};
  for (const s of list) map[s.entity_id] = s;
  return map;
}

let mapInstance, marker;

function initMap(lat, lon) {
  mapInstance = L.map("map", { zoomControl: true }).setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapInstance);

  marker = L.marker([lat, lon]).addTo(mapInstance);
}

function updateMap(lat, lon) {
  if (!mapInstance) return initMap(lat, lon);
  marker.setLatLng([lat, lon]);
  mapInstance.setView([lat, lon], mapInstance.getZoom());
}

function updateLocation(states) {
  const loc = states[CONFIG.entities.location];
  const lat = loc?.attributes?.latitude;
  const lon = loc?.attributes?.longitude;
  if (typeof lat === "number" && typeof lon === "number") {
    updateMap(lat, lon);
  }
}

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
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 3,
        fill: false
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 8 }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function updateChartWithSingleValue(tempValue) {
  if (!chart) initChart();

  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const label = `${hh}:${mm}:${ss}`;

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(Number(tempValue.toFixed(2)));

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

async function refreshData() {
  try {
    const states = await loadAllStates();
    updateUI(states);
    updateLocation(states);

    const t = states[CONFIG.entities.temperature];
    if (t && t.state !== "unknown" && t.state !== "unavailable") {
      const value = Number(t.state);
      if (Number.isFinite(value)) {
        updateChartWithSingleValue(value);
        el.hint.textContent = `Données mises à jour : ${value.toFixed(2)} °C`;
      } else {
        el.hint.textContent = "Température non numérique.";
      }
    } else {
      el.hint.textContent = "Capteur température sans valeur.";
    }
  } catch (e) {
    console.error(e);
    el.hint.textContent = `Erreur : ${e.message}`;
  }
}

function setupButtons() {
  el.btnHumidity.onclick = () => {
    el.hint.textContent = "Aucun capteur humidité configuré.";
  };
  el.btnPressure.onclick = () => {
    el.hint.textContent = "Aucun capteur pression configuré.";
  };
  el.btnWind.onclick = () => {
    el.hint.textContent = "Aucun capteur vent configuré.";
  };
}

(function main() {
  startClock();
  setupButtons();
  initChart();
  refreshData();
  setInterval(refreshData, 5000);
})();
