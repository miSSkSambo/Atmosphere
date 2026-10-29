const WEATHER_CODES = {
  0: ["Clear sky", "☀️", "Ideal visibility"], 1: ["Mostly clear", "🌤️", "Bright spells"], 2: ["Partly cloudy", "⛅", "Cloud breaks"], 3: ["Overcast", "☁️", "Cloudy skies"],
  45: ["Fog", "🌫️", "Low visibility"], 48: ["Rime fog", "🌫️", "Low visibility"], 51: ["Light drizzle", "🌦️", "A little damp"], 53: ["Drizzle", "🌦️", "A little damp"], 55: ["Dense drizzle", "🌧️", "Wet conditions"],
  56: ["Freezing drizzle", "🌧️", "Icy surfaces possible"], 57: ["Heavy freezing drizzle", "🌧️", "Icy surfaces possible"], 61: ["Light rain", "🌦️", "Light showers"], 63: ["Moderate rain", "🌧️", "Wet conditions"], 65: ["Heavy rain", "🌧️", "Heavy showers"],
  66: ["Freezing rain", "🌧️", "Icy surfaces possible"], 67: ["Heavy freezing rain", "🌧️", "Icy surfaces possible"], 71: ["Light snow", "🌨️", "Snow flurries"], 73: ["Moderate snow", "🌨️", "Snow likely"], 75: ["Heavy snow", "❄️", "Snow likely"], 77: ["Snow grains", "❄️", "Snow grains"],
  80: ["Rain showers", "🌦️", "Passing showers"], 81: ["Moderate showers", "🌧️", "Passing showers"], 82: ["Violent showers", "⛈️", "Stormy showers"], 85: ["Snow showers", "🌨️", "Snow showers"], 86: ["Heavy snow showers", "❄️", "Snow showers"], 95: ["Thunderstorm", "⛈️", "Storm risk"], 96: ["Thunderstorm + hail", "⛈️", "Hail risk"], 99: ["Severe thunderstorm", "⛈️", "Hail risk"]
};

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_PLACE = { name: "Johannesburg", country: "South Africa", latitude: -26.2041, longitude: 28.0473 };
const $ = (id) => document.getElementById(id);
const state = { place: null, weather: null, favorites: readFavorites(), fahrenheit: localStorage.getItem("atmosphere-unit") === "fahrenheit", light: localStorage.getItem("atmosphere-theme") === "light", busy: false };

function info(code) { return WEATHER_CODES[code] || ["Conditions unavailable", "🌡️", "Stay alert"]; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]); }
function readFavorites() { try { return JSON.parse(localStorage.getItem("atmosphere-favorites") || "[]"); } catch { return []; } }
function saveFavorites() { localStorage.setItem("atmosphere-favorites", JSON.stringify(state.favorites.slice(0, 8))); }
function getPlaceFromUrl() {
  const params = new URLSearchParams(location.search);
  const lat = Number(params.get("lat")); const lon = Number(params.get("lon"));
  return params.get("city") && Number.isFinite(lat) && Number.isFinite(lon) ? { name: params.get("city"), country: params.get("country") || "", latitude: lat, longitude: lon } : null;
}
function updateUrl(place) {
  const params = new URLSearchParams({ city: place.name, country: place.country || "", lat: String(place.latitude), lon: String(place.longitude) });
  history.replaceState({}, "", `${location.pathname}?${params}`);
}
function weatherUrl(place) {
  const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,pressure_msl,uv_index,visibility", hourly: "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m", daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max", timezone: "auto", forecast_days: "7" });
  return `${WEATHER_URL}?${params}`;
}
function temp(value) { if (value == null) return "—"; const converted = state.fahrenheit ? (Number(value) * 9 / 5) + 32 : Number(value); return `${Math.round(converted)}°`; }
function wind(value) { if (value == null) return "—"; return state.fahrenheit ? `${Math.round(Number(value) * .621371)} mph` : `${Math.round(Number(value))} km/h`; }
function visibility(value) { if (value == null) return "—"; const meters = Number(value); return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`; }
function timeOnly(value) { return value ? value.slice(-5) : "—"; }
function dateLabel(value, index) { if (index === 0) return "Today"; return new Intl.DateTimeFormat("en", { weekday: "short", day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`)); }

async function requestJson(url) { const response = await fetch(url); if (!response.ok) throw new Error("The forecast service returned an error."); return response.json(); }
async function searchPlaces(query) { const params = new URLSearchParams({ name: query, count: "5", language: "en", format: "json" }); const data = await requestJson(`${GEO_URL}?${params}`); return data.results || []; }

function setLoading(isLoading) { $("loading-state").hidden = !isLoading; $("forecast-view").hidden = isLoading || !state.weather; $("empty-state").hidden = isLoading || Boolean(state.weather); }
function setError(message = "We could not reach the forecast service.") { $("error-message").textContent = message; $("error-state").hidden = false; }
function clearError() { $("error-state").hidden = true; }
function toast(message) { const el = $("toast"); el.textContent = message; el.classList.add("show"); window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => el.classList.remove("show"), 2600); }
function scoreFor(current, daily) { const rain = Number(daily.precipitation_probability_max?.[0] || 0); const uv = Number(daily.uv_index_max?.[0] || 0); const windSpeed = Number(current.wind_speed_10m || 0); return Math.max(8, Math.min(98, Math.round(100 - rain * .45 - windSpeed * .7 - uv * 1.5))); }
function isFavorite(place) { return state.favorites.some((item) => item.name === place.name && Math.abs(item.latitude - place.latitude) < .01); }

function renderHero() {
  const { place, weather } = state; const current = weather.current; const daily = weather.daily; const [condition, emoji] = info(Number(current.weather_code));
  $("location-name").textContent = place.name; $("location-region").textContent = place.country || weather.timezone || "Local forecast"; $("hero-temperature").textContent = temp(current.temperature_2m); $("hero-condition").textContent = condition; $("hero-meta").textContent = `Feels like ${temp(current.apparent_temperature)} · ${wind(current.wind_speed_10m)} wind`; $("hero-icon").textContent = emoji;
  $("last-updated").textContent = `Live · refreshed ${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
  $("metric-feels").textContent = temp(current.apparent_temperature); $("metric-humidity").textContent = `${Math.round(current.relative_humidity_2m || 0)}%`; $("metric-wind").textContent = wind(current.wind_speed_10m); $("metric-pressure").textContent = `${Math.round(current.pressure_msl || 0)} hPa`; $("metric-uv").textContent = String(Math.round(Number(current.uv_index ?? daily.uv_index_max?.[0] ?? 0) * 10) / 10); $("metric-visibility").textContent = visibility(current.visibility);
  $("sunrise").textContent = timeOnly(daily.sunrise?.[0]); $("sunset").textContent = timeOnly(daily.sunset?.[0]); $("favorite-button").textContent = isFavorite(place) ? "♥" : "♡"; $("favorite-button").setAttribute("aria-label", isFavorite(place) ? "Unpin this place" : "Pin this place");
}
function renderHourly() {
  const hourly = state.weather.hourly; const times = hourly.time || []; const start = Math.max(0, times.indexOf(state.weather.current.time)); const html = times.slice(start, start + 12).map((time, offset) => { const i = start + offset; const [, emoji] = info(Number(hourly.weather_code[i])); return `<article class="hour-card ${offset === 0 ? "current" : ""}"><div class="hour-time">${offset === 0 ? "NOW" : timeOnly(time)}</div><div class="hour-icon">${emoji}</div><div class="hour-temp">${temp(hourly.temperature_2m[i])}</div><div class="rain-chance">↓ ${hourly.precipitation_probability?.[i] ?? 0}%</div></article>`; }).join(""); $("hourly-list").innerHTML = html || `<div class="note-subcopy">Hourly detail is not available for this place yet.</div>`;
}
function renderDaily() {
  const daily = state.weather.daily; $("daily-list").innerHTML = (daily.time || []).map((date, i) => { const [description, emoji] = info(Number(daily.weather_code[i])); return `<article class="day-row"><span class="day-name">${dateLabel(date, i)}</span><span class="day-icon">${emoji}</span><span class="day-desc">${description}</span><span class="day-rain">↓ ${daily.precipitation_probability_max?.[i] ?? 0}%</span><strong class="day-high">${temp(daily.temperature_2m_max[i])}</strong><span class="day-low">${temp(daily.temperature_2m_min[i])}</span></article>`; }).join("");
}
function renderInsights() {
  const { current } = state.weather; const daily = state.weather.daily; const [description, emoji, hint] = info(Number(current.weather_code)); const rain = Number(daily.precipitation_probability_max?.[0] || 0); const uv = Number(daily.uv_index_max?.[0] || 0); const windSpeed = Number(current.wind_speed_10m || 0); const score = scoreFor(current, daily); let advice = "Excellent conditions to explore"; let adviceIcon = "⌖"; if (rain >= 55 || Number(current.weather_code) >= 61) { advice = "Carry an umbrella"; adviceIcon = "♧"; } else if (uv >= 7) { advice = "Sun protection recommended"; adviceIcon = "☼"; } else if (windSpeed >= 35) { advice = "Secure loose outdoor items"; adviceIcon = "≋"; }
  $("insight-list").innerHTML = `<div class="score-card"><div class="score-number ${score <= 60 ? "caution" : ""}">${score}</div><div><div class="note-label">OUTDOOR SCORE</div><div class="note-copy">${score > 70 ? "Your day looks promising" : "Plan around the conditions"}</div><div class="note-subcopy">${emoji} ${description} · ${hint}</div></div></div><div class="brief-card"><div class="brief-icon">${adviceIcon}</div><div><div class="note-label">SMART BRIEFING</div><div class="note-copy">${advice}</div></div></div>`;
}
function renderFavorites() { $("pin-count").textContent = String(state.favorites.length); $("favorites-list").innerHTML = state.favorites.length ? state.favorites.map((place, i) => `<div class="favorite-row"><span class="favorite-pin">⌖</span><div class="favorite-copy"><strong>${escapeHtml(place.name)}</strong><span>${escapeHtml(place.country || "Pinned forecast")}</span></div><button class="favorite-open" type="button" data-favorite-index="${i}" aria-label="Open ${escapeHtml(place.name)}">›</button></div>`).join("") : `<div class="note-subcopy">Pin a place to create your own sky atlas.</div>`; }
function render() { document.documentElement.classList.toggle("light", state.light); $("unit-toggle").textContent = state.fahrenheit ? "°F" : "°C"; $("theme-toggle").textContent = state.light ? "☾" : "☼"; renderHero(); renderHourly(); renderDaily(); renderInsights(); renderFavorites(); }

async function loadPlace(place, updateHistory = true) {
  if (state.busy) return; state.busy = true; clearError(); setLoading(true); state.place = place; $("location-name").textContent = place.name; $("location-region").textContent = place.country || "";
  try { state.weather = await requestJson(weatherUrl(place)); if (updateHistory) updateUrl(place); render(); $("forecast-view").hidden = false; $("empty-state").hidden = true; } catch (error) { state.weather = null; setError(navigator.onLine ? error.message : "You appear to be offline. Reconnect and try again."); $("forecast-view").hidden = true; $("empty-state").hidden = true; } finally { state.busy = false; setLoading(false); }
}
async function runSearch() { const query = $("city-search").value.trim(); if (!query) { $("search-status").textContent = "Enter a city to search."; return; } $("search-status").textContent = "Searching the planet…"; $("search-results").innerHTML = ""; try { const places = await searchPlaces(query); $("search-status").textContent = places.length ? "Choose a place to open its atmosphere." : `No places found for “${query}”.`; $("search-results").innerHTML = places.map((place, i) => `<button class="search-result" type="button" data-result-index="${i}">${escapeHtml(place.name)}, ${escapeHtml(place.country_code || place.country || "")}</button>`).join(""); window.searchResults = places; } catch { $("search-status").textContent = navigator.onLine ? "Search is unavailable right now." : "You appear to be offline."; } }
function toggleFavorite() { if (!state.place) return; if (isFavorite(state.place)) state.favorites = state.favorites.filter((item) => !(item.name === state.place.name && Math.abs(item.latitude - state.place.latitude) < .01)); else state.favorites.unshift({ ...state.place }); saveFavorites(); render(); toast(isFavorite(state.place) ? "Place pinned to your atlas." : "Place removed from your atlas."); }
async function shareForecast() { if (!state.place) return; updateUrl(state.place); try { await navigator.clipboard.writeText(location.href); toast("Shareable forecast link copied."); } catch { toast("Your forecast URL is ready in the address bar."); } }
function toggleUnits() { state.fahrenheit = !state.fahrenheit; localStorage.setItem("atmosphere-unit", state.fahrenheit ? "fahrenheit" : "celsius"); if (state.weather) render(); }
function toggleTheme() { state.light = !state.light; localStorage.setItem("atmosphere-theme", state.light ? "light" : "dark"); render(); }

$("search-button").addEventListener("click", runSearch); $("city-search").addEventListener("keydown", (event) => { if (event.key === "Enter") runSearch(); }); $("unit-toggle").addEventListener("click", toggleUnits); $("theme-toggle").addEventListener("click", toggleTheme); $("refresh-button").addEventListener("click", () => state.place && loadPlace(state.place, false)); $("retry-button").addEventListener("click", () => loadPlace(state.place || getPlaceFromUrl() || DEFAULT_PLACE)); $("favorite-button").addEventListener("click", toggleFavorite); $("share-button").addEventListener("click", shareForecast);
$("search-results").addEventListener("click", (event) => { const button = event.target.closest("[data-result-index]"); if (!button) return; const place = window.searchResults[Number(button.dataset.resultIndex)]; $("search-results").innerHTML = ""; $("search-status").textContent = ""; $("city-search").value = ""; loadPlace(place); }); $("favorites-list").addEventListener("click", (event) => { const button = event.target.closest("[data-favorite-index]"); if (!button) return; loadPlace(state.favorites[Number(button.dataset.favoriteIndex)]); }); window.addEventListener("online", () => { if (!state.weather && state.place) loadPlace(state.place); });

renderFavorites(); const initialPlace = getPlaceFromUrl() || state.favorites[0] || DEFAULT_PLACE; loadPlace(initialPlace, false);
