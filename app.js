// ============================================================
// OpenWeatherMap API キー（https://openweathermap.org/api で無料取得）
// 取得したキーを下の引用符の中に貼り付けてください。
// ============================================================
const API_KEY = '5d68e0844dff3b6644d77f2ae21ae1a0';

const CITIES = [
  { label: '東京', query: 'Tokyo,JP' },
  { label: '大阪', query: 'Osaka,JP' },
  { label: '札幌', query: 'Sapporo,JP' },
  { label: '福岡', query: 'Fukuoka,JP' },
  { label: '沖縄（那覇）', query: 'Naha,JP' },
  { label: '名古屋', query: 'Nagoya,JP' },
  { label: '京都', query: 'Kyoto,JP' },
  { label: '横浜', query: 'Yokohama,JP' },
];

const WEATHER_LABELS = {
  Clear: '晴れ',
  Clouds: 'くもり',
  Rain: '雨',
  Drizzle: '霧雨',
  Thunderstorm: '雷雨',
  Snow: '雪',
  Mist: '霧',
  Fog: '霧',
  Haze: 'もや',
  Smoke: '煙霧',
  Dust: '砂塵',
  Sand: '砂嵐',
  Ash: '火山灰',
  Squall: '突風',
  Tornado: '竜巻',
};

const WEATHER_ICONS = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
};

const BG_BY_WEATHER = {
  Clear: 'linear-gradient(160deg, #4facfe 0%, #00f2fe 100%)',
  Clouds: 'linear-gradient(160deg, #89a4c7 0%, #c9d6e8 100%)',
  Rain: 'linear-gradient(160deg, #536976 0%, #292e49 100%)',
  Drizzle: 'linear-gradient(160deg, #606c88 0%, #3f4c6b 100%)',
  Thunderstorm: 'linear-gradient(160deg, #373b44 0%, #4286f4 100%)',
  Snow: 'linear-gradient(160deg, #e6e9f0 0%, #eef1f5 100%)',
  Mist: 'linear-gradient(160deg, #bdc3c7 0%, #2c3e50 100%)',
  Fog: 'linear-gradient(160deg, #bdc3c7 0%, #2c3e50 100%)',
  default: 'linear-gradient(160deg, #667eea 0%, #764ba2 100%)',
};

const citySelect = document.getElementById('city-select');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const weatherCard = document.getElementById('weather-card');
const cityNameEl = document.getElementById('city-name');
const weatherIconEl = document.getElementById('weather-icon');
const weatherDescEl = document.getElementById('weather-desc');
const tempEl = document.getElementById('temperature');
const outfitIconEl = document.getElementById('outfit-icon');
const outfitTextEl = document.getElementById('outfit-text');
const umbrellaEl = document.getElementById('umbrella-warning');

function initCitySelect() {
  CITIES.forEach((city, i) => {
    const opt = document.createElement('option');
    opt.value = city.query;
    opt.textContent = city.label;
    if (i === 0) opt.selected = true;
    citySelect.appendChild(opt);
  });
}

function kelvinToCelsius(k) {
  return Math.round(k - 273.15);
}

function getWeatherLabel(main) {
  return WEATHER_LABELS[main] || main;
}

function getWeatherIcon(main) {
  return WEATHER_ICONS[main] || '🌡️';
}

function setBackground(main) {
  const bg = BG_BY_WEATHER[main] || BG_BY_WEATHER.default;
  document.body.style.background = bg;
  document.body.dataset.weather = main;
}

function getOutfitAdvice(celsius) {
  if (celsius >= 25) {
    return {
      icon: '🩳',
      text: '暑いです。半袖やサンダルが快適です。熱中症に注意。',
    };
  }
  if (celsius >= 20) {
    return {
      icon: '👕',
      text: '過ごしやすい気候です。シャツ1枚や薄手の長袖がおすすめ。',
    };
  }
  if (celsius >= 15) {
    return {
      icon: '🧥',
      text: '少し肌寒いです。カーディガンやジャケットなどの羽織るものが必要。',
    };
  }
  if (celsius >= 10) {
    return {
      icon: '🧶',
      text: '寒いです。セーターや厚手のコートを着てお出かけください。',
    };
  }
  return {
    icon: '🧣',
    text: '激寒です。ダウンジャケットやマフラー、手袋などで完全防寒してください。',
  };
}

function needsUmbrella(main) {
  return main === 'Rain' || main === 'Drizzle';
}

function showLoading(show) {
  loadingEl.hidden = !show;
  if (show) {
    weatherCard.hidden = true;
    errorEl.hidden = true;
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  weatherCard.hidden = true;
}

function hideError() {
  errorEl.hidden = true;
}

async function fetchWeather(cityQuery) {
  if (!API_KEY || API_KEY === 'ここにキーを貼る') {
    throw new Error('fetch_failed');
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('q', cityQuery);
  url.searchParams.set('appid', API_KEY);
  url.searchParams.set('lang', 'ja');

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('fetch_failed');
  }
  return res.json();
}

function renderWeather(data, cityLabel) {
  const main = data.weather[0]?.main || 'Clear';
  const celsius = kelvinToCelsius(data.main.temp);
  const outfit = getOutfitAdvice(celsius);

  cityNameEl.textContent = cityLabel;
  weatherIconEl.textContent = getWeatherIcon(main);
  weatherDescEl.textContent = getWeatherLabel(main);
  tempEl.textContent = `${celsius}`;
  outfitIconEl.textContent = outfit.icon;
  outfitTextEl.textContent = outfit.text;

  if (needsUmbrella(main)) {
    umbrellaEl.hidden = false;
  } else {
    umbrellaEl.hidden = true;
  }

  setBackground(main);
  weatherCard.hidden = false;
  hideError();
}

async function onCityChange() {
  const query = citySelect.value;
  const city = CITIES.find((c) => c.query === query);
  const label = city?.label || query;

  showLoading(true);

  try {
    const data = await fetchWeather(query);
    renderWeather(data, label);
  } catch {
    showError('天気を取得できませんでした。しばらくしてからもう一度お試しください。');
  } finally {
    showLoading(false);
  }
}

initCitySelect();
citySelect.addEventListener('change', onCityChange);
onCityChange();
