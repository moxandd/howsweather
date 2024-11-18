import React, { useState } from "react";
import axios from "axios";

const WeatherApp = () => {
  const [city, setCity] = useState(""); // Состояние для хранения введённого города
  const [weatherData, setWeatherData] = useState(null); // Состояние для хранения данных о погоде
  const [loading, setLoading] = useState(false); // Состояние для индикатора загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  // API ключи
  const WEATHER_API_KEY = "9bd13e4f6369f626dcdb6a5ff8a7377f";

  // Функция для получения координат города
  const getCoords = async (cityName, countryCode, api_key) => {
    const cityApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=1&appid=${api_key}`;

    try {
      const response = await axios.get(cityApiUrl);
      const result = response.data[0];
      const lat = result.lat;
      const lon = result.lon;

      return [lat, lon];
    } catch (error) {
      throw new Error("Ошибка при получении координат");
    }
  };

  // Функция для получения данных о погоде
  const getWeatherData = async (lat, lon) => {
    try {
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
      const response = await axios.get(weatherApiUrl);
      return response.data;
    } catch (error) {
      throw new Error("Ошибка при получении данных о погоде");
    }
  };

  // Функция для парсинга данных о погоде
  const parseWeatherData = (weatherData) => {
    const mainWeather = weatherData.weather[0].main;
    const weatherDescription = weatherData.weather[0].description;
    return [mainWeather, weatherDescription];
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      // 1. Получаем координаты города
      const [lat, lon] = await getCoords(city, "RU", WEATHER_API_KEY);
      console.log("Успешно получены координаты:", lat, lon);

      // 2. Получаем данные о погоде по координатам
      const weatherData = await getWeatherData(lat, lon);
      console.log("Успешно получены данные о погоде:", weatherData);

      // 3. Парсим полученные данные
      const weatherInfo = parseWeatherData(weatherData);
      setWeatherData(weatherInfo); // Обновляем состояние с данными о погоде
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl mb-[1.75rem] pt-[1.75rem]">HOWSWEATHER</h1>

      {/* Форма для ввода города */}
      <form onSubmit={handleSubmit}>
        <div className="input-flex-block | flex flex-col gap-[0.5rem]">
          <input
            className="min-h-[2.5rem] rounded-sm px-[0.75rem]"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Введите город"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1BFC80] rounded-sm min-h-[2rem]"
          >
            {loading ? "Загружаем..." : "Ок"}
          </button>
        </div>
      </form>

      {/* Ошибка */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Погода */}
      {weatherData ? (
        <div className="pt-[2rem]">
          <h2>
            Погода в <span className="font-bold">{city}</span>:
          </h2>
          <p>Состояние: {weatherData[0]}</p>
          <p>Описание: {weatherData[1]}</p>
        </div>
      ) : (
        !loading && <p>Введите город, чтобы получить данные о погоде.</p>
      )}
    </div>
  );
};

export default WeatherApp;
