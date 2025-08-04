const weatherData = {
    sunny: { icon: '☀️', desc: '맑음', rainChance: '0%' },
    cloudy: { icon: '☁️', desc: '흐림', rainChance: '20%' },
    rainy: { icon: '🌧️', desc: '비', rainChance: '90%' },
    snowy: { icon: '❄️', desc: '눈', rainChance: '80%' },
    stormy: { icon: '⛈️', desc: '폭풍', rainChance: '100%' },
    foggy: { icon: '🌫️', desc: '안개', rainChance: '30%' }
};

// 옷차림 추천 로직
function getClothingRecommendation(temp, weather) {
    let icon = '👕';
    let text = '';
    
    if (temp < -10) {
        icon = '🧥';
        text = '패딩, 두꺼운 코트, 목도리, 장갑, 방한모자가 필요해요. 내복도 꼭 입으세요!';
    } else if (temp < 0) {
        icon = '🧥';
        text = '겨울 코트, 니트, 목도리를 착용하세요. 따뜻한 부츠도 좋아요.';
    } else if (temp < 5) {
        icon = '🧥';
        text = '코트나 패딩, 니트를 입으세요. 손이 시릴 수 있으니 장갑도 준비하세요.';
    } else if (temp < 10) {
        icon = '🧥';
        text = '자켓이나 가디건, 니트가 적당해요. 아침저녁으로 쌀쌀할 수 있어요.';
    } else if (temp < 15) {
        icon = '👔';
        text = '얇은 니트나 맨투맨, 가디건이 좋아요. 긴바지를 추천해요.';
    } else if (temp < 20) {
        icon = '👔';
        text = '긴팔 티셔츠나 얇은 셔츠가 적당해요. 해가 지면 쌀쌀할 수 있어요.';
    } else if (temp < 25) {
        icon = '👕';
        text = '반팔 티셔츠와 얇은 긴바지가 좋아요. 활동하기 좋은 날씨예요!';
    } else if (temp < 30) {
        icon = '👕';
        text = '반팔, 반바지가 시원해요. 린넨 소재가 좋고, 모자로 햇빛을 가리세요.';
    } else {
        icon = '🎽';
        text = '민소매, 반바지로 시원하게! 자외선 차단제는 필수예요. 물을 자주 마시세요.';
    }
    
    // 날씨별 추가 조언
    if (weather === 'rainy' || weather === 'stormy') {
        text += ' 우산이나 우비를 꼭 챙기세요! ☂️';
    } else if (weather === 'snowy') {
        text += ' 미끄럼 방지 신발을 신고, 따뜻하게 입으세요! 👢';
    } else if (weather === 'sunny' && temp >= 25) {
        text += ' 선글라스와 모자로 자외선을 차단하세요! 🕶️';
    }
    
    return { icon, text };
}

// 체감온도 계산
function calculateFeelsLike(temp, humidity, wind) {
    let feelsLike = temp;
    
    if (temp <= 10 && wind > 4.8) {
        // 체감온도 (겨울) - 윈드칠 공식
        feelsLike = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind * 3.6, 0.16) + 
                    0.3965 * temp * Math.pow(wind * 3.6, 0.16);
    } else if (temp >= 20 && humidity > 40) {
        // 체감온도 (여름) - 열지수 공식
        const c1 = -8.78469475556;
        const c2 = 1.61139411;
        const c3 = 2.33854883889;
        const c4 = -0.14611605;
        const c5 = -0.012308094;
        const c6 = -0.0164248277778;
        const c7 = 0.002211732;
        const c8 = 0.00072546;
        const c9 = -0.000003582;
        
        feelsLike = c1 + c2*temp + c3*humidity + c4*temp*humidity + 
                    c5*temp*temp + c6*humidity*humidity + 
                    c7*temp*temp*humidity + c8*temp*humidity*humidity + 
                    c9*temp*temp*humidity*humidity;
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
    else if (weatherSelect.value === 'snowy') visibility = '2km';
    document.getElementById('visibility').textContent = visibility;
    
    // 강수확률
    document.getElementById('rainChance').textContent = weather.rainChance;
    
    // 미세먼지
    const dustLevels = {
        good: '좋음 😊',
        normal: '보통 😐',
        bad: '나쁨 😷',
        verybad: '매우나쁨 😵'
    };
    const dustSelect = document.getElementById('dustSelect');
    document.getElementById('dustLevel').textContent = dustLevels[dustSelect.value];
    
    // 자외선 지수
    const uvLevels = {
        low: '낮음 (0-2)',
        moderate: '보통 (3-5)',
        high: '높음 (6-7)',
        veryhigh: '매우높음 (8-10)',
        extreme: '위험 (11+)'
    };
    const uvSelect = document.getElementById('uvSelect');
    document.getElementById('uvIndex').textContent = uvLevels[uvSelect.value];
    
    // 옷차림 추천
    const clothing = getClothingRecommendation(temp, weatherSelect.value);
    document.getElementById('clothesIcon').textContent = clothing.icon;
    document.getElementById('clothesText').textContent = clothing.text;
    
    // 배경 애니메이션 변경
    updateWeatherAnimation(weatherSelect.value);
    
    // 로컬 스토리지에 저장
    saveWeatherData();
}

// 날씨별 배경 애니메이션
function updateWeatherAnimation(weatherType) {
    const display = document.querySelector('.weather-display');
    
    // 기존 애니메이션 제거
    display.classList.remove('sunny-animation', 'rainy-animation', 'snowy-animation');
    
    // 날씨별 애니메이션 추가
    if (weatherType === 'sunny') {
        display.classList.add('sunny-animation');
    } else if (weatherType === 'rainy' || weatherType === 'stormy') {
        display.classList.add('rainy-animation');
    } else if (weatherType === 'snowy') {
        display.classList.add('snowy-animation');
    }
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
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date().getDay();
    const forecastGrid = document.getElementById('forecastGrid');
    
    forecastGrid.innerHTML = '';
    
    // 랜덤 날씨 생성을 위한 배열
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy'];
    
    for (let i = 0; i < 7; i++) {
        const dayIndex = (today + i) % 7;
        const dayName = i === 0 ? '오늘' : i === 1 ? '내일' : days[dayIndex];
        
        // 랜덤 날씨와 온도 생성
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        const baseTemp = parseInt(document.getElementById('tempInput').value);
        const highTemp = baseTemp + Math.floor(Math.random() * 5);
        const lowTemp = baseTemp - Math.floor(Math.random() * 5);
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-day-name">${dayName}</div>
            <div class="forecast-icon">${weatherData[randomWeather].icon}</div>
            <div class="forecast-temp">
                <span class="forecast-temp-high">${highTemp}°</span> / 
                <span class="forecast-temp-low">${lowTemp}°</span>
            </div>
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
        document.getElementById('uvSelect').value = data.uv || 'moderate';
        updateWeather();
    }
}

// 애니메이션 CSS 추가
function addWeatherAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .sunny-animation {
            background: linear-gradient(135deg, #87CEEB, #FFD700) !important;
        }
        
        .rainy-animation {
            background: linear-gradient(135deg, #4B5563, #6B7280) !important;
        }
        
        .rainy-animation::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                linear-gradient(transparent 50%, rgba(255,255,255,0.1) 50%),
                linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%);
            background-size: 50px 50px, 50px 50px;
            animation: rain 1s linear infinite;
            pointer-events: none;
        }
        
        @keyframes rain {
            0% { transform: translate(0, -50px); }
            100% { transform: translate(0, 0); }
        }
        
        .snowy-animation {
            background: linear-gradient(135deg, #E0E7FF, #C7D2FE) !important;
        }
        
        .snowy-animation::after {
            content: '❄️ ❄️ ❄️ ❄️ ❄️';
            position: absolute;
            top: -50px;
            left: 0;
            right: 0;
            font-size: 2em;
            animation: snow 10s linear infinite;
            pointer-events: none;
        }
        
        @keyframes snow {
            0% { transform: translateY(0); }
            100% { transform: translateY(calc(100vh + 50px)); }
        }
    `;
    document.head.appendChild(style);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    setupSliders();
    generateForecast();
    loadWeatherData();
    addWeatherAnimations();
    
    // 주간 예보 자동 업데이트 (12시간마다)
    setInterval(generateForecast, 12 * 60 * 60 * 1000);
});