const API_KEY = '6b2b0829fded470da24164713250707';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');

// State
let currentUnit = 'celsius';
let currentData = null; // Store current weather data

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

locationBtn.addEventListener('click', getLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'celsius') {
        currentUnit = 'celsius';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        updateTemperatureDisplay();
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'fahrenheit') {
        currentUnit = 'fahrenheit';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        updateTemperatureDisplay();
    }
});

// Main Weather Fetch Function - CHANGED TO WEATHERAPI
async function getWeatherData(city) {
    try {
        showLoading();
        hideError();
        
        // Using WeatherAPI.com's free endpoint
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`
        );
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const data = await response.json();
        currentData = data; // Store the data
        displayWeatherData(data);
        
    } catch (error) {
        showError('City not found or API error');
        console.error('API Error:', error);
    } finally {
        hideLoading();
    }
}

// Geolocation Function - UPDATED FOR WEATHERAPI
async function getLocationWeather() {
    if (navigator.geolocation) {
        try {
            showLoading();
            hideError();
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const { latitude, longitude } = position.coords;
            
            // Using WeatherAPI with coordinates
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=5&aqi=no&alerts=no`
            );
            
            const data = await response.json();
            currentData = data;
            displayWeatherData(data);
            
        } catch (error) {
            showError('Unable to retrieve your location');
            console.error('Geolocation Error:', error);
        } finally {
            hideLoading();
        }
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

// Display Function - UPDATED FOR WEATHERAPI DATA STRUCTURE
function displayWeatherData(data) {
    // Current weather data
    const current = data.current;
    const location = data.location;
    
    // Update current weather display
    cityName.textContent = `${location.name}, ${location.country}`;
    temperature.dataset.celsius = Math.round(current.temp_c);
    temperature.dataset.fahrenheit = Math.round(current.temp_f);
    updateTemperatureDisplay();
    
    weatherDescription.textContent = current.condition.text;
    weatherIcon.src = current.condition.icon.replace('64x64', '128x128');
    weatherIcon.alt = current.condition.text;
    
    humidity.textContent = `${current.humidity}%`;
    windSpeed.textContent = `${current.wind_kph} km/h`;
    pressure.textContent = `${current.pressure_mb} hPa`;
    
    // Update forecast
    forecastContainer.innerHTML = '';
    
    // WeatherAPI provides daily forecast directly
    data.forecast.forecastday.slice(0, 5).forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <img src="${day.day.condition.icon.replace('64x64', '128x128')}" alt="${day.day.condition.text}">
            </div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
    
    // Clear input
    cityInput.value = '';
}

// Helper functions (same as before)
function updateTemperatureDisplay() {
    if (!currentData) return;
    
    if (currentUnit === 'celsius') {
        temperature.textContent = temperature.dataset.celsius;
    } else {
        temperature.textContent = temperature.dataset.fahrenheit;
    }
}

function showLoading() {
    // Add loading spinner logic here
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

function showError(message) {
    alert(message); // Or update a dedicated error element
}

function hideError() {
    // Clear error display
}

// Initialize with default city
getWeatherData('London');