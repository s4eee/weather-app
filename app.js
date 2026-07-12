/* ============================================================
   APP — state, controller functions that tie API + render
   together, and all event listeners. This is the entry point.
   ============================================================ */

const state = { units:'metric', data:null, name:'' };

// Fetch forecast data for a location and hand it to the renderer
async function loadWeather(lat, lon, name){
  showSkeleton();
  try{
    const data = await API.forecast(lat, lon);
    state.data = data;
    state.name = name;
    render();
  }catch(err){
    showError('Could not reach weather data. Please try again.');
  }
}

// Run a geocode search and show matching suggestions
async function runGeocodeSearch(query){
  try{
    const results = await API.geocode(query);
    renderSuggestions(results);
  }catch(err){
    document.getElementById('suggestions').classList.remove('show');
  }
}

/* ---------- Events ---------- */
const searchInput = document.getElementById('searchInput');
let searchTimer = null;

searchInput.addEventListener('input', ()=>{
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  if(q.length < 2){ document.getElementById('suggestions').classList.remove('show'); return; }
  searchTimer = setTimeout(()=> runGeocodeSearch(q), 300);
});

searchInput.addEventListener('keydown', async (e)=>{
  if(e.key === 'Enter'){
    const q = searchInput.value.trim();
    if(q.length < 2) return;
    document.getElementById('suggestions').classList.remove('show');
    try{
      const results = await API.geocode(q);
      if(results.length){
        const r = results[0];
        searchInput.value = `${r.name}${r.admin1 ? ', '+r.admin1 : ''}`;
        loadWeather(r.latitude, r.longitude, searchInput.value);
      }else{
        showError(`No results found for "${q}"`);
      }
    }catch(err){
      showError('Search failed — check your connection.');
    }
  }
});

document.addEventListener('click', (e)=>{
  if(!e.target.closest('.search-box')) document.getElementById('suggestions').classList.remove('show');
});

document.getElementById('locateBtn').addEventListener('click', ()=>{
  if(!navigator.geolocation){ showError('Geolocation not supported by this browser'); return; }
  showSkeleton();
  navigator.geolocation.getCurrentPosition(
    pos => loadWeather(pos.coords.latitude, pos.coords.longitude, 'Current location'),
    () => showError('Location access denied — search a city instead')
  );
});

document.getElementById('unitToggle').addEventListener('click', ()=>{
  state.units = state.units === 'metric' ? 'imperial' : 'metric';
  if(state.data) render();
});

/* ---------- Init ---------- */
loadWeather(51.5074, -0.1278, 'London, England');
