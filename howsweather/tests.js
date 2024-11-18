const axios = require("axios");

WEATHER_API_KEY = "9bd13e4f6369f626dcdb6a5ff8a7377f";
WEATHER_API_KEY2 = "dfbbc4e147be301a4dc626c337a2cb34";

const cityName = "Voronezh";
const limit = 1;
const countryCode = "RU";

const cityApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${countryCode}&limit=${limit}&appid=${WEATHER_API_KEY}`;

const getCoords = async () => {
  try {
    const response = await axios.get(cityApiUrl);
    const result = response.data[0];
    const lat = result["lat"];
    const lon = result["lon"];

    return [lat, lon];
  } catch (error) {
    console.error("Ошибка при получении координат:", error);
    throw error;
  }
};

const getWeatherData = async (lat, lon) => {
  try {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    const response = await axios.get(weatherApiUrl);
    const result = response.data;

    return result;
  } catch (error) {
    console.error("Ошибка при получении координат:", error);
    throw error;
  }
};
const parseWeatherData = async (weatherData) => {
  try {
    const mainWeather = weatherData["weather"][0]["main"];
    const weatherDescription = weatherData["weather"][0]["description"];

    return [mainWeather, weatherDescription];
  } catch (error) {
    console.error("Ошибка при получении координат:", error);
    throw error;
  }
};

const makeApiCalls = async () => {
  try {
    // 1. Получаем координаты города
    const [lat, lon] = await getCoords();
    console.log("Успешно получены координаты:", lat, lon);

    // 2. Получаем данные о погоде по координатам
    const weatherData = await getWeatherData(lat, lon);
    console.log("Успешно получены данные о погоде:", weatherData);

    // 3. Парсим полученные данные
    const weatherInfoArray = await parseWeatherData(weatherData);
    // Массив, который хранит все нужные данные о погоде, дальше надо пройтись по нему циклом и вывести всё это в React Template на фронте
    console.log(weatherInfoArray);
  } catch (error) {
    console.error("Ошибка при выполнении API запросов:", error);
  }
};

makeApiCalls();
