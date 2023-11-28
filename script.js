document.getElementById('current-location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        displayError("Geolocation is not supported by this browser.");
    }
});

document.getElementById('search-button').addEventListener('click', function() {
    const location = document.getElementById('location-search').value;
    getCoordinates(location);
});

function showPosition(position) {
    getSunriseSunsetInfo(position.coords.latitude, position.coords.longitude);
}

function getCoordinates(location) {
    fetch(`https://geocode.maps.co/search?q=${location}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                getSunriseSunsetInfo(lat, lon);
            } else {
                displayError("Location not found.");
            }
        })
        .catch(error => displayError("Error fetching location data: " + error));
}

function getSunriseSunsetInfo(lat, lon) {
    const urls = [
        `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=today`,
        `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=tomorrow`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json())))
        .then(data => {
            if (data[0].status === "OK" && data[1].status === "OK") {
                displayData(data[0].results, 'today');
                displayData(data[1].results, 'tomorrow');
            } else {
                displayError("Error fetching sunrise and sunset data.");
            }
        })
        .catch(error => displayError("Error: " + error));
}

function displayData(data, day) {
    document.getElementById(`sunrise-${day}`).textContent = `Sunrise: ${data.sunrise}`;
    document.getElementById(`sunset-${day}`).textContent = `Sunset: ${data.sunset}`;
    document.getElementById(`dawn-${day}`).textContent = `Dawn: ${data.dawn}`;
    document.getElementById(`dusk-${day}`).textContent = `Dusk: ${data.dusk}`;
    document.getElementById(`day-length-${day}`).textContent = `Day Length: ${data.day_length}`;
    document.getElementById(`solar-noon-${day}`).textContent = `Solar Noon: ${data.solar_noon}`;
    // Assuming timezone information is available in the response
    document.getElementById('time-zone-info').textContent = `Time Zone: ${data.timezone}`;
}

function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            displayError("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            displayError("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            displayError("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            displayError("An unknown error occurred.");
            break;
    }
}
