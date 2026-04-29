const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2MzlkYjlkYTdhZDg0MmUyOTBlNGJkZGQ4ZTRmYjMzYiIsImlhdCI6MTc3NzQ3MDY1NywiZXhwIjoyMDkyODMwNjU3fQ._-bff3MPzAtSvrpCsAWpmz5MQNz3sikaVwoI-Guazpo";

const CONFIG = {
  homeAssistant: {
    location: "zone.home",
    entities: {
      temperature: "sensor.espbonbon_temperature_2",
      humidity: "sensor.espbonbon_humidite_2",
      pressure: "sensor.espbonbon_pression_2",
      wind: "sensor.esp32_weather_vent",
      light: "sensor.espbonbon_luminosite_2",
      rain: "sensor.espbonbon_pluviometrie"
    }
  },

  refreshMs: 5000,
  weatherRefreshMs: 600000,
  maxChartPoints: 20
};

const el = {
  temp: document.getElementById("tempValue"),
  hum: document.getElementById("humValue"),
  pres: document.getElementById("presValue"),
  wind: document.getElementById("windValue"),
  light: document.getElementById("lightValue"),
  rain: document.getElementById("rainValue"),
  clock: document.getElementById("clock"),
  hint: document.getElementById("hint"),
  emoji: document.getElementById("emoji"),
  chartTitle: document.getElementById("chartTitle"),

  btnTemperature: document.getElementById("btnTemperature"),
  btnHumidity: document.getElementById("btnHumidity"),
  btnPressure: document.getElementById("btnPressure"),
  btnWind: document.getElementById("btnWind"),

  cityInput: document.getElementById("cityInput"),
  btnSearchCity: document.getElementById("btnSearchCity"),
  btnUseHomeLocation: document.getElementById("btnUseHomeLocation"),
  weatherStatus: document.getElementById("weatherStatus"),

  extCity: document.getElementById("extCity"),
  extDesc: document.getElementById("extDesc"),
  extIcon: document.getElementById("extIcon"),
  extTemp: document.getElementById("extTemp"),
  extFeels: document.getElementById("extFeels"),
  extHum: document.getElementById("extHum"),
  extPres: document.getElementById("extPres"),
  extWind: document.getElementById("extWind"),
  extRain: document.getElementById("extRain")
};

const CHART_SERIES = {
  temperature: {
    label: "Température capteur",
    title: "Variation température capteur",
    entityKey: "temperature",
    fallbackUnit: "°C"
  },
  humidity: {
    label: "Humidité capteur",
    title: "Variation humidité capteur",
    entityKey: "humidity",
    fallbackUnit: "%"
  },
  pressure: {
    label: "Pression capteur",
    title: "Variation pression capteur",
    entityKey: "pressure",
    fallbackUnit: "hPa"
  },
  wind: {
    label: "Vent capteur",
    title: "Variation vent capteur",
    entityKey: "wind",
    fallbackUnit: "km/h"
  }
};

let currentChartKey = "temperature";
let chart = null;
let mapInstance = null;
let marker = null;
let currentExternalCoords = null;
let currentExternalPlaceName = null;

const historyStore = {
  temperature: { labels: [], data: [] },
  humidity: { labels: [], data: [] },
  pressure: { labels: [], data: [] },
  wind: { labels: [], data: [] }
};

function getTemperatureEmoji(value) {
  if (value >= 30) return "🥵";
  if (value >= 18) return "😎";
  if (value >= 14) return "🙂";
  if (value >= 4) return "🥶";
  return "❄️";
}

function getWeatherEmoji(code) {
  if ([0].includes(code)) return "☀️";
  if ([1].includes(code)) return "🌤️";
  if ([2].includes(code)) return "⛅";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([66, 67].includes(code)) return "🌨️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
}

function weatherDescriptionFr(code) {
  const map = {
    0: "Ciel dégagé",
    1: "Plutôt dégagé",
    2: "Partiellement nuageux",
    3: "Couvert",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine légère",
    53: "Bruine modérée",
    55: "Bruine dense",
    56: "Bruine verglaçante légère",
    57: "Bruine verglaçante dense",
    61: "Pluie faible",
    63: "Pluie modérée",
    65: "Pluie forte",
    66: "Pluie verglaçante légère",
    67: "Pluie verglaçante forte",
    71: "Neige faible",
    73: "Neige modérée",
    75: "Neige forte",
    77: "Grains de neige",
    80: "Averses faibles",
    81: "Averses modérées",
    82: "Averses fortes",
    85: "Averses de neige faibles",
    86: "Averses de neige fortes",
    95: "Orage",
    96: "Orage avec grêle légère",
    99: "Orage avec forte grêle"
  };
  return map[code] || "Conditions météo inconnues";
}

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

function formatValue(stateObj, fallback = "N/A") {
  if (!stateObj) return fallback;
  if (stateObj.state === "unknown" || stateObj.state === "unavailable") return fallback;

  const raw = Number(stateObj.state);
  const unit = stateObj.attributes?.unit_of_measurement || "";

  if (Number.isFinite(raw)) {
    return unit ? `${raw.toFixed(2)} ${unit}` : raw.toFixed(2);
  }

  return unit ? `${stateObj.state} ${unit}` : stateObj.state;
}

function formatRainValue(stateObj) {
  if (!stateObj) return "N/A";
  if (stateObj.state === "unknown" || stateObj.state === "unavailable") return "N/A";

  const state = String(stateObj.state).toLowerCase();
  const deviceClass = stateObj.attributes?.device_class || "";

  if (deviceClass === "moisture" || state === "on" || state === "wet" || state === "rain") {
    return "Oui";
  }

  if (state === "off" || state === "dry" || state === "clear") {
    return "Non";
  }

  return formatValue(stateObj);
}

function updateUI(states) {
  const entities = CONFIG.homeAssistant.entities;

  const t = states[entities.temperature];
  const h = entities.humidity ? states[entities.humidity] : null;
  const p = entities.pressure ? states[entities.pressure] : null;
  const w = entities.wind ? states[entities.wind] : null;
  const l = entities.light ? states[entities.light] : null;
  const r = entities.rain ? states[entities.rain] : null;

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
  el.light.textContent = formatValue(l);
  el.rain.textContent = formatRainValue(r);
}

async function loadAllStates() {
  const list = await haGet("/api/states");
  const map = {};
  for (const s of list) {
    map[s.entity_id] = s;
  }
  return map;
}

function initMap(lat, lon) {
  mapInstance = L.map("map", { zoomControl: true }).setView([lat, lon], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
    referrerPolicy: "origin"
  }).addTo(mapInstance);

  marker = L.marker([lat, lon]).addTo(mapInstance);
}

function updateMap(lat, lon) {
  if (!mapInstance) {
    initMap(lat, lon);
    return;
  }

  marker.setLatLng([lat, lon]);
  mapInstance.setView([lat, lon], mapInstance.getZoom());
}

function getHomeCoordinates(states) {
  const loc = states[CONFIG.homeAssistant.location];
  const lat = loc?.attributes?.latitude;
  const lon = loc?.attributes?.longitude;

  if (typeof lat === "number" && typeof lon === "number") {
    return { lat, lon };
  }

  return null;
}

function updateLocation(states) {
  const coords = getHomeCoordinates(states);
  if (coords) {
    updateMap(coords.lat, coords.lon);
  }
}

function initChart() {
  const ctx = document.getElementById("chart");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: CHART_SERIES[currentChartKey].label,
        data: [],
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#cbd5e1",
            maxTicksLimit: 8
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          }
        },
        y: {
          ticks: {
            color: "#cbd5e1"
          },
          grid: {
            color: "rgba(255,255,255,0.08)"
          },
          beginAtZero: false
        }
      }
    }
  });
}

function getCurrentTimeLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function pushHistory(chartKey, value) {
  if (!Number.isFinite(value)) return;

  const store = historyStore[chartKey];
  store.labels.push(getCurrentTimeLabel());
  store.data.push(Number(value.toFixed(2)));

  if (store.labels.length > CONFIG.maxChartPoints) {
    store.labels.shift();
    store.data.shift();
  }
}

function renderCurrentChart() {
  if (!chart) initChart();

  const series = CHART_SERIES[currentChartKey];
  const store = historyStore[currentChartKey];

  chart.data.labels = [...store.labels];
  chart.data.datasets[0].data = [...store.data];
  chart.data.datasets[0].label = series.label;
  chart.update();

  el.chartTitle.textContent = series.title;
}

function setActiveButton(chartKey) {
  const buttons = {
    temperature: el.btnTemperature,
    humidity: el.btnHumidity,
    pressure: el.btnPressure,
    wind: el.btnWind
  };

  Object.entries(buttons).forEach(([key, button]) => {
    if (!button) return;
    button.classList.toggle("active", key === chartKey);
  });
}

function switchChart(chartKey) {
  currentChartKey = chartKey;
  setActiveButton(chartKey);
  renderCurrentChart();
  el.hint.textContent = `Graphique affiché : ${CHART_SERIES[chartKey].label}`;
}

function updateAllHistories(states) {
  const entities = CONFIG.homeAssistant.entities;

  const values = {
    temperature: states[entities.temperature],
    humidity: entities.humidity ? states[entities.humidity] : null,
    pressure: entities.pressure ? states[entities.pressure] : null,
    wind: entities.wind ? states[entities.wind] : null
  };

  Object.entries(values).forEach(([key, stateObj]) => {
    if (!stateObj) return;
    if (stateObj.state === "unknown" || stateObj.state === "unavailable") return;

    const numericValue = Number(stateObj.state);
    if (!Number.isFinite(numericValue)) return;

    pushHistory(key, numericValue);
  });
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Impossible de rechercher cette ville.");
  }

  const data = await res.json();
  if (!data.results || !data.results.length) {
    throw new Error("Ville introuvable.");
  }

  const place = data.results[0];
  return {
    lat: place.latitude,
    lon: place.longitude,
    name: place.name,
    country: place.country || ""
  };
}

async function fetchMeteoFranceByCoords(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/meteofrance?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code,precipitation,rain&timezone=auto`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erreur météo externe (${res.status})`);
  }

  return res.json();
}

function updateExternalWeatherUI(data, placeLabel = "--") {
  const current = data.current || {};
  const code = current.weather_code;

  el.extCity.textContent = placeLabel;
  el.extDesc.textContent = weatherDescriptionFr(code);

  el.extTemp.textContent = Number.isFinite(current.temperature_2m)
    ? `${current.temperature_2m.toFixed(1)} °C`
    : "N/A";

  el.extFeels.textContent = Number.isFinite(current.apparent_temperature)
    ? `${current.apparent_temperature.toFixed(1)} °C`
    : "N/A";

  el.extHum.textContent = Number.isFinite(current.relative_humidity_2m)
    ? `${current.relative_humidity_2m} %`
    : "N/A";

  el.extPres.textContent = Number.isFinite(current.surface_pressure)
    ? `${current.surface_pressure.toFixed(1)} hPa`
    : "N/A";

  el.extWind.textContent = Number.isFinite(current.wind_speed_10m)
    ? `${current.wind_speed_10m.toFixed(1)} km/h`
    : "N/A";

  if (Number.isFinite(current.rain) || Number.isFinite(current.precipitation)) {
    const rainValue = Number.isFinite(current.rain) ? current.rain : current.precipitation;
    el.extRain.textContent = `${rainValue.toFixed(1)} mm`;
  } else {
    el.extRain.textContent = "0.0 mm";
  }

  el.extIcon.textContent = getWeatherEmoji(code);
}

async function refreshExternalWeatherFromHome(states) {
  const coords = getHomeCoordinates(states);

  if (!coords) {
    el.weatherStatus.textContent = "Impossible de lire la localisation Home Assistant.";
    return;
  }

  currentExternalCoords = coords;
  currentExternalPlaceName = "Localisation Home Assistant";

  el.weatherStatus.textContent = "Météo chargée depuis la localisation de la carte…";

  const data = await fetchMeteoFranceByCoords(coords.lat, coords.lon);
  updateExternalWeatherUI(data, currentExternalPlaceName);
  el.weatherStatus.textContent = `Météo basée sur la localisation Home Assistant (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}).`;
}

async function refreshExternalWeatherFromCity(city) {
  el.weatherStatus.textContent = `Recherche de "${city}"…`;

  const place = await geocodeCity(city);
  currentExternalCoords = { lat: place.lat, lon: place.lon };
  currentExternalPlaceName = `${place.name}${place.country ? ", " + place.country : ""}`;

  const data = await fetchMeteoFranceByCoords(place.lat, place.lon);
  updateExternalWeatherUI(data, currentExternalPlaceName);
  updateMap(place.lat, place.lon);

  el.weatherStatus.textContent = `Météo chargée pour ${currentExternalPlaceName}.`;
}

async function refreshData() {
  try {
    const states = await loadAllStates();

    updateUI(states);
    updateLocation(states);
    updateAllHistories(states);
    renderCurrentChart();

    const currentEntityKey = CHART_SERIES[currentChartKey].entityKey;
    const currentEntityId = CONFIG.homeAssistant.entities[currentEntityKey];
    const currentState = states[currentEntityId];

    if (currentState && currentState.state !== "unknown" && currentState.state !== "unavailable") {
      const numericValue = Number(currentState.state);
      if (Number.isFinite(numericValue)) {
        const unit = currentState.attributes?.unit_of_measurement || CHART_SERIES[currentChartKey].fallbackUnit;
        el.hint.textContent = `${CHART_SERIES[currentChartKey].label} : ${numericValue.toFixed(2)} ${unit}`;
      } else {
        el.hint.textContent = `${CHART_SERIES[currentChartKey].label} non numérique.`;
      }
    } else {
      el.hint.textContent = `${CHART_SERIES[currentChartKey].label} indisponible.`;
    }

    if (!currentExternalCoords) {
      await refreshExternalWeatherFromHome(states);
    }
  } catch (e) {
    console.error(e);
    el.hint.textContent = `Erreur Home Assistant : ${e.message}`;
  }
}

async function periodicRefreshExternalWeather() {
  try {
    if (!currentExternalCoords) return;

    const data = await fetchMeteoFranceByCoords(
      currentExternalCoords.lat,
      currentExternalCoords.lon
    );

    updateExternalWeatherUI(data, currentExternalPlaceName || "Météo externe");
  } catch (e) {
    console.error(e);
    el.weatherStatus.textContent = `Erreur météo : ${e.message}`;
  }
}

function setupButtons() {
  el.btnTemperature.onclick = () => switchChart("temperature");
  el.btnHumidity.onclick = () => switchChart("humidity");
  el.btnPressure.onclick = () => switchChart("pressure");
  el.btnWind.onclick = () => switchChart("wind");

  setActiveButton(currentChartKey);

  el.btnSearchCity.onclick = async () => {
    const city = el.cityInput.value.trim();
    if (!city) {
      el.weatherStatus.textContent = "Entre une ville avant de cliquer.";
      return;
    }

    try {
      await refreshExternalWeatherFromCity(city);
    } catch (e) {
      console.error(e);
      el.weatherStatus.textContent = e.message;
    }
  };

  el.cityInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    const city = el.cityInput.value.trim();
    if (!city) {
      el.weatherStatus.textContent = "Entre une ville avant de valider.";
      return;
    }

    try {
      await refreshExternalWeatherFromCity(city);
    } catch (e) {
      console.error(e);
      el.weatherStatus.textContent = e.message;
    }
  });

  el.btnUseHomeLocation.onclick = async () => {
    try {
      const states = await loadAllStates();
      await refreshExternalWeatherFromHome(states);
    } catch (e) {
      console.error(e);
      el.weatherStatus.textContent = e.message;
    }
  };
}

(function main() {
  startClock();
  setupButtons();
  initChart();
  renderCurrentChart();

  refreshData();

  setInterval(refreshData, CONFIG.refreshMs);
  setInterval(periodicRefreshExternalWeather, CONFIG.weatherRefreshMs);
})();