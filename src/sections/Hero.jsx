
import { useEffect } from "react";

function Hero() {

  const API_KEY = "7f3e28c1280ec9a7659b7de9aaad4fc6";

  const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
      return `<div class="details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </div>
              <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h6>${weatherItem.weather[0].description}</h6>
              </div>`;
    } else {
      return `<li class="card">
                  <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </li>`;
    }
  };

  const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
      .then(response => response.json())
      .then(data => {

        if (!data.list) {
          throw new Error("Weather forecast could not be loaded.");
        }

        const uniqueForecastDays = [];

        const fiveDaysForecast = data.list.filter(forecast => {
          const forecastDate = new Date(forecast.dt_txt).getDate();

          if (!uniqueForecastDays.includes(forecastDate)) {
            uniqueForecastDays.push(forecastDate);
            return true;
          }

          return false;
        });

        const cityInput = document.querySelector(".city-input");
        const currentWeatherDiv = document.querySelector(".current-weather");
        const weatherCardsDiv = document.querySelector(".weather-cards");

        if (!cityInput || !currentWeatherDiv || !weatherCardsDiv) return;

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
          const html = createWeatherCard(cityName, weatherItem, index);

          if (index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend", html);
          } else {
            weatherCardsDiv.insertAdjacentHTML("beforeend", html);
          }
        });

      })
      .catch(error => {
        console.error(error);
        alert("An error occurred while fetching the weather forecast!");
      });
  };

  const getCityCoordinates = () => {
    const cityInput = document.querySelector(".city-input");
    const cityName = cityInput.value.trim();

    if (cityName === "") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
      .then(response => response.json())
      .then(data => {

        if (!data.length) {
          return alert(`No coordinates found for ${cityName}`);
        }

        const { lat, lon, name } = data[0];

        getWeatherDetails(name, lat, lon);
      })
      .catch(error => {
        console.error(error);
        alert("An error occurred while fetching the coordinates!");
      });
  };

  const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(

      position => {
        const { latitude, longitude } = position.coords;

        const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

        fetch(API_URL)
          .then(response => response.json())
          .then(data => {

            const name = data.length ? data[0].name : "Your Location";

            getWeatherDetails(name, latitude, longitude);
          })
          .catch(error => {
            console.error(error);
            alert("An error occurred while fetching the city name!");
          });
      },

      error => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Geolocation request denied. Please reset location permission to grant access again.");
        } else {
          alert("Geolocation request error. Please reset location permission.");
        }
      }
    );
  };

  useEffect(() => {
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");

    if (!cityInput || !searchButton || !locationButton) return;

    const handleSearch = () => getCityCoordinates();
    const handleLocation = () => getUserCoordinates();

    const handleKeyUp = e => {
      if (e.key === "Enter") {
        getCityCoordinates();
      }
    };

    searchButton.addEventListener("click", handleSearch);
    locationButton.addEventListener("click", handleLocation);
    cityInput.addEventListener("keyup", handleKeyUp);

    return () => {
      searchButton.removeEventListener("click", handleSearch);
      locationButton.removeEventListener("click", handleLocation);
      cityInput.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div>
      <div className="Titlea">
        <h1>Weather Bird</h1>
      </div>

      <div className="weather-container">
        <div className="weather-input">
          <h3>Enter a City Name</h3>

          <input
            type="text"
            className="city-input"
            placeholder="E.g., New York, London, Tokyo"
          />

          <button className="search-btn">Search</button>

          <div className="seperator"></div>

          <button className="location-btn">
            Use Current Location
          </button>
        </div>

        <div className="weather-data">
          <div className="current-weather"></div>

          {/* <div className="">
            <div className="details">
              <h2>_______ ( ______ )</h2>
              <h6>Temperature: __°C</h6>
              <h6>Wind: __ M/S</h6>
              <h6>Humidity: __%</h6>
            </div>
          </div> */}

          <div className="days-forecast">
            <h2>5-Day Forecast</h2>

            <ul className="weather-cards">
              <li className="card">
                <h3>( ______ )</h3>
                <h6>Temp: __C</h6>
                <h6>Wind: __ M/S</h6>
                <h6>Humidity: __%</h6>
              </li>

              <li className="card">
                <h3>( ______ )</h3>
                <h6>Temp: __C</h6>
                <h6>Wind: __ M/S</h6>
                <h6>Humidity: __%</h6>
              </li>

              <li className="card">
                <h3>( ______ )</h3>
                <h6>Temp: __C</h6>
                <h6>Wind: __ M/S</h6>
                <h6>Humidity: __%</h6>
              </li>

              <li className="card">
                <h3>( ______ )</h3>
                <h6>Temp: __C</h6>
                <h6>Wind: __ M/S</h6>
                <h6>Humidity: __%</h6>
              </li>

              <li className="card">
                <h3>( ______ )</h3>
                <h6>Temp: __C</h6>
                <h6>Wind: __ M/S</h6>
                <h6>Humidity: __%</h6>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
