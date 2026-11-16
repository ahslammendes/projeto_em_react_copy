import { useEffect, useState } from 'react';
import './App.css';

const weatherCodes = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Principalmente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' },
  48: { label: 'Nevoeiro com geada', icon: '🌫️' },
  51: { label: 'Chuvisco leve', icon: '🌦️' },
  53: { label: 'Chuvisco', icon: '🌦️' },
  55: { label: 'Chuvisco forte', icon: '🌧️' },
  56: { label: 'Chuvisco gelado', icon: '🌧️' },
  57: { label: 'Chuvisco gelado forte', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva', icon: '🌧️' },
  65: { label: 'Chuva forte', icon: '🌧️' },
  66: { label: 'Chuva gelada', icon: '🌧️' },
  67: { label: 'Chuva gelada forte', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve', icon: '❄️' },
  75: { label: 'Neve forte', icon: '❄️' },
  77: { label: 'Granizo', icon: '🌨️' },
  80: { label: 'Pancadas leves', icon: '🌦️' },
  81: { label: 'Pancadas', icon: '🌧️' },
  82: { label: 'Pancadas fortes', icon: '⛈️' },
  85: { label: 'Neve leve', icon: '🌨️' },
  86: { label: 'Neve intensa', icon: '❄️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo', icon: '⛈️' },
  99: { label: 'Trovoada intensa', icon: '⛈️' }
};

// Escala do Índice Europeu de Qualidade do Ar (European AQI) usado pela Open-Meteo.
// `tone` mapeia para as superfícies semânticas do SORA Design System.
const airQualityLevels = [
  { max: 20, label: 'Boa', description: 'Ar limpo, ideal para atividades ao ar livre.', tone: 'positive' },
  { max: 40, label: 'Razoável', description: 'Qualidade aceitável para a maioria das pessoas.', tone: 'info' },
  { max: 60, label: 'Moderada', description: 'Grupos sensíveis devem reduzir esforços prolongados.', tone: 'warning' },
  { max: 80, label: 'Ruim', description: 'Evite atividades intensas ao ar livre.', tone: 'negative' },
  { max: 100, label: 'Muito ruim', description: 'Prefira ficar em ambientes fechados.', tone: 'negative' },
  { max: Infinity, label: 'Péssima', description: 'Evite exposição ao ar livre.', tone: 'negative' }
];

// Ícones de traço no estilo Lucide, como no SORA Design System.
function Icon({ name, className = 'icon' }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    arrow: <path d="M9 5l7 7-7 7" />,
    sunrise: (
      <>
        <path d="M12 2v8" />
        <path d="m4.93 10.93 1.41 1.41" />
        <path d="M2 18h2" />
        <path d="M20 18h2" />
        <path d="m19.07 10.93-1.41 1.41" />
        <path d="M22 22H2" />
        <path d="m8 6 4-4 4 4" />
        <path d="M16 18a4 4 0 0 0-8 0" />
      </>
    ),
    sunset: (
      <>
        <path d="M12 10V2" />
        <path d="m4.93 10.93 1.41 1.41" />
        <path d="M2 18h2" />
        <path d="M20 18h2" />
        <path d="m19.07 10.93-1.41 1.41" />
        <path d="M22 22H2" />
        <path d="m16 6-4 4-4-4" />
        <path d="M16 18a4 4 0 0 0-8 0" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l3 3" />
      </>
    ),
    calendar: (
      <>
        <path d="M4 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M4 11h16" />
      </>
    ),
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const defaultCity = 'São Paulo';
const HOURS_TO_SHOW = 24;
const DAYS_TO_SHOW = 7;

function getWeatherInfo(code) {
  return weatherCodes[code] || { label: 'Condição variável', icon: '🌤️' };
}

function formatHour(dateString) {
  // Strings da Open-Meteo vêm sem fuso ("2026-11-16T14:00") e já no horário local da cidade,
  // então são interpretadas como horário local e exibidas sem conversão.
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':00', 'h');
}

function formatDay(dateString) {
  // "YYYY-MM-DD" sozinho é interpretado como UTC; adicionar a hora força o horário local
  // e evita que o dia da semana apareça deslocado em fusos negativos (ex.: Brasil).
  return new Date(`${dateString}T00:00`).toLocaleDateString('pt-BR', { weekday: 'short' });
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date());
}

function formatPercent(value) {
  return value == null ? '—' : `${Math.round(value)}%`;
}

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const totalMinutes = Math.round(seconds / 60);
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, '0')}min`;
}

function getAirQuality(aqi) {
  if (aqi == null) return null;
  const level = airQualityLevels.find((item) => aqi <= item.max);
  return { ...level, value: Math.round(aqi), percent: Math.min(aqi, 100) };
}

async function fetchAirQuality(latitude, longitude) {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi&timezone=auto`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return getAirQuality(data?.current?.european_aqi);
  } catch {
    // Qualidade do ar é complementar: uma falha aqui não deve impedir a exibição do clima.
    return null;
  }
}

function App() {
  const [searchValue, setSearchValue] = useState(defaultCity);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const fetchWeather = async (location) => {
    const query = location.trim();
    if (!query) {
      setError('Digite uma cidade para consultar o clima.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
      );

      if (!geoResponse.ok) {
        throw new Error('Não foi possível buscar a cidade.');
      }

      const geoData = await geoResponse.json();

      if (!geoData.length) {
        throw new Error('Cidade não encontrada. Tente outra busca.');
      }

      const place = geoData[0];
      const latitude = place.lat;
      const longitude = place.lon;
      const locationName = place.display_name.split(',')[0].trim() || query;

      const [weatherResponse, air] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
            '&hourly=temperature_2m,weather_code,precipitation_probability' +
            '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,' +
            'precipitation_sum,uv_index_max,wind_speed_10m_max,daylight_duration' +
            `&timezone=auto&forecast_days=${DAYS_TO_SHOW + 1}`
        ),
        fetchAirQuality(latitude, longitude)
      ]);

      if (!weatherResponse.ok) {
        throw new Error('Falha ao consultar a previsão do tempo.');
      }

      const data = await weatherResponse.json();
      const current = data.current;
      const codeInfo = getWeatherInfo(current.weather_code);

      // A série horária começa à 00h de hoje; localizamos a hora atual (no fuso da cidade)
      // para que a previsão comece em "Agora".
      const currentHourKey = `${current.time.slice(0, 13)}:00`;
      const foundIndex = data.hourly.time.findIndex((time) => time >= currentHourKey);
      const startIndex = foundIndex === -1 ? 0 : foundIndex;

      const hourly = data.hourly.time.slice(startIndex, startIndex + HOURS_TO_SHOW).map((time, offset) => {
        const index = startIndex + offset;
        return {
          key: time,
          time: offset === 0 ? 'Agora' : formatHour(time),
          temp: `${Math.round(data.hourly.temperature_2m[index])}°`,
          icon: getWeatherInfo(data.hourly.weather_code[index]).icon,
          rain: formatPercent(data.hourly.precipitation_probability?.[index])
        };
      });

      const daily = data.daily.time.slice(0, DAYS_TO_SHOW).map((day, index) => {
        const maxValue = Math.round(data.daily.temperature_2m_max[index]);
        const minValue = Math.round(data.daily.temperature_2m_min[index]);
        return {
          key: day,
          day: index === 0 ? 'Hoje' : formatDay(day),
          icon: getWeatherInfo(data.daily.weather_code[index]).icon,
          maxValue,
          minValue,
          max: `${maxValue}°`,
          min: `${minValue}°`,
          rain: formatPercent(data.daily.precipitation_probability_max?.[index])
        };
      });

      // Extremos da semana, usados para posicionar a barra de amplitude de cada dia.
      const weekMin = Math.min(...daily.map((item) => item.minValue));
      const weekMax = Math.max(...daily.map((item) => item.maxValue));
      const weekSpan = Math.max(weekMax - weekMin, 1);
      daily.forEach((item) => {
        item.rangeStart = ((item.minValue - weekMin) / weekSpan) * 100;
        item.rangeWidth = Math.max(((item.maxValue - item.minValue) / weekSpan) * 100, 4);
      });

      const currentRain = formatPercent(data.hourly.precipitation_probability?.[startIndex]);

      setSearchValue(locationName);
      setWeatherData({
        city: locationName,
        temperature: Math.round(current.temperature_2m),
        feelsLike: `${Math.round(current.apparent_temperature)}°`,
        condition: codeInfo.label,
        icon: codeInfo.icon,
        sunrise: formatHour(data.daily.sunrise[0]),
        sunset: formatHour(data.daily.sunset[0]),
        air,
        hourly,
        daily,
        highlights: [
          { label: 'Umidade', value: `${Math.round(current.relative_humidity_2m)}%` },
          { label: 'Vento', value: `${Math.round(current.wind_speed_10m)} km/h` },
          { label: 'Chuva', value: currentRain },
          { label: 'Sensação', value: `${Math.round(current.apparent_temperature)}°` }
        ],
        details: [
          { label: 'Índice UV máx.', value: data.daily.uv_index_max?.[0] != null ? Math.round(data.daily.uv_index_max[0]) : '—' },
          {
            label: 'Chuva acumulada',
            value: data.daily.precipitation_sum?.[0] != null ? `${data.daily.precipitation_sum[0].toFixed(1)} mm` : '—'
          },
          {
            label: 'Vento máx.',
            value: data.daily.wind_speed_10m_max?.[0] != null ? `${Math.round(data.daily.wind_speed_10m_max[0])} km/h` : '—'
          },
          { label: 'Duração do dia', value: formatDuration(data.daily.daylight_duration?.[0]) }
        ]
      });
    } catch (err) {
      setError(err.message || 'Erro inesperado ao buscar o clima.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(defaultCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inicializa a cena WebGL do Unicorn Studio (feixes de chuva de luz + horizonte do planeta do SORA).
  useEffect(() => {
    let cancelled = false;

    const initScene = () => {
      if (cancelled || !window.UnicornStudio?.init) return false;
      try {
        window.UnicornStudio.init();
      } catch {
        // Ambientes sem WebGL2 (ex.: JSDOM nos testes) usam o fallback em CSS.
      }
      return true;
    };

    if (!initScene()) {
      const timer = window.setInterval(() => {
        if (initScene()) window.clearInterval(timer);
      }, 150);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchWeather(searchValue);
  };

  const air = weatherData?.air;

  return (
    <div className="weather-app">
      {/* Fundo original do SORA Design System: cena WebGL Unicorn Studio (BhoqrigscYbD7NN1fwcp)
          com horizonte do planeta + feixes suaves de luz + névoa cósmica */}
      <div className="sora-scene" aria-hidden="true">
        <div
          className="sora-unicorn-canvas"
          data-us-project-src="/sora/scene.json"
          data-us-scale="1"
          data-us-dpi="1.5"
          data-us-lazyload="false"
          data-us-fixed="true"
        />
      </div>

      <header className="topbar">
        <a className="brand-link" href="/" aria-label="Weatherly">
          <span className="wordmark">
            Weatherl<span>y</span>
          </span>
        </a>

        <div className="nav-pill">
          <span className="nav-link is-current">
            <span className="live-dot" aria-hidden="true" /> Ao vivo
          </span>
          <span className="nav-link">{formatCurrentDate()}</span>
        </div>

        <form className="controls" onSubmit={handleSubmit}>
          <label className="search-box">
            <Icon name="search" className="icon icon-muted" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              aria-label="Digite uma cidade"
              placeholder="Buscar cidade"
            />
          </label>
          <button className="glass-button" type="submit" disabled={loading}>
            <span className="glass-button-shine" aria-hidden="true" />
            <span className="glass-button-glow" aria-hidden="true" />
            <span className="glass-button-content">
              <span className="glass-button-label">{loading ? 'Buscando...' : 'Buscar'}</span>
              <Icon name="arrow" className="icon glass-button-arrow" />
            </span>
          </button>
        </form>
      </header>

      <section className="sora-hero">
        <h1 className="sora-hero-title">
          WEATHERL<span>Y</span>
        </h1>
      </section>

      {error && (
        <div className="alert alert-negative" role="alert">
          <Icon name="alert" className="icon icon-sm" />
          <span>{error}</span>
        </div>
      )}

      {loading && !weatherData && (
        <div className="loading" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          Carregando previsão do tempo...
        </div>
      )}

      {weatherData && (
        <main className="dashboard">
          <section className="card hero-card">
            <div className="card-glow" aria-hidden="true" />
            <div className="hero-top">
              <div className="location-row">
                <Icon name="pin" className="icon icon-accent" />
                <span>{weatherData.city}</span>
              </div>
              <span className="badge badge-info">{weatherData.condition}</span>
            </div>

            <div className="temperature-row">
              <h2 className="temperature">
                {weatherData.temperature}
                <span>°</span>
              </h2>
              <div className="weather-summary">
                <div className="big-icon" aria-hidden="true">
                  {weatherData.icon}
                </div>
                <div>
                  <p className="summary-title">{weatherData.condition}</p>
                  <p className="text-muted">Sensação térmica de {weatherData.feelsLike}</p>
                </div>
              </div>
            </div>

            <div className="highlights-grid">
              {weatherData.highlights.map((item) => (
                <div key={item.label} className="stat">
                  <span className="label">{item.label}</span>
                  <strong className="stat-value">{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <aside className="card sidebar-card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Hoje</p>
                <h3 className="section-title">Resumo do dia</h3>
              </div>
              <button
                type="button"
                className={`tab-button${showDetails ? ' is-selected' : ''}`}
                onClick={() => setShowDetails((value) => !value)}
                aria-expanded={showDetails}
                aria-controls="today-details"
              >
                {showDetails ? 'Ocultar' : 'Detalhes'}
                <Icon name="chevron" className="icon icon-sm tab-chevron" />
              </button>
            </div>

            <div className="sun-times">
              <div className="sun-item">
                <span className="icon-tile">
                  <Icon name="sunrise" className="icon icon-accent" />
                </span>
                <div>
                  <span className="label">Nascer do sol</span>
                  <strong>{weatherData.sunrise}</strong>
                </div>
              </div>
              <div className="sun-item">
                <span className="icon-tile">
                  <Icon name="sunset" className="icon icon-accent" />
                </span>
                <div>
                  <span className="label">Pôr do sol</span>
                  <strong>{weatherData.sunset}</strong>
                </div>
              </div>
            </div>

            {showDetails && (
              <div id="today-details" className="details-grid">
                {weatherData.details.map((item) => (
                  <div key={item.label} className="detail-item">
                    <span className="label">{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            )}

            <div className={`air-panel tone-${air ? air.tone : 'neutral'}`}>
              <div className="panel-label">
                <span className="air-title">
                  <Icon name="leaf" className="icon icon-sm" />
                  Qualidade do ar
                </span>
                <span className="badge">{air ? `${air.label} · ${air.value}` : 'Indisponível'}</span>
              </div>
              <div className="meter">
                <span className="meter-fill" style={{ width: `${air ? air.percent : 0}%` }} />
              </div>
              <p className="air-description">
                {air ? air.description : 'Não foi possível obter o índice de qualidade do ar para esta região.'}
              </p>
            </div>
          </aside>

          <section className="card forecast-card">
            <div className="section-header">
              <div className="section-heading">
                <Icon name="clock" className="icon icon-accent" />
                <h3 className="section-title">Próximas 24h</h3>
              </div>
              <span className="text-muted small">Atualizado agora</span>
            </div>

            <div className="hourly-list">
              {weatherData.hourly.map((item, index) => (
                <div key={item.key} className={`hour-item${index === 0 ? ' is-current' : ''}`}>
                  <span className="hour-time">{item.time}</span>
                  <span className="hour-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <b className="hour-temp">{item.temp}</b>
                  <small className="hour-rain">💧 {item.rain}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="card week-card">
            <div className="section-header">
              <div className="section-heading">
                <Icon name="calendar" className="icon icon-accent" />
                <h3 className="section-title">Próximos 7 dias</h3>
              </div>
              <span className="text-muted small">Mín · Máx · Chuva</span>
            </div>

            <div className="week-list">
              {weatherData.daily.map((item) => (
                <div key={item.key} className="day-row">
                  <span className="weekday">{item.day}</span>
                  <span className="day-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="day-min">{item.min}</span>
                  <span className="range-track" aria-hidden="true">
                    <span
                      className="range-fill"
                      style={{ left: `${item.rangeStart}%`, width: `${item.rangeWidth}%` }}
                    />
                  </span>
                  <span className="day-temp">{item.max}</span>
                  <span className="rain">{item.rain}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        <p>
          Dados: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> ·{' '}
          <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">OpenStreetMap Nominatim</a>
        </p>
        <p className="legal">© {new Date().getFullYear()} Weatherly</p>
      </footer>
    </div>
  );
}

export default App;
