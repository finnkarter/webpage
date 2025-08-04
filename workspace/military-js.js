let militaryData = JSON.parse(localStorage.getItem('militaryData'));

function saveMilitaryInfo(e) {
    e.preventDefault();
    
    const enlistDate = document.getElementById('enlistDate').value;
    const serviceMonths = parseInt(document.getElementById('serviceType').value);
    
    militaryData = {
        enlistDate: enlistDate,
        serviceMonths: serviceMonths,
        dischargeDate: calculateDischargeDate(enlistDate, serviceMonths)
    };
    
    localStorage.setItem('militaryData', JSON.stringify(militaryData));
    showMilitaryInfo();
}

function calculateDischargeDate(enlistDate, months) {
    const date = new Date(enlistDate);
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() - 1); // 전역일은 복무 마지막 날
    return date.toISOString().split('T')[0];
}

function showMilitaryInfo() {
    if (!militaryData) {
        document.getElementById('setupForm').style.display = 'block';
        document.getElementById('militaryInfo').style.display = 'none';
        return;
    }
    
    document.getElementById('setupForm').style.display = 'none';
    document.getElementById('militaryInfo').style.display = 'block';
    
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60); // 1분마다 업데이트
}

function updateCountdown() {
    const now = new Date();
    const enlistDate = new Date(militaryData.enlistDate);
    const dischargeDate = new Date(militaryData.dischargeDate);
    
    const totalDays = Math.ceil((dischargeDate - enlistDate) / (1000 * 60 * 60 * 24));
    const servedDays = Math.ceil((now - enlistDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((dischargeDate - now) / (1000 * 60 * 60 * 24));
    
    const progress = Math.min(100, Math.max(0, (servedDays / totalDays) * 100));
    
    // 남은 주말 계산
    let weekends = 0;
    let current = new Date(now);
    while (current <= dischargeDate) {
        if (current.getDay() === 0 || current.getDay() === 6) {
            weekends++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    // UI 업데이트
    document.getElementById('remainingDays').textContent = 
        remainingDays > 0 ? `D-${remainingDays}` : '전역!';
    
    document.getElementById('dischargeDate').textContent = 
        `전역일: ${formatDate(militaryData.dischargeDate)}`;
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = 
        `${progress.toFixed(1)}% 완료`;
    
    document.getElementById('servedDays').textContent = servedDays;
    document.getElementById('remainingWeekends').textContent = weekends;
    document.getElementById('percentComplete').textContent = progress.toFixed(1) + '%';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function resetInfo() {
    if (confirm('복무 정보를 재설정하시겠습니까?')) {
        localStorage.removeItem('militaryData');
        militaryData = null;
        showMilitaryInfo();
    }
}

// 이벤트 리스너
document.getElementById('militaryForm').addEventListener('submit', saveMilitaryInfo);

// 초기 로드
showMilitaryInfo();