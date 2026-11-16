import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const hours = Array.from({ length: 48 }, (_, i) => {
  const day = i < 24 ? '12' : '13';
  return `2026-08-${day}T${String(i % 24).padStart(2, '0')}:00`;
});

const days = ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19'];

function mockFetch({ airOk = true } = {}) {
  global.fetch = jest.fn((url) => {
    if (url.includes('nominatim')) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ lat: '-23.5505', lon: '-46.6333', display_name: 'São Paulo, São Paulo, Brasil' }]
      });
    }

    if (url.includes('air-quality')) {
      if (!airOk) return Promise.reject(new Error('offline'));
      return Promise.resolve({ ok: true, json: async () => ({ current: { european_aqi: 45 } }) });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({
        current: {
          time: '2026-08-12T14:45',
          temperature_2m: 28,
          apparent_temperature: 30,
          relative_humidity_2m: 68,
          wind_speed_10m: 12,
          weather_code: 1
        },
        hourly: {
          time: hours,
          temperature_2m: hours.map((_, i) => 15 + (i % 24)),
          weather_code: hours.map(() => 1),
          precipitation_probability: hours.map((_, i) => i)
        },
        daily: {
          time: days,
          weather_code: days.map(() => 2),
          temperature_2m_max: [29, 28, 27, 26, 30, 31, 32, 33],
          temperature_2m_min: [11, 19, 18, 17, 20, 21, 22, 23],
          precipitation_probability_max: [73, 10, 20, 30, 40, 50, 60, 70],
          precipitation_sum: [2.345, 0, 0, 0, 0, 0, 0, 0],
          uv_index_max: [7.6, 5, 5, 5, 5, 5, 5, 5],
          wind_speed_10m_max: [21.4, 10, 10, 10, 10, 10, 10, 10],
          daylight_duration: [41400, 0, 0, 0, 0, 0, 0, 0],
          sunrise: days.map((d) => `${d}T06:00`),
          sunset: days.map((d) => `${d}T18:00`)
        }
      })
    });
  });
}

test('renders weather dashboard with real forecast data', async () => {
  mockFetch();
  render(<App />);

  expect(await screen.findByText('São Paulo')).toBeInTheDocument();
  expect(screen.getByText(/próximas 24h/i)).toBeInTheDocument();

  // Previsão horária começa na hora atual (14h) e mostra 24 itens
  const hourItems = document.querySelectorAll('.hour-item');
  expect(hourItems).toHaveLength(24);
  expect(hourItems[0]).toHaveTextContent('Agora');
  expect(hourItems[0]).toHaveTextContent('29°'); // 15 + 14
  expect(hourItems[1]).toHaveTextContent('15h');

  // Chuva atual vem da probabilidade horária (índice 14)
  expect(screen.getByText('14%')).toBeInTheDocument();

  // 7 dias com máxima, mínima e probabilidade real de chuva
  const dayRows = document.querySelectorAll('.day-row');
  expect(dayRows).toHaveLength(7);
  expect(dayRows[0]).toHaveTextContent('Hoje');
  expect(dayRows[0]).toHaveTextContent('29°');
  expect(dayRows[0]).toHaveTextContent('11°');
  expect(dayRows[0]).toHaveTextContent('73%');
  // 2026-08-13 é quinta-feira (sem deslocamento de fuso)
  expect(dayRows[1]).toHaveTextContent(/qui/i);

  // Qualidade do ar real (European AQI 45 = Moderada)
  expect(screen.getByText(/moderada · 45/i)).toBeInTheDocument();
});

test('toggles today details', async () => {
  mockFetch();
  render(<App />);

  const button = await screen.findByRole('button', { name: /detalhes/i });
  expect(screen.queryByText(/índice uv/i)).not.toBeInTheDocument();

  userEvent.click(button);
  expect(screen.getByText(/índice uv/i)).toBeInTheDocument();
  expect(screen.getByText('2.3 mm')).toBeInTheDocument();
  expect(screen.getByText('11h 30min')).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /ocultar/i }));
  expect(screen.queryByText(/índice uv/i)).not.toBeInTheDocument();
});

test('still shows weather when air quality request fails', async () => {
  mockFetch({ airOk: false });
  render(<App />);

  expect(await screen.findByText('São Paulo')).toBeInTheDocument();
  expect(screen.getByText('Indisponível')).toBeInTheDocument();
});
