const londonCoords = {
  latitude: 51.5072,
  longitude: -0.1276,
};

const weatherDescriptions = {
  0: 'Clear skies',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Strong thunderstorm with hail',
};

function weatherBucket(code) {
  if ([61, 63, 65, 80, 81, 82, 51, 53, 55].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([45, 48].includes(code)) return 'fog';
  if ([0, 1].includes(code)) return 'clear';
  return 'mild';
}

function weatherIcon(bucket) {
  const icons = {
    rain: '🌧️',
    snow: '🌨️',
    storm: '⛈️',
    fog: '🌫️',
    clear: '☀️',
    mild: '⛅',
  };
  return icons[bucket] || '⛅';
}

function pickDailyItem(items) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return items[dayOfYear % items.length];
}

function buildQuip(bucket) {
  const quips = {
    rain: [
      "It's raining like a desperate stoppage-time cross — keep your umbrella in the starting XI.",
      "London's serving wet-ball conditions today; first touch sloppy, coat game sharp.",
      'Rainy pitch, rainy commute: channel your inner midfield general and cover every blade with waterproofs.',
    ],
    snow: [
      "It's snowing like a cup tie in January — layer up before your warm-up lap.",
      'This weather is all frost and no flair, so treat your scarf like club colours.',
      'Snow on the ground means defensive football and heavyweight outerwear.',
    ],
    storm: [
      'Thunder overhead like a manager at full-time — wear weatherproof gear and keep the hood up.',
      'Storm mode: less tiki-taka, more tactical shell. Zip up and stay dry.',
      'Today is pure chaos-ball from the clouds — pick grip, layers, and rain cover.',
    ],
    fog: [
      "Fog so thick you'd lose the linesman — keep it simple with warm, visible layers.",
      'Low visibility in London: play percentages and wear a jacket with structure.',
      'Misty conditions call for patient build-up and a dependable coat.',
    ],
    clear: [
      "Blue skies in London — a rare clean sheet from the weather gods, so enjoy a lighter lineup.",
      'It is sunshine and swagger today, perfect for a confident first-choice outfit.',
      'Clear conditions: total football, clean trainers, and no umbrella drama.',
    ],
    mild: [
      'Classic London mixed conditions: bring layers like a squad built for every competition.',
      'Not too harsh, not too easy — a weather table-topper for flexible styling.',
      'Unpredictable weather means rotate smartly: light jacket and adaptable picks.',
    ],
  };

  return pickDailyItem(quips[bucket]);
}

function buildOutfits(bucket, maxTemp, minTemp) {
  const chilly = minTemp <= 7;
  const warm = maxTemp >= 19;
  const umbrellaNote = bucket === 'rain' || bucket === 'storm' ? ' Bring an umbrella.' : '';

  const businessBase = chilly
    ? 'Navy wool overcoat, oxford shirt, knit tie, tailored trousers, and leather Chelsea boots.'
    : 'Unstructured blazer, crisp shirt, tailored trousers, and polished loafers.';

  const casualBase = warm
    ? 'Breathable bomber, fitted tee, dark jeans, and clean white trainers.'
    : 'Field jacket, lightweight knit, straight-fit chinos, and suede sneakers.';

  const athleticBase = chilly
    ? 'Thermal base layer, training quarter-zip, tapered track pants, and weather-ready running shoes.'
    : 'Moisture-wicking tee, lightweight hoodie, shorts or joggers, and cushioned trainers.';

  return {
    business: `${businessBase}${umbrellaNote}`,
    casual: `${casualBase}${umbrellaNote}`,
    athletic: `${athleticBase}${umbrellaNote}`,
  };
}

function setDate() {
  const dateEl = document.getElementById('currentDate');
  const now = new Date();
  const formatted = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });
  dateEl.textContent = formatted;
}

function renderMiniHourly(times, temps) {
  const container = document.getElementById('miniHourly');
  const keyHours = [0, 3, 6, 9, 12, 15, 18, 21];

  const cards = keyHours
    .map((hour) => {
      const rawTime = times[hour] || '';
      const hourLabel = rawTime.split('T')[1]?.slice(0, 2) || String(hour).padStart(2, '0');
      const temp = Math.round(temps[hour]);
      if (Number.isNaN(temp)) return '';
      return `<div class="mini-hourly-item"><span class="mini-hourly-time">${hourLabel}:00</span><span class="mini-hourly-temp">${temp}°C</span></div>`;
    })
    .join('');

  container.innerHTML = cards || '<span class="mini-hourly-item">Hourly unavailable</span>';
}

async function loadWeather() {
  const weatherStatus = document.getElementById('weatherStatus');
  setDate();

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${londonCoords.latitude}&longitude=${londonCoords.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m&forecast_days=1&timezone=Europe%2FLondon`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API unavailable');

    const data = await response.json();
    const code = data.daily.weathercode[0];
    const maxTemp = Math.round(data.daily.temperature_2m_max[0]);
    const minTemp = Math.round(data.daily.temperature_2m_min[0]);
    const rainChance = data.daily.precipitation_probability_max[0];
    const description = weatherDescriptions[code] || 'Variable conditions';
    const bucket = weatherBucket(code);

    weatherStatus.textContent = `${description}. High ${maxTemp}°C, low ${minTemp}°C. Rain chance: ${rainChance}%.`;
    document.getElementById('weatherGraphic').textContent = weatherIcon(bucket);
    document.getElementById('dailyQuip').textContent = buildQuip(bucket);

    const outfits = buildOutfits(bucket, maxTemp, minTemp);
    document.getElementById('businessOutfit').textContent = outfits.business;
    document.getElementById('casualOutfit').textContent = outfits.casual;
    document.getElementById('athleticOutfit').textContent = outfits.athletic;

    renderMiniHourly(data.hourly.time.slice(0, 24), data.hourly.temperature_2m.slice(0, 24));
  } catch (error) {
    weatherStatus.textContent = 'Could not load live weather data right now. Check back shortly.';
    document.getElementById('dailyQuip').textContent =
      'The forecast feed is doing a post-match interview — give it a minute and try again.';
    document.getElementById('weatherGraphic').textContent = '⚽';
    document.getElementById('miniHourly').innerHTML = '<span class="mini-hourly-item">Hourly unavailable</span>';
  }
}

loadWeather();
