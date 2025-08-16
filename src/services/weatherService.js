const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeatherByCity(city) {
    if (!API_KEY) {
        throw new Error("API Key da OpenWeather não está configurada no arquivo .env.");
    }
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
                lang: 'pt_br',
            },
        });
        const weatherData = response.data;
        return {
            temperature: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            condition: weatherData.weather[0].description,
        };
    } catch (error) {
        console.error('Erro ao buscar o clima:', error.message);
        throw new Error('Não foi possível obter os dados do clima.');
    }
}

module.exports = { getWeatherByCity };
