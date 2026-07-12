/* ============================================================
   RENDER LAYER — takes state/data and writes it to the DOM.
   No fetch() calls belong in this file.
   ============================================================ */

function condFor(code, isDay){
  const entry = WMO[code] || ['Unknown','cloud','cloud'];
  let [text, iconKey, themeKey] = entry;
  if(themeKey === 'clearDay' && isDay === 0) themeKey = 'clearNight';
  return { text, iconKey, themeKey };
}
const cToF = c => c * 9/5 + 32;
const fmtTemp = c => Math.round(state.units === 'metric' ? c : cToF(c));
const fmtWind = kmh => Math.round(state.units === 'metric' ? kmh : kmh * 0.621371);

function applyTheme(themeKey){
  const t = THEMES[themeKey] || THEMES.clearDay;
  const root = document.documentElement.style;
  root.setProperty('--grad-a', t.a);
  root.setProperty('--grad-b', t.b);
  root.setProperty('--grad-c', t.c);
  root.setProperty('--accent', t.accent);
}

function contextMessage(tempC, iconKey){
  if(iconKey === 'storm') return "Thunder's rolling in — best to stay indoors.";
  if(iconKey === 'snow') return "Snowy out there — bundle up before you head out.";
  if(iconKey === 'rain') return "Don't forget an umbrella today.";
  if(iconKey === 'fog') return "Visibility's low — drive carefully.";
  if(tempC >= 28) return "Hot one — stay hydrated out there.";
  if(tempC <= 2) return "Bitterly cold — layer up.";
  if(iconKey === 'sun' && tempC >= 15 && tempC <= 26) return "Pretty much a perfect day for a walk.";
  return "A fairly ordinary day, weather-wise.";
}

function icon(kind, size=64){
  const s = size;
  const map = {
    sun: `<circle cx="32" cy="32" r="12" fill="var(--accent)"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="32" y1="32" x2="${32+21*Math.cos(a*Math.PI/180)}" y2="${32+21*Math.sin(a*Math.PI/180)}" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>`).join('')}`,
    'cloud-sun': `<circle cx="23" cy="21" r="9" fill="var(--accent)" opacity="0.9"/><ellipse cx="35" cy="40" rx="19" ry="12" fill="rgba(255,255,255,0.85)"/>`,
    cloud: `<ellipse cx="32" cy="38" rx="21" ry="13" fill="rgba(255,255,255,0.85)"/><circle cx="21" cy="32" r="9" fill="rgba(255,255,255,0.85)"/><circle cx="38" cy="28" r="11" fill="rgba(255,255,255,0.85)"/>`,
    fog: `${[20,30,40,50].map(y=>`<line x1="10" y1="${y}" x2="54" y2="${y}" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
    rain: `<ellipse cx="32" cy="24" rx="19" ry="12" fill="rgba(255,255,255,0.85)"/>${[18,32,46].map(x=>`<line x1="${x}" y1="40" x2="${x-5}" y2="54" stroke="#8ecae6" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
    snow: `<ellipse cx="32" cy="22" rx="19" ry="11" fill="rgba(255,255,255,0.85)"/>${[18,32,46].map(x=>`<circle cx="${x}" cy="46" r="2.6" fill="#fff"/>`).join('')}`,
    storm: `<ellipse cx="32" cy="22" rx="19" ry="11" fill="rgba(255,255,255,0.85)"/><polygon points="34,34 24,50 32,50 27,58 44,40 35,40" fill="var(--accent)"/>`
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64">${map[kind] || map.cloud}</svg>`;
}

function showSkeleton(){
  document.getElementById('status').style.display = 'none';
  document.getElementById('readout').classList.remove('show');
  document.getElementById('readout').style.display = 'none';
  document.getElementById('skeleton').classList.add('show');
}

function showError(msg){
  document.getElementById('skeleton').classList.remove('show');
  document.getElementById('readout').style.display = 'none';
  const el = document.getElementById('status');
  el.style.display = 'block';
  el.className = 'status error';
  el.textContent = `⚠ ${msg}`;
}

function showReadout(){
  document.getElementById('skeleton').classList.remove('show');
  document.getElementById('status').style.display = 'none';
  const ro = document.getElementById('readout');
  ro.style.display = 'block';
  ro.classList.remove('show');
  void ro.offsetWidth; // restart the fade/slide-in animation
  ro.classList.add('show');
}

function render(){
  const { data, name } = state;
  const cur = data.current;
  const { text, iconKey, themeKey } = condFor(cur.weather_code, cur.is_day);

  applyTheme(themeKey);

  document.getElementById('heroName').textContent = name;
  document.getElementById('heroDate').textContent = new Date().toLocaleDateString(undefined,{ weekday:'long', month:'long', day:'numeric' });
  document.getElementById('heroIcon').innerHTML = icon(iconKey, 72);
  document.getElementById('heroTemp').textContent = fmtTemp(cur.temperature_2m);
  document.getElementById('unitToggle').textContent = state.units === 'metric' ? '°C' : '°F';
  document.getElementById('heroCond').textContent = text;
  document.getElementById('heroFeels').textContent = `Feels like ${fmtTemp(cur.apparent_temperature)}°`;
  document.getElementById('heroMessage').textContent = contextMessage(cur.temperature_2m, iconKey);

  document.getElementById('statHumidity').innerHTML = `${cur.relative_humidity_2m} <small>%</small>`;
  document.getElementById('statWind').innerHTML = `${fmtWind(cur.wind_speed_10m)} <small>${state.units==='metric'?'km/h':'mph'}</small>`;
  document.getElementById('statFeels').innerHTML = `${fmtTemp(cur.apparent_temperature)} <small>°</small>`;
  document.getElementById('statPressure').innerHTML = `${Math.round(cur.surface_pressure)} <small>hPa</small>`;

  renderHourly(data);
  renderDays(data);
  showReadout();
}

function renderHourly(data){
  const now = new Date();
  const times = data.hourly.time;
  let startIdx = times.findIndex(t => new Date(t) >= now);
  if(startIdx < 0) startIdx = 0;
  const temps = data.hourly.temperature_2m.slice(startIdx, startIdx+24);
  const hrs = times.slice(startIdx, startIdx+24);

  const disp = temps.map(t => state.units === 'metric' ? t : cToF(t));
  const min = Math.min(...disp), max = Math.max(...disp);
  const range = (max - min) || 1;

  const W = hrs.length * 52, H = 96, PAD = 16;
  const pts = disp.map((t,i)=>{
    const x = i*52 + 26;
    const y = PAD + (1 - (t-min)/range) * (H - PAD*2);
    return [x,y];
  });
  const pathD = pts.map((p,i)=> (i===0?'M':'L') + p[0] + ',' + p[1]).join(' ');
  const areaD = pathD + ` L${pts[pts.length-1][0]},${H} L${pts[0][0]},${H} Z`;

  const svg = document.getElementById('hourlySvg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${areaD}" fill="url(#ag)"/>
    <path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===0?3.5:2}" fill="${i===0?'#fff':'var(--accent)'}"/>`).join('')}
    ${pts.map((p,i)=>`<text x="${p[0]}" y="${p[1]-9}" font-family="Inter, sans-serif" font-size="10" fill="rgba(255,255,255,0.75)" text-anchor="middle">${Math.round(disp[i])}°</text>`).join('')}
  `;

  document.getElementById('hourlyLabels').innerHTML = hrs.map((h,i)=>{
    const d = new Date(h);
    const label = i===0 ? 'Now' : d.toLocaleTimeString(undefined,{hour:'numeric'}).replace(' ','');
    return `<div class="hourly-hr ${i===0?'now':''}">${label}</div>`;
  }).join('');
}

function renderDays(data){
  const days = data.daily.time;
  const maxT = data.daily.temperature_2m_max;
  const minT = data.daily.temperature_2m_min;
  const codes = data.daily.weather_code;
  const pop = data.daily.precipitation_probability_max;

  const gMin = Math.min(...minT.map(t=> state.units==='metric'?t:cToF(t)));
  const gMax = Math.max(...maxT.map(t=> state.units==='metric'?t:cToF(t)));
  const gRange = (gMax - gMin) || 1;

  document.getElementById('days').innerHTML = days.slice(0,5).map((d,i)=>{
    const dt = new Date(d + 'T12:00:00');
    const dayName = i===0 ? 'Today' : dt.toLocaleDateString(undefined,{weekday:'short'});
    const { text, iconKey } = condFor(codes[i], 1);
    const lo = state.units==='metric' ? minT[i] : cToF(minT[i]);
    const hi = state.units==='metric' ? maxT[i] : cToF(maxT[i]);
    const leftPct = ((lo-gMin)/gRange)*100;
    const widthPct = ((hi-lo)/gRange)*100;
    return `<div class="day-row">
      <div class="day-name">${dayName}</div>
      <div class="day-cond">${icon(iconKey,20)}<span>${text}</span></div>
      <div class="day-bar-wrap">
        <span>${Math.round(lo)}°</span>
        <div class="day-bar-track"><div class="day-bar-fill" style="left:${leftPct}%; width:${widthPct}%;"></div></div>
        <span>${Math.round(hi)}°</span>
      </div>
      <div class="day-pop">${pop[i]!=null ? pop[i]+'%' : '—'}</div>
    </div>`;
  }).join('');
}

function renderSuggestions(results){
  const box = document.getElementById('suggestions');
  if(!results.length){ box.classList.remove('show'); return; }
  box.innerHTML = results.map(r=>{
    const region = [r.admin1, r.country].filter(Boolean).join(', ');
    return `<div class="suggestion" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}${r.admin1 ? ', '+r.admin1 : ''}">
      <span class="name">${r.name}</span><span class="region">${region}</span>
    </div>`;
  }).join('');
  box.classList.add('show');
  box.querySelectorAll('.suggestion').forEach(el=>{
    el.addEventListener('click', ()=>{
      const lat = parseFloat(el.dataset.lat), lon = parseFloat(el.dataset.lon);
      document.getElementById('searchInput').value = el.dataset.name;
      box.classList.remove('show');
      loadWeather(lat, lon, el.dataset.name);
    });
  });
}
