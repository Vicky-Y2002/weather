// Weather API Configuration
const apiKey = 'Y857032992ae102491300a4962f81d038'; // Replace with your OpenWeatherMap API key

// DOM Elements
const cityInput = document.getElementById('cityInput');
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const errorElement = document.getElementById('error');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');

// Fetch Weather Data
async function fetchWeather(city) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}

// Fetch Forecast Data
async function fetchForecast(city) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}

// Display Weather Data
function displayWeather(data) {
  const { name, weather, main, wind } = data;
  cityName.textContent = name;
  weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;
  weatherDescription.textContent = weather[0].description;
  temperature.textContent = `${main.temp}°C`;
  humidity.textContent = `Humidity: ${main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${wind.speed} m/s`;

  weatherContainer.classList.remove('hidden');
  errorElement.classList.add('hidden');
  displayForecast(data);
}

// Display Forecast Data
function displayForecast(data) {
  forecastContainer.innerHTML = '';
  data.list.slice(0, 5).forEach((forecast) => {
    const dayElement = document.createElement('div');
    dayElement.classList.add('bg-blue-50', 'p-4', 'rounded');
    dayElement.innerHTML = `
      <p class="font-semibold">${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
      <p class="text-xl">${forecast.main.temp}°C</p>
      <p>Wind: ${forecast.wind.speed} m/s</p>
      <p>Humidity: ${forecast.main.humidity}%</p>
    `;
    forecastContainer.appendChild(dayElement);
  });
  forecastContainer.classList.remove('hidden');
}

// Handle City Search
async function searchWeather() {
  const city = cityInput.value.trim();
  if (city === '') {
    showError('Please enter a city name');
    return;
  }

  try {
    const data = await fetchWeather(city);
    displayWeather(data);
    saveCityToLocalStorage(city);
  } catch (error) {
    showError('City not found!');
  }
}

// Handle Error
function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  weatherContainer.classList.add('hidden');
  forecastContainer.classList.add('hidden');
}

// Save Recent Cities to LocalStorage
function saveCityToLocalStorage(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateRecentCitiesDropdown();
  }
}

// Update Recently Searched Cities Dropdown
function updateRecentCitiesDropdown() {
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentCitiesDropdown.innerHTML = '<option disabled selected>Recently searched cities</option>';
  recentCities.forEach((city) => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Handle Dropdown Selection
recentCitiesDropdown.addEventListener('change', async (e) => {
  const city = e.target.value;
  const data = await fetchWeather(city);
  displayWeather(data);
});

// Get Current Location Weather
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      displayWeather(data);
    });
  } else {
    showError('Geolocation not supported');
  }
}

// Initialize
updateRecentCitiesDropdown();
