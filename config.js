/* ============================================================
   CONFIG — theme palettes per weather group + WMO code map
   ============================================================ */

// Background/accent colors used per weather condition group
const THEMES = {
  clearDay:   { a:'#4b91f7', b:'#1c3b6e', c:'#7cc7ff', accent:'#ffd166' },
  clearNight: { a:'#1e2757', b:'#05070f', c:'#3a4a8f', accent:'#f4d35e' },
  cloud:      { a:'#6b7c93', b:'#2b3442', c:'#8fa3b8', accent:'#e8dfc9' },
  fog:        { a:'#7a8792', b:'#2f353b', c:'#a7b2b8', accent:'#e6e6e6' },
  rain:       { a:'#3a5169', b:'#111c29', c:'#5c7f9b', accent:'#8ecae6' },
  storm:      { a:'#333047', b:'#0b0a14', c:'#524a75', accent:'#ffb703' },
  snow:       { a:'#6f8bab', b:'#232f42', c:'#c9dcec', accent:'#ffffff' }
};

// WMO weather codes -> [condition text, icon key, theme group]
// https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
const WMO = {
  0:['Clear sky','sun','clearDay'], 1:['Mainly clear','sun','clearDay'], 2:['Partly cloudy','cloud-sun','cloud'], 3:['Overcast','cloud','cloud'],
  45:['Fog','fog','fog'], 48:['Rime fog','fog','fog'],
  51:['Light drizzle','rain','rain'], 53:['Drizzle','rain','rain'], 55:['Dense drizzle','rain','rain'],
  56:['Freezing drizzle','rain','rain'], 57:['Freezing drizzle','rain','rain'],
  61:['Light rain','rain','rain'], 63:['Rain','rain','rain'], 65:['Heavy rain','rain','rain'],
  66:['Freezing rain','rain','rain'], 67:['Freezing rain','rain','rain'],
  71:['Light snow','snow','snow'], 73:['Snow','snow','snow'], 75:['Heavy snow','snow','snow'], 77:['Snow grains','snow','snow'],
  80:['Light showers','rain','rain'], 81:['Showers','rain','rain'], 82:['Violent showers','rain','rain'],
  85:['Snow showers','snow','snow'], 86:['Snow showers','snow','snow'],
  95:['Thunderstorm','storm','storm'], 96:['Thunderstorm, hail','storm','storm'], 99:['Thunderstorm, hail','storm','storm']
};
