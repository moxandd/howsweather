import React, { useState, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

const WeatherApp = () => {
  const [query, setQuery] = useState(""); // Запрос пользователя
  const [selectedCity, setSelectedCity] = useState(null); // Выбранный город
  const [city, setCity] = useState(""); // Состояние для хранения введённого города
  const [lastSubmittedCity, setLastSubmittedCity] = useState([]); // Состояние для хранения последнего введённого города
  const [weatherData, setWeatherData] = useState(null); // Состояние для хранения данных о погоде
  const [loading, setLoading] = useState(false); // Состояние для индикатора загрузки
  const [error, setError] = useState(null); // Состояние для ошибок
  const [suggestions, setSuggestions] = useState([]); // Состояние для автоподбора/угадывания названия города

  // API ключи
  const WEATHER_API_KEY = "9bd13e4f6369f626dcdb6a5ff8a7377f";

  const fetchCitySuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return; // Не делаем запрос, если ввод меньше 3 символов
    }

    console.log(`Fetching city suggestions on "${query}"...`);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&cnt=5&appid=${WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (data.list && data.list.length > 0) {
        const cities = data.list.map((city) => ({
          name: city.name,
          country: city.sys.country,
          id: city.id,
        }));
        setSuggestions(cities);
      } else {
        setSuggestions([]);
      }
      console.log("Suggestions: ", suggestions);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setSuggestions([]);
    }
  };

  const debouncedFetchCitySuggestions = debounce((query) => {
    fetchCitySuggestions(query);
  }, 500);

  useEffect(() => {
    if (query.length >= 3) {
      debouncedFetchCitySuggestions(query);
    }
  }, [query]);

  // Функция для получения координат города
  const getCoords = async (cityName, countryCode, api_key, limit = 3) => {
    const cityApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=${limit}&appid=${api_key}`;

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

  const convertToLocalTime = (timestamp, timezoneOffset) => {
    // Преобразуем метку времени (timestamp) в объект Date в UTC (timestamp уже в секундах)
    const date = new Date(timestamp * 1000); // Переводим в миллисекунды

    // Получаем часы и минуты в UTC
    const utcHours = date.getUTCHours(); // Часы в UTC
    const utcMinutes = date.getUTCMinutes(); // Минуты в UTC

    // Теперь добавляем смещение по времени
    const localHours = utcHours + Math.floor(timezoneOffset / 3600); // переводим смещение из секунд в часы
    const localMinutes = utcMinutes + Math.floor((timezoneOffset % 3600) / 60); // минуты
    const localDate = new Date(date.setHours(localHours, localMinutes));

    // Форматируем время в формат HH:MM
    const formattedTime = `${localDate
      .getHours()
      .toString()
      .padStart(2, "0")}:${localDate.getMinutes().toString().padStart(2, "0")}`;

    return formattedTime;
  };

  // Функция для парсинга данных о погоде
  const parseWeatherData = (weatherData) => {
    const mainWeather = weatherData.weather[0].main;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = parseInt(weatherData["main"]["temp"] - 273);
    const feelsLike = parseInt(weatherData["main"]["feels_like"] - 273);
    const pressure = weatherData["main"]["pressure"];
    const humidity = weatherData["main"]["humidity"];
    const windSpeed = weatherData["wind"]["speed"];
    const timezone = convertToLocalTime(
      weatherData["dt"],
      weatherData["timezone"]
    );
    const sunrise = convertToLocalTime(
      weatherData["sys"]["sunrise"],
      weatherData["timezone"]
    );
    const sunset = convertToLocalTime(
      weatherData["sys"]["sunset"],
      weatherData["timezone"]
    );
    return [
      mainWeather,
      weatherDescription,
      temperature,
      feelsLike,
      pressure,
      humidity,
      windSpeed,
      timezone,
      sunrise,
      sunset,
    ];
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

      console.log(
        `Calling getCoords with arguments (${city}, ${selectedCity.country}, ${WEATHER_API_KEY})`
      );

      const [lat, lon] = await getCoords(
        selectedCity.name,
        selectedCity.country,
        WEATHER_API_KEY
      );
      console.log("Успешно получены координаты:", lat, lon);

      setLastSubmittedCity([city, selectedCity.country]);

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length == 0) setSuggestions([]);
    setQuery(value);
    // debouncedFetchCitySuggestions(value); // Вызываем дебаунсированную функцию
  };

  const handleSuggestionSelect = (city) => {
    // Вместо строки сохраняем весь объект города
    setSelectedCity(city);
    setCity(`${city.name}`); // Обновляем строку для отображения в поле
    setSuggestions([]); // Очистка предложений после выбора
    console.log(`Selected city: ${city.name}, ${city.country}`); // Логируем выбранный город
  };

  return (
    <div>
      <h1 className="text-3xl mb-[1.75rem] pt-[1.75rem]">HOWSWEATHER</h1>

      {/* Форма для ввода города */}
      <form onSubmit={handleSubmit} onChange={handleInputChange}>
        <div className="input-flex-block | flex flex-col gap-[0.5rem]">
          <input
            className="min-h-[2.5rem] rounded-sm px-[0.75rem]"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Введите город"
          />
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((city) => (
                <li key={city.id} onClick={() => handleSuggestionSelect(city)}>
                  {city.name}, {city.country}
                </li>
              ))}
            </ul>
          )}
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
        <div className="pt-[2rem] lg:text-[1.5rem]">
          <h2>
            Погода в{" "}
            <span className="font-bold">
              {lastSubmittedCity[0]}, {lastSubmittedCity[1]}
            </span>
            :
          </h2>
          <p>Состояние: {weatherData[0]}</p>
          <p>Описание: {weatherData[1]}</p>
          <p>Температура: {weatherData[2]}°C</p>
          <p>Ощущается как: {weatherData[3]}°C</p>
          <p>Атмосферное давление: {weatherData[4]}</p>
          <p>Влажность: {weatherData[5]}%</p>
          <p>Ветер: {weatherData[6]}м/c</p>
          <p>Время: {weatherData[7]}</p>
          <p>Восход солнца: {weatherData[8]}</p>
          <p>Закат солнца: {weatherData[9]}</p>
        </div>
      ) : (
        !loading && <p>Введите город РФ, чтобы получить данные о погоде.</p>
      )}
    </div>
  );
};

export default WeatherApp;
