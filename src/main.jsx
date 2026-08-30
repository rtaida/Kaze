import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

const API = "https://api.open-meteo.com/v1/forecast";
const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE = "https://geocoding-api.open-meteo.com/v1/reverse";
const PHILIPPINES = "Philippines";

const NCR = [
  ["Caloocan", "NCR", "city"],
  ["Las Piñas", "NCR", "city"],
  ["Makati", "NCR", "city"],
  ["Malabon", "NCR", "city"],
  ["Mandaluyong", "NCR", "city"],
  ["Manila", "NCR", "city"],
  ["Marikina", "NCR", "city"],
  ["Muntinlupa", "NCR", "city"],
  ["Navotas", "NCR", "city"],
  ["Parañaque", "NCR", "city"],
  ["Pasay", "NCR", "city"],
  ["Pasig", "NCR", "city"],
  ["Quezon City", "NCR", "city"],
  ["San Juan", "NCR", "city"],
  ["Taguig", "NCR", "city"],
  ["Valenzuela", "NCR", "city"],
  ["Pateros", "NCR", "municipality"],
];

const REGION_III = {
  Bataan: [
    "Abucay",
    "Bagac",
    "Dinalupihan",
    "Hermosa",
    "Limay",
    "Mariveles",
    "Morong",
    "Orani",
    "Orion",
    "Pilar",
    "Samal",
  ],
  Bulacan: [
    "Angat",
    "Balagtas",
    "Bocaue",
    "Bulacan",
    "Bustos",
    "Calumpit",
    "Guiguinto",
    "Hagonoy",
    "Marilao",
    "Norzagaray",
    "Obando",
    "Pandi",
    "Paombong",
    "Plaridel",
    "Pulilan",
    "San Ildefonso",
    "San Miguel",
    "San Rafael",
    "Santa Maria",
    "Doña Remedios Trinidad",
  ],
  "Nueva Ecija": [
    "Aliaga",
    "Bongabon",
    "Cabiao",
    "Carranglan",
    "Cuyapo",
    "Gabaldon",
    "General Mamerto Natividad",
    "General Tinio",
    "Guimba",
    "Jaen",
    "Laur",
    "Licab",
    "Llanera",
    "Lupao",
    "Nampicuan",
    "Pantabangan",
    "Peñaranda",
    "Quezon",
    "Rizal",
    "San Antonio",
    "San Isidro",
    "San Leonardo",
    "Santa Rosa",
    "Santo Domingo",
    "Talavera",
    "Talugtug",
    "Zaragoza",
  ],
  Pampanga: [
    "Apalit",
    "Arayat",
    "Bacolor",
    "Candaba",
    "Floridablanca",
    "Guagua",
    "Lubao",
    "Macabebe",
    "Magalang",
    "Masantol",
    "Mexico",
    "Minalin",
    "Porac",
    "San Luis",
    "San Simon",
    "Santa Ana",
    "Santa Rita",
    "Sto. Tomas",
    "Sasmuan",
  ],
  Tarlac: [
    "Anao",
    "Bamban",
    "Camiling",
    "Capas",
    "Concepcion",
    "Gerona",
    "La Paz",
    "Mayantoc",
    "Moncada",
    "Paniqui",
    "Pura",
    "Ramos",
    "San Clemente",
    "San Manuel",
    "Santa Ignacia",
    "Victoria",
    "San Jose",
  ],
  Zambales: [
    "Botolan",
    "Cabangan",
    "Candelaria",
    "Castillejos",
    "Iba",
    "Masinloc",
    "Palauig",
    "San Antonio",
    "San Felipe",
    "San Marcelino",
    "San Narciso",
    "Santa Cruz",
    "Subic",
  ],
  Aurora: [
    "Baler",
    "Casiguran",
    "Dilasag",
    "Dinalungan",
    "Dingalan",
    "Dipaculao",
    "Maria Aurora",
    "San Luis",
  ],
};

const CENTRAL_CITIES = [
  ["Balanga", "Bataan", "city"],
  ["Baliwag", "Bulacan", "city"],
  ["Malolos", "Bulacan", "city"],
  ["Meycauayan", "Bulacan", "city"],
  ["San Jose del Monte", "Bulacan", "city"],
  ["Cabanatuan", "Nueva Ecija", "city"],
  ["Gapan", "Nueva Ecija", "city"],
  ["Science City of Muñoz", "Nueva Ecija", "city"],
  ["Palayan", "Nueva Ecija", "city"],
  ["San Jose City", "Nueva Ecija", "city"],
  ["Mabalacat", "Pampanga", "city"],
  ["San Fernando", "Pampanga", "city"],
  ["Tarlac City", "Tarlac", "city"],
  ["Angeles", "Pampanga", "city"],
  ["Olongapo", "Zambales", "city"],
];

const LOCATION_DATA = [
  ...NCR.map(([name, province, type]) => ({
    name,
    province,
    region: "NCR",
    type,
  })),
  ...CENTRAL_CITIES.map(([name, province, type]) => ({
    name,
    province,
    region: "Region III",
    type,
  })),
  ...Object.entries(REGION_III).flatMap(([province, names]) =>
    names.map((name) => ({
      name,
      province,
      region: "Region III",
      type: "municipality",
    })),
  ),
];

const FALLBACK = LOCATION_DATA.find((x) => x.name === "Manila")
  ? {
      ...LOCATION_DATA.find((x) => x.name === "Manila"),
      latitude: 14.5995,
      longitude: 120.9842,
      country: PHILIPPINES,
    }
  : {
      name: "Manila",
      province: "NCR",
      region: "NCR",
      latitude: 14.5995,
      longitude: 120.9842,
      country: PHILIPPINES,
    };

const weatherCodeMap = {
  0: ["Clear sky", Sun],
  1: ["Mainly clear", Sun],
  2: ["Partly cloudy", CloudSun],
  3: ["Overcast", Cloud],
  45: ["Fog", Cloud],
  48: ["Rime fog", Cloud],
  51: ["Light drizzle", CloudDrizzle],
  53: ["Drizzle", CloudDrizzle],
  55: ["Dense drizzle", CloudDrizzle],
  56: ["Freezing drizzle", CloudDrizzle],
  57: ["Freezing drizzle", CloudDrizzle],
  61: ["Light rain", CloudRain],
  63: ["Rain", CloudRain],
  65: ["Heavy rain", CloudRain],
  66: ["Freezing rain", CloudRain],
  67: ["Freezing rain", CloudRain],
  71: ["Light snow", CloudSun],
  73: ["Snow", CloudSun],
  75: ["Heavy snow", CloudSun],
  77: ["Snow grains", CloudSun],
  80: ["Rain showers", CloudRain],
  81: ["Rain showers", CloudRain],
  82: ["Heavy showers", CloudRain],
  85: ["Snow showers", CloudSun],
  86: ["Snow showers", CloudSun],
  95: ["Thunderstorm", CloudRain],
  96: ["Thunderstorm + hail", CloudRain],
  99: ["Thunderstorm + hail", CloudRain],
};
const weatherMeta = (code) => weatherCodeMap[code] || ["Variable", CloudSun];
const formatTime = (dateString) =>
  new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(
    new Date(dateString),
  );
const formatDay = (dateString) =>
  new Intl.DateTimeFormat([], { weekday: "short" }).format(
    new Date(dateString),
  );
const formatUpdated = (dateString) =>
  dateString
    ? new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(dateString))
    : "—";

const LOCATION_ALIASES = {
  "Sto. Tomas|Pampanga": "Santo Tomas",
  "Science City of Muñoz|Nueva Ecija": "Muñoz",
  "San Jose City|Nueva Ecija": "San Jose",
  "Tarlac City|Tarlac": "Tarlac",
};

function isValidCoordinate(value) {
  return Number.isFinite(Number(value));
}

function normalizeLocationName(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function fetchJson(url, options = {}, label = "Request") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let message = `${label} failed (${response.status}).`;
      try {
        const body = await response.json();
        message = body?.reason || body?.message || message;
      } catch {}
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`${label} timed out. Check your internet connection.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocodeLocation(location) {
  if (
    isValidCoordinate(location.latitude) &&
    isValidCoordinate(location.longitude)
  ) {
    return {
      ...location,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      country: PHILIPPINES,
    };
  }

  const province =
    location.province === "NCR" ? "Metro Manila" : location.province;
  const alias = LOCATION_ALIASES[`${location.name}|${location.province}`];
  const names = [...new Set([location.name, alias].filter(Boolean))];
  let lastError = null;

  for (const name of names) {
    try {
      const url = new URL(GEOCODE);
      // Important: Open-Meteo's `name` parameter should be the place name.
      // Province is used only to score the returned administrative fields.
      url.searchParams.set("name", name);
      url.searchParams.set("count", "100");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");
      url.searchParams.set("countryCode", "PH");

      const data = await fetchJson(url, {}, "Location lookup");
      const results = Array.isArray(data.results) ? data.results : [];
      if (!results.length) continue;

      const wantedName = normalizeLocationName(name);
      const wantedProvince = normalizeLocationName(province);

      const scored = results
        .filter(
          (x) =>
            isValidCoordinate(x.latitude) && isValidCoordinate(x.longitude),
        )
        .map((x) => {
          const resultName = normalizeLocationName(x.name);
          const admins = [x.admin1, x.admin2, x.admin3, x.admin4]
            .filter(Boolean)
            .map(normalizeLocationName);

          let score = 0;
          if ((x.country_code || "").toUpperCase() === "PH") score += 1000;
          if (resultName === wantedName) score += 1000;
          if (admins.includes(wantedProvince)) score += 800;
          if (
            admins.some(
              (admin) =>
                admin.includes(wantedProvince) ||
                wantedProvince.includes(admin),
            )
          )
            score += 500;
          if (
            resultName.includes(wantedName) ||
            wantedName.includes(resultName)
          )
            score += 100;

          return { x, score };
        })
        .sort((a, b) => b.score - a.score);

      const best = scored[0]?.x;
      if (!best) continue;

      return {
        ...location,
        latitude: Number(best.latitude),
        longitude: Number(best.longitude),
        country: PHILIPPINES,
        timezone: best.timezone || "Asia/Manila",
        displayName: best.name || location.name,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ||
    new Error(`Coordinates unavailable for ${location.name}, ${province}.`)
  );
}

async function fetchWeather(place) {
  if (
    !isValidCoordinate(place.latitude) ||
    !isValidCoordinate(place.longitude)
  ) {
    throw new Error("This location does not have valid coordinates yet.");
  }

  const url = new URL(API);
  url.searchParams.set("latitude", Number(place.latitude).toFixed(6));
  url.searchParams.set("longitude", Number(place.longitude).toFixed(6));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,precipitation,is_day",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum",
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("precipitation_unit", "mm");

  const data = await fetchJson(url, {}, "Weather update");

  if (!data.current || !data.hourly || !data.daily) {
    throw new Error("The weather service returned incomplete forecast data.");
  }

  return { place, ...data };
}

async function getBrowserLocation() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not available in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = Number(coords.latitude);
        const longitude = Number(coords.longitude);

        if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
          reject(new Error("Your browser returned invalid coordinates."));
          return;
        }

        resolve({
          name: "My location",
          province: "Detected location",
          region: "My Location",
          type: "detected",
          country: PHILIPPINES,
          latitude,
          longitude,
          timezone: "auto",
        });
      },
      (error) => {
        const messages = {
          1: "Location access was denied. Allow location access or choose a place manually.",
          2: "Your location could not be determined. Choose a place manually.",
          3: "Location detection timed out. Choose a place manually.",
        };
        reject(
          new Error(messages[error.code] || "Unable to detect your location."),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  });
}

function App() {
  const [place, setPlace] = useState(FALLBACK);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [provinceFilter, setProvinceFilter] = useState("All");

  const load = async (target, mode = "normal") => {
    mode === "refresh" ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const resolved = await geocodeLocation(target);
      const data = await fetchWeather(resolved);

      setPlace(resolved);
      setWeather(data);
      localStorage.setItem(
        "kaze-last-location",
        JSON.stringify({
          name: resolved.name,
          province: resolved.province,
          region: resolved.region,
          type: resolved.type,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          country: resolved.country,
        }),
      );
    } catch (err) {
      console.error("Kaze weather error:", err);
      setError(err?.message || "Kaze could not retrieve the latest weather.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      let initial = FALLBACK;

      try {
        const saved = JSON.parse(
          localStorage.getItem("kaze-last-location") || "null",
        );
        if (
          saved &&
          isValidCoordinate(saved.latitude) &&
          isValidCoordinate(saved.longitude)
        ) {
          initial = saved;
        }
      } catch {}

      if (!cancelled) await load(initial);
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const id = setInterval(
      () => {
        if (place?.latitude) load(place, "refresh");
      },
      15 * 60 * 1000,
    );
    return () => clearInterval(id);
  }, [place?.latitude, place?.longitude]);

  const detectLocation = async () => {
    setLocating(true);
    setError("");

    try {
      const detected = await getBrowserLocation();
      setLocationOpen(false);
      await load(detected);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.message || "Unable to detect your location.");
    } finally {
      setLocating(false);
    }
  };

  const selectLocation = async (item) => {
    setLocationOpen(false);
    await load(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const provinces = useMemo(() => ["All", ...Object.keys(REGION_III)], []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LOCATION_DATA.filter((item) => {
      const regionOk = regionFilter === "All" || item.region === regionFilter;
      const provinceOk =
        provinceFilter === "All" ||
        item.province === provinceFilter ||
        (regionFilter === "NCR" && provinceFilter === "All");
      const searchOk =
        !q ||
        `${item.name} ${item.province} ${item.region}`
          .toLowerCase()
          .includes(q);
      return regionOk && provinceOk && searchOk;
    });
  }, [query, regionFilter, provinceFilter]);

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const hourlySlice = useMemo(() => {
    if (!hourly) return [];
    const now = Date.now();
    return hourly.time
      .map((time, i) => ({ time, i }))
      .filter(({ time }) => new Date(time).getTime() >= now - 30 * 60 * 1000)
      .slice(0, 8);
  }, [hourly]);

  const insight = current
    ? current.precipitation > 0.3
      ? "A wetter pocket is passing through. Keep an umbrella nearby."
      : current.wind_speed_10m > 25
        ? "It's breezy right now. Expect the air to feel cooler in exposed areas."
        : current.temperature_2m >= 32
          ? "Hot conditions today. Hydrate early and take breaks from direct sun."
          : "Conditions look comfortable. A good window for getting outside."
    : "Reading the sky...";

  return (
    <div className="app">
      <div className="noise" />
      <nav className="nav glass">
        <a href="#top" className="brand" aria-label="Kaze home">
          <img className="brand-mark-image" src="/kaze-icon.png" alt="Kaze" />
          <span>Kaze</span>
        </a>
        <div className="nav-links">
          <a href="#today">Today</a>
          <a href="#hours">Next hours</a>
          <a href="#week">7 day</a>
        </div>
        <button className="nav-location" onClick={() => setLocationOpen(true)}>
          <MapPin size={16} />
          <span>{place.name}</span>
          <Chevron />
        </button>
      </nav>

      <AnimatePresence>
        {locationOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="location-modal glass-strong"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <button
                className="close-btn glass-soft"
                onClick={() => setLocationOpen(false)}
              >
                <X size={19} />
              </button>
              <div className="modal-top">
                <span className="eyebrow">Location explorer</span>
                <h2>
                  Choose where to <em>look.</em>
                </h2>
                <p>
                  All NCR cities and Pateros, plus every city and municipality
                  in Region III.
                </p>
              </div>
              <div className="location-tools">
                <button className="use-location-btn" onClick={detectLocation}>
                  <LocateFixed size={16} />
                  {locating ? "Locating..." : "Use my location"}
                </button>
                <div className="location-search glass-soft">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search city or municipality..."
                  />
                </div>
              </div>
              <div className="region-tabs">
                {["All", "NCR", "Region III"].map((r) => (
                  <button
                    key={r}
                    className={regionFilter === r ? "active" : ""}
                    onClick={() => {
                      setRegionFilter(r);
                      setProvinceFilter("All");
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {regionFilter === "Region III" && (
                <div className="province-strip">
                  {provinces.map((p) => (
                    <button
                      key={p}
                      className={provinceFilter === p ? "active" : ""}
                      onClick={() => setProvinceFilter(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
              <div className="location-count">
                Showing <strong>{filtered.length}</strong> of{" "}
                <strong>{LOCATION_DATA.length}</strong> NCR + Region III
                locations
              </div>
              <div className="location-grid">
                {filtered.map((item) => (
                  <button
                    key={`${item.region}-${item.province}-${item.name}`}
                    className={`location-item ${place.name === item.name && place.province === item.province ? "selected" : ""}`}
                    onClick={() => selectLocation(item)}
                  >
                    <span className="location-icon">
                      <MapPin size={15} />
                    </span>
                    <span className="location-copy">
                      <strong>{item.name}</strong>
                      <small>
                        {item.region === "NCR"
                          ? "National Capital Region"
                          : `${item.type === "city" ? "City" : "Municipality"} · ${item.province}`}
                      </small>
                    </span>
                    {place.name === item.name &&
                    place.province === item.province ? (
                      <Check size={16} />
                    ) : (
                      <ArrowRight size={15} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="top">
        <section className="hero">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="wave-field">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} style={{ "--i": i }} />
            ))}
          </div>
          <div className="hero-content">
            <motion.img
              className="hero-logo"
              src="/kaze-logo.png"
              alt="Kaze weather logo"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.05 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Live conditions ·{" "}
                {place.region}
              </span>
              <h1>
                See the day
                <br />
                <em>in motion.</em>
              </h1>
              <p className="hero-copy">
                Kaze turns live weather into a calm, readable experience —
                wherever you are across Metro Manila and Central Luzon.
              </p>
              <div className="hero-actions">
                <button
                  className="secondary-btn"
                  onClick={() => setLocationOpen(true)}
                >
                  Change location <ArrowRight size={16} />
                </button>
              </div>
              {error && <p className="error-note">{error}</p>}
            </motion.div>
          </div>
          <div className="hero-scroll">
            <span>Scroll to forecast</span>
            <ArrowDown size={16} />
          </div>
        </section>

        <section id="today" className="section weather-section">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Your sky, right now</span>
              <h2>
                Good weather should feel <em>easy.</em>
              </h2>
            </div>
            <button
              className="location-chip glass-soft"
              onClick={() => setLocationOpen(true)}
            >
              <MapPin size={16} />
              <span>
                {place.name}, {place.province}
              </span>
              <Chevron />
            </button>
          </div>
          <motion.div
            className="current-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div
              className="current-card glass"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {loading || !current ? (
                <div className="loading-block">
                  <RefreshCw size={18} className="spin" /> Loading live
                  conditions...
                </div>
              ) : (
                <>
                  <div className="current-top">
                    <div>
                      <div className="mini-label">CURRENT CONDITIONS</div>
                      <h3>{Math.round(current.temperature_2m)}°</h3>
                      <p>
                        Feels like {Math.round(current.apparent_temperature)}° ·{" "}
                        {weatherMeta(current.weather_code)[0]}
                      </p>
                    </div>
                    <div className="weather-icon large">
                      <WeatherIcon code={current.weather_code} size={68} />
                    </div>
                  </div>
                  <div className="current-divider" />
                  <div className="current-meta">
                    <span>
                      <Droplets size={17} /> Humidity{" "}
                      <strong>{current.relative_humidity_2m}%</strong>
                    </span>
                    <span>
                      <Wind size={17} /> Wind{" "}
                      <strong>{Math.round(current.wind_speed_10m)} km/h</strong>
                    </span>
                    <span>
                      <CloudRain size={17} /> Rain{" "}
                      <strong>{current.precipitation.toFixed(1)} mm</strong>
                    </span>
                  </div>
                </>
              )}
            </motion.div>
            <motion.div
              className="insight-card glass-blue"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="insight-glow" />
              <span className="mini-label">KAZE READ</span>
              <h3>{insight}</h3>
              <p>
                Weather is refreshed automatically every 15 minutes while you
                keep Kaze open.
              </p>
              <button
                onClick={() =>
                  document
                    .getElementById("hours")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See what's next <ArrowDown size={15} />
              </button>
            </motion.div>
          </motion.div>
          <div className="refresh-line">
            <span>Updated {formatUpdated(current?.time)}</span>
            <button
              onClick={() => place?.latitude && load(place, "refresh")}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />{" "}
              {refreshing ? "Refreshing" : "Refresh now"}
            </button>
          </div>
        </section>

        <section id="hours" className="section hours-section">
          <div className="section-head compact">
            <div>
              <span className="eyebrow">The next few hours</span>
              <h2>
                Watch the weather <em>move.</em>
              </h2>
            </div>
            <span className="muted-note">Local time · {place.name}</span>
          </div>
          <div className="hour-strip">
            {hourlySlice.map(({ time, i }, index) => {
              const [label, Icon] = weatherMeta(hourly.weather_code[i]);
              return (
                <motion.div
                  key={time}
                  className={`hour-card glass-soft ${index === 0 ? "active" : ""}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.045 }}
                >
                  <span>{index === 0 ? "Now" : formatTime(time)}</span>
                  <Icon size={24} />
                  <strong>{Math.round(hourly.temperature_2m[i])}°</strong>
                  <small>{hourly.precipitation_probability[i]}% rain</small>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="week" className="section week-section">
          <div className="blue-panel glass-blue">
            <div className="blue-lines" />
            <div className="week-head">
              <div>
                <span className="eyebrow light">A wider view</span>
                <h2>
                  Seven days.
                  <br />
                  <em>One clear picture.</em>
                </h2>
              </div>
              {daily && (
                <div className="sun-pair">
                  <span>
                    <Sunrise size={16} /> {formatTime(daily.sunrise[0])}
                  </span>
                  <span>
                    <Sunset size={16} /> {formatTime(daily.sunset[0])}
                  </span>
                </div>
              )}
            </div>
            <div className="week-list">
              {daily?.time.map((date, i) => {
                const [label, Icon] = weatherMeta(daily.weather_code[i]);
                return (
                  <motion.div
                    className="week-row"
                    key={date}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <strong>{i === 0 ? "Today" : formatDay(date)}</strong>
                    <div className="week-condition">
                      <Icon size={19} />
                      <span>{label}</span>
                    </div>
                    <span className="rain-prob">
                      {daily.precipitation_probability_max[i]}% rain
                    </span>
                    <span className="temps">
                      <b>{Math.round(daily.temperature_2m_max[i])}°</b>
                      <span>{Math.round(daily.temperature_2m_min[i])}°</span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section details-section">
          <div className="detail-copy">
            <span className="eyebrow">Small details, useful moments.</span>
            <h2>
              Weather is more than
              <br />
              <em>a number.</em>
            </h2>
            <p>
              From humidity to wind direction, Kaze surfaces the details that
              change how a day actually feels — with live conditions for every
              NCR and Central Luzon city and municipality.
            </p>
          </div>
          <div className="detail-grid">
            <Detail
              icon={<Thermometer />}
              title="Temperature"
              value={current ? `${Math.round(current.temperature_2m)}°C` : "—"}
              note={
                current
                  ? `Feels like ${Math.round(current.apparent_temperature)}°C`
                  : "—"
              }
            />
            <Detail
              icon={<Droplets />}
              title="Humidity"
              value={current ? `${current.relative_humidity_2m}%` : "—"}
              note="Relative humidity"
            />
            <Detail
              icon={<Wind />}
              title="Wind"
              value={
                current ? `${Math.round(current.wind_speed_10m)} km/h` : "—"
              }
              note={
                current
                  ? `${Math.round(current.wind_direction_10m)}° direction`
                  : "—"
              }
            />
            <Detail
              icon={<CalendarDays />}
              title="Rain chance"
              value={daily ? `${daily.precipitation_probability_max[0]}%` : "—"}
              note="Today"
            />
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="brand footer-brand">
            <img className="brand-mark-image" src="/kaze-icon.png" alt="Kaze" />
            <span>Kaze</span>
          </div>
          <p>Weather, in motion.</p>
          <span className="footer-source">
            Live weather · Open-Meteo · PSGC-aligned locations
          </span>
        </div>
      </footer>
    </div>
  );
}

function Chevron() {
  return <span className="chevron">⌄</span>;
}
function WeatherIcon({ code, size }) {
  const [, Icon] = weatherMeta(code);
  return <Icon size={size} strokeWidth={1.5} />;
}
function Detail({ icon, title, value, note }) {
  return (
    <motion.div
      className="detail-card glass-soft"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="detail-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </motion.div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
