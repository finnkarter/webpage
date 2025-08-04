const weatherData = {
    sunny: { icon: '☀️', desc: '맑음' },
    cloudy: { icon: '☁️', desc: '흐림' },
    rainy: { icon: '🌧️', desc: '비' },
    snowy: { icon: '❄️', desc: '눈' },
    stormy: { icon: '⛈️', desc: '폭풍' },
    foggy: { icon: '🌫️', desc: '안개' }
};

// 옷차림 추천 로직
function getClothingRecommendation(temp, weather) {
    let icon = '👕';
    let text = '';
    
    if (temp < 0) {
        icon = '🧥';
        text = '패딩, 두꺼운 코트, 목도리, 장갑이 필요해요.';
    } else if (temp < 5) {
        icon = '🧥';
        text = '겨울 코트, 히트텍, 니트를 입으세요.';
    } else if (temp < 10) {
        icon = '🧥';
        text = '자켓, 가디건, 니트를 준비하세요.';
    } else if (temp < 15) {
        icon = '👔';
        text = '얇은 니트나 맨투맨, 가디건이 좋아요.';
    } else if (temp < 20) {
        icon = '👔';
        text = '긴팔 티셔츠나 얇은 셔츠가 적당해요.';
    } else if (temp < 25) {
        icon = '👕';
        text = '반팔, 얇은 셔츠, 면바지가 좋아요.';
    } else if (temp < 30) {
        icon = '👕';
        text = '반팔, 반바지, 린넨 소재가 시원해요.';
    } else {
        icon = '🎽';
        text = '민소매, 반바지, 통풍이 잘되는 옷을 입으세요.';
    }
    
    // 날씨별 추가 조언
    if (weather === 'rainy' || weather === 'stormy') {
        text += ' 우산이나 우비를 챙기세요! ☂️';
    } else if (weather === 'snowy') {
        text += ' 미끄럼 방지 신발을 신으세요! 👢';
    }
    
    return { icon, text };
}

// 체감온도 계산
function calculateFeelsLike(temp, humidity, wind) {
    // 간단한 체감온도 공식
    let feelsLike = temp;
    
    if (temp <= 10 && wind > 4.8) {
        // 체감온도 (겨울)
        feelsLike = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind * 3.6, 0.16) + 
                    0.3965 * temp * Math.pow(wind * 3.6, 0.16);
    } else if (temp >= 20 && humidity > 40) {
        // 체감온도 (여름)
        feelsLike = temp + (humidity - 40) * 0.1;
    }
    
    return Math.round(feelsLike);
}

// 날씨 업데이트
function updateWeather() {
    const weatherSelect = document.getElementById('weatherSelect');
    const temp = parseInt(document.getElementById('tempInput').value);
    const humidity = parseInt(document.getElementById('humidityInput').value);
    const wind = parseInt(document.getElementById('windInput').value);
    
    const weather = weatherData[weatherSelect.value];
    document.getElementById('weatherIcon').textContent = weather.icon;
    document.getElementById('weatherDesc').textContent = weather.desc;
    document.getElementById('temperature').textContent = temp + '°C';
    document.getElementById('humidityValue').textContent = humidity + '%';
    document.getElementById('windValue').textContent = wind + 'm/s';
    
    // 체감온도 계산
    const feelsLike = calculateFeelsLike(temp, humidity, wind);
    document.getElementById('feelsLike').textContent = feelsLike + '°C';
    
    // 가시거리 설정 (날씨에 따라)
    let visibility = '10km';
    if (weatherSelect.value === 'foggy') visibility = '1km';
    else if (weatherSelect.value === 'rainy') visibility = '5km';
    else if (weatherSelect.value === 'stormy') visibility = '3km';
    document.getElementById('visibility').textContent = visibility;
    
    // 옷차림 추천
    const clothing = getClothingRecommendation(temp, weatherSelect.value);
    document.getElementById('clothesIcon').textContent = clothing.icon;
    document.getElementById('clothesText').textContent = clothing.text;
    
    // 로컬 스토리지에 저장
    saveWeatherData();
}

// 슬라이더 연동
function setupSliders() {
    // 온도 슬라이더
    const tempRange = document.getElementById('tempRange');
    const tempInput = document.getElementById('tempInput');
    
    tempRange.addEventListener('input', () => {
        tempInput.value = tempRange.value;
        updateWeather();
    });
    
    tempInput.addEventListener('input', () => {
        tempRange.value = tempInput.value;
        updateWeather();
    });
    
    // 습도 슬라이더
    const humidityRange = document.getElementById('humidityRange');
    const humidityInput = document.getElementById('humidityInput');
    
    humidityRange.addEventListener('input', () => {
        humidityInput.value = humidityRange.value;
        updateWeather();
    });
    
    humidityInput.addEventListener('input', () => {
        humidityRange.value = humidityInput.value;
        updateWeather();
    });
    
    // 풍속 슬라이더
    const windRange = document.getElementById('windRange');
    const windInput = document.getElementById('windInput');
    
    windRange.addEventListener('input', () => {
        windInput.value = windRange.value;
        updateWeather();
    });
    
    windInput.addEventListener('input', () => {
        windRange.value = windInput.value;
        updateWeather();
    });
}

// 주간 예보 생성
function generateForecast() {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    const today = new Date().getDay();
    const forecastGrid = document.getElementById('forecastGrid');
    
    forecastGrid.innerHTML = '';
    
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = i === 0 ? '오늘' : days[dayIndex];
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">${dayName}</div>
            <div style="font-size: 2em; margin: 10px 0;">☀️</div>
            <div style="color: var(--primary); font-weight: bold;">20°</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">15°</div>
        `;
        
        forecastGrid.appendChild(forecastDay);
    }
}

// 날씨 데이터 저장
function saveWeatherData() {
    const data = {
        type: document.getElementById('weatherSelect').value,
        temp: document.getElementById('tempInput').value,
        humidity: document.getElementById('humidityInput').value,
        wind: document.getElementById('windInput').value,
        dust: document.getElementById('dustSelect').value,
        uv: document.getElementById('uvSelect').value
    };
    localStorage.setItem('weather', JSON.stringify(data));
}

// 날씨 데이터 로드
function loadWeatherData() {
    const saved = localStorage.getItem('weather');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('weatherSelect').value = data.type || 'sunny';
        document.getElementById('tempInput').value = data.temp || 20;
        document.getElementById('tempRange').value = data.temp || 20;
        document.getElementById('humidityInput').value = data.humidity || 50;
        document.getElementById('humidityRange').value = data.humidity || 50;
        document.getElementById('windInput').value = data.wind || 5;
        document.getElementById('windRange').value = data.wind || 5;
        document.getElementById('dustSelect').value = data.dust || 'good';
        document.getElementById('uvSelect').value = data.uv || 'low';
        updateWeather();
    }
}

// 이벤트 리스너
document.getElementById('weatherSelect').addEventListener('change', updateWeather);
document.getElementById('dustSelect').addEventListener('change', saveWeatherData);
document.getElementById('uvSelect').addEventListener('change', saveWeatherData);

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    setupSliders();
    generateForecast();
    loadWeatherData();
});