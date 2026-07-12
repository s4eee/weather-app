/* ============================================================
   API LAYER — all network calls live here. No DOM code allowed
   in this file; it only fetches and returns data.
   ============================================================ */

const API = {
  // Look up matching cities/places for a search string
  async geocode(query){
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    if(!res.ok) throw new Error('Geocoding request failed');
    const json = await res.json();
    return json.results || [];
  },

  // Fetch current conditions + hourly/daily forecast for a coordinate
  async forecast(lat, lon){
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,is_day` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=auto&forecast_days=6`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Forecast request failed');
    return res.json();
  }
};
